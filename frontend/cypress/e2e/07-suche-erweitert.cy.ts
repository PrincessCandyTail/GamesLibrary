/// <reference types="cypress" />

/**
 * Diese Tests prüfen ungewöhnliche Suchbegriffe.
 * Das ist wichtig, weil Nutzer auch Sonderzeichen oder sehr lange
 * Eingaben verwenden können. Die Anwendung darf dabei weder abstürzen
 * noch bei jeder einzelnen Eingabe einen Request auslösen.
 */
describe('Erweiterte Suche', () => {
    beforeEach(() => {
        cy.visitApp();
    });

    it('verträgt Sonderzeichen und Umlaute in der Suche', () => {
        const searchTerm = '% < & äöü';

        cy.intercept('GET', '/api/games/search*').as('search');

        cy.get('.search-bar__input').type(searchTerm);
        cy.get('.search-bar__button').click();

        cy.wait('@search')
            .its('response.statusCode')
            .should('eq', 200);

        // Es darf entweder ein Treffer oder "No Games Found" angezeigt werden.
        cy.get('.game-list__status-title, .game-card__title')
            .should('exist');

        cy.get('body').should('not.contain.text', 'Application Error');
    });

    it('verträgt einen sehr langen Suchbegriff mit mehr als 200 Zeichen', () => {
        const searchTerm = 'CypressLongSearch'.repeat(20); // > 200 Zeichen

        expect(searchTerm.length).to.be.greaterThan(200);

        cy.intercept('GET', '/api/games/search*').as('search');

        cy.get('.search-bar__input').type(searchTerm);
        cy.get('.search-bar__button').click();

        // Der Request darf nicht hängen bleiben.
        cy.wait('@search', { timeout: 10000 })
            .its('response.statusCode')
            .should('eq', 200);

        cy.get('.game-list__status-title, .game-card__title')
            .should('exist');

        cy.get('body').should('not.contain.text', 'Application Error');
    });

    it('führt die Suche erst nach Klick auf den Such-Button aus', () => {
        const searchTerm = `CypressDelayedSearch_${Date.now()}`;

        cy.intercept('GET', '/api/games/search*').as('search');

        // Nur tippen: Es darf noch kein Such-Request ausgelöst werden.
        cy.get('.search-bar__input').type(searchTerm);

        cy.get('@search.all').should('have.length', 0);

        // Erst der Klick darf die Suche auslösen.
        cy.get('.search-bar__button').click();

        cy.wait('@search')
            .its('response.statusCode')
            .should('eq', 200);

        cy.get('.game-list__status-title, .game-card__title')
            .should('exist');
    });
});