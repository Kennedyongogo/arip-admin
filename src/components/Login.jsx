import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Link,
  Grid,
  useTheme,
  useMediaQuery,
  Snackbar,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store the token in localStorage
      localStorage.setItem("token", data.token);
      // Store user data if needed
      localStorage.setItem("user", JSON.stringify(data.data));

      // Show success message
      setSnackbar({
        open: true,
        message: "Login successful! Redirecting to dashboard...",
        severity: "success",
      });

      // Wait for 2 seconds to show the success message before redirecting
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      const errorMessage = err.message || "An error occurred during login";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
          px: { xs: 2, md: 3 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            width: "100%",
            maxHeight: { xs: "100%", md: "600px" },
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              flex: isMobile ? "none" : 1,
              bgcolor: "background.default",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              position: "relative",
              height: isMobile ? "180px" : "auto",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                zIndex: 1,
              },
            }}
          >
            <Box
              component="img"
              src="/IMG-20250506-WA0004.jpg"
              alt="Company Logo"
              sx={{
                width: isMobile ? "120px" : "70%",
                maxWidth: "300px",
                height: "auto",
                objectFit: "contain",
                zIndex: 2,
              }}
            />
          </Box>

          {/* Login Form Section */}
          <Box
            sx={{
              flex: isMobile ? "none" : 1,
              display: "flex",
              flexDirection: "column",
              p: { xs: 2, md: 3 },
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "360px",
                mx: "auto",
                my: "auto",
              }}
            >
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  mb: 2.5,
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: { xs: "1.5rem", md: "2rem" },
                }}
              >
                Welcome Back
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  size={isMobile ? "small" : "medium"}
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  size={isMobile ? "small" : "medium"}
                  sx={{ mb: 1 }}
                />

                <Box sx={{ textAlign: "right", mb: 1.5 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{
                      color: "primary.main",
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.2,
                    bgcolor: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <Grid container justifyContent="center" sx={{ mt: 2 }}>
                  <Grid item>
                    <Typography variant="body2" sx={{ display: "inline" }}>
                      Don't have an account?{" "}
                    </Typography>
                    <Link
                      component={RouterLink}
                      to="/register"
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        fontWeight: 600,
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Sign Up
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Login;
