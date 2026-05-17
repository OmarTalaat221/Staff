import React, { useEffect, useState } from "react";
import { Button, Drawer, Form, Input, Select, Switch, Radio, Upload } from "antd";
import { UploadCloud } from "lucide-react";

const VideoDrawer = React.memo(
  ({ open, mode, video, onClose, onSubmit, loading, categories = [] }) => {
    const [form] = Form.useForm();
    const [videoSource, setVideoSource] = useState("url");
    const [thumbnailSource, setThumbnailSource] = useState("url");

    useEffect(() => {
      if (!open) return;

      if (video) {
        form.setFieldsValue({
          title: video.title,
          category_id: Number(video.category_id),
          instructor: video.instructor,
          duration: video.duration,
          thumbnail_url: video.thumbnail_url || video.thumbnail || "",
          video_url: video.video_url || video.videoUrl || "",
          description: video.description || "",
          is_featured: Number(video.is_featured || video.featured || 0) === 1,
        });
        setVideoSource("url");
        setThumbnailSource("url");
      } else {
        form.setFieldsValue({
          title: "",
          category_id: categories[0]?.category_id ? Number(categories[0].category_id) : undefined,
          instructor: "",
          duration: "5:00",
          thumbnail_url: "",
          video_url: "",
          description: "",
          is_featured: false,
        });
        setVideoSource("url");
        setThumbnailSource("url");
      }
    }, [form, open, video, categories]);

    const handleFinish = (values) => {
      const payload = {
        ...values,
        videoSource,
        thumbnailSource,
      };
      onSubmit(payload);
    };

    return (
      <Drawer
        title={mode === "edit" ? "Edit Video" : "Upload Video"}
        open={open}
        onClose={onClose}
        width={540}
        destroyOnClose
        extra={<Button onClick={onClose}>Close</Button>}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={() => form.submit()}
              className="rounded-xl"
            >
              {mode === "edit" ? "Save Changes" : "Create Video"}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item
            name="title"
            label="Video Title"
            rules={[{ required: true, message: "Please enter video title" }]}
          >
            <Input placeholder="Enter video title" className="h-10 rounded-xl" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select
              placeholder="Select category"
              className="h-10 rounded-xl"
              options={categories.map((c) => ({
                value: Number(c.category_id),
                label: c.category_name,
              }))}
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
              <Input placeholder="Instructor name" className="h-10 rounded-xl" />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true, message: "Please enter duration" }]}
            >
              <Input placeholder="Example: 5:00" className="h-10 rounded-xl" />
            </Form.Item>
          </div>

          {/* Thumbnail source selection */}
          <div className="mb-4">
            <span className="block text-sm font-medium text-text mb-2">Thumbnail Source</span>
            <Radio.Group
              value={thumbnailSource}
              onChange={(e) => setThumbnailSource(e.target.value)}
              buttonStyle="solid"
              className="w-full flex"
            >
              <Radio.Button value="url" className="flex-1 text-center h-10 flex items-center justify-center rounded-l-xl">
                Thumbnail Image URL
              </Radio.Button>
              <Radio.Button value="file" className="flex-1 text-center h-10 flex items-center justify-center rounded-r-xl">
                Upload Thumbnail File
              </Radio.Button>
            </Radio.Group>
          </div>

          {thumbnailSource === "url" ? (
            <Form.Item
              name="thumbnail_url"
              label="Thumbnail URL"
              rules={[{ required: true, message: "Please enter thumbnail URL" }]}
            >
              <Input placeholder="https://..." className="h-10 rounded-xl" />
            </Form.Item>
          ) : (
            <Form.Item
              name="thumbnail_file"
              label="Upload Thumbnail Image"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) return e;
                return e && e.fileList;
              }}
              rules={[{ required: true, message: "Please upload thumbnail file" }]}
            >
              <Upload
                name="thumbnail_file"
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                className="w-full"
              >
                <Button
                  icon={<UploadCloud size={16} />}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl"
                >
                  Select Thumbnail Image File
                </Button>
              </Upload>
            </Form.Item>
          )}

          {/* Video source selection */}
          <div className="mb-4 mt-6">
            <span className="block text-sm font-medium text-text mb-2">Video Source</span>
            <Radio.Group
              value={videoSource}
              onChange={(e) => setVideoSource(e.target.value)}
              buttonStyle="solid"
              className="w-full flex"
            >
              <Radio.Button value="url" className="flex-1 text-center h-10 flex items-center justify-center rounded-l-xl">
                Video URL (YouTube/MP4/Vimeo)
              </Radio.Button>
              <Radio.Button value="file" className="flex-1 text-center h-10 flex items-center justify-center rounded-r-xl">
                Upload Video File
              </Radio.Button>
            </Radio.Group>
          </div>

          {videoSource === "url" ? (
            <Form.Item
              name="video_url"
              label="Video URL"
              rules={[{ required: true, message: "Please enter video URL" }]}
            >
              <Input placeholder="https://...mp4" className="h-10 rounded-xl" />
            </Form.Item>
          ) : (
            <Form.Item
              name="video_file"
              label="Upload Video File"
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) return e;
                return e && e.fileList;
              }}
              rules={[{ required: true, message: "Please upload video file" }]}
            >
              <Upload
                name="video_file"
                maxCount={1}
                beforeUpload={() => false}
                accept="video/*"
                className="w-full"
              >
                <Button
                  icon={<UploadCloud size={16} />}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl"
                >
                  Select Video File
                </Button>
              </Upload>
            </Form.Item>
          )}

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
            className="mt-4"
          >
            <Input.TextArea rows={4} placeholder="Enter video description" className="rounded-xl" />
          </Form.Item>

          <Form.Item name="is_featured" label="Featured Video" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    );
  }
);

VideoDrawer.displayName = "VideoDrawer";

export default VideoDrawer;
