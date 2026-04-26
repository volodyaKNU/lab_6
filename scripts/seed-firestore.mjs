import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RTDB_ROOT = 'catalogItems';
const LOCAL_SERVICE_ACCOUNT_FILE = 'adminSDK_cred.json';

const WEARABLE_EXTENSION_ITEMS = [
  {
    id: 'wearable-1',
    name: 'FitPro Watch X',
    category: 'wearables',
    price: 12999,
    description: 'Smartwatch with heart-rate monitor and GPS',
    stock: 12,
  },
  {
    id: 'wearable-2',
    name: 'SoundBand Lite',
    category: 'wearables',
    price: 3499,
    description: 'Fitness band for daily activity tracking',
    stock: 30,
  },
];

const toDisplayCategory = (category) => {
  const normalized = String(category ?? '').trim().toLowerCase();

  if (!normalized) {
    return 'Unknown';
  }

  return normalized[0].toUpperCase() + normalized.slice(1);
};

const compactObject = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));

const toCatalogItem = (item) => {
  const metadata =
    item.metadata && typeof item.metadata === 'object'
      ? compactObject({
          manufacturedAt:
            typeof item.metadata.manufacturedAt === 'string'
              ? item.metadata.manufacturedAt
              : undefined,
          warrantyMonths:
            item.metadata.warrantyMonths === undefined
              ? undefined
              : Number(item.metadata.warrantyMonths),
          highlights: Array.isArray(item.metadata.highlights)
            ? item.metadata.highlights
                .filter((entry) => typeof entry === 'string')
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0)
            : undefined,
        })
      : undefined;

  const catalogItem = {
    id: String(item.id ?? '').trim(),
    name: String(item.name ?? '').trim(),
    category: toDisplayCategory(item.category),
    price: Number(item.price ?? 0),
    description: String(item.description ?? 'Description is not available').trim(),
    stock: Number(item.stock ?? 0),
  };

  if (metadata && Object.keys(metadata).length > 0) {
    return {
      ...catalogItem,
      metadata,
    };
  }

  return catalogItem;
};

const getProjectRoot = () => {
  const filePath = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(filePath), '..');
};

const loadBaseItems = async () => {
  const projectRoot = getProjectRoot();
  const sourcePath = path.resolve(projectRoot, 'public', 'cloud-electronics.json');
  const rawJson = await readFile(sourcePath, 'utf-8');
  const normalizedJson = rawJson.replace(/^\uFEFF/, '');
  const payload = JSON.parse(normalizedJson);
  return Array.isArray(payload) ? payload : payload.items ?? [];
};

const fileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const loadServiceAccount = async () => {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson);
  }

  const projectRoot = getProjectRoot();
  const credentialsPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ??
    path.resolve(projectRoot, LOCAL_SERVICE_ACCOUNT_FILE);

  if (!(await fileExists(credentialsPath))) {
    return null;
  }

  const rawJson = await readFile(credentialsPath, 'utf-8');
  const normalizedJson = rawJson.replace(/^\uFEFF/, '');
  return JSON.parse(normalizedJson);
};

const buildDatabaseUrl = (projectId) => {
  const fromEnv = process.env.FIREBASE_DATABASE_URL;

  if (fromEnv) {
    return fromEnv;
  }

  return `https://${projectId}-default-rtdb.firebaseio.com`;
};

const initializeAdmin = async () => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = await loadServiceAccount();
  const explicitProjectId = process.env.FIREBASE_PROJECT_ID;
  const resolvedProjectId = explicitProjectId ?? serviceAccount?.project_id;

  if (!resolvedProjectId) {
    throw new Error(
      'project id is missing. Set FIREBASE_PROJECT_ID or include project_id in adminSDK_cred.json.',
    );
  }

  const databaseURL = buildDatabaseUrl(resolvedProjectId);

  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: resolvedProjectId,
      databaseURL,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId: resolvedProjectId,
    databaseURL,
  });
};

const run = async () => {
  const app = await initializeAdmin();
  const database = getDatabase(app);

  const baseItems = await loadBaseItems();
  const items = [...baseItems, ...WEARABLE_EXTENSION_ITEMS]
    .map(toCatalogItem)
    .filter((item) => item.id.length > 0);

  if (items.length === 0) {
    throw new Error('No catalog items found for seeding.');
  }

  const payload = Object.fromEntries(items.map((item) => [item.id, item]));
  await database.ref(RTDB_ROOT).update(payload);
  console.log(`Seeded ${items.length} item(s) into "${RTDB_ROOT}" (Realtime Database).`);
};

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Seed failed: ${message}`);
  process.exitCode = 1;
});
