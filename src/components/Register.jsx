import React, { useState, useEffect } from "react";
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
  IconButton,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://38.242.243.113:4035" // Production API URL
    : ""; // Empty for development (will use relative paths)

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

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
      console.log("Sending registration request with data:", {
        ...formData,
        password: "[REDACTED]",
      });

      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSnackbar({
        open: true,
        message: "Registration successful! Please login to continue.",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Registration error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response,
      });

      const errorMessage =
        err.message || "An error occurred during registration";
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
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 3 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            width: "100%",
            height: isMobile ? "auto" : "75vh",
            maxHeight: "520px",
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
              alignItems: "center",
              justifyContent: "center",
              p: 0,
              position: "relative",
              height: isMobile ? "140px" : "auto",
              minHeight: isMobile ? "140px" : "100%",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                minHeight: isMobile ? "140px" : "100%",
                backgroundImage: 'url("/IMG-20250506-WA0004.jpg")',
                backgroundSize: isMobile ? "contain" : "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "#1ccfcf",
                zIndex: 2,
              }}
            />
          </Box>

          {/* Registration Form Section */}
          <Box
            sx={{
              flex: isMobile ? "none" : 1,
              display: "flex",
              flexDirection: "column",
              p: { xs: 2, md: 2.5 },
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: "400px",
                mx: "auto",
                my: 0,
                py: 2,
              }}
            >
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  textAlign: "center",
                  fontSize: { xs: "1.4rem", md: "1.8rem" },
                }}
              >
                Create Account
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      value={formData.username}
                      onChange={handleChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      name="phoneNumber"
                      label="Phone Number"
                      type="tel"
                      id="phoneNumber"
                      autoComplete="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      name="latitude"
                      label="Latitude"
                      type="number"
                      id="latitude"
                      value={formData.latitude}
                      onChange={handleChange}
                      size="small"
                      inputProps={{
                        step: "any",
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      name="longitude"
                      label="Longitude"
                      type="number"
                      id="longitude"
                      value={formData.longitude}
                      onChange={handleChange}
                      size="small"
                      inputProps={{
                        step: "any",
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1,
                    bgcolor: "primary.main",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <Grid container justifyContent="center" sx={{ mt: 1.5 }}>
                  <Grid item>
                    <Typography variant="body2" sx={{ display: "inline" }}>
                      Already have an account?{" "}
                    </Typography>
                    <Link
                      component={RouterLink}
                      to="/"
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
                      Sign In
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

export default Register;
