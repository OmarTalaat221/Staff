import React from "react";
import VideoCard from "./VideoCard";

const VideoGrid = React.memo(
  ({ videos, onView, onEdit, onDelete, onToggleFeatured }) => {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleFeatured={onToggleFeatured}
          />
        ))}
      </div>
    );
  }
);

VideoGrid.displayName = "VideoGrid";

export default VideoGrid;
