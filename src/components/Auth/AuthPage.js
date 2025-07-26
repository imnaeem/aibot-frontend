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
  GitHub as GitHubIcon,
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
          redirectTo: process.env.REACT_APP_URI,
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
        padding: 2,
        overflow: "hidden",
        background: `
          linear-gradient(135deg, #f9fafe 0%, #f8f9fa 100%),
          linear-gradient(90deg, transparent 49%, rgba(25, 118, 210, 0.03) 50%, transparent 51%),
          linear-gradient(0deg, transparent 49%, rgba(25, 118, 210, 0.02) 50%, transparent 51%)
        `,
        backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        position: "relative",
        "& .triangle-accent": {
          position: "absolute",
          width: "0",
          height: "0",
          borderStyle: "solid",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: "0",
          right: "0",
          width: "0",
          height: "0",
          borderStyle: "solid",
          borderWidth: "0 150px 150px 0",
          borderColor:
            "transparent rgba(25, 118, 210, 0.06) transparent transparent",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "0",
          height: "0",
          borderStyle: "solid",
          borderWidth: "120px 0 0 120px",
          borderColor:
            "transparent transparent transparent rgba(25, 118, 210, 0.04)",
        },
      }}
    >
      {/* Additional triangle accents */}
      <Box
        className="triangle-accent"
        sx={{
          top: "15%",
          left: "10%",
          borderWidth: "0 0 30px 30px",
          borderColor:
            "transparent transparent rgba(25, 118, 210, 0.03) transparent",
        }}
      />
      <Box
        className="triangle-accent"
        sx={{
          top: "70%",
          right: "15%",
          borderWidth: "25px 25px 0 0",
          borderColor:
            "rgba(25, 118, 210, 0.03) transparent transparent transparent",
        }}
      />
      <Box
        className="triangle-accent"
        sx={{
          bottom: "25%",
          left: "80%",
          borderWidth: "0 20px 20px 0",
          borderColor:
            "transparent rgba(25, 118, 210, 0.02) transparent transparent",
        }}
      />

      {/* Diagonal line accents */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          left: "8%",
          width: "120px",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.2), transparent)",
          transform: "rotate(45deg)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "65%",
          right: "12%",
          width: "100px",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.18), transparent)",
          transform: "rotate(-45deg)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "35%",
          left: "12%",
          width: "80px",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.15), transparent)",
          transform: "rotate(30deg)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "45%",
          right: "5%",
          width: "60px",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.12), transparent)",
          transform: "rotate(-60deg)",
        }}
      />

      {/* Large prominent shape */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "-10%",
          width: "300px",
          height: "400px",
          background:
            "linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.02) 50%, transparent 100%)",
          transform: "rotate(15deg)",
          borderRadius: "0 100px 0 50px",
          zIndex: 0,
        }}
      />

      {/* Additional diagonal shapes */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          right: "25%",
          width: "40px",
          height: "40px",
          background:
            "linear-gradient(45deg, rgba(25, 118, 210, 0.04), transparent)",
          transform: "rotate(45deg)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "8%",
          width: "30px",
          height: "30px",
          background:
            "linear-gradient(-45deg, rgba(25, 118, 210, 0.03), transparent)",
          transform: "rotate(-30deg)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "75%",
          left: "5%",
          width: "35px",
          height: "35px",
          background:
            "conic-gradient(from 0deg, rgba(25, 118, 210, 0.05), transparent, rgba(25, 118, 210, 0.02))",
          borderRadius: "50% 0 50% 0",
        }}
      />

      {/* Large bottom-right accent */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-5%",
          right: "-8%",
          width: "250px",
          height: "300px",
          background:
            "radial-gradient(ellipse at center, rgba(25, 118, 210, 0.06) 0%, rgba(25, 118, 210, 0.02) 60%, transparent 100%)",
          transform: "rotate(-25deg)",
          borderRadius: "50% 0 50% 0",
          zIndex: 0,
        }}
      />

      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 530,
          p: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img
            src="/chatbot.png"
            alt="AI Bot"
            style={{
              width: 36,
              height: 36,
              marginBottom: 4,
            }}
          />
          <Typography
            variant="h5"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            AI Bot
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
              height: "45px",
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

        <Button
          fullWidth
          variant="outlined"
          startIcon={
            <img
              src="/google.png"
              alt="Google"
              style={{ width: 18, height: 18 }}
            />
          }
          onClick={() => handleSocialAuth("google")}
          disabled={loading}
          size="medium"
          sx={{
            textTransform: "none",
            backgroundColor: "#ffffff",
            border: "1px solid #dadce0",
            color: "#3c4043",
            fontWeight: 500,
            fontSize: "14px",
            height: "45px",
            "&:hover": {
              backgroundColor: "#f8f9fa",
              border: "1px solid #dadce0",
              boxShadow:
                "0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)",
            },
            "&:focus": {
              backgroundColor: "#f8f9fa",
              border: "1px solid #4285f4",
            },
            "&:disabled": {
              backgroundColor: "#ffffff",
              color: "#9aa0a6",
              border: "1px solid #f1f3f4",
            },
            "& .MuiButton-startIcon": {
              marginRight: "12px",
            },
          }}
        >
          Continue with Google
        </Button>

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
            mb: 1,
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
