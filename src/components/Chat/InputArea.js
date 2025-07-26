import React from "react";
import {
  Paper,
  Container,
  Stack,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Chip,
  Box,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Send as SendIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { KEYBOARD_SHORTCUTS } from "../../utils/constants";

const InputArea = ({
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  sidebarOpen,
  textareaRef,
  editingMessage,
  onCancelEdit,
  onOpenDocuments,
  documentCount = 0,
  currentChatId,
  isGuest,
  selectedDocument,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleKeyPress = (e) => {
    if (e.key === KEYBOARD_SHORTCUTS.ENTER && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    } else if (e.key === "Escape" && editingMessage) {
      e.preventDefault();
      onCancelEdit();
    }
  };

  const handleSendClick = () => {
    onSendMessage();
  };

  const getReferenceText = () => {
    if (!selectedDocument) return null;

    const isImage =
      selectedDocument.mime_type &&
      selectedDocument.mime_type.startsWith("image/");

    if (isImage) {
      return `📷 Reference: I have attached an image "${selectedDocument.original_name}". Please analyze this image and answer my questions about it.`;
    } else {
      return `📄 Reference: I have attached a document "${selectedDocument.original_name}". Please use this document as context to answer my questions.`;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 1.5 : 2,
        backgroundColor: "#ffffff",
        borderTop: "1px solid #e0e0e0",
        position: isMobile ? "sticky" : "static",
        bottom: 0,
        zIndex: isMobile ? 2 : "auto",
      }}
    >
      <Container
        maxWidth={sidebarOpen && !isMobile ? "lg" : "md"}
        sx={{ transition: "all 0.2s ease" }}
      >
        {editingMessage && (
          <Box sx={{ mb: 1 }}>
            <Chip
              icon={<EditIcon sx={{ fontSize: 16 }} />}
              label="Edit and resend message"
              onDelete={onCancelEdit}
              deleteIcon={<CloseIcon sx={{ fontSize: 16 }} />}
              variant="outlined"
              color="primary"
              size="small"
              sx={{
                backgroundColor: "rgba(25, 118, 210, 0.08)",
                borderColor: "#1976d2",
              }}
            />
          </Box>
        )}

        {selectedDocument && (
          <Box sx={{ mb: 1 }}>
            <Chip
              label={getReferenceText()}
              variant="outlined"
              color="success"
              size="small"
              sx={{
                backgroundColor: "rgba(76, 175, 80, 0.08)",
                borderColor: "#4caf50",
                color: "#2e7d32",
                fontWeight: 500,
                maxWidth: "100%",
                "& .MuiChip-label": {
                  whiteSpace: "normal",
                  textAlign: "left",
                },
              }}
            />
          </Box>
        )}

        <Stack
          direction="row"
          spacing={isMobile ? 0.5 : 1}
          alignItems="flex-end"
        >
          <TextField
            ref={textareaRef}
            fullWidth
            multiline
            maxRows={isMobile ? 4 : 6}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              editingMessage
                ? "Edit your message and resend..."
                : "Type a message..."
            }
            disabled={isLoading}
            variant="outlined"
            size={isMobile ? "medium" : "small"}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                minHeight: isMobile ? 48 : 44,
                alignItems: "flex-end",
              },
              "& .MuiInputBase-input": {
                fontSize: isMobile ? "1rem" : "0.875rem",
                lineHeight: 1.5,
                padding: isMobile ? "12px 14px" : "4px 14px",
                resize: "none",
              },
              "& .MuiInputBase-inputMultiline": {
                overflow: "auto !important",
              },
            }}
          />
          {/* Documents Button */}
          <Tooltip
            title={
              isGuest
                ? "Login to use document upload and chat about files"
                : !currentChatId
                ? "Select or create a chat to use documents"
                : "Documents"
            }
          >
            <span>
              <Badge badgeContent={documentCount} color="primary" showZero>
                <IconButton
                  onClick={onOpenDocuments}
                  disabled={isLoading || !currentChatId || isGuest}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    color: "#666",
                    width: isMobile ? 48 : 44,
                    height: isMobile ? 48 : 44,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                      transform: "scale(1.05)",
                    },
                    "&:disabled": {
                      backgroundColor: "#e0e0e0",
                      color: "#9e9e9e",
                    },
                  }}
                >
                  <FolderIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Badge>
            </span>
          </Tooltip>
          <IconButton
            onClick={handleSendClick}
            disabled={!inputValue.trim() || isLoading}
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              width: isMobile ? 48 : 44,
              height: isMobile ? 48 : 44,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#1565c0",
                transform: "scale(1.05)",
              },
              "&:disabled": {
                backgroundColor: "#e0e0e0",
                color: "#9e9e9e",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "inherit" }} />
            ) : editingMessage ? (
              <SaveIcon sx={{ fontSize: 20 }} />
            ) : (
              <SendIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 1,
            display: "block",
            textAlign: "center",
          }}
        >
          {editingMessage
            ? "Press Enter to resend • Escape to cancel • Shift+Enter for new line"
            : "Press Enter to send • Shift+Enter for new line • ⌘K to search"}
        </Typography>
      </Container>
    </Paper>
  );
};

export default InputArea;
