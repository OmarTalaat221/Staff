import React from "react";
import { Button, Modal } from "antd";
import { Trash2, X } from "lucide-react";

const VideoDeleteModal = React.memo(
  ({ open, video, loading, onClose, onConfirm }) => {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={460}
        centered
        destroyOnClose
        closeIcon={<X size={18} />}
      >
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
            <Trash2 size={20} className="text-danger" />
          </div>

          <div>
            <h3 className="mb-1 text-lg font-semibold text-text">
              Delete video
            </h3>
            <p className="text-sm leading-relaxed text-text/50">
              Are you sure you want to delete{" "}
              <span className="font-medium text-text">{video?.title}</span>?
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button danger type="primary" loading={loading} onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
);

VideoDeleteModal.displayName = "VideoDeleteModal";

export default VideoDeleteModal;
