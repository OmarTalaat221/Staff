import { useState, useMemo, useCallback, useDeferredValue, useEffect } from "react";
import toast from "react-hot-toast";
import { getCategories, getVideos, addVideo } from "../../features/Education/educationService";

const parseDurationToSeconds = (duration) => {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number);

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
};

const formatTotalDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const remaining = seconds % 3600;
  const minutes = Math.floor(remaining / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const useTrainingVideos = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("create");
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deferredSearch = useDeferredValue(search);


  const apiToUi = useCallback((api) => {
    return {
      id: String(api.video_id),
      video_id: api.video_id,
      category_id: api.category_id,
      category: api.category_name,
      category_name: api.category_name,
      title: api.title,
      subtitle: api.category_name || "Training",
      duration: api.duration || "5:00",
      thumbnail: api.thumbnail_url || "",
      videoUrl: api.video_url || "",
      instructor: api.instructor || "Instructor",
      description: api.description || "",
      featured: Number(api.is_featured) === 1,
      watched: false,
      createdAt: api.created_at
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, vidsRes] = await Promise.all([
        getCategories(),
        getVideos()
      ]);

      if (catsRes.status === "success") {
        setCategories(catsRes.data);
      }
      if (vidsRes.status === "success") {
        setVideos(vidsRes.data.map(apiToUi));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load training videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiToUi]);

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    if (deferredSearch) {
      const query = deferredSearch.toLowerCase().trim();

      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          video.instructor.toLowerCase().includes(query) ||
          video.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((video) => String(video.category_id) === String(selectedCategory));
    }

    if (featuredFilter === "featured") {
      result = result.filter((video) => video.featured);
    }

    if (featuredFilter === "regular") {
      result = result.filter((video) => !video.featured);
    }

    return result;
  }, [videos, deferredSearch, selectedCategory, featuredFilter]);

  const stats = useMemo(() => {
    const total = videos.length;
    const featured = videos.filter((video) => video.featured).length;
    const appGuides = videos.filter((video) => String(video.category_id) === "1").length;
    const categoriesCount = categories.length;

    const totalSeconds = videos.reduce((acc, video) => {
      return acc + parseDurationToSeconds(video.duration);
    }, 0);

    return {
      total,
      featured,
      appGuides,
      categories: categoriesCount,
      totalDuration: formatTotalDuration(totalSeconds),
    };
  }, [videos, categories]);

  const hasActiveFilters = useMemo(() => {
    return !!(search || selectedCategory !== "all" || featuredFilter !== "all");
  }, [search, selectedCategory, featuredFilter]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSelectedCategory("all");
    setFeaturedFilter("all");
  }, []);

  const handleOpenCreate = useCallback(() => {
    setDrawerMode("create");
    setActiveVideo(null);
    setDrawerOpen(true);
  }, []);

  const handleOpenEdit = useCallback((video) => {
    setDrawerMode("edit");
    setActiveVideo(video);
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
    setActiveVideo(null);
  }, []);

  const handleOpenView = useCallback((video) => {
    setActiveVideo(video);
    setViewOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
    setActiveVideo(null);
  }, []);

  const handleOpenDelete = useCallback((video) => {
    setActiveVideo(video);
    setDeleteOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteOpen(false);
    setActiveVideo(null);
  }, []);

  const handleSubmitVideo = useCallback(
    async (values) => {
      setSubmitting(true);

      try {
        const hasVideoFile = values.videoSource === "file" && !!(values.video_file && values.video_file[0]?.originFileObj);
        const hasThumbnailFile = values.thumbnailSource === "file" && !!(values.thumbnail_file && values.thumbnail_file[0]?.originFileObj);

        let payload;

        if (!hasVideoFile && !hasThumbnailFile) {

          payload = {
            title: values.title.trim(),
            category_id: Number(values.category_id),
            instructor: values.instructor.trim(),
            duration: values.duration.trim(),
            description: values.description.trim(),
            is_featured: values.is_featured ? 1 : 0,
            video_url: (values.video_url || "").trim(),
            thumbnail_url: (values.thumbnail_url || "").trim(),
          };
        } else {

          const formData = new FormData();
          formData.append("title", values.title.trim());
          formData.append("category_id", String(values.category_id));
          formData.append("instructor", values.instructor.trim());
          formData.append("duration", values.duration.trim());
          formData.append("description", values.description.trim());
          formData.append("is_featured", values.is_featured ? "1" : "0");

          if (hasVideoFile) {
            formData.append("video_file", values.video_file[0].originFileObj);
          } else {
            formData.append("video_url", (values.video_url || "").trim());
          }

          if (hasThumbnailFile) {
            formData.append("thumbnail_file", values.thumbnail_file[0].originFileObj);
          } else {
            formData.append("thumbnail_url", (values.thumbnail_url || "").trim());
          }

          payload = formData;
        }

        const res = await addVideo(payload);
        if (res.status === "success") {
          toast.success(drawerMode === "edit" ? "Video updated successfully" : "Video uploaded successfully");
          fetchData();
          setDrawerOpen(false);
          setActiveVideo(null);
        } else {
          toast.error(res.message || "Failed to save video");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to save video");
      } finally {
        setSubmitting(false);
      }
    },
    [drawerMode]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!activeVideo) return;

    setDeleting(true);

    try {

      setVideos((prev) => prev.filter((item) => item.id !== activeVideo.id));
      toast.success("Video deleted successfully");
      setDeleteOpen(false);
      setActiveVideo(null);
    } finally {
      setDeleting(false);
    }
  }, [activeVideo]);

  const handleToggleFeatured = useCallback((videoId) => {
    setVideos((prev) =>
      prev.map((item) =>
        item.id === videoId ? { ...item, featured: !item.featured } : item
      )
    );
  }, []);

  return {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    featuredFilter,
    setFeaturedFilter,
    filteredVideos,
    stats,
    hasActiveFilters,
    handleClearFilters,
    loading,

    drawerOpen,
    drawerMode,
    viewOpen,
    deleteOpen,
    activeVideo,
    submitting,
    deleting,

    handleOpenCreate,
    handleOpenEdit,
    handleCloseDrawer,
    handleOpenView,
    handleCloseView,
    handleOpenDelete,
    handleCloseDelete,
    handleSubmitVideo,
    handleConfirmDelete,
    handleToggleFeatured,

    categories,
  };
};

export default useTrainingVideos;
