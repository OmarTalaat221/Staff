import React from "react";
import { Button, Modal } from "antd";
import { Clock3, Star, User, X } from "lucide-react";
import ReactPlayer from "react-player";
import CategoryBadge from "./CategoryBadge";

const getVideoUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://camp-coding.site/nourstaff/admin/${url}`;
};

const VideoViewModal = React.memo(({ open, video, onClose }) => {
  if (!video) return null;

  const targetUrl = getVideoUrl(video.videoUrl || video.video_url);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={820}
      centered
      destroyOnClose
      closeIcon={<X size={18} />}
    >
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[16px] bg-black flex items-center justify-center relative min-h-[300px]">
          <ReactPlayer
            url={targetUrl}
            controls
            width="100%"
            height="400px"
            style={{ borderRadius: "16px", overflow: "hidden" }}
          />
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <CategoryBadge category={video.category_name || video.category} />

            {Number(video.featured || video.is_featured) === 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                <Star size={12} fill="currentColor" />
                Featured
              </span>
            )}
          </div>

          <h2 className="mb-2 text-lg font-bold text-text">{video.title}</h2>

          <p className="mb-4 text-sm leading-relaxed text-text/60">
            {video.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-text/40">
            <span className="inline-flex items-center gap-1.5">
              <User size={14} />
              {video.instructor}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />
              {video.duration}
            </span>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <Button onClick={onClose} className="rounded-xl h-10 px-5">Close</Button>
        </div>
      </div>
    </Modal>
  );
});

VideoViewModal.displayName = "VideoViewModal";

export default VideoViewModal;
