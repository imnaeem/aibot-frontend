import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  Alert,
  Divider,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { supabase } from "../../lib/supabase";

const UserProfile = ({ open, onClose, user, updateUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
  });

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Update auth metadata
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName.trim(),
        },
      });

      if (error) throw error;

      // Update user profile in database
      const { error: profileError } = await supabase
        .from("users")
        .update({
          full_name: formData.fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.warn("Profile update error:", profileError);
        // Don't throw - auth update succeeded
      }

      setSuccess("Profile updated successfully!");

      // Notify parent component
      if (updateUser) {
        updateUser(data.user);
      }

      // Close after success
      setTimeout(() => {
        onClose();
        setSuccess("");
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (formData.fullName) {
      return formData.fullName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || "?";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="600">
          Edit Profile
        </Typography>
      </DialogTitle>

      <DialogContent>
        {/* Avatar Section */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3, mt: 2 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              backgroundColor: "primary.main",
              fontSize: "2rem",
              fontWeight: "bold",
            }}
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              getInitials()
            )}
          </Avatar>
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Full Name"
            value={formData.fullName}
            onChange={handleInputChange("fullName")}
            margin="normal"
            disabled={loading}
            placeholder="Enter your full name"
          />

          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            margin="normal"
            disabled
            helperText="Email cannot be changed here"
            sx={{
              "& .MuiInputBase-input": {
                color: "text.secondary",
              },
            }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Account Details
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Account created: {new Date(user?.created_at).toLocaleDateString()}
          </Typography>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: "none",
            minWidth: 100,
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfile;
