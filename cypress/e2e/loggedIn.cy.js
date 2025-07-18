/* eslint-disable */


describe('Authenticated (Regular User)', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email')
        .type('franz@gmail.com')
        .should('have.value', 'franz@gmail.com');

      cy.get('#password')
        .type('test1234')
        .should('have.value', 'test1234');

      cy.get('#login-button').click();
      cy.wait(2000); // Wait for the login to process
    })
  });

  it('login should work and logout should be visible', () => {
    cy.visit('/');
    cy.get('#logout-button')
      .should('exist')
      .should('be.visible')
      .and('contain.text', 'Log out');
  });

  it('admin action should not be visible', () => {
    cy.visit('/');
    cy.get('#adminActionBtn').should('not.exist');
  });

  it('me page link should be included in the navbar', () => {
    cy.visit('/');
    cy.get('#meLink').should('exist').should('be.visible').and('contain.text', 'Me')
  })

  it.only('can visit project and should be able to comment', () => {
    cy.visit('/projects/vaccine-village');
    cy.get('#form-message').should('exist').and('be.visible');
    cy.get('#message').type('as').should('have.value', 'as');
    cy.get('#submit-message-btn').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-danger').should('exist');

    cy.get('#message').clear().type('Simple Test Comment').should('have.value', 'Simple Test Comment');
    cy.get('#submit-message-btn').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
  });

  // First Message Card
  it.only('message of the user should be able to be edited and deleted', () => {
    cy.visit('/projects/vaccine-village');
    cy.get('.message-card').first().should('exist').and('be.visible');

    // Edit the first card
    cy.get('.message-card').first().find('.dropdown-toggle').click();
    cy.get('.message-card').first().find('.dropdown-menu.show').should('exist').and('be.visible');
    cy.get('.message-card').first().find('.dropdown-toggle').click();
    cy.get('.message-card').first().find('.dropdown-menu.show').should('not.exist');

    // Editing Process
    cy.get('.message-card').first().find('.dropdown-toggle').click();
    cy.get('.message-card').first().find('.dropdown-menu.show').should('exist').and('be.visible');
    cy.get('.message-card').first().find('.dropdown-menu.show').find('.edit-message').click();
    cy.get('.message-card').first().find('.dropdown-menu.show').should('not.exist');
    cy.get('.edit-message-form').should('exist').and('be.visible');
    cy.get('.input-group .confirm-edit').should('exist').and('be.visible');
    cy.get('.input-group .cancel-edit').should('exist').and('be.visible');
    cy.get('.input-group input').should('exist').and('be.visible').type('Edited Message').should('have.value', 'Edited Message');
    cy.get('.input-group .confirm-edit').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click(); // Close the alert

    cy.wait(500);

    // Deleting the first card
    cy.get('.message-card').first().find('.dropdown-toggle').click();
    cy.get('.message-card').first().find('.dropdown-menu.show').should('exist').and('be.visible');
    cy.get('.message-card').first().find('.dropdown-menu.show').find('.delete-message').click();
    cy.get('.modal').should('exist').and('be.visible');
    cy.get('.modal').find('.btn-secondary').should('contain.text', 'Cancel').and('be.visible');
    cy.wait(500);
    cy.get('.btn-secondary').click();
    cy.get('.modal').should('not.exist');

    cy.wait(500);

    cy.get('.message-card').first().find('.dropdown-toggle').click();
    cy.get('.message-card').first().find('.dropdown-menu.show').should('exist').and('be.visible');
    cy.get('.message-card').first().find('.dropdown-menu.show').find('.delete-message').click();
    cy.get('.modal').find('#confirm-delete-btn').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
  })
});