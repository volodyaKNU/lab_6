describe('Catalog page', () => {
  it('opens app root and shows electronics page title', () => {
    cy.visit('/');
    cy.contains('Магазин електроніки');
  });
});
