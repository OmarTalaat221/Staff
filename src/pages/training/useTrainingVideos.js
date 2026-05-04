import { useState, useMemo, useCallback, useDeferredValue } from "react";
import toast from "react-hot-toast";
import { CATEGORIES, VIDEOS, DEFAULT_VIDEO_URL } from "./data/videosData";

const CATEGORY_LABEL_MAP = CATEGORIES.reduce((acc, item) => {
  acc[item.id] = item.label;
  return acc;
}, {});

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

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 350));

const useTrainingVideos = () => {
  const [videos, setVideos] = useState(VIDEOS);
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

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    if (deferredSearch) {
      const query = deferredSearch.toLowerCase().trim();

      result = result.filter(
        (video) =>
          video.title.toLowerCase().includes(query) ||
          video.description.toLowerCase().includes(query) ||
          video.instructor.toLowerCase().includes(query) ||
          video.subtitle.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((video) => video.category === selectedCategory);
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
    const appGuides = videos.filter((video) => video.category === "app").length;
    const categories = CATEGORIES.filter((item) => item.id !== "all").length;

    const totalSeconds = videos.reduce((acc, video) => {
      return acc + parseDurationToSeconds(video.duration);
    }, 0);

    return {
      total,
      featured,
      appGuides,
      categories,
      totalDuration: formatTotalDuration(totalSeconds),
    };
  }, [videos]);

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
        await mockDelay();

        const payload = {
          id: activeVideo?.id || Date.now().toString(),
          title: values.title.trim(),
          category: values.category,
          subtitle: CATEGORY_LABEL_MAP[values.category] || "Training",
          duration: values.duration.trim(),
          thumbnail: values.thumbnail.trim(),
          videoUrl: values.videoUrl.trim() || DEFAULT_VIDEO_URL,
          instructor: values.instructor.trim(),
          description: values.description.trim(),
          featured: !!values.featured,
          watched: activeVideo?.watched ?? false,
        };

        if (drawerMode === "edit" && activeVideo) {
          setVideos((prev) =>
            prev.map((item) => (item.id === activeVideo.id ? payload : item))
          );
          toast.success("Video updated successfully");
        } else {
          setVideos((prev) => [payload, ...prev]);
          toast.success("Video uploaded successfully");
        }

        setDrawerOpen(false);
        setActiveVideo(null);
      } finally {
        setSubmitting(false);
      }
    },
    [activeVideo, drawerMode]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!activeVideo) return;

    setDeleting(true);

    try {
      await mockDelay();

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

    categories: CATEGORIES,
  };
};

export default useTrainingVideos;
