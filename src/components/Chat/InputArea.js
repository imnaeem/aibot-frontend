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
} from "@mui/material";
import {
  Send as SendIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Save as SaveIcon,
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
