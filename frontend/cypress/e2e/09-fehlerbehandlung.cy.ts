/// <reference types="cypress" />

/**
 * Simulieren Fehler, die im Betrieb auftreten könnten. Dadurch wird geprüft,
 * ob Nutzer eine verständliche
 * Fehlermeldung sehen und die Oberfläche nicht einfach leer oder kaputt wird.
 */
describe('Fehlerbehandlung', () => {
    it('zeigt einen Fehler beim initialen Laden der Spiele', () => {
        cy.intercept('GET', '/api/games', {
            statusCode: 500,
            body: {
                error: 'Internal Server Error',
            },
        }).as('getGamesError');

        cy.visit('/');

        cy.wait('@getGamesError');

        cy.get('.home-page__error')
            .should('be.visible')
            .and('contain.text', 'Fehler beim Laden der Spiele.');
    });

    it('zeigt einen Fehler, wenn die Suche mit einem Serverfehler antwortet', () => {
        cy.visitApp();

        cy.intercept('GET', '/api/games/search*', {
            statusCode: 500,
            body: {
                error: 'Internal Server Error',
            },
        }).as('searchError');

        cy.get('.search-bar__input')
            .type('CypressServerError');

        cy.get('.search-bar__button').click();

        cy.wait('@searchError');

        cy.get('.home-page__error')
            .should('be.visible')
            .and('contain.text', 'Fehler bei der Suche.');
    });

    it('zeigt einen Fehler beim Erstellen bei einem Netzwerkfehler', () => {
        cy.visitApp();

        const title = `Cypress Network Error ${Date.now()}`;

        cy.openAddGameForm();

        cy.fillGameForm({
            title,
            description: 'Dieses Spiel darf nicht gespeichert werden.',
            releaseDate: '2020-03-03',
        });

        cy.intercept('POST', '/api/games', {
            forceNetworkError: true,
        }).as('createNetworkError');

        cy.get('.game-form__btn--submit').click();

        cy.wait('@createNetworkError');

        cy.get('.game-form')
            .should('not.exist');

        // Das Spiel darf wegen des fehlgeschlagenen POST nicht erscheinen.
        cy.contains('.game-card__title', title)
            .should('not.exist');

        // Die Anwendung zeigt den Fehler im Banner an.
        cy.get('.home-page__error')
            .should('be.visible')
            .and('contain.text', 'Fehler beim Erstellen des Spiels.');
    });
});