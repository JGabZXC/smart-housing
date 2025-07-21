/* eslint-disable */

describe('Correct Header for Admin', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email')
        .type('admin@gmail.com')
        .should('have.value', 'admin@gmail.com');

      cy.get('#password')
        .type('test1234')
        .should('have.value', 'test1234');

      cy.get('#login-button').click();
      cy.wait(2000); // Wait for the login to process
    })
  });

  it('should have admin action and correct dropdown menu', () => {
    cy.visit('/');
    cy.get('.dropdown').should('exist').and('be.visible');
    cy.get('#adminActionBtn').click();
    cy.get('.dropdown-menu.show').should('exist').and('be.visible');
    cy.get('.dropdown-menu.show').within(() => {
      cy.contains('Create User').should('exist');
      cy.contains('Update User').should('exist');
      cy.contains('Dashboard').should('exist');
      cy.contains('Address').should('exist');
      cy.contains('Manual Payment').should('exist');
      cy.contains('Yearly Statement').should('exist');
      cy.contains('Accept Event Bookings').should('exist');
      cy.contains('Manage Garbage Collection').should('exist');
    });
    cy.get('#adminActionBtn').click();
    cy.get('.dropdown-menu.show').should('not.exist');
  });
});

describe('Create User Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email')
        .type('admin@gmail.com')
        .should('have.value', 'admin@gmail.com');

      cy.get('#password')
        .type('test1234')
        .should('have.value', 'test1234');

      cy.get('#login-button').click();
      cy.wait(2000); // Wait for the login to process
    })
  });

  it('should have correct form inputs', () => {
    cy.visit('/admin/signup');
    cy.get('#name').should('exist').and('be.visible');
    cy.get('#contactNumber').should('exist').and('be.visible');
    cy.get('#email').should('exist').and('be.visible');
    cy.get('#phase').should('exist').and('be.visible');
    cy.get('#block').should('exist').and('be.visible');
    cy.get('#lot').should('exist').and('be.visible');
    cy.get('#street').should('exist').and('be.visible');
    cy.get('#password').should('exist').and('be.visible');
    cy.get('#confirmPassword').should('exist').and('be.visible');
    cy.get('#createResidentSubmitButton').should('exist').and('be.visible');
  });

  it('should have validation for required fields and can create user', () => {
    cy.visit('/admin/signup');

    // Remove required attributes for testing
    cy.get('#name').should('exist').and('be.visible').invoke('removeAttr', 'required');
    cy.get('#contactNumber').should('exist').and('be.visible').invoke('removeAttr', 'required');
    cy.get('#email').should('exist').and('be.visible').invoke('removeAttr', 'required');
    cy.get('#phase').should('exist').and('be.visible').invoke('removeAttr', 'required');
    cy.get('#block').should('exist').and('be.visible').invoke('removeAttr', 'required');
    cy.get('#lot').should('exist').and('be.visible').invoke('removeAttr', 'required');
    cy.get('#street').should('exist').and('be.visible').invoke('removeAttr', 'required');
    cy.get('#password').should('exist').and('be.visible').invoke('removeAttr', 'required');
    cy.get('#confirmPassword').should('exist').and('be.visible').invoke('removeAttr', 'required');

    // Testing beginning of form submission
    cy.get('#name').type('test').should('have.value', 'test');
    cy.get('#createResidentSubmitButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Address (Existing)
    cy.get('#phase').should('exist').and('be.visible').type('3');
    cy.get('#block').should('exist').and('be.visible').type('1');
    cy.get('#lot').should('exist').and('be.visible').type('1');
    cy.get('#street').should('exist').and('be.visible').type('Maligaya');
    cy.get('#createResidentSubmitButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Contact Number (Wrong)
    cy.get('#contactNumber').type('1234567890');
    cy.get('#createResidentSubmitButton').should('exist').and('be.visible').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Address (New)
    cy.get('#phase').should('exist').and('be.visible').clear().type('9');
    cy.get('#block').should('exist').and('be.visible').clear().type('2');
    cy.get('#lot').should('exist').and('be.visible').clear().type('1');
    cy.get('#street').should('exist').and('be.visible').clear().type('Yeet');
    cy.get('#createResidentSubmitButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Contact Number (Correct)
    cy.get('#contactNumber').clear().type('1234567890');
    cy.get('#createResidentSubmitButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Mismatched Password
    cy.get('#password').type('test1234');
    cy.get('#confirmPassword').type('test4321');
    cy.get('#createResidentSubmitButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Matched Password
    cy.get('#confirmPassword').clear().type('test1234');
    cy.get('#createResidentSubmitButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Email (New)
    cy.get('#email').clear().type('testingemail100@gmail.com');
    cy.get('#createResidentSubmitButton').click();
    cy.get('.alert-con .alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();
  });
});

describe('Update User Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email')
        .type('admin@gmail.com')
        .should('have.value', 'admin@gmail.com');

      cy.get('#password')
        .type('test1234')
        .should('have.value', 'test1234');

      cy.get('#login-button').click();
      cy.wait(2000); // Wait for the login to process
    })
  });

  it('should have correct form inputs', () => {
    cy.visit('/admin/update/resident');
    cy.get('#searchEmail').should('exist').and('be.visible');
    cy.get('#searchEmailButton').should('exist').and('be.visible');

    cy.get('#residentId').should('exist').and('be.visible');
    cy.get('#updateName').should('exist').and('be.visible');
    cy.get('#updateEmail').should('exist').and('be.visible');
    cy.get('#updateContactNumber').should('exist').and('be.visible');
    cy.get('#updateRole').should('exist').and('be.visible');
    cy.get('#updatePhase').should('exist').and('be.visible');
    cy.get('#updateBlock').should('exist').and('be.visible');
    cy.get('#updateLot').should('exist').and('be.visible');
    cy.get('#updateStreet').should('exist').and('be.visible');
    cy.get('#updatePassword').should('exist').and('be.visible');
    cy.get('#updateConfirmPassword').should('exist').and('be.visible');
    cy.get('#updateResidentButton').should('exist').should('be.visible').and('be.disabled');
  });

  it('should be able to search, have validation, and update user', () => {
    cy.visit('/admin/update/resident');

    cy.get('#updateResidentButton').invoke('removeAttr', 'disabled').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Not Existing Email
    cy.get('#searchEmail').clear().type('testemail101@gmail.com');
    cy.get('#searchEmailButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Exisitng Email
    cy.get('#searchEmail').clear().type('testingemail100@gmail.com');
    cy.get('#searchEmailButton').click();
    cy.get('.alert-con .alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Existing Email
    cy.get('#updateEmail').clear().type('franz@gmail.com');
    cy.get('#updateResidentButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Previous Email
    cy.get('#updateEmail').clear().type('testingemail100@gmail.com');

    // Invalid Number
    cy.get('#updateContactNumber').type('1234567890');
    cy.get('#updateResidentButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Correct Format Number
    cy.get('#updateContactNumber').type('09254736581');
    cy.get('#updateResidentButton').click();
    cy.get('.alert-con .alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();
  });

  it('should be able to update password', () => {
    cy.visit('/admin/update/resident');

    // Search for existing user
    cy.get('#searchEmail').clear().type('testingemail100@gmail.com');
    cy.get('#searchEmailButton').click();
    cy.get('.alert-con .alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    cy.get('#updatePassword').type('test1234');
    // Wrong Match Password
    cy.get('#updateConfirmPassword').type('test4321');
    cy.get('#updateResidentButton').click();
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible');
    cy.get('.btn-close').click();

    // Correct Match Password
    cy.get('#updateConfirmPassword').clear().type('test1234');
    cy.get('#updateResidentButton').click();
    cy.get('.alert-con .alert-success').should('exist').and('be.visible');
    cy.get('.btn-close').click();
  });
});

describe.only('Dashboard Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email')
        .type('admin@gmail.com')
        .should('have.value', 'admin@gmail.com');

      cy.get('#password')
        .type('test1234')
        .should('have.value', 'test1234');

      cy.get('#login-button').click();
      cy.wait(2000); // Wait for the login to process
    })
  });

  it('should have admin section for project and event', () => {
    cy.visit('/admin/dashboard');
    cy.get('#admin-project-section').should('exist').and('be.visible').within(() => {
      cy.get('#admin-project-search-form').should('exist').and('be.visible');
      cy.get('#sort-project').should('exist').and('be.visible');
      cy.get('#show-project').should('exist').and('be.visible');
      cy.get('#admin-project-create-button').should('exist').and('be.visible');
      cy.get('.table').should('exist').and('be.visible');
    });

    cy.get('#admin-event-section').should('exist').and('be.visible').within(() => {
      cy.get('#admin-event-search-form').should('exist').and('be.visible');
      cy.get('#sort-event').should('exist').and('be.visible');
      cy.get('#show-event').should('exist').and('be.visible');
      cy.get('#admin-event-create-button').should('exist').and('be.visible');
      cy.get('.table').should('exist').and('be.visible');
    });
  });

  it('should be able to search, sort, and show projects', () => {
    cy.visit('/admin/dashboard');

    cy.get('#admin-project-search-form').within(() => {
      // Doesn't exist project
      cy.get('input[name="admin-search-project"]').should('exist').and('be.visible').type('project-1');
      cy.get('#admin-project-search-button').click();
    });

    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#admin-project-search-form').within(() => {
      // Existing project
      cy.get('input[name="admin-search-project"]').clear().type('vaccine-village');
      cy.get('#admin-project-search-button').click();
    });

    cy.get('.alert-con .alert-danger').should('not.exist');


    cy.get('#sort-project').select('name');
    cy.get('#show-project').select('20');
  });

  it('should be able to search, sort, and show events', () => {
    cy.visit('/admin/dashboard');

    cy.get('#admin-event-search-form').within(() => {
      // Doesn't exist event
      cy.get('input[name="admin-search-event"]').should('exist').and('be.visible').type('event-1');
      cy.get('#admin-event-search-button').click();
    });

    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#admin-event-search-form').within(() => {
      // Existing event
      cy.get('input[name="admin-search-event"]').clear().type('test-name');
      cy.get('#admin-event-search-button').click();
    });

    cy.get('.alert-con .alert-danger').should('not.exist');

    cy.get('#admin-event-section').within(() => {
      cy.get('table').contains('Test Name').should('exist').and('be.visible');
    });


    cy.get('#sort-event').select('name');
    cy.get('#show-event').select('20');

    cy.get('#admin-event-search-form').within(() => {
      cy.get('input[name="admin-search-event"]').clear();
      cy.get('#admin-event-search-button').click();


    });

    cy.get('#admin-event-section').within(() => {
      cy.get('table').within(() => {
        cy.contains('Test Name');
        cy.contains('Soft Opening of HH3 Playground');
      })
    });
  });

  it('should be able to create project and event', () => {
    cy.visit('/admin/dashboard');

    cy.get('#admin-project-create-button').click();


  });
});