import { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  Fade,
  Avatar,
  CircularProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import RemoveIcon from "@mui/icons-material/Remove";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { sendChatMessage } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

const initialMessages = (): Message[] => [
  {
    id: 0,
    text: "Hi! I'm your Mark Book assistant. Ask me about your classes, exams, payments, or attendance!",
    sender: "bot",
    timestamp: new Date(),
  },
];

export default function ChatBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset chat when user changes (login/logout/switch account)
  useEffect(() => {
    setMessages(initialMessages());
    setInput("");
    setLoading(false);
    setOpen(false);
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await sendChatMessage(trimmed);
      const botMsg: Message = {
        id: Date.now() + 1,
        text: reply,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Sorry, something went wrong. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
      {/* Chat Window */}
      <Fade in={open}>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 340,
            height: 440,
            display: open ? "flex" : "none",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SmartToyIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600}>
                Assistant
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "white" }}>
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              bgcolor: "#f5f5f5",
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  gap: 1,
                  alignItems: "flex-end",
                }}
              >
                {msg.sender === "bot" && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>
                    <SmartToyIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: "75%",
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: msg.sender === "user" ? "primary.main" : "white",
                    color: msg.sender === "user" ? "white" : "text.primary",
                    boxShadow: 1,
                    fontSize: "0.875rem",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {renderMarkdown(msg.text)}
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>
                  <SmartToyIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: "white",
                    boxShadow: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Thinking...
                  </Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              gap: 1,
              bgcolor: "white",
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  fontSize: "0.875rem",
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="small"
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Fade>

      {/* Floating Button */}
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            width: 52,
            height: 52,
            boxShadow: 4,
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          <ChatIcon />
        </IconButton>
      )}
    </Box>
  );
}
