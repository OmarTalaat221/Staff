import { useState } from "react";
import { Alert, Button, Checkbox, Form, Input } from "antd";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../../utils/storage";

const LOGO_URL =
  "https://res.cloudinary.com/dhebgz7qh/image/upload/v1767452496/y3replc9wmlnvwb7kjvo_hyo3u3.png";

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (values) => {
    setError("");
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const username = values.username?.trim();
      const password = values.password?.trim();

      if (!username || !password) {
        setError("Please enter your credentials.");
        setLoading(false);
        return;
      }

      const validUser =
        username === "admin" || username === "nourmaison@gmail.com";
      const validPass = password === "admin123";

      if (!validUser || !validPass) {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      setToken("mock-admin-token");
      navigate("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={LOGO_URL}
              alt="NOUR MAISON"
              className="w-16 h-16 rounded-2xl object-contain"
            />
          </div>

          <h1 className="text-text text-[28px] leading-tight font-bold tracking-tight">
            NOUR MAISON
          </h1>
          <p className="text-secondary text-xs font-semibold tracking-widest uppercase mt-1">
            Restaurant Management
          </p>
          <p className="text-text/50 text-sm mt-3">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl shadow-sm p-6 sm:p-8">
          {error && (
            <Alert
              type="error"
              showIcon
              message={error}
              closable
              onClose={() => setError("")}
              className="mb-5"
            />
          )}

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleLogin}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label={
                <span className="text-text text-sm font-medium">
                  Email or Username
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter your email or username",
                },
              ]}
            >
              <Input size="large" placeholder="admin or admin@restaurant.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-text text-sm font-medium">Password</span>
              }
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
              ]}
            >
              <Input
                size="large"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex items-center justify-center text-text/40 hover:text-text/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </Form.Item>

            <div className="flex items-center justify-between gap-3 mb-5">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>
                  <span className="text-text/70 text-sm">Remember me</span>
                </Checkbox>
              </Form.Item>

              <button
                type="button"
                className="text-primary text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Forgot password?
              </button>
            </div>

            <Button
              htmlType="submit"
              type="primary"
              block
              size="large"
              loading={loading}
              className="font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form>
        </div>

        {/* Demo hint */}
        {/* <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-center text-text/60 text-xs">
            Demo: username{" "}
            <span className="text-primary font-semibold">admin</span>
            {" / "}password{" "}
            <span className="text-primary font-semibold">admin123</span>
          </p>
        </div> */}

        <p className="text-center text-text/40 text-xs mt-4">
          Internal management system — NOUR MAISON
        </p>
      </div>
    </div>
  );
}
