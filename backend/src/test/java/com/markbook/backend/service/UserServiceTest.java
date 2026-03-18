package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.User;
import com.markbook.backend.repository.UserRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private static final String USER_ID = "user@example.com";

    private User buildUser() {
        User user = new User(USER_ID, "John Doe", USER_ID);
        user.setPasswordHash("hashed_old");
        user.setRole("USER");
        return user;
    }

    // -------------------------------------------------------
    // getUser
    // -------------------------------------------------------
    @Nested
    class GetUser {

        @Test
        void returnsUserWhenFound() {
            User user = buildUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

            User result = userService.getUser(USER_ID);

            assertEquals("John Doe", result.getName());
            assertEquals(USER_ID, result.getId());
        }

        @Test
        void throwsWhenUserNotFound() {
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> userService.getUser(USER_ID));
        }
    }

    // -------------------------------------------------------
    // updateUser
    // -------------------------------------------------------
    @Nested
    class UpdateUser {

        @Test
        void updatesUserNameSuccessfully() {
            User user = buildUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            User result = userService.updateUser(USER_ID, "Jane Doe");

            assertEquals("Jane Doe", result.getName());
            verify(userRepository).save(user);
        }
    }

    // -------------------------------------------------------
    // changePassword
    // -------------------------------------------------------
    @Nested
    class ChangePassword {

        @Test
        void changesPasswordWhenCurrentPasswordMatches() {
            User user = buildUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("oldPassword", "hashed_old")).thenReturn(true);
            when(passwordEncoder.encode("newPassword")).thenReturn("hashed_new");

            userService.changePassword(USER_ID, "oldPassword", "newPassword");

            assertEquals("hashed_new", user.getPasswordHash());
            verify(userRepository).save(user);
        }

        @Test
        void throwsWhenCurrentPasswordIsWrong() {
            User user = buildUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("wrong", "hashed_old")).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> userService.changePassword(USER_ID, "wrong", "newPassword"));

            assertEquals(400, ex.getStatusCode().value());
            verify(userRepository, never()).save(any());
        }

        @Test
        void newPasswordIsStoredAsHash() {
            User user = buildUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("oldPassword", "hashed_old")).thenReturn(true);
            when(passwordEncoder.encode("newPassword")).thenReturn("hashed_new");

            userService.changePassword(USER_ID, "oldPassword", "newPassword");

            assertNotEquals("newPassword", user.getPasswordHash());
            assertEquals("hashed_new", user.getPasswordHash());
        }
    }
}
