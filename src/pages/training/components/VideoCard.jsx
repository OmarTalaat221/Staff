import React, { useMemo } from "react";
import { Dropdown } from "antd";
import { Eye, Edit3, MoreVertical, Play, Star, Trash2 } from "lucide-react";
import CategoryBadge from "./CategoryBadge";

const getThumbnailUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  return `https://camp-coding.site/nourstaff/admin/${url}`;
};

const VideoCard = React.memo(
  ({ video, onView, onEdit, onDelete, onToggleFeatured }) => {
    const menuItems = useMemo(
      () => [
        {
          key: "view",
          label: "View Video",
          icon: <Eye size={14} />,
          onClick: () => onView(video),
        },
        {
          key: "edit",
          label: "Edit Video",
          icon: <Edit3 size={14} />,
          onClick: () => onEdit(video),
        },
        {
          key: "featured",
          label: video.featured ? "Remove Featured" : "Mark Featured",
          icon: <Star size={14} />,
          onClick: () => onToggleFeatured(video.id),
        },
        {
          key: "delete",
          label: "Delete Video",
          icon: <Trash2 size={14} />,
          danger: true,
          onClick: () => onDelete(video),
        },
      ],
      [onDelete, onEdit, onToggleFeatured, onView, video]
    );

    return (
      <div className="overflow-hidden rounded-[18px] border border-border bg-surface transition-shadow hover:shadow-sm">
        <button
          type="button"
          onClick={() => onView(video)}
          className="group relative block w-full cursor-pointer"
        >
          <img
            src={getThumbnailUrl(video.thumbnail)}
            alt={video.title}
            className="h-[190px] w-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
            <div className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white/90 text-primary opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
              <Play size={20} fill="currentColor" />
            </div>
          </div>

          <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
            {video.duration}
          </div>

          {video.featured && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-text">
              <Star size={12} className="text-warning" fill="currentColor" />
              Featured
            </div>
          )}
        </button>

        <div className="p-4">
          <div className="mb-3 flex items-start justify-between gap-2">
            <CategoryBadge category={video.category} />

            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{ items: menuItems }}
            >
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-[10px] text-text/40 transition-colors hover:bg-bg hover:text-text/70"
              >
                <MoreVertical size={16} />
              </button>
            </Dropdown>
          </div>

          <button
            type="button"
            onClick={() => onView(video)}
            className="mb-1 block text-left text-sm font-semibold text-text transition-colors hover:text-primary"
          >
            {video.title}
          </button>

          <p className="mb-3 text-xs leading-relaxed text-text/50">
            {video.description}
          </p>

          <div className="flex items-center justify-between text-xs text-text/40">
            <span>{video.instructor}</span>
            <span>{video.subtitle}</span>
          </div>
        </div>
      </div>
    );
  }
);

VideoCard.displayName = "VideoCard";

export default VideoCard;
