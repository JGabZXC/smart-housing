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

  it('can visit project and should be able to comment', () => {
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
  it('message of the user should be able to be edited and deleted', () => {
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

describe.only('Me Authenticated', () => {
  beforeEach(() => {
    // Check if any previous test changed the password
    const hasPasswordChanged = Cypress.env('passwordChanged') || false;
    const sessionKey = hasPasswordChanged ? 'user-login-after-password-change' : 'user-login';

    cy.session(sessionKey, () => {
      cy.visit('/login');
      cy.get('#email')
        .type('franz@gmail.com')
        .should('have.value', 'franz@gmail.com');

      cy.get('#password')
        .type('test1234')
        .should('have.value', 'test1234');

      cy.get('#login-button').click();
      cy.wait(2000);

      cy.getCookie('jwt').should('exist');
    });
  });

  it('should be able to visit the me page', () => {
    cy.visit('/me');
    cy.get('#me-container').should('exist').and('be.visible');
    cy.get('#payment-stripe-form').should('exist').and('be.visible');
    cy.get('.payment-statement-container').should('exist').and('be.visible');
    cy.get('#change-password-form').should('exist').and('be.visible');
    cy.get('#change-details-form').should('exist').and('be.visible');
    cy.get('#bookDetailsSection').should('exist').and('be.visible');
    cy.get('#forgotPassword').should('exist').and('be.visible');
  });

  it('change password should have validation', () => {
    cy.visit('/me');
    cy.get('#current-password').should('exist').and('be.visible').type('test4321').should('have.value', 'test4321');
    cy.get('#new-password').should('exist').and('be.visible').type('test1234').should('have.value', 'test1234');
    cy.get('#confirm-new-password').should('exist').and('be.visible').type('test1234').should('have.value', 'test1234');
    cy.get('#change-password-form-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();


    cy.get('#current-password').should('exist').and('be.visible').clear().type('test1234').should('have.value', 'test1234');
    cy.get('#new-password').should('exist').and('be.visible').clear().type('test').should('have.value', 'test');
    cy.get('#confirm-new-password').should('exist').and('be.visible').clear().type('test').should('have.value', 'test');
    cy.get('#change-password-form-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    cy.get('#current-password').should('exist').and('be.visible').clear().type('test1234').should('have.value', 'test1234');
    cy.get('#new-password').should('exist').and('be.visible').clear().type('testingtest').should('have.value', 'testingtest');
    cy.get('#confirm-new-password').should('exist').and('be.visible').clear().type('testtesting').should('have.value', 'testtesting');
    cy.get('#change-password-form-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();
  });

  it('should be able to change password', () => {
    cy.visit('/me');
    cy.get('#current-password').should('exist').and('be.visible').type('test1234').should('have.value', 'test1234');
    cy.get('#new-password').should('exist').and('be.visible').type('test1234').should('have.value', 'test1234');
    cy.get('#confirm-new-password').should('exist').and('be.visible').type('test1234').should('have.value', 'test1234');

    cy.intercept('PATCH', '**/users/**').as('changePassword');

    cy.get('#change-password-form-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Wait for the password change request and verify new token is received
    cy.wait('@changePassword').then((interception) => {
      // The server should have set a new JWT cookie in the response
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.then(() => {
      // Mark that password has been changed for subsequent tests
      Cypress.env('passwordChanged', true);
      Cypress.session.clearCurrentSessionData();
    });

    cy.getCookie('jwt').should('exist');
  });

  it('should be able to change details', () => {
    cy.visit('/me');
    cy.get('#first-name').should('exist').and('be.visible').type('Franz').should('have.value', 'Franz');
    cy.get('#middle-initial').should('exist').and('be.visible').type('B').should('have.value', 'B');
    cy.get('#last-name').should('exist').and('be.visible').type('Bendo').should('have.value', 'Bendo');
    cy.get('#change-details-form-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    cy.get('#email').should('exist').and('be.visible').type('franz@gmail.com').should('have.value', 'franz@gmail.com')
    cy.get('#change-details-form-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    cy.get('#number').should('exist').and('be.visible').type('1234567890').should('have.value', '1234567890');
    cy.get('#change-details-form-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('not.exist');
    cy.pause();

    cy.get('#number').should('exist').and('be.visible').clear().type('01578935429').should('have.value', '01578935429');
    cy.get('#change-details-form-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();
  });

  it('should be able to book event', () => {
    cy.visit('/me');
    cy.get('#bookEventPlace').should('exist').and('be.visible');
    cy.get('#date').should('exist').and('be.visible').type('2025-10-01').should('have.value', '2025-10-01');
    cy.get('#time').should('exist').and('be.visible').type('10:00').should('have.value', '10:00');
    cy.get('#place').should('exist').and('be.visible').type('Phase 3 Clubhouse').should('have.value', 'Phase 3 Clubhouse');
    cy.get('#buttonEventSubmit').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
  });

  it('should not be able to book event with past date', () => {
    cy.visit('/me');
    cy.get('#bookEventPlace').should('exist').and('be.visible');
    cy.get('#date').should('exist').and('be.visible').type('2020-01-01').should('have.value', '2020-01-01');
    cy.get('#time').should('exist').and('be.visible').type('10:00').should('have.value', '10:00');
    cy.get('#place').should('exist').and('be.visible').type('Phase 3 Clubhouse').should('have.value', 'Phase 3 Clubhouse');
    cy.get('#buttonEventSubmit').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-danger').should('exist').and('be.visible');
  });

  it('should have security settings', () => {
    cy.visit('/me');
    cy.get('#forgotPassword').should('exist').and('be.visible');
  })

  it('should be able to logout', () => {
    cy.visit('/me');
    cy.get('#logout-button').should('exist').and('be.visible').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();
    cy.wait(2000);

    cy.getCookie('jwt').should('not.exist');
  })
})