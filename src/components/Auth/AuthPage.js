import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Android as BotIcon,
} from "@mui/icons-material";
import { signIn, signUp, supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";

const AuthPage = () => {
  const { continueAsGuest, preferredAuthTab } = useAuth();
  const [activeTab, setActiveTab] = useState(preferredAuthTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  // Update activeTab when preferredAuthTab changes
  useEffect(() => {
    setActiveTab(preferredAuthTab);
    // Clear any previous error/success messages when switching tabs from guest mode
    setError("");
    setSuccess("");
  }, [preferredAuthTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError("");
    setSuccess("");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    });
  };

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (activeTab === 0) {
        // Sign In
        const { data, error } = await signIn(formData.email, formData.password);
        if (error) throw error;

        if (data.user) {
          // User signed in successfully
          console.log("User signed in:", data.user);
          // Clear the form after successful sign in
          setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
          });
        }
      } else {
        // Sign Up
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        const { data, error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName.trim() || null
        );
        if (error) throw error;

        if (data.user) {
          setSuccess(
            "Account created! Please check your email to verify your account."
          );
          // Clear the form after successful signup
          setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
          });
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa", // Light gray like Google
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 530,
          p: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <BotIcon
            sx={{
              fontSize: 36,
              color: "primary.main",
              mb: 0.5,
            }}
          />
          <Typography
            variant="h5"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            ChatGPT Clone
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your AI-powered conversation companion
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 2 }}
          indicatorColor="primary"
        >
          <Tab label="Sign In" />
          <Tab label="Sign Up" />
        </Tabs>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 1.5 }}>
            {success}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {activeTab === 1 && (
            <TextField
              fullWidth
              variant="filled"
              label="Full Name"
              value={formData.fullName}
              onChange={handleInputChange("fullName")}
              margin="dense"
              required
              disabled={loading}
              size="small"
            />
          )}

          <TextField
            fullWidth
            variant="filled"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange("email")}
            margin="dense"
            required
            disabled={loading}
            autoComplete="email"
            size="small"
          />

          <TextField
            fullWidth
            variant="filled"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange("password")}
            margin="dense"
            required
            disabled={loading}
            autoComplete={activeTab === 0 ? "current-password" : "new-password"}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {activeTab === 1 && (
            <TextField
              fullWidth
              variant="filled"
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleInputChange("confirmPassword")}
              margin="dense"
              required
              disabled={loading}
              autoComplete="new-password"
              size="small"
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="medium"
            disabled={loading}
            sx={{
              mt: 2,
              mb: 1.5,
              py: 1,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            {loading
              ? "Please wait..."
              : activeTab === 0
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        {/* Social Auth */}
        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            or continue with
          </Typography>
        </Divider>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleSocialAuth("google")}
            disabled={loading}
            size="small"
            sx={{ textTransform: "none" }}
          >
            Google
          </Button>
          <Tooltip
            title="Sign in with GitHub is not available yet"
            placement="top"
            arrow
          >
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon />}
              // onClick={() => handleSocialAuth("github")}
              // disabled={true}
              size="small"
              sx={{ textTransform: "none" }}
            >
              GitHub
            </Button>
          </Tooltip>
        </Box>

        {/* Guest Mode */}
        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="text"
          onClick={continueAsGuest}
          disabled={loading}
          size="small"
          sx={{
            textTransform: "none",
            py: 1,
            color: "text.secondary",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          }}
        >
          Continue as Guest
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ mt: 0.5, display: "block" }}
        >
          Try the chat without signing up. Your conversations will be stored
          locally.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AuthPage;
