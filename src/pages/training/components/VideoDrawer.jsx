import React, { useEffect } from "react";
import { Button, Drawer, Form, Input, Select, Switch } from "antd";
import { CATEGORIES, DEFAULT_VIDEO_URL } from "../data/videosData";

const VideoDrawer = React.memo(
  ({ open, mode, video, onClose, onSubmit, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
      if (!open) return;

      if (video) {
        form.setFieldsValue({
          title: video.title,
          category: video.category,
          duration: video.duration,
          thumbnail: video.thumbnail,
          videoUrl: video.videoUrl,
          instructor: video.instructor,
          description: video.description,
          featured: video.featured,
        });
      } else {
        form.setFieldsValue({
          title: "",
          category: "app",
          duration: "",
          thumbnail: "",
          videoUrl: DEFAULT_VIDEO_URL,
          instructor: "",
          description: "",
          featured: false,
        });
      }
    }, [form, open, video]);

    return (
      <Drawer
        title={mode === "edit" ? "Edit Video" : "Upload Video"}
        open={open}
        onClose={onClose}
        width={520}
        destroyOnClose
        extra={<Button onClick={onClose}>Close</Button>}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => form.submit()}
            >
              {mode === "edit" ? "Save Changes" : "Upload Video"}
            </Button>
          </div>
        }
      >
        <div className="mb-4 rounded-[12px] bg-bg px-3 py-2 text-xs text-text/50">
          For the current mock flow, videos are added using a direct MP4 URL.
        </div>

        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            name="title"
            label="Video Title"
            rules={[{ required: true, message: "Please enter video title" }]}
          >
            <Input placeholder="Enter video title" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select
              options={CATEGORIES.filter((item) => item.id !== "all").map(
                (item) => ({
                  value: item.id,
                  label: item.label,
                })
              )}
            />
          </Form.Item>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Form.Item
              name="instructor"
              label="Instructor"
              rules={[
                { required: true, message: "Please enter instructor name" },
              ]}
            >
              <Input placeholder="Instructor name" />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true, message: "Please enter duration" }]}
            >
              <Input placeholder="Example: 6:40" />
            </Form.Item>
          </div>

          <Form.Item
            name="thumbnail"
            label="Thumbnail URL"
            rules={[{ required: true, message: "Please enter thumbnail URL" }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item
            name="videoUrl"
            label="Video URL"
            rules={[{ required: true, message: "Please enter video URL" }]}
          >
            <Input placeholder="https://...mp4" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter video description" />
          </Form.Item>

          <Form.Item name="featured" label="Featured" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    );
  }
);

VideoDrawer.displayName = "VideoDrawer";

export default VideoDrawer;
