import React from "react";
import { Video } from "lucide-react";
import useTrainingVideos from "./useTrainingVideos";
import TrainingHeader from "./components/TrainingHeader";
import TrainingStats from "./components/TrainingStats";
import TrainingFilters from "./components/TrainingFilters";
import VideoGrid from "./components/VideoGrid";
import VideoDrawer from "./components/VideoDrawer";
import VideoViewModal from "./components/VideoViewModal";
import VideoDeleteModal from "./components/VideoDeleteModal";
import Loader from "../../shared/components/loader";

const TrainingVideos = () => {
  const {
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
    categories,
    loading,
  } = useTrainingVideos();

  if (loading) {
    return (
      <div className="relative min-h-[400px] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TrainingHeader
        total={stats.total}
        filteredCount={filteredVideos.length}
        hasActiveFilters={hasActiveFilters}
        onAddVideo={handleOpenCreate}
      />

      <TrainingStats stats={stats} />

      <TrainingFilters
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        featuredFilter={featuredFilter}
        onFeaturedFilterChange={setFeaturedFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        categories={categories}
      />

      {filteredVideos.length > 0 ? (
        <VideoGrid
          videos={filteredVideos}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onToggleFeatured={handleToggleFeatured}
        />
      ) : (
        <div className="rounded-[18px] border border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg">
            <Video size={28} className="text-text/30" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-text">
            No videos found
          </h3>
          <p className="text-sm text-text/50">
            Try changing the filters or upload a new training video.
          </p>
        </div>
      )}

      {drawerOpen && (
        <VideoDrawer
          open={drawerOpen}
          mode={drawerMode}
          video={activeVideo}
          onClose={handleCloseDrawer}
          onSubmit={handleSubmitVideo}
          loading={submitting}
          categories={categories}
        />
      )}

      {viewOpen && activeVideo && (
        <VideoViewModal
          open={viewOpen}
          video={activeVideo}
          onClose={handleCloseView}
        />
      )}

      {deleteOpen && activeVideo && (
        <VideoDeleteModal
          open={deleteOpen}
          video={activeVideo}
          loading={deleting}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default TrainingVideos;
