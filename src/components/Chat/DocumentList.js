import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Article as DocIcon,
  TextFields as TextIcon,
  Delete as DeleteIcon,
  CheckCircle as SelectedIcon,
} from "@mui/icons-material";

const getFileIcon = (mimeType) => {
  if (mimeType.includes("pdf")) return <PdfIcon />;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return <DocIcon />;
  if (mimeType.includes("text")) return <TextIcon />;
  return <DocumentIcon />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const DocumentList = ({
  documents = [],
  selectedDocument,
  onSelectDocument,
  onDeleteDocument,
  sidebarOpen,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (documents.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        <Typography variant="body2">No documents uploaded yet.</Typography>
        <Typography variant="caption">
          Upload a document to start chatting about it.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontSize: isMobile ? "1rem" : "1.125rem",
          fontWeight: 600,
        }}
      >
        Documents ({documents.length})
      </Typography>

      <List sx={{ p: 0 }}>
        {documents.map((doc) => (
          <ListItem
            key={doc.id}
            disablePadding
            sx={{
              mb: 1,
              borderRadius: 1,
              border:
                selectedDocument?.id === doc.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : "1px solid transparent",
              backgroundColor:
                selectedDocument?.id === doc.id
                  ? "rgba(25, 118, 210, 0.08)"
                  : "transparent",
            }}
          >
            <ListItemButton
              onClick={() => onSelectDocument(doc)}
              sx={{
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {selectedDocument?.id === doc.id ? (
                  <SelectedIcon color="primary" />
                ) : (
                  getFileIcon(doc.type)
                )}
              </ListItemIcon>

              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: selectedDocument?.id === doc.id ? 600 : 400,
                      fontSize: isMobile ? "0.875rem" : "0.875rem",
                    }}
                  >
                    {doc.name}
                  </Typography>
                }
                secondary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 0.5,
                    }}
                  >
                    <Chip
                      label={formatFileSize(doc.size)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.75rem", height: 20 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />

              <Tooltip title="Delete document">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                  }}
                  sx={{
                    opacity: 0.7,
                    "&:hover": {
                      opacity: 1,
                      color: "error.main",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default DocumentList;
