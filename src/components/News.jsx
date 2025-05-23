import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  CircularProgress,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  IconButton,
  Divider,
  Chip,
  TextField,
  Tooltip,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Add as AddIcon,
  Close,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import Fade from "@mui/material/Fade";

// Add API_BASE_URL configuration
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://38.242.243.113:4035" // Production API URL
    : ""; // Empty for development (will use relative paths)

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#19bdb7",
    },
    secondary: {
      main: "#ff9800",
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        fullWidth: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Get auth header helper
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

// Create News Dialog Component
const CreateNewsDialog = React.memo(
  ({ open, onClose, formData, handleChange, handleSubmit, setFormData }) => (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: "primary.main", fontWeight: "bold" }}
        >
          Create News Article
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content"
                name="content"
                multiline
                rows={6}
                value={formData.content}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {[
                  "Politics",
                  "Technology",
                  "Business",
                  "Sports",
                  "Entertainment",
                  "Health",
                  "Science",
                ].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Media Type"
                name="mediaType"
                value={formData.mediaType}
                onChange={handleChange}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="video">Video</MenuItem>
              </TextField>
            </Grid>
            {formData.mediaType && (
              <Grid item xs={12}>
                <input
                  accept={
                    formData.mediaType === "image" ? "image/*" : "video/*"
                  }
                  style={{ display: "none" }}
                  id="media-upload"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData((prev) => ({
                        ...prev,
                        mediaFile: file,
                      }));
                    }
                  }}
                />
                <label htmlFor="media-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Upload {formData.mediaType === "image" ? "Image" : "Video"}
                  </Button>
                </label>
                {formData.mediaFile && (
                  <Typography variant="body2" color="textSecondary">
                    Selected file: {formData.mediaFile.name}
                  </Typography>
                )}
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="Tags (comma-separated)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                helperText="Enter tags separated by commas"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                Submit News
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  )
);

// Helper to get full media URL
const getFullMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return "";
  if (mediaUrl.startsWith("http")) return mediaUrl;
  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "http://38.242.243.113:4035"
      : "http://localhost:3003";
  return `${API_BASE_URL}${mediaUrl}`;
};

// News Details Dialog Component
const NewsDetailsDialog = ({
  news,
  open,
  onClose,
  isAdmin,
  onApprove,
  onReject,
}) => {
  if (!news) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ color: "primary.main", fontWeight: "bold" }}
        >
          News Details
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" color="primary">
              {news.title}
            </Typography>
            <Chip
              label={news.status}
              color={
                news.status === "approved"
                  ? "success"
                  : news.status === "pending"
                  ? "warning"
                  : "error"
              }
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Content
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {news.content}
            </Typography>
          </Grid>

          {news.mediaUrl && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">
                Media
              </Typography>
              {news.mediaType === "image" ? (
                <img
                  src={getFullMediaUrl(news.mediaUrl)}
                  alt={news.title}
                  style={{ maxWidth: "100%", maxHeight: "400px" }}
                />
              ) : (
                <video
                  src={getFullMediaUrl(news.mediaUrl)}
                  controls
                  style={{ maxWidth: "100%", maxHeight: "400px" }}
                />
              )}
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Category
            </Typography>
            <Typography>{news.category}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Tags
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {news.tags?.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </Grid>

          {isAdmin && news.status === "pending" && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => onApprove(news.id)}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => onReject(news.id)}
                >
                  Reject
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

// Main News Component
const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedNews, setSelectedNews] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    mediaType: "",
    mediaUrl: "",
    tags: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.isAdmin === true;

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const authHeader = getAuthHeader();

      const headers = {};
      if (authHeader) {
        headers.Authorization = authHeader;
      }

      // Use the same endpoint for both admin and user
      const endpoint = `/api/news/pending?page=${
        page + 1
      }&limit=${rowsPerPage}`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
      });

      if (!response.ok) throw new Error("Failed to fetch news");

      const data = await response.json();
      setNews(data.data);
      setTotalCount(data.pagination.total);
    } catch (error) {
      console.error("Error fetching news:", error);
      Swal.fire("Error", "Failed to fetch news articles", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateNews = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateDialogOpen(false);
    setFormData({
      title: "",
      content: "",
      category: "",
      mediaType: "",
      mediaUrl: "",
      tags: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("category", formData.category);
      formDataToSend.append(
        "tags",
        JSON.stringify(formData.tags.split(",").map((tag) => tag.trim()))
      );

      if (formData.mediaType) {
        formDataToSend.append("mediaType", formData.mediaType);
        if (formData.mediaFile) {
          formDataToSend.append("media", formData.mediaFile);
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/news`, {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
        },
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Failed to create news article");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "News article submitted successfully and pending approval",
        timer: 2000,
        showConfirmButton: false,
      });

      handleCloseCreate();
      fetchNews();
    } catch (error) {
      console.error("Error creating news:", error);
      Swal.fire("Error", "Failed to create news article", "error");
    }
  };

  const handleViewNews = (newsItem) => {
    setSelectedNews(newsItem);
    setDetailsDialogOpen(true);
  };

  const handleApprove = async (newsId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/news/admin/${newsId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: getAuthHeader(),
          },
        }
      );

      if (!response.ok) throw new Error("Failed to approve news");

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "News article approved successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setDetailsDialogOpen(false);
      fetchNews();
    } catch (error) {
      console.error("Error approving news:", error);
      Swal.fire("Error", "Failed to approve news article", "error");
    }
  };

  const handleReject = async (newsId) => {
    const { value: rejectionReason } = await Swal.fire({
      title: "Reject News Article",
      input: "textarea",
      inputLabel: "Rejection Reason",
      inputPlaceholder: "Enter reason for rejection...",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Please provide a reason for rejection";
        }
      },
    });

    if (rejectionReason) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/news/admin/${newsId}/reject`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: getAuthHeader(),
            },
            body: JSON.stringify({ rejectionReason }),
          }
        );

        if (!response.ok) throw new Error("Failed to reject news");

        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "News article rejected successfully",
          timer: 2000,
          showConfirmButton: false,
        });

        setDetailsDialogOpen(false);
        fetchNews();
      } catch (error) {
        console.error("Error rejecting news:", error);
        Swal.fire("Error", "Failed to reject news article", "error");
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "primary.main" }}
            >
              {isAdmin ? "All News Articles" : "My Pending News"}
            </Typography>
            {!isAdmin && (
              <Typography variant="subtitle2" color="textSecondary">
                View and manage your submitted news articles
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNews}
          >
            Create News
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#19bdb7" }}>
                <TableCell sx={{ color: "white" }}>Title</TableCell>
                <TableCell sx={{ color: "white" }}>Category</TableCell>
                <TableCell sx={{ color: "white" }}>Status</TableCell>
                <TableCell sx={{ color: "white" }}>Created At</TableCell>
                <TableCell sx={{ color: "white" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : news.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="subtitle1" color="textSecondary">
                      No news articles found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                news.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={
                          item.status === "approved"
                            ? "success"
                            : item.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleViewNews(item)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        <CreateNewsDialog
          open={createDialogOpen}
          onClose={handleCloseCreate}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setFormData={setFormData}
        />

        <NewsDetailsDialog
          news={selectedNews}
          open={detailsDialogOpen}
          onClose={() => setDetailsDialogOpen(false)}
          isAdmin={isAdmin}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </Box>
    </ThemeProvider>
  );
};

export default News;
