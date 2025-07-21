/* eslint-disable */

describe('Correct Header for Admin', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });

    // Clear any existing alerts before each test
    cy.visit('/'); // Reset to a clean state
    cy.get('body').then($body => {
      if ($body.find('.alert-con .alert').length > 0) {
        cy.get('.alert-con .alert .btn-close').click({ multiple: true, force: true });
      }
    });
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
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });
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
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    // Address (Existing)
    cy.get('#phase').should('exist').and('be.visible').type('3');
    cy.get('#block').should('exist').and('be.visible').type('1');
    cy.get('#lot').should('exist').and('be.visible').type('1');
    cy.get('#street').should('exist').and('be.visible').type('Maligaya');
    cy.get('#createResidentSubmitButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    // Contact Number (Wrong)
    cy.get('#contactNumber').type('1234567890');
    cy.get('#createResidentSubmitButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    // Address (New)
    cy.get('#phase').should('exist').and('be.visible').clear().type('9');
    cy.get('#block').should('exist').and('be.visible').clear().type('2');
    cy.get('#lot').should('exist').and('be.visible').clear().type('1');
    cy.get('#street').should('exist').and('be.visible').clear().type('Yeet');
    cy.get('#createResidentSubmitButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Contact Number (Correct)
    cy.get('#contactNumber').clear().type('1234567890');


    // Mismatched Password
    cy.get('#password').type('test1234');
    cy.get('#confirmPassword').type('test4321');
    cy.get('#createResidentSubmitButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })


    // Matched Password
    cy.get('#confirmPassword').clear().type('test1234');
    cy.get('#createResidentSubmitButton').click();

    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })


    // Email (New)
    cy.get('#email').clear().type('testingemail100@gmail.com');
    cy.get('#createResidentSubmitButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

  });
});

describe('Update User Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });

    // Clear any existing alerts before each test
    cy.visit('/'); // Reset to a clean state
    cy.get('body').then($body => {
      if ($body.find('.alert-con .alert').length > 0) {
        cy.get('.alert-con .alert .btn-close').click({ multiple: true, force: true });
      }
    });
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
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Not Existing Email
    cy.get('#searchEmail').clear().type('testemail101@gmail.com');
    cy.get('#searchEmailButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Exisitng Email
    cy.get('#searchEmail').clear().type('testingemail100@gmail.com');
    cy.get('#searchEmailButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Existing Email
    cy.get('#updateEmail').clear().type('franz@gmail.com');
    cy.get('#updateResidentButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Previous Email
    cy.get('#updateEmail').clear().type('testingemail100@gmail.com');

    // Invalid Number
    cy.get('#updateContactNumber').clear().type('1234567890');
    cy.get('#updateResidentButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Correct Format Number
    cy.get('#updateContactNumber').clear().type('09254736581');
    cy.get('#updateResidentButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });
  });

  it('should be able to update password', () => {
    cy.visit('/admin/update/resident');

    // Search for existing user
    cy.get('#searchEmail').clear().type('testingemail100@gmail.com');
    cy.get('#searchEmailButton').click();
    cy.wait(1000); // Wait to load user data

    cy.get('#updatePassword').type('test1234');
    // Wrong Match Password
    cy.get('#updateConfirmPassword').type('test4321');
    cy.get('#updateResidentButton').click();

    // Correct Match Password
    cy.get('#updateConfirmPassword').clear().type('test1234');
    cy.get('#updateResidentButton').click();
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });
  });
});

describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });

    // Clear any existing alerts before each test
    cy.visit('/'); // Reset to a clean state
    cy.get('body').then($body => {
      if ($body.find('.alert-con .alert').length > 0) {
        cy.get('.alert-con .alert .btn-close').click({ multiple: true, force: true });
      }
    });
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

    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    cy.get('#admin-project-search-form').within(() => {
      // Existing project
      cy.get('input[name="admin-search-project"]').clear().type('vaccine-village');
      cy.get('#admin-project-search-button').click();
    });

    cy.wait(500);
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

    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#admin-event-search-form').within(() => {
      // Existing event
      cy.get('input[name="admin-search-event"]').clear().type('test-name');
      cy.get('#admin-event-search-button').click();
    });

    cy.wait(500);
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

  // PROJECTS
  it('should be able to create project', () => {
    cy.visit('/admin/dashboard');

    cy.get('#admin-project-create-button').click();
    cy.get('#createDashboardForm').should('exist').should('be.visible').should('have.attr', 'data-type', 'projects').within(() => {
      // Remove required attributes for testing
      cy.get('#name').should('exist').should('be.visible').invoke('removeAttr', 'required');
      cy.get('#date').should('exist').should('be.visible').invoke('removeAttr', 'required');
      cy.get('#richDescription').should('exist').should('be.visible').invoke('removeAttr', 'required');
      cy.get('#description').should('exist').should('be.visible').invoke('removeAttr', 'required');

      // Invalid Name
      cy.get('#name').type('Test').should('have.value', 'Test');
      cy.get('#saveBtnDashboard').click().should('be.disabled');
    });

    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#createDashboardForm').should('have.attr', 'data-type', 'projects').within(() => {
      // Valid Name
      cy.get('#name').clear().type('Testing Project Name').should('have.value', 'Testing Project Name');
    });

    cy.get('#createDashboardForm').should('have.attr', 'data-type', 'projects').within(() => {
      // Invalid Rich Description
      cy.get('#richDescription').type('Test').should('have.value', 'Test');
      cy.get('#saveBtnDashboard').click().should('be.disabled');
    })

    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    cy.get('#createDashboardForm').should('have.attr', 'data-type', 'projects').within(() => {
      // Valid Rich Description
      cy.get('#richDescription').clear().type('This is a rich description for the project.').should('have.value', 'This is a rich description for the project.');
    });

    cy.get('#createDashboardForm').should('have.attr', 'data-type', 'projects').within(() => {
      // Invalid Description
      cy.get('#description').clear().type('Test').should('have.value', 'Test');
      cy.get('#saveBtnDashboard').click().should('be.disabled');
    });

    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    cy.get('#createDashboardForm').should('have.attr', 'data-type', 'projects').within(() => {
      // Valid Description
      cy.get('#description').clear().type('This is a valid description for test project').should('have.value', 'This is a valid description for test project');
      cy.get('#saveBtnDashboard').click().should('be.disabled');
    });

    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
  });

  it('should be able to view project details', () => {
    cy.visit('/admin/dashboard');
    cy.get('#admin-project-search-form').within(() => {
      // Created project
      cy.get('input[name="admin-search-project"]').clear().type('testing-project-name');
      cy.get('#admin-project-search-button').click();

      // Wait for the search results to load
      cy.wait(1000);
    });

    cy.get('#admin-project-section').within(() => {
      cy.get('.table').within(() => {
        cy.get('[href="/projects/testing-project-name"] > .bi').click();
        cy.url().should('include', '/projects/testing-project-name');
      });
    })
  });

  it('should be able to update project details and have validation', () => {
    cy.visit('/admin/dashboard');
    cy.get('#admin-project-search-form').within(() => {
      // Created project
      cy.get('input[name="admin-search-project"]').clear().type('testing-project-name');
      cy.get('#admin-project-search-button').click();

      cy.wait(1000); // Wait for the search results to load
    });

    cy.get('#admin-project-section').within(() => {
      cy.get('.table').within(() => {
        cy.get('#admin-project-table-body > tr > :nth-child(3) > a.border-0').click();
        cy.url().should('include', '/projects/testing-project-name/edit?type=projects');
      });
    });

    cy.get('#editProjEve').should('exist').should('be.visible').and('have.attr', 'data-slug', 'testing-project-name').and('have.attr', 'data-type', 'projects').within(() => {
      // Check form inputs
      cy.get('#formEditProjEve').should('exist').should('be.visible').within(() => {
        cy.get('input[name="title"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('input[name="date"]').should('exist').should('be.visible');
        cy.get('textarea[name="summary"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('textarea[name="description"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('input[name="imageCover"]').should('exist').should('be.visible');
        cy.get('input[name="images"]').should('exist').should('be.visible');
      });
    });

    // No inputs
    cy.get('#formEditProjEve').should('exist').should('be.visible').within(() => {
      cy.get('input[name="title"]').clear();
      cy.get('input[name="date"]').clear().type('2021-01-01');
      cy.get('textarea[name="summary"]').clear();
      cy.get('textarea[name="description"]').clear();
      cy.get('#editProjEveButton').click();
    });

    // Invalid inputs
    cy.get('#formEditProjEve').should('exist').should('be.visible').within(() => {
      cy.get('input[name="title"]').clear();
      cy.get('input[name="date"]').clear().type('2021-01-01');
      cy.get('textarea[name="summary"]').clear().type('Test');
      cy.get('textarea[name="description"]').clear().type('Test');
      cy.get('#featured').click();
      cy.get('#editProjEveButton').click();
    });
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
    cy.get('#formEditProjEve').should('exist').should('be.visible').within(() => {
      cy.get('input[name="title"]').clear().type("Updated Project Name");
      cy.get('input[name="date"]').clear().type('2021-01-01');
      cy.get('textarea[name="summary"]').clear().type('This is a test rich description for updated project');
      cy.get('textarea[name="description"]').clear().type('This is a test description for updated project');
      cy.get('#featured').click();
      cy.get('#editProjEveButton').click();
    });

    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
  });

  it('should be able to delete project', () => {
    cy.visit('/admin/dashboard');

    cy.get('#admin-project-search-form').within(() => {
      // Updated project name
      cy.get('input[name="admin-search-project"]').clear().type('updated-project-name');
      cy.get('#admin-project-search-button').click();

      cy.wait(1000); // Wait for the search results to load
    });

    cy.get('#admin-project-table-body > tr > :nth-child(3) > button.btn').click();
    cy.get('#modalDeleteDashboard').should('exist').and('be.visible').within(() => {
      cy.get('#deleteDashboardForm').should('exist').should('be.visible').should('have.attr', 'data-type', 'projects').within(() => {
        cy.get('#deleteBtnDashboard').click();
      });
    });
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
  });

  // EVENTS
  it('should be able to create event', () => {
    cy.visit('/admin/dashboard');

    cy.get('#admin-event-create-button').click();
    cy.get('#createDashboardForm').should('exist').should('be.visible').should('have.attr', 'data-type', 'events').within(() => {
      // Remove required attributes for testing
      cy.get('#name').should('exist').should('be.visible').invoke('removeAttr', 'required');
      cy.get('#date').should('exist').should('be.visible').invoke('removeAttr', 'required');
      cy.get('#place').should('exist').should('be.visible').invoke('removeAttr', 'required');
      cy.get('#time').should('exist').should('be.visible').invoke('removeAttr', 'required');
      cy.get('#richDescription').should('exist').should('be.visible').invoke('removeAttr', 'required');
      cy.get('#description').should('exist').should('be.visible').invoke('removeAttr', 'required');
    });

    // Invalid Inputs
    cy.get('#name').type('Test').should('have.value', 'Test');
    cy.get('#saveBtnDashboard').click().should('be.disabled');
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
    cy.get('#date').type('2021-01-01').should('have.value', '2021-01-01');
    cy.get('#saveBtnDashboard').click().should('be.disabled');
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
    cy.get('#place').type('Test').should('have.value', 'Test');
    cy.get('#saveBtnDashboard').click().should('be.disabled');
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
    cy.get('#time').type('10:00').should('have.value', '10:00');
    cy.get('#saveBtnDashboard').click().should('be.disabled');
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
    cy.get('#richDescription').type('Test').should('have.value', 'Test');
    cy.get('#saveBtnDashboard').click().should('be.disabled');
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
    cy.get('#description').type('Test').should('have.value', 'Test');
    cy.get('#saveBtnDashboard').click().should('be.disabled');
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    // Valid Inputs
    cy.get('#name').clear().type('A Test Event').should('have.value', 'A Test Event');
    cy.get('#date').clear().type('2025-10-01').should('have.value', '2025-10-01');
    cy.get('#place').clear().type('Phase 3 Court').should('have.value', 'Phase 3 Court');
    cy.get('#time').clear().type('10:00').should('have.value', '10:00');
    cy.get('#richDescription').clear().type('This is a rich description for event.').should('have.value', 'This is a rich description for event.');
    cy.get('#description').clear().type('This is a description for event.').should('have.value', 'This is a description for event.');
    cy.get('#saveBtnDashboard').click().should('be.disabled');
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
  });

  it('should be able to view event details', () => {
    cy.visit('/admin/dashboard');
    cy.get('#admin-event-search-form').within(() => {
      // Created project
      cy.get('input[name="admin-search-event"]').clear().type('a-test-event');
      cy.get('#admin-event-search-button').click();

      // Wait for the search results to load
      cy.wait(1000);
    });

    cy.get('#admin-event-section').within(() => {
      cy.get('.table').within(() => {
        cy.get('[href="/events/a-test-event"] > .bi').click();
        cy.url().should('include', '/events/a-test-event');
      });
    })
  });

  it('should be able to update event details and have validation', () => {
    cy.visit('/admin/dashboard');
    cy.get('#admin-event-search-form').within(() => {
      // Created project
      cy.get('input[name="admin-search-event"]').clear().type('a-test-event');
      cy.get('#admin-event-search-button').click();

      cy.wait(1000); // Wait for the search results to load
    });

    cy.get('#admin-event-section').within(() => {
      cy.get('.table').within(() => {
        cy.get('#admin-event-table-body > tr > :nth-child(3) > a.border-0').click();
        cy.url().should('include', '/events/a-test-event/edit?type=events');
      });
    });

    cy.get('#editProjEve').should('exist').should('be.visible').and('have.attr', 'data-slug', 'a-test-event').and('have.attr', 'data-type', 'events').within(() => {
      // Check form inputs
      cy.get('#formEditProjEve').should('exist').should('be.visible').within(() => {
        cy.get('input[name="title"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('input[name="date"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('input[name="place"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('input[name="time"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('textarea[name="summary"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('textarea[name="description"]').should('exist').should('be.visible').invoke('removeAttr', 'required');
        cy.get('input[name="imageCover"]').should('exist').should('be.visible');
        cy.get('input[name="images"]').should('exist').should('be.visible');
      });
    });

    // No inputs
    cy.get('#formEditProjEve').should('exist').should('be.visible').within(() => {
      cy.get('input[name="title"]').clear();
      cy.get('input[name="date"]').clear().type('2021-01-01');
      cy.get('textarea[name="summary"]').clear();
      cy.get('input[name="place"]').clear();
      cy.get('input[name="time"]').clear();
      cy.get('textarea[name="description"]').clear();
      cy.get('#editProjEveButton').click();
    });

    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
    // Invalid inputs
    cy.get('#formEditProjEve').should('exist').should('be.visible').within(() => {
      cy.get('input[name="title"]').clear();
      cy.get('input[name="date"]').clear().type('2021-01-01');
      cy.get('input[name="place"]').clear().type('Phase 3 Court');
      cy.get('input[name="time"]').clear().type('10:00');
      cy.get('textarea[name="summary"]').clear().type('Test');
      cy.get('textarea[name="description"]').clear().type('Test');
      cy.get('#featured').click();
      cy.get('#editProjEveButton').click();
    });
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    cy.get('#formEditProjEve').should('exist').should('be.visible').within(() => {
      cy.get('input[name="title"]').clear().type("Updated Event Name");
      cy.get('input[name="date"]').clear().type('2025-10-01');
      cy.get('textarea[name="summary"]').clear().type('This is a test rich description for updated event');
      cy.get('textarea[name="description"]').clear().type('This is a test description for updated event');
      cy.get('#featured').click();
      cy.get('#editProjEveButton').click();
    });

    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
  });

  it('should be able to delete event', () => {
    cy.visit('/admin/dashboard');

    cy.get('#admin-event-search-form').within(() => {
      // Updated event name
      cy.get('input[name="admin-search-event"]').clear().type('updated-event-name');
      cy.get('#admin-event-search-button').click();

      cy.wait(1000); // Wait for the search results to load
    });

    cy.get('#admin-event-table-body > tr > :nth-child(3) > button.btn').click();
    cy.get('#modalDeleteDashboard').should('exist').and('be.visible').within(() => {
      cy.get('#deleteDashboardForm').should('exist').should('be.visible').should('have.attr', 'data-type', 'events').within(() => {
        cy.get('#deleteBtnDashboard').click();
      });
    });
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })
  });
});