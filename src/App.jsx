import { ConfigProvider } from "antd";
import { Toaster } from "react-hot-toast";
import AppRouter from "./routes/AppRouter";
import antdTheme from "./theme/antdTheme";
import dayjs from "dayjs";
import "dayjs/locale/en-gb";
dayjs.locale("en-gb");
import enGB from "antd/locale/en_GB";

export default function App() {
  return (
    <ConfigProvider theme={antdTheme} locale={enGB}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            color: "#111827",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "14px",
            padding: "12px 16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          },
          success: {
            iconTheme: {
              primary: "#16A34A",
              secondary: "#FFFFFF",
            },
          },
          error: {
            iconTheme: {
              primary: "#DC2626",
              secondary: "#FFFFFF",
            },
          },
        }}
      />
      <AppRouter />
    </ConfigProvider>
  );
}
