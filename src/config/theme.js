// Shared Theme Configuration
// Extracted from Dashboard styling for consistent application

export const theme = {
  // Primary Colors (from Dashboard gradient)
  primary: {
    dark: "#334155",      // slate-700
    base: "#475569",      // slate-600
    light: "#64748b",     // slate-500
    lighter: "#cbd5e1",   // slate-300
  },

  // Secondary Colors (from Dashboard accents)
  secondary: {
    blue: "#3b82f6",      // blue-500
    green: "#10b981",     // green-600
    red: "#ef4444",       // red-500
    purple: "#8b5cf6",    // purple-500
    amber: "#f59e0b",     // amber-500
    indigo: "#4f46e5",    // indigo-500
  },

  // Background Colors
  background: {
    primary: "#ffffff",   // white
    secondary: "#f8fafc", // slate-50
    tertiary: "#f1f5f9",  // slate-100
    hover: "#f3f4f6",     // neutral-100
    disabled: "#e5e7eb",  // gray-200
  },

  // Border Colors
  border: {
    light: "#e2e8f0",     // slate-200
    default: "#cbd5e1",   // slate-300
    dark: "#64748b",      // slate-500
  },

  // Text Colors
  text: {
    primary: "#1f2937",   // gray-900
    secondary: "#6b7280", // gray-600
    tertiary: "#9ca3af",  // gray-400
    light: "#d1d5db",     // gray-300
    muted: "#9ca3af",     // gray-400
  },

  // Status Colors
  status: {
    pending: "#f59e0b",   // amber-500 (PR)
    progress: "#3b82f6",  // blue-500 (OP)
    approved: "#10b981",  // green-600 (App)
    rejected: "#ef4444",  // red-500 (Rej)
    rework: "#8b5cf6",    // purple-500 (RW)
  },

  // Shadow Styles
  shadow: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },

  // Border Radius
  radius: {
    sm: "0.375rem",    // 6px
    md: "0.5rem",      // 8px
    lg: "1rem",        // 16px
    xl: "1.5rem",      // 24px
    full: "9999px",    // full
  },

  // Transitions
  transition: {
    fast: "all 0.15s ease",
    base: "all 0.2s ease",
    slow: "all 0.3s ease",
  },

  // Table Styles
  table: {
    headerBg: "#f3f4f6",        // neutral-100
    headerText: "#111827",      // neutral-900
    headerFont: "font-bold",
    rowBorder: "#e5e7eb",       // neutral-200
    rowHoverBg: "#f9fafb",      // neutral-50
    cellPadding: "12px 16px",
  },

  // Card Styles
  card: {
    bg: "#ffffff",
    border: "#e5e7eb",
    shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    shadowHover: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },

  // Button Styles
  button: {
    primary: {
      bg: "#3b82f6",
      bgHover: "#2563eb",
      text: "#ffffff",
    },
    secondary: {
      bg: "#f3f4f6",
      bgHover: "#e5e7eb",
      border: "#d1d5db",
      text: "#111827",
    },
    danger: {
      bg: "#ef4444",
      bgHover: "#dc2626",
      text: "#ffffff",
    },
  },

  // Dashboard Header (from dashboard.jsx)
  dashboard: {
    headerBg: "linear-gradient(90deg, #475569 0%, #334155 100%)",
    headerText: "#ffffff",
    cardBg: "#ffffff",
    tableHeaderBg: "linear-gradient(to right, #475569, #334155, #475569)",
    tableHeaderText: "#ffffff",
    filterDropdownBg: "#ffffff",
    badgeBg: {
      pending: "#f59e0b",
      progress: "#3b82f6",
      approved: "#10b981",
      rejected: "#ef4444",
      rework: "#8b5cf6",
    },
  },
};

export default theme;
