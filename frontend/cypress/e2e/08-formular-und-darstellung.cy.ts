/// <reference types="cypress" />

/**
 * Diese Tests prüfen wichtige Formular- und Darstellungsfälle.
 * Besonders relevant sind Abbrechen beim Bearbeiten sowie fehlende
 * oder ungültige Bilder, da Nutzer dabei keine Daten verlieren und
 * trotzdem eine verständliche Darstellung erhalten sollen.
 */
describe('Formular und Darstellung', () => {
    const uniqueSuffix = () => Date.now().toString();

    beforeEach(() => {
        cy.visitApp();
    });

    it('bricht die Bearbeitung ab und behält die Originaldaten', () => {
        const suffix = uniqueSuffix();
        const title = `Cypress Cancel Original ${suffix}`;
        const description = `Original Beschreibung ${suffix}`;

        cy.openAddGameForm();

        cy.fillGameForm({
            title,
            description,
            releaseDate: '2021-05-15',
        });

        cy.intercept('POST', '/api/games').as('createGame');

        cy.get('.game-form__btn--submit').click();

        cy.wait('@createGame');

        cy.contains('.game-card', title).should('be.visible');

        // Originaldaten vor dem Bearbeiten speichern.
        cy.contains('.game-card', title).within(() => {
            cy.get('.game-card__title')
                .invoke('text')
                .as('originalTitle');

            cy.get('.game-card__description')
                .invoke('text')
                .as('originalDescription');

            cy.get('.game-card__btn--edit').click();
        });

        cy.get('.game-form').should('be.visible');

        // Daten absichtlich verändern.
        cy.fillGameForm({
            title: `Cypress Changed ${suffix}`,
            description: 'Diese Änderung darf nicht gespeichert werden.',
        });

        // Es darf beim Cancel kein PUT stattfinden.
        cy.intercept('PUT', '/api/games/*').as('updateGame');

        cy.get('.game-form__btn--cancel').click();

        cy.get('.game-form').should('not.exist');

        // Originaltitel und Originalbeschreibung müssen weiterhin vorhanden sein.
        cy.get('@originalTitle').then((originalTitle) => {
            cy.contains('.game-card__title', originalTitle as string)
                .should('be.visible');
        });

        cy.get('@originalDescription').then((originalDescription) => {
            cy.contains('.game-card__description', originalDescription as string)
                .should('be.visible');
        });

        cy.get('@updateGame.all').should('have.length', 0);

        cy.deleteGameByTitle(title);
    });

    it('zeigt "No Image" bei einer ungültigen Bild-URL', () => {
        const title = `Cypress Broken Image ${uniqueSuffix()}`;

        cy.openAddGameForm();

        cy.fillGameForm({
            title,
            description: 'Test mit ungültiger Bild-URL.',
            imageUrl: 'https://example.invalid/does-not-exist.jpg',
            releaseDate: '2020-01-01',
        });

        cy.intercept('POST', '/api/games').as('createGame');

        cy.get('.game-form__btn--submit').click();

        cy.wait('@createGame');

        cy.contains('.game-card', title)
            .should('be.visible')
            .within(() => {
                cy.get('.game-card__no-image')
                    .should('be.visible')
                    .and('contain.text', 'No Image');

                cy.get('img.game-card__image')
                    .should('not.exist');
            });

        cy.deleteGameByTitle(title);
    });

    it('zeigt "No Image", wenn keine Bild-URL angegeben wurde', () => {
        const title = `Cypress No Image ${uniqueSuffix()}`;

        cy.openAddGameForm();

        cy.fillGameForm({
            title,
            description: 'Test ohne Bild-URL.',
            releaseDate: '2020-02-02',
        });

        cy.intercept('POST', '/api/games').as('createGame');

        cy.get('.game-form__btn--submit').click();

        cy.wait('@createGame');

        cy.contains('.game-card', title)
            .should('be.visible')
            .within(() => {
                cy.get('.game-card__no-image')
                    .should('be.visible')
                    .and('contain.text', 'No Image');

                cy.get('img.game-card__image')
                    .should('not.exist');
            });

        cy.deleteGameByTitle(title);
    });
});