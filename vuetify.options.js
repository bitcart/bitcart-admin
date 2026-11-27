const accents = {
  primary: "#9E60F4",
  secondary: "#22D3EE",
  accent: "#9E60F4",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#38BDF8",
}

export default {
  theme: {
    dark: true,
    options: { variations: false, customProperties: true },
    themes: {
      dark: { ...accents, background: "#0B0D12", surface: "#12151C" },
      light: { ...accents, background: "#F6F7F9", surface: "#FFFFFF" },
    },
  },
}
