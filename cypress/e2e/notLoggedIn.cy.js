/* eslint-disable */

Cypress.on('uncaught:exception', (err, runnable) => {
  return false
});

describe('Main Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have a visible header and correct logo image', () => {
    cy.get('header')
      .first()
      .should('be.visible')
      .within(() => {
        cy.get('.navbar').should('exist');
        cy.get('#holidayLogoImg')
          .should('exist')
          .and('have.attr', 'src', '/img/logo_holiday.webp')
          .and('have.attr', 'width', '60')
          .and('have.attr', 'height', '60')
          .and('have.attr', 'alt', 'holiday homes logo');
      });
  });

  it('should have correct links in the header', () => {
    cy.get('header')
      .find('nav')
      .should('exist')
      .within(() => {
        cy.contains('a', 'Home').should('have.attr', 'href', '/');
        cy.contains('a', 'Projects').should('have.attr', 'href', '/projects');
        cy.contains('a', 'Events').should('have.attr', 'href', '/events');
      });
  })

  it('should navigate to Projects page when clicking Projects link', () => {
    cy.get('header')
      .contains('a', 'Projects').click()
      .url().should('include', '/projects')
  })

  it('should navigate to Events page when clicking Events link', () => {
    cy.get('header')
      .contains('a', 'Events').click()
      .url().should('include', '/events')
  });

  it('should highlight the active link', () => {
    cy.get('header')
      .contains('a', 'Projects').click()
      cy.get('a.nav-link.active').should('contain.text', 'Projects')
  });

  it('should not show the "Me" link', () => {
    cy.get('#meLink')
      .should('not.exist');
  });

  it('should not show the "Admin Action" dropdown', () => {
    cy.get('#adminActionBtn')
      .should('not.exist');
  });

  it('should not show the "Logout" link', () => {
    cy.get('header')
      .find('#logout-form').should('not.exist');
  });
});

describe('Featured Project Section', () => {
  it('conditionally Test Featured Project Section', () => {
    cy.visit('/');
    cy.get('body').then(($body) => {
      if($body.find('#featuredProjectSection').length > 0) {
        cy.get('#featuredProjectSection')
          .should('exist')
          .within(() => {
            cy.get('#linkContainer')
              .should('exist')
              .contains('a', 'Read More').click()
              .url().should('include', '/projects');
          });
      } else {
        cy.log('Featured Project Section does not exist, skipping test');
      }
    });
  });
});

describe('Featured Event Section', () => {
  it('conditionally Test Featured Project Section', () => {
    cy.visit('/');
    cy.get('body').then(($body) => {
      if($body.find('#featuredEventSection').length > 0) {
        cy.get('#featuredEventSection')
          .should('exist')
          .within(() => {
            cy.get('#linkContainer')
              .should('exist')
              .contains('a', 'Read More').click()
              .url().should('include', '/events');
          });
      } else {
        cy.log('Featured Event Section does not exist, skipping test');
      }
    });
  });
});

describe('Garbage Collection Section', () => {
  it('conditionally Test Garbage Collection Section', () => {
    cy.visit('/');
    cy.get('body').then(($body) => {
      if($body.find('#garbageCollectionSectionIndex').length > 0) {
        cy.get('#garbageCollectionSectionIndex')
          .should('exist')
          .within(() => {
            cy.get('table').should('exist')
          });
      }
    })

  });
});

describe('Projects Page', () => {
  beforeEach(() => {
    cy.visit('/projects');
  });

  it('should navigate to Projects page', () => {
    cy.url().should('include', '/projects');
  });

  it('conditionally test card', () => {
    cy.wait(2500); // Wait for the page to load and content to be fetched
    cy.get('body').then(($body) => {
      if($body.find('.card').length > 0) {
        cy.get('.card').first().within(()=> {
          cy.get('.card-body').within(() => {
            cy.get('a').should('exist')
              .and('have.attr', 'href')
              .and('include', '/projects')
          });
        });
      } else {
        cy.log('No project cards found, skipping test');
      }
    });
  });

  it('project card can be visited', () => {
    cy.get('.card').first().within(() => {
      cy.get('.card-body').within(() => {
        cy.get('a').first().click();

        cy.url().should('include', '/projects');
      });
    });
  });

  it('single project rendering correct layout', () => {
    cy.visit('/projects/vaccine-village');
    cy.get('#type-single-container').should('exist');
    cy.get('#form-message').should('not.exist');
  });
});

describe('Events Page', () => {
  beforeEach(() => {
    cy.visit('/events');
  });

  it('should navigate to Event page', () => {
    cy.url().should('include', '/events');
  });

  it('conditionally test event card', () => {
    cy.wait(2500); // Wait for the page to load and content to be fetched
    cy.get('body').then(($body) => {
      if($body.find('.card').length > 0) {
        cy.get('.card').first().within(()=> {
          cy.get('.card-body').within(() => {
            cy.get('a').should('exist')
              .and('have.attr', 'href')
              .and('include', '/events')
          });
        });
      } else {
        cy.log('No event cards found, skipping test');
      }
    });
  });

  it('event card can be visited', () => {
    cy.get('.card').first().within(() => {
      cy.get('.card-body').within(() => {
        cy.get('a').first().click();

        cy.url().should('include', '/event');
      });
    });
  });

  it('single event rendering correct layout', () => {
    cy.visit('/events/soft-opening-of-hh3-playground');
    cy.get('#type-single-container').should('exist');
    cy.get('#form-message').should('not.exist');
    cy.get('#attendEventSingle').should('not.exist');
  });
});

describe.only('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('login page should be accessible and visible', () => {
    cy.get('#login-form')
      .should('exist')
      .and('be.visible');
  });

  it('should allow a user to type email and password and submit', () => {
    cy.get('#email')
      .type('test@example.com')
      .should('have.value', 'test@example.com');

    cy.get('#password')
      .type('password123')
      .should('have.value', 'password123');

    cy.get('#login-button').click();
  });

  it('invalid login alert working properly', () => {
    cy.get('#email')
      .type('test@example.com')
      .should('have.value', 'test@example.com');

    cy.get('#password')
      .type('password123')
      .should('have.value', 'password123');

    cy.get('#login-button').click();
    cy.get('.alert-con').should('exist').and('be.visible');
    cy.get('.alert-danger').should('exist');
    cy.wait(5000); // Wait for the alert to disappear
    cy.get('.alert-con').should('not.exist');
  });

  it('should successfully login with valid credentials', () => {
    cy.get('#email')
      .type('admin@gmail.com')
      .should('have.value', 'admin@gmail.com');

    cy.get('#password')
      .type('test1234')
      .should('have.value', 'test1234');

    cy.get('#login-button').click();
    cy.wait(2000); // Wait for the login to process
    cy.url().should('include', '/');
  });
});