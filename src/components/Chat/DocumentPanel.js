import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Article as DocIcon,
  TextFields as TextIcon,
  Delete as DeleteIcon,
  CheckCircle as SelectedIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  Image as ImageIcon,
  Collections as CollectionsIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import {
  uploadDocumentToStorage,
  createDocumentRecord,
  getChatDocuments,
  deleteDocument,
  getDocumentContent,
  supabase,
} from "../../lib/supabase";
import { processDocument } from "../../services/chatService";

const getFileIcon = (mimeType) => {
  if (mimeType.includes("pdf"))
    return (
      <Typography sx={{ fontSize: 20, color: "primary.main" }}>📄</Typography>
    );
  if (mimeType.includes("word") || mimeType.includes("document"))
    return (
      <Typography sx={{ fontSize: 20, color: "primary.main" }}>📋</Typography>
    );
  if (mimeType.includes("text"))
    return (
      <Typography sx={{ fontSize: 20, color: "primary.main" }}>📄</Typography>
    );
  if (mimeType.startsWith("image/"))
    return (
      <Typography sx={{ fontSize: 20, color: "primary.main" }}>📷</Typography>
    );
  return (
    <Typography sx={{ fontSize: 20, color: "primary.main" }}>📁</Typography>
  );
};

const isImageFile = (mimeType) => {
  return mimeType && mimeType.startsWith("image/");
};

const categorizeDocuments = (documents) => {
  const images = documents.filter((doc) => isImageFile(doc.mime_type));
  const otherDocs = documents.filter((doc) => !isImageFile(doc.mime_type));
  return { images, otherDocs };
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getDocumentUrl = (filePath) => {
  if (!filePath) return null;
  // Create a signed URL that expires in 1 hour
  return supabase.storage
    .from("aibot")
    .createSignedUrl(filePath, 3600) // 1 hour = 3600 seconds
    .then(({ data, error }) => {
      if (error) {
        console.error("Error creating signed URL:", error);
        return null;
      }
      return data.signedUrl;
    });
};

const handleOpenDocument = (doc) => {
  getDocumentUrl(doc.file_path).then((url) => {
    if (url) {
      window.open(url, "_blank");
    }
  });
};

const DocumentPanel = ({
  open,
  onClose,
  currentChatId,
  selectedDocument,
  onSelectDocument,
  onDocumentUpload,
  onDeleteDocument,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingDocumentId, setProcessingDocumentId] = useState(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState(null);
  const fileInputRef = useRef();

  // Load documents for current chat
  useEffect(() => {
    if (currentChatId && user) {
      loadChatDocuments();
    }
  }, [currentChatId, user]);

  const loadChatDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await getChatDocuments(currentChatId);
      if (error) throw error;
      setDocuments(data || []);
      // Update document count
      if (onDocumentUpload) {
        onDocumentUpload({ count: (data || []).length });
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!currentChatId || !user) return;

    setUploading(true);
    try {
      // Upload to Supabase storage
      const { fileName } = await uploadDocumentToStorage(
        file,
        currentChatId,
        user.id
      );

      // Create document record in database
      const documentData = {
        chat_id: currentChatId,
        user_id: user.id,
        filename: fileName,
        original_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
      };

      const { data: newDocument, error } = await createDocumentRecord(
        documentData
      );
      if (error) throw error;

      // Add to local state
      setDocuments((prev) => [newDocument, ...prev]);

      // Notify parent component
      if (onDocumentUpload) {
        onDocumentUpload({ count: documents.length + 1 });
      }

      console.log("Document uploaded successfully:", newDocument);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      // Upload to Supabase storage
      const { fileName } = await uploadDocumentToStorage(
        file,
        currentChatId,
        user.id
      );

      // Create document record in database
      const documentData = {
        chat_id: currentChatId,
        user_id: user.id,
        filename: fileName,
        original_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
      };

      const { data: newDocument, error } = await createDocumentRecord(
        documentData
      );
      if (error || !newDocument || !newDocument.id) {
        alert("Failed to create document record. Please try again.");
        return;
      }

      // Add to local state
      setDocuments((prev) => [newDocument, ...prev]);

      // Notify parent component
      if (onDocumentUpload) {
        onDocumentUpload({ count: documents.length + 1 });
      }

      console.log("Document uploaded successfully:", newDocument);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      // After upload, reset file input so dialog can be reopened
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async (documentId) => {
    setDeletingDocumentId(documentId);
    try {
      const { error } = await deleteDocument(documentId);
      if (error) throw error;

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

      // Clear selection if this document was selected
      if (selectedDocument && selectedDocument.id === documentId) {
        onSelectDocument(null);
      }

      // Notify parent component to update document count
      if (onDeleteDocument) {
        onDeleteDocument({ count: documents.length - 1 });
      }

      console.log("Document deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      alert(`Delete failed: ${error.message}`);
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleSelectDocument = async (document) => {
    // Toggle selection - if already selected, unselect it
    if (selectedDocument?.id === document.id) {
      onSelectDocument(null);
      return;
    }

    // Only allow processing if document has a real id
    if (!document.id) {
      alert("Document is not ready yet. Please wait a moment and try again.");
      return;
    }
    // If document doesn't have extracted text, try to load it
    if (!document.extracted_text) {
      setProcessingDocumentId(document.id);
      try {
        // Process the document to extract text
        const result = await processDocument(document.id);
        console.log("Document processed:", result);

        // Update document with content
        const updatedDocument = {
          ...document,
          extracted_text: result.extractedText,
        };
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === document.id ? updatedDocument : doc))
        );

        onSelectDocument(updatedDocument);
      } catch (error) {
        console.error("Error loading document content:", error);
        // Show error to user
        alert(`Failed to process document: ${error.message}`);
        // Do not select the document if processing fails
      } finally {
        setProcessingDocumentId(null);
      }
    } else {
      onSelectDocument(document);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <Box
          onClick={onClose}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0,0,0,0.18)",
            zIndex: 9,
          }}
        />
      )}
      {/* Panel */}
      <Box
        sx={{
          width: 340,
          transform: open ? "translateX(0)" : "translateX(100%)",
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 200px)", // More space for header and input area
          background: "#fafbfc",
          borderLeft: "1px solid #e0e0e0",
          borderTop: "1px solid #e0e0e0",
          borderBottom: "1px solid #e0e0e0",
          borderTopLeftRadius: "12px",
          borderBottomLeftRadius: "12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.3s ease-in-out",
          position: "absolute",
          right: 0,
          top: "17px", // Closer to header
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {/* Header and Upload */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 2,
            borderBottom: "1px solid #eee",
          }}
        >
          <Typography variant="h6" sx={{ flex: 1 }}>
            Documents
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            fullWidth
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={uploading}
            startIcon={<AttachFileIcon />}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Scrollable Documents List */}
        <Box sx={{ flex: 1, overflow: "auto", px: 2, pb: 2 }}>
          {/* Documents List */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : documents.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                No documents uploaded yet.
              </Typography>
              <Typography variant="caption">
                Upload a document to start chatting about it.
              </Typography>
            </Box>
          ) : (
            (() => {
              const { images, otherDocs } = categorizeDocuments(documents);
              return (
                <>
                  {/* Documents Section */}
                  {otherDocs.length > 0 && (
                    <>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color="text.primary"
                        sx={{
                          mb: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: 18 }}>📚</Typography>
                        Documents ({otherDocs.length})
                      </Typography>
                      <List sx={{ p: 0, mb: 2 }}>
                        {otherDocs.map((doc) => (
                          <ListItem
                            key={doc.id}
                            disablePadding
                            sx={{
                              mb: 1,
                              borderRadius: 1,
                              backgroundColor:
                                selectedDocument?.id === doc.id
                                  ? "rgba(25, 118, 210, 0.08)"
                                  : "transparent",
                            }}
                          >
                            <ListItemButton
                              onClick={() => handleSelectDocument(doc)}
                              sx={{
                                mx: 0,
                                borderRadius: 1,
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                {processingDocumentId === doc.id ? (
                                  <CircularProgress size={20} />
                                ) : selectedDocument?.id === doc.id ? (
                                  <SelectedIcon color="primary" />
                                ) : (
                                  getFileIcon(doc.mime_type)
                                )}
                              </ListItemIcon>

                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        selectedDocument?.id === doc.id
                                          ? 600
                                          : 400,
                                      fontSize: "0.875rem",
                                      color:
                                        processingDocumentId === doc.id
                                          ? "text.secondary"
                                          : "inherit",
                                    }}
                                  >
                                    {processingDocumentId === doc.id
                                      ? `${doc.original_name} (Processing...)`
                                      : doc.original_name}
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
                                      label={formatFileSize(doc.file_size)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.75rem", height: 20 }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        doc.created_at
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                }
                              />

                              <Tooltip title="Delete document">
                                <IconButton
                                  size="small"
                                  disabled={processingDocumentId === doc.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDocument(doc.id);
                                  }}
                                  sx={{
                                    opacity: 1,
                                    "&:hover": {
                                      opacity: 1,
                                      color: "error.main",
                                    },
                                  }}
                                >
                                  {deletingDocumentId === doc.id ? (
                                    <CircularProgress size={18} />
                                  ) : (
                                    <DeleteIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Open in new tab">
                                <IconButton
                                  size="small"
                                  disabled={processingDocumentId === doc.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDocument(doc);
                                  }}
                                  sx={{
                                    opacity: 1,
                                    "&:hover": {
                                      opacity: 1,
                                      color: "primary.main",
                                    },
                                  }}
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}

                  {/* Divider between sections */}
                  {otherDocs.length > 0 && images.length > 0 && (
                    <Divider sx={{ my: 2 }} />
                  )}

                  {/* Images Section */}
                  {images.length > 0 && (
                    <>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        color="text.primary"
                        sx={{
                          mb: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography sx={{ fontSize: 18 }}>🖼️</Typography>
                        Images ({images.length})
                      </Typography>
                      <List sx={{ p: 0 }}>
                        {images.map((doc) => (
                          <ListItem
                            key={doc.id}
                            disablePadding
                            sx={{
                              mb: 1,
                              borderRadius: 1,
                              backgroundColor:
                                selectedDocument?.id === doc.id
                                  ? "rgba(25, 118, 210, 0.08)"
                                  : "transparent",
                            }}
                          >
                            <ListItemButton
                              onClick={() => handleSelectDocument(doc)}
                              sx={{
                                mx: 0,
                                borderRadius: 1,
                                "&:hover": {
                                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 40 }}>
                                {processingDocumentId === doc.id ? (
                                  <CircularProgress size={20} />
                                ) : selectedDocument?.id === doc.id ? (
                                  <SelectedIcon color="primary" />
                                ) : (
                                  getFileIcon(doc.mime_type)
                                )}
                              </ListItemIcon>

                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        selectedDocument?.id === doc.id
                                          ? 600
                                          : 400,
                                      fontSize: "0.875rem",
                                      color:
                                        processingDocumentId === doc.id
                                          ? "text.secondary"
                                          : "inherit",
                                    }}
                                  >
                                    {processingDocumentId === doc.id
                                      ? `${doc.original_name} (Processing...)`
                                      : doc.original_name}
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
                                      label={formatFileSize(doc.file_size)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.75rem", height: 20 }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        doc.created_at
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                }
                              />

                              <Tooltip title="Delete document">
                                <IconButton
                                  size="small"
                                  disabled={processingDocumentId === doc.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDocument(doc.id);
                                  }}
                                  sx={{
                                    opacity: 1,
                                    "&:hover": {
                                      opacity: 1,
                                      color: "error.main",
                                    },
                                  }}
                                >
                                  {deletingDocumentId === doc.id ? (
                                    <CircularProgress size={18} />
                                  ) : (
                                    <DeleteIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Open in new tab">
                                <IconButton
                                  size="small"
                                  disabled={processingDocumentId === doc.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDocument(doc);
                                  }}
                                  sx={{
                                    opacity: 1,
                                    "&:hover": {
                                      opacity: 1,
                                      color: "primary.main",
                                    },
                                  }}
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </>
              );
            })()
          )}
        </Box>
      </Box>
    </>
  );
};

export default DocumentPanel;
