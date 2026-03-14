package com.markbook.backend.controller;

import com.markbook.backend.dto.UserDTO;
import com.markbook.backend.dto.request.ChangePasswordRequest;
import com.markbook.backend.dto.request.UpdateUserRequest;
import com.markbook.backend.security.SecurityUtils;
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
    public UserDTO getCurrentUser() {
        return UserDTO.from(userService.getUser(SecurityUtils.getCurrentUserId()));
    }

    @PutMapping("/me")
    public UserDTO updateCurrentUser(@Valid @RequestBody UpdateUserRequest request) {
        return UserDTO.from(userService.updateUser(SecurityUtils.getCurrentUserId(), request.name()));
    }

    @PutMapping("/me/password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(SecurityUtils.getCurrentUserId(), request.currentPassword(), request.newPassword());
    }
}
