import { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  Paper,
  Fade,
  Avatar,
  CircularProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToyOutlined";
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

  if (!user) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1300,
      }}
    >
      <Fade in={open}>
        <Paper
          variant="outlined"
          sx={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: 360,
            maxHeight: 560,
            display: open ? "flex" : "none",
            flexDirection: "column",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 4,
              py: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <SmartToyIcon sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Assistant
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton size="small" onClick={() => setOpen(false)}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 4,
              py: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
              minHeight: 280,
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  gap: 2,
                  alignItems: "flex-end",
                }}
              >
                {msg.sender === "bot" && (
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: (t) =>
                        t.palette.mode === "dark"
                          ? "rgba(59, 111, 160, 0.20)"
                          : "primary.tint",
                      color: "primary.main",
                    }}
                  >
                    <SmartToyIcon sx={{ fontSize: 14 }} />
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: "78%",
                    px: 3,
                    py: 2,
                    borderRadius: 1.5,
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                    bgcolor:
                      msg.sender === "user"
                        ? "primary.main"
                        : (t) =>
                            t.palette.mode === "dark"
                              ? "rgba(243, 244, 246, 0.05)"
                              : "#F3F4F6",
                    color:
                      msg.sender === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                  }}
                >
                  {renderMarkdown(msg.text)}
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(59, 111, 160, 0.20)"
                        : "primary.tint",
                    color: "primary.main",
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 14 }} />
                </Avatar>
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderRadius: 1.5,
                    bgcolor: (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(243, 244, 246, 0.05)"
                        : "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <CircularProgress size={14} />
                  <Typography variant="caption" color="text.secondary">
                    Thinking…
                  </Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box
            sx={{
              p: 3,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              gap: 2,
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder="Ask about classes, exams, payments…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
              inputProps={{ maxLength: 1000 }}
            />
            <Tooltip title="Send">
              <span>
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  size="small"
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "&:hover": { bgcolor: "primary.main", opacity: 0.92 },
                    "&.Mui-disabled": {
                      bgcolor: "action.hover",
                      color: "text.disabled",
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Paper>
      </Fade>

      {/* Floating Button */}
      {!open && (
        <Tooltip title="Ask the assistant">
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              width: 44,
              height: 44,
              boxShadow: 3,
              borderRadius: 2,
              "&:hover": { bgcolor: "primary.main", opacity: 0.92 },
            }}
          >
            <ChatIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
