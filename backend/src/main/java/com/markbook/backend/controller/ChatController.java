package com.markbook.backend.controller;

import com.markbook.backend.dto.ChatResponse;
import com.markbook.backend.dto.request.ChatRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody @Valid ChatRequest body) {
        String userId = SecurityUtils.getCurrentUserId();
        String reply = chatService.chat(userId, body.message());
        return new ChatResponse(reply);
    }
}
