package com.markbook.backend.controller;

import com.markbook.backend.dto.UserDTO;
import com.markbook.backend.dto.request.UpdateUserRequest;
import com.markbook.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserDTO getCurrentUser(@RequestHeader("X-User-Id") String userId) {
        return UserDTO.from(userService.getUser(userId));
    }

    @PutMapping("/me")
    public UserDTO updateCurrentUser(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody UpdateUserRequest request) {
        return UserDTO.from(userService.updateUser(userId, request.name()));
    }
}
