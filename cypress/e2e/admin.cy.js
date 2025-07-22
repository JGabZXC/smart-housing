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

  it('should display user creation form with all required input fields', () => {
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

  it('should validate all required fields and create user with comprehensive error handling', () => {
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
  });

  it('should display user search and update form with all required input fields', () => {
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

  it('should validate email search and populate form fields when user is found', () => {
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

  it('should update user password with confirmation validation', () => {
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
  });

  it('should display project and event management sections with all interface elements', () => {
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

  it('should search and sort projects with proper validation and display controls', () => {
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

  it('should search and sort events with proper validation and display controls', () => {
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
  it('should create new project with form validation for all required fields', () => {
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

  it('should navigate to project details page from dashboard table', () => {
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

  it('should update project details with comprehensive field validation', () => {
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
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

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

  it('should delete project with confirmation modal', () => {
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
  it('should create new event with form validation for all required fields', () => {
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

  it('should navigate to event details page from dashboard table', () => {
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

  it('should update event details with comprehensive field validation', () => {
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

  it('should delete event with confirmation modal', () => {
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

describe('Address Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });
  });

  it('should display address management interface with all required elements', () => {
    cy.visit('/admin/address');

    cy.get('#admin-address-section').should('exist').should('be.visible').within(() => {
      cy.get('#search-address-form').should('exist').should('be.visible');
      cy.get('#sort-address').should('exist').should('be.visible');
      cy.get('#show-address').should('exist').should('be.visible');
      cy.get('#admin-create-address-button').should('exist').should('be.visible');
      cy.get('.table').should('exist').should('be.visible');
    });

    cy.get('input[name="admin-search-event"]').type('Phase 9, Block 2, Lot 2, Yeet');
    cy.get('#search-address-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('.table').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length.greaterThan', 0);
      });
    });
  });

  it('should display create address modal with all form fields', () => {
    cy.visit('/admin/address');

    cy.get('#admin-create-address-button').click();
    cy.get('#addressModal').should('exist').should('be.visible').within(() => {
      cy.get('#phase').should('exist').should('be.visible');
      cy.get('#block').should('exist').should('be.visible');
      cy.get('#lot').should('exist').should('be.visible');
      cy.get('#street').should('exist').should('be.visible');
      cy.get('#status').should('exist').should('be.visible');
      cy.get('#address-modal-save-btn').should('exist').should('be.visible');
      cy.get('#address-modal-close-btn').should('exist').should('be.visible');
    });
  });

  it('should sort addresses by phase and display 20 entries per page', () => {
    cy.visit('/admin/address');
    cy.get('#sort-address').select('Phase');
    cy.get('#show-address').select('20');
    cy.get('.table').should('exist').should('be.visible').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length.greaterThan', 10);
      });
    });
  });

  it('should validate required fields when creating new address', () => {
    cy.visit('/admin/address');

    cy.get('#admin-create-address-button').click();
    cy.get('#phase').type('9');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#block').type('2');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Existing Address Lot
    cy.get('#lot').type('1');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#street').type('Yeet');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#status').select('unoccupied');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#lot').clear().type('3');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });
  })

  it('should search for created address and open edit modal with populated fields', () => {
    cy.visit('/admin/address');

    // Created Address
    cy.get('input[name="admin-search-event"]').clear().type('Phase 9, Block 2, Lot 3, Yeet');
    cy.get('#search-address-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('.table').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 1).within(() => {
          cy.get('td').eq(0).should('contain.text', '9');
          cy.get('td').eq(1).should('contain.text', '2');
          cy.get('td').eq(2).should('contain.text', '3');
          cy.get('td').eq(3).should('contain.text', 'Yeet');
          cy.get('td').eq(4).should('contain.text', 'unoccupied');
          cy.get('#edit-btn').should('exist').click();
        });
      });
    });

    cy.get('#addressForm').within(() => {
      cy.get('#phase').should('contain.value', '9');
      cy.get('#block').should('contain.value', '2');
      cy.get('#lot').should('contain.value', '3');
      cy.get('#street').should('contain.value', 'Yeet');
      cy.get('#status').should('contain.value', 'unoccupied');
    })
  });

  it('should update selected address with validation', () => {
    cy.visit('/admin/address');

    // Search for created address
    cy.get('input[name="admin-search-event"]').clear().type('Phase 9, Block 2, Lot 3, Yeet');
    cy.get('#search-address-button').click();
    cy.wait(500); // Wait for the search results to load

    cy.get('.table').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 1).within(() => {
          cy.get('#edit-btn').click();
        });
      });
    });

    cy.get('#addressForm').within(() => {
      // Remove required attributes for testing
      cy.get('#phase').invoke('removeAttr', 'required');
      cy.get('#block').invoke('removeAttr', 'required');
      cy.get('#lot').invoke('removeAttr', 'required');
      cy.get('#street').invoke('removeAttr', 'required');
      cy.get('#status').invoke('removeAttr', 'required');
    });

    // Invalid Inputs
    cy.get('#phase').clear();
    cy.get('#block').clear();
    cy.get('#lot').clear();
    cy.get('#street').clear();
    cy.get('#status').select('');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Existing Address
    cy.get('#phase').clear().type('3');
    cy.get('#block').clear().type('1');
    cy.get('#lot').clear().type('1');
    cy.get('#street').clear().type('Maligaya');
    cy.get('#status').select('unoccupied');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    // Non Existing Address
    cy.get('#phase').clear().type('9');
    cy.get('#block').clear().type('2');
    cy.get('#lot').clear().type('4');
    cy.get('#street').clear().type('Yeet');
    cy.get('#status').select('maintenance');
    cy.get('#address-modal-save-btn').click();
    cy.wait(500);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

  });

  it('should delete selected address', () => {
    cy.visit('/admin/address');

    // Search for updated address
    cy.get('input[name="admin-search-event"]').clear().type('Phase 9, Block 2, Lot 4, Yeet');
    cy.get('#search-address-button').click();
    cy.wait(1000); // Wait for the search results to load

    cy.get('.table').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 1).within(() => {
          cy.get('#delete-btn').click();
        });
      });
    });

    cy.get('#delete').should('exist').and('be.visible').within(() => {
      cy.get('#complete-address').should('contain.text', 'Phase 9, Blk 2, Lot 4, Street Yeet');
      cy.get('#delete-btn').click();
    })
  });
})

describe('Manual Payment Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });
  });

  it('should display search interface and hide payment form until valid user is found', () => {
    cy.visit('/admin/manual-payment');
    cy.get('#search-user-input').should('exist').and('be.visible');
    cy.get('#search-user-button').should('exist').and('be.visible');
    cy.get('#manual-payment-details').should('have.class', 'visually-hidden');

    cy.get('#search-user-input').type('test');
    cy.get('#search-user-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get('#search-user-input').clear().type('testingemail100@gmail.com');
    cy.get('#search-user-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('#manual-payment-details').should('not.have.class', 'visually-hidden');

    cy.get('#manual-payment-details').should('exist').and('be.visible');
    cy.get('#statement-admin-manual').should('exist').and('be.visible');
  });

  it('should search for user by address and display payment details form', () => {
    cy.visit('/admin/manual-payment');

    // Address of testingemail100@gmail.com
    cy.get('#search-user-input').clear().type('phase 9, block 2, lot 1');
    cy.get('#search-user-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('#manual-payment-details').should('not.have.class', 'visually-hidden');

    cy.get('#manual-payment-details').should('exist').and('be.visible');
    cy.get('#statement-admin-manual').should('exist').and('be.visible');
  })

  it('should validate payment form fields and create manual payment record with automatic calculation', () => {
    cy.visit('/admin/manual-payment');

    // Address of testingemail100@gmail.com
    cy.get('#search-user-input').clear().type('phase 9, block 2, lot 1');
    cy.get('#search-user-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('#manual-payment-details').should('not.have.class', 'visually-hidden');

    // No Fields
    cy.get('#manual-payment-form').within(() => {
      cy.get('#from-manual-payment').clear();
      cy.get('#to-manual-payment').clear();
      // cy.get('#checkbox-manual-payment').clear();
      cy.get('#manual-payment-amount').invoke('removeAttr', 'disabled').clear();
      cy.get('#or-statement').clear();
      cy.get('#manual-payment-form-button').click();
    });
    cy.wait(1000);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    // Invalid Date Fields
    cy.get('#manual-payment-form').within(() => {
      cy.get('#from-manual-payment').clear().type('2021-01-01');
      cy.get('#to-manual-payment').clear().type('2021-01-01');
      cy.get('#manual-payment-form-button').click();
    });
    cy.wait(1000);
    cy.get('.alert-con .alert-danger').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    // Valid Inputs
    cy.get('#manual-payment-form').within(() => {
      cy.get('#from-manual-payment').clear().type('2025-01-01');
      cy.get('#to-manual-payment').clear().type('2025-03-31');
      cy.get('#or-statement').clear().type('TESTOR0001');
      cy.get('#manual-payment-amount').should('have.value', '300');
      cy.get('#manual-payment-form-button').click();
    });
    cy.wait(1000);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    })

    // Manual Payment Enabled
    cy.get('#manual-payment-form').within(() => {
      cy.get('#from-manual-payment').clear().type('2025-04-01');
      cy.get('#to-manual-payment').clear().type('2025-04-30');
      cy.get('#or-statement').clear().type('TESTOR0002');
      cy.get('#checkbox-manual-payment').click();
      cy.get('#manual-payment-amount').clear().type('250');
      cy.get('#manual-payment-amount').should('have.value', '250');
      cy.get('#manual-payment-form-button').click();
    });
    cy.wait(1000);
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });


    cy.get('#manual-payment-form').within(() => {
      cy.get('#manual-payment-amount').should('have.attr', 'disabled');
    });
  });

  it('should allow year selection for payment statement display', () => {
    cy.visit('/admin/manual-payment');

    // Address of testingemail100@gmail.com
    cy.get('#search-user-input').clear().type('phase 9, block 2, lot 1');
    cy.get('#search-user-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('#manual-payment-details').should('not.have.class', 'visually-hidden');

    cy.get('#year-select').select('2026').should('have.value', '2026');
  });

  it('should filter transaction records by date range and payment method with pagination controls', () => {
    cy.visit('/admin/manual-payment');

    // Address of testingemail100@gmail.com
    cy.get('#search-user-input').clear().type('phase 9, block 2, lot 1');
    cy.get('#search-user-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('#manual-payment-details').should('not.have.class', 'visually-hidden');

    cy.get('#from-date-filter').type('2025-02-01');
    cy.get('#to-date-filter').type('2025-02-28');
    cy.get('#filter-date-form-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('.custom-dashboard-table-height').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 1).within(() => {
          cy.get('td').eq(0).should('contain.text', '1');
          cy.get('td').eq(1).should('contain.text', 'January 2025 - March 2025');
          cy.get('td').eq(2).should('contain.text', '300');
          cy.get('td').eq(3).should('contain.text', 'July 22, 2025');
          cy.get('td').eq(4).should('contain.text', 'TESTOR0001');
          cy.get('td').eq(5).should('contain.text', 'manual');
        });
      });
    });

    cy.get('#from-date-filter').clear();
    cy.get('#to-date-filter').clear();
    cy.get('#payment-method-filter').select('stripe');
    cy.get('#filter-date-form-button').click();
    cy.wait(1000); // Wait for the search results to load
    cy.get('.custom-dashboard-table-height').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 1).within(() => {
          cy.get('td').eq(0).should('contain.text', 'Either no payment record exists or no payment date is recorded.');
        });
      });
    });

    cy.get('#show-payment').select('20');
    cy.wait(1000); // Wait for the search results to load
  });
})

describe('Yearly Statement Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });
  });

  it('should have correct interface elements and functionality', () => {
    cy.visit('/admin/yearly-statement');
    cy.get('#yearlyStatementSection').should('exist').and('be.visible');
    cy.get('#contentContainer').should('exist').and('be.visible');

    cy.get(':nth-child(7) > .card > .card-body').should('exist').should('be.visible').click();
    cy.wait(500);
    cy.get('#transactionModal').should('exist').and('be.visible').within(() => {
     cy.get('.btn-close').click();
    });
  })
})

describe('Accept Event Bookings Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });
  });

  it('should display event booking management interface with search and table controls', () => {
    cy.visit('/admin/event-bookings');
    cy.get('#acceptEventBookingSection').should('exist').and('be.visible').within(() => {
      cy.get('#adminEventBookingSearchForm').should('exist').and('be.visible').within(() => {
        cy.get('input[name="adminSearchBookingInput').should('exist').and('be.visible');
        cy.get('#adminEventBookingSearchFormButton').should('exist').and('be.visible');
      });
    });

    cy.get('#sortEventBooking').should('exist').and('be.visible');
    cy.get('#showEventBooking').should('exist').and('be.visible');

    cy.get('#tableAcceptEventBookings').should('exist').and('be.visible');
  });

  it('should search for event bookings by user email and display matching results', () => {
    cy.visit('/admin/event-bookings');

    cy.get('#adminEventBookingSearchForm').within(() => {
      cy.get('input[name="adminSearchBookingInput').type('jurie@gmail.com');
      cy.get('#adminEventBookingSearchFormButton').click();
      cy.wait(1000); // Wait for the search results to load
    });

    cy.get('#tableAcceptEventBookings').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').within(() => {
          cy.get('td').eq(0).should('contain.text', 'Jurie Talaid');
        });
      });
    });
  });

  it('should toggle booking approval status between approve and unapprove states', () => {
    cy.visit('/admin/event-bookings');

    cy.get('#adminEventBookingSearchForm').within(() => {
      cy.get('input[name="adminSearchBookingInput').type('jurie@gmail.com');
      cy.get('#adminEventBookingSearchFormButton').click();
      cy.wait(1000); // Wait for the search results to load
    });

    cy.get('#tableAcceptEventBookings').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').within(() => {
          cy.get('td').eq(0).should('contain.text', 'Jurie Talaid');
          cy.get('.btn').should('contain.text', 'Approve').click();
        });
      });
    });

    cy.wait(2000); // Wait for the approval to process

    cy.get('#tableAcceptEventBookings').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').within(() => {
          cy.get('td').eq(0).should('contain.text', 'Jurie Talaid');
          cy.get('.btn').should('contain.text', 'Unapprove').click();
        });
      });
    });
  })

  it('should configure table to sort by user name with 20 entries displayed', () => {
    cy.visit('/admin/event-bookings');

    cy.get('#sortEventBooking').select('user.name');
    cy.wait(1000); // Wait for the sorting to apply
    cy.get('#showEventBooking').select('20');
    cy.wait(1000);

    cy.get('#tableAcceptEventBookings').should('exist').and('be.visible').within(() => {
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length.greaterThan', 10);
      });
    })
  })
})

describe('Garbage Collection Page', () => {
  beforeEach(() => {
    cy.session('user-login', () => {
      cy.visit('/login');
      cy.get('#email').type('admin@gmail.com');
      cy.get('#password').type('test1234');
      cy.get('#login-button').click();
      cy.wait(2000);
    });
  });

  it('should display correct UI elements', () => {
    cy.visit('/admin/garbage-collection');

    cy.get('#garbageCollectionSection').should('exist').and('be.visible');
    cy.get('button[data-bs-target="#garbageModal"]').should('exist').and('be.visible');
    cy.get('#garbageList').should('exist').and('be.visible');

    cy.wait(1000); // Wait for the garbage collection data to load

    cy.get('.card').first().within(() => {
      cy.get('#dropdownMenuButton').click();
      cy.get('.dropdown-menu.show').should('exist').and('be.visible');
      cy.get('#dropdownMenuButton').click();
      cy.get('.dropdown-menu.show').should('not.exist');
    });
  });

  it('should be able to add day', () => {
    cy.visit('/admin/garbage-collection');

    cy.wait(1000); // Wait for the garbage collection data to load

    cy.get('.card').first().within(() => {
      cy.get('#dropdownMenuButton').click();
      cy.get('.dropdown-menu.show').within(() => {
        cy.get(':nth-child(1) > .dropdown-item').click();
      });
    });
    cy.get('#garbageModal').should('exist').and('be.visible').within(() => {
      cy.get('#day').select('Friday');
      cy.get('#saveBtnCollection').click();
      cy.wait(1000); // Wait for the save action to complete
    });
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });
  })

  it('should be a able to add time, edit name and delete day', () => {
    cy.visit('/admin/garbage-collection');

    cy.wait(1000); // Wait for the garbage collection data to load
    cy.get(':nth-child(4) > .justify-content-between > .d-flex > .add-time').should('exist').and('be.visible');
    cy.get(':nth-child(4) > .justify-content-between > .d-flex > .edit-name').should('exist').and('be.visible');
    cy.get(':nth-child(4) > .justify-content-between > .d-flex > .delete-day').should('exist').and('be.visible');

    cy.get(':nth-child(4) > .justify-content-between > .d-flex > .add-time').click();
    cy.get('#garbageModal').within(() => {
      cy.get('#timeFrom').type('08:00');
      cy.wait(500); // Wait for the time input to be processed
      cy.get('#timeTo').type('10:00');
      cy.get('.street-input').eq(0).type('Yeet');
      cy.get('.add-street').click();
      cy.get('.street-input').eq(1).type('Amsterdam');
      cy.get('#saveBtnCollection').click();
      cy.wait(1000); // Wait for the save action to complete
    });
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get(':nth-child(4) > .table > tbody > tr > :nth-child(3) > .btn-outline-primary').should('exist').and('be.visible').click();
    cy.get('#garbageModal').within(() => {
      cy.get('.remove-street').click();
      cy.get('#saveBtnCollection').click();
      cy.wait(1000); // Wait for the save action to complete
    });
    cy.get('.alert-con .alert-success').should('exist').and('be.visible').within(() => {
      cy.get('.btn-close').click();
    });

    cy.get(':nth-child(4) > .table > tbody > tr > :nth-child(3) > .btn-outline-danger').should('exist').and('be.visible').click();
    cy.get('#deleteConfirmModal').within(() => {
      cy.get('#confirmDelete').click();
      cy.wait(1000); // Wait for the delete action to complete
    });
    cy.get('#notificationModal').within(() => {
      cy.get('.btn').click();
    });

    // EDIT NAME
    cy.get(':nth-child(4) > .justify-content-between > .d-flex > .edit-name').click();
    cy.get('#garbageModal').within(() => {
      cy.get('#day').select('Saturday');
      cy.get('#saveBtnCollection').click();
      cy.wait(1000); // Wait for the save action to complete
    });

    // DELETE DAY
    cy.get(':nth-child(4) > .justify-content-between > .d-flex > .delete-day').click();
    cy.get('#deleteConfirmModal').within(() => {
      cy.get('#confirmDelete').click();
      cy.wait(1000); // Wait for the delete action to complete
    });
    cy.get('#notificationModal').within(() => {
      cy.get('.btn').click();
    });

  })
})