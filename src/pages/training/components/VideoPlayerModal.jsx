import React from "react";
import { Modal, Button } from "antd";
import { Play, CheckCircle, Clock, User, X } from "lucide-react";
import CategoryBadge from "./CategoryBadge";

const VideoPlayerModal = React.memo(
  ({ video, open, onClose, onMarkWatched }) => {
    if (!video) return null;

    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={720}
        centered
        closeIcon={<X size={18} />}
        destroyOnClose
      >
        <div className="space-y-5">
          {/* Video Placeholder */}
          <div className="relative rounded-[14px] overflow-hidden bg-gray-900">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-[300px] sm:h-[360px] object-cover opacity-60"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-3">
                <Play size={36} fill="white" className="ml-1" />
              </div>
              <p className="text-sm text-white/70">Video player placeholder</p>
            </div>
            <div className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2.5 py-1 text-sm font-medium text-white">
              {video.duration}
            </div>
          </div>

          {/* Video Info */}
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

            <h2 className="mb-2 text-lg font-bold text-text">{video.title}</h2>

            <p className="mb-4 text-sm text-text/60 leading-relaxed">
              {video.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-text/40">
              <span className="inline-flex items-center gap-1.5">
                <User size={14} />
                {video.instructor}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {video.duration}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            {!video.watched && (
              <Button
                type="primary"
                icon={<CheckCircle size={16} />}
                onClick={onMarkWatched}
              >
                Mark as Watched
              </Button>
            )}
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  }
);

VideoPlayerModal.displayName = "VideoPlayerModal";

export default VideoPlayerModal;
