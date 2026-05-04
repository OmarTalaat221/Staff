const antdTheme = {
  token: {
    colorPrimary: "#2563EB",
    colorText: "#111827",
    colorBgLayout: "#F6F8FB",
    colorBgContainer: "#FFFFFF",
    colorBorder: "#E5E7EB",
    colorSuccess: "#16A34A",
    colorWarning: "#D97706",
    colorError: "#DC2626",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: 12,
    controlHeight: 44,
  },
  components: {
    Button: {
      primaryShadow: "none",
      borderRadius: 12,
      controlHeight: 46,
    },
    Input: {
      borderRadius: 12,
      controlHeight: 46,
      activeBorderColor: "#2563EB",
      hoverBorderColor: "#93C5FD",
    },
    Card: {
      borderRadius: 18,
    },
  },
};

export default antdTheme;
