package com.markbook.backend.controller;

import lombok.RequiredArgsConstructor;

import com.markbook.backend.dto.ChatResponse;
import com.markbook.backend.dto.request.ChatRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ChatResponse chat(@RequestBody @Valid ChatRequest body) {
        String userId = SecurityUtils.getCurrentUserId();
        String reply = chatService.chat(userId, body.message(), body.history());
        return new ChatResponse(reply);
    }
}
