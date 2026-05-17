import React, { useCallback } from "react";
import { Button } from "antd";
import { Play, CheckCircle, Star, Clock, User } from "lucide-react";
import CategoryBadge from "./CategoryBadge";

const getThumbnailUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `https://camp-coding.site/nourstaff/admin/${url}`;
};

const FeaturedVideo = React.memo(({ video, onPlay, onToggleWatched }) => {
  const handlePlay = useCallback(() => {
    onPlay(video.id);
  }, [onPlay, video.id]);

  const handleToggle = useCallback(() => {
    onToggleWatched(video.id);
  }, [onToggleWatched, video.id]);

  return (
    <div className="rounded-[18px] border border-border bg-surface overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Thumbnail */}
        <div className="relative lg:w-[420px] shrink-0">
          <img
            src={getThumbnailUrl(video.thumbnail)}
            alt={video.title}
            className="h-[200px] w-full object-cover lg:h-full"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-primary transition-transform hover:scale-110 cursor-pointer"
            >
              <Play size={28} fill="currentColor" />
            </button>
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            <Star size={12} />
            Featured
          </div>
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {video.duration}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between p-5 lg:p-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <CategoryBadge category={video.category} />
              {video.watched && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                  <CheckCircle size={12} />
                  Watched
                </span>
              )}
            </div>
            <h2 className="mb-2 text-lg font-bold text-text sm:text-xl">
              {video.title}
            </h2>
            <p className="mb-4 text-sm text-text/60 leading-relaxed">
              {video.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-text/40">
              <span className="inline-flex items-center gap-1">
                <User size={12} />
                {video.instructor}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {video.duration}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Button
              type="primary"
              icon={<Play size={16} />}
              onClick={handlePlay}
            >
              Watch Now
            </Button>
            <Button onClick={handleToggle}>
              {video.watched ? "Mark Unwatched" : "Mark as Watched"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

FeaturedVideo.displayName = "FeaturedVideo";

export default FeaturedVideo;
