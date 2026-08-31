package ch.diethelm.backend;

import ch.diethelm.backend.model.Game;
import ch.diethelm.backend.repository.GameRepository;
import ch.diethelm.backend.service.GameService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private GameService gameService;


    @Test
    void getAllGames_returnsListFromRepository() {
        Game game1 = Game.builder()
                .id(1L)
                .title("Minecraft")
                .description("Sandbox game")
                .imageUrl("minecraft.jpg")
                .releaseDate(LocalDate.of(2011, 11, 18))
                .build();

        Game game2 = Game.builder()
                .id(2L)
                .title("Portal 2")
                .description("Puzzle game")
                .imageUrl("portal2.jpg")
                .releaseDate(LocalDate.of(2011, 4, 19))
                .build();

        List<Game> games = List.of(game1, game2);

        when(gameRepository.findAll()).thenReturn(games);

        List<Game> result = gameService.getAllGames();

        assertEquals(games, result);
        verify(gameRepository).findAll();
    }


    @Test
    void getGameById_returnsGameWhenExists() {
        Game game = Game.builder()
                .id(1L)
                .title("Minecraft")
                .description("Sandbox game")
                .imageUrl("minecraft.jpg")
                .releaseDate(LocalDate.of(2011, 11, 18))
                .build();

        when(gameRepository.findById(1L)).thenReturn(Optional.of(game));

        Game result = gameService.getGameById(1L);

        assertEquals(game, result);
        verify(gameRepository).findById(1L);
    }


    @Test
    void getGameById_throwsExceptionWhenGameDoesNotExist() {
        when(gameRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                NoSuchElementException.class,
                () -> gameService.getGameById(99L)
        );

        verify(gameRepository).findById(99L);
    }


    @Test
    void createGame_savesAndReturnsGame() {
        Game game = Game.builder()
                .title("Minecraft")
                .description("Sandbox game")
                .imageUrl("minecraft.jpg")
                .releaseDate(LocalDate.of(2011, 11, 18))
                .build();

        Game savedGame = Game.builder()
                .id(1L)
                .title("Minecraft")
                .description("Sandbox game")
                .imageUrl("minecraft.jpg")
                .releaseDate(LocalDate.of(2011, 11, 18))
                .build();

        when(gameRepository.save(game)).thenReturn(savedGame);

        Game result = gameService.createGame(game);

        assertEquals(savedGame, result);
        verify(gameRepository).save(game);
    }


    @Test
    void updateGame_updatesAllFields() {
        Game existingGame = Game.builder()
                .id(1L)
                .title("Old Title")
                .description("Old Description")
                .imageUrl("old.jpg")
                .releaseDate(LocalDate.of(2020, 1, 1))
                .build();

        Game updatedGame = Game.builder()
                .id(999L)
                .title("New Title")
                .description("New Description")
                .imageUrl("new.jpg")
                .releaseDate(LocalDate.of(2022, 5, 10))
                .build();

        when(gameRepository.findById(1L)).thenReturn(Optional.of(existingGame));
        when(gameRepository.save(existingGame)).thenReturn(existingGame);

        Game result = gameService.updateGame(1L, updatedGame);

        assertEquals("New Title", existingGame.getTitle());
        assertEquals("New Description", existingGame.getDescription());
        assertEquals("new.jpg", existingGame.getImageUrl());
        assertEquals(LocalDate.of(2022, 5, 10), existingGame.getReleaseDate());

        assertEquals(existingGame, result);

        verify(gameRepository).findById(1L);
        verify(gameRepository).save(existingGame);
    }


    @Test
    void updateGame_throwsExceptionWhenGameDoesNotExist() {
        Game updatedGame = Game.builder()
                .title("New Title")
                .description("New Description")
                .imageUrl("new.jpg")
                .releaseDate(LocalDate.of(2022, 5, 10))
                .build();

        when(gameRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                NoSuchElementException.class,
                () -> gameService.updateGame(99L, updatedGame)
        );

        verify(gameRepository).findById(99L);
        verify(gameRepository, never()).save(any());
    }


    @Test
    void deleteGame_deletesGameWhenItExists() {
        when(gameRepository.existsById(1L)).thenReturn(true);

        gameService.deleteGame(1L);

        verify(gameRepository).existsById(1L);
        verify(gameRepository).deleteById(1L);
    }


    @Test
    void deleteGame_throwsExceptionWhenGameDoesNotExist() {
        when(gameRepository.existsById(99L)).thenReturn(false);

        assertThrows(
                NoSuchElementException.class,
                () -> gameService.deleteGame(99L)
        );

        verify(gameRepository).existsById(99L);
        verify(gameRepository, never()).deleteById(anyLong());
    }


    @Test
    void searchByTitle_delegatesToRepository() {
        Game game = Game.builder()
                .id(1L)
                .title("Minecraft")
                .description("Sandbox game")
                .imageUrl("minecraft.jpg")
                .releaseDate(LocalDate.of(2011, 11, 18))
                .build();

        List<Game> games = List.of(game);

        when(gameRepository.findByTitleContainingIgnoreCase("mine"))
                .thenReturn(games);

        List<Game> result = gameService.searchByTitle("mine");

        assertEquals(games, result);
        verify(gameRepository)
                .findByTitleContainingIgnoreCase("mine");
    }
}