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
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://38.242.243.113:4035" // Production API URL
    : ""; // Empty for development (will use relative paths)

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      // First try admin login
      const adminResponse = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        localStorage.setItem("token", adminData.token);
        localStorage.setItem(
          "user",
          JSON.stringify({ ...adminData.data, isAdmin: true })
        );
        localStorage.setItem("loginType", "admin");

        setSnackbar({
          open: true,
          message: "Admin login successful! Redirecting to dashboard...",
          severity: "success",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        return;
      }

      // If admin login fails, try regular user login
      const userResponse = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(userData.message || "Login failed");
      }

      localStorage.setItem("token", userData.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...userData.data, isAdmin: false })
      );
      localStorage.setItem("loginType", "user");

      setSnackbar({
        open: true,
        message: "Login successful! Redirecting to dashboard...",
        severity: "success",
      });

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

          {/* Login Form Section */}
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
                  size="small"
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  size="small"
                  sx={{ mb: 1 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                    "Sign In"
                  )}
                </Button>

                <Grid container justifyContent="center" sx={{ mt: 1.5 }}>
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
