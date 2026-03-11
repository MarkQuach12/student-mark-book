package com.markbook.backend.dto;

import com.markbook.backend.model.User;

public record UserDTO(String id, String name, String email) {
    public static UserDTO from(User user) {
        return new UserDTO(user.getId(), user.getName(), user.getEmail());
    }
}
