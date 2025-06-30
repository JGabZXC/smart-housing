/* eslint-disable */

Cypress.on('uncaught:exception', (err, runnable) => {
  return false
});

describe('Main Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Should have a visible header with correct links', () => {
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
})

describe('Hero Section', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Should render hero banner with correct structure and styles', () => {
    // Check main banner div
    cy.get('#heroBannerSection > div.position-relative')
      .should('be.visible')
      .should('have.css', 'height', '600px')
      .should('have.css', 'background-image')
      .and('include', '/img/holiday-homes-banner.webp');

    // Check overlay
    cy.get('.position-absolute')
      .should('have.css', 'background-color', 'rgba(3, 100, 63, 0.5)')
      .should('have.css', 'z-index', '1');

    // Check content container
    cy.get('#heroContent')
      .should('have.class', 'h-100')
      .should('have.css', 'z-index', '2');
  });

  it('Should display correct content with proper styling', () => {
    // Check content div
    cy.get('.text-center.text-md-start')
      .should('have.css', 'max-width', '500px')
      .within(() => {
        // Check heading
        cy.get('h1')
          .should('have.class', 'text-uppercase')
          .should('have.class', 'fw-bold')
          .should('have.class', 'text-slate-50')
          .should('contain', 'Welcome to Holiday Homes');

        // Check first paragraph
        cy.get('p').first()
          .should('have.class', 'fw-semibold')
          .should('have.class', 'text-slate-50')
          .should('contain', 'Simplify community living with powerful tools');

        // Check second paragraph
        cy.get('p').last()
          .should('have.class', 'text-slate-200')
          .should('contain', 'Manage dues, reserve amenities');
      });
  });
});

describe('Featured Project and Event showing properly', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Featured Project is Visible', () => {
    cy.get('[id="featuredProjectSection"]').should('be.visible');
  });

  it('Featured Event is Visible', () => {
    // cy.get('[id="featuredEvent"]').should('not.exist');
    cy.get('[id="featuredEventSection"]').should('be.visible');
  });
});

describe('Garbage Collection', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Section is visible', () => {
    cy.get('#garbageCollectionSection')
      .should('exist')
      .should('be.visible');
  });

  it('Should display correct content', () => {
    cy.get('#garbageCollectionSection')
      .should('contain', 'Garbage Collection Schedule')
      .and('contain', 'Weekly pickup schedule for all phases');
  });
});