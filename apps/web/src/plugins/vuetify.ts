import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify, type ThemeDefinition } from "vuetify";
import { fa } from "vuetify/locale";

// Persist theme preference across sessions
const savedTheme = typeof window !== "undefined"
  ? localStorage.getItem("sess-theme")
  : null;

export const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#8C57FF",
    "primary-darken-1": "#7E4EE6",
    secondary: "#8A8D93",
    "secondary-darken-1": "#7C7F84",
    success: "#56CA00",
    "success-darken-1": "#4DB600",
    info: "#16B1FF",
    "info-darken-1": "#149FE6",
    warning: "#FFB400",
    "warning-darken-1": "#E6A200",
    error: "#FF4C51",
    "error-darken-1": "#E64449",
    background: "#F4F5FA",
    surface: "#FFFFFF",
    "surface-bright": "#F6F7FB",
    "surface-light": "#FAFAFA",
    "surface-variant": "#2E263D",
    "on-surface-variant": "#FFFFFF",
    "on-primary": "#FFFFFF",
    "on-secondary": "#FFFFFF",
    "on-success": "#FFFFFF",
    "on-warning": "#FFFFFF",
    "on-error": "#FFFFFF",
    "on-background": "#2E263D",
    "on-surface": "#2E263D",
  },
  variables: {
    "border-color": "46, 38, 61",
    "border-opacity": 0.12,
    "high-emphasis-opacity": 0.90,
    "medium-emphasis-opacity": 0.70,
    "disabled-opacity": 0.40,
    "hover-opacity": 0.04,
    "focus-opacity": 0.10,
    "selected-opacity": 0.08,
    "activated-opacity": 0.16,
    "pressed-opacity": 0.14,
    "dragged-opacity": 0.10,
  },
};

export const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary: "#B085FF",
    "primary-darken-1": "#9568E8",
    secondary: "#B0B3B8",
    "secondary-darken-1": "#9A9DA4",
    success: "#72D146",
    "success-darken-1": "#56CA00",
    info: "#38C4FF",
    "info-darken-1": "#16B1FF",
    warning: "#FFC233",
    "warning-darken-1": "#FFB400",
    error: "#FF757A",
    "error-darken-1": "#FF545A",
    background: "#1E1C2E",
    surface: "#2B2940",
    "surface-bright": "#35324D",
    "surface-light": "#36334E",
    "surface-variant": "#1C192B",
    "on-surface-variant": "#FFFFFF",
    "on-primary": "#FFFFFF",
    "on-secondary": "#FFFFFF",
    "on-success": "#FFFFFF",
    "on-warning": "#FFFFFF",
    "on-error": "#FFFFFF",
    "on-background": "#E7E3FC",
    "on-surface": "#E7E3FC",
  },
  variables: {
    "border-color": "231, 227, 252",
    "border-opacity": 0.14,
    "high-emphasis-opacity": 0.92,
    "medium-emphasis-opacity": 0.72,
    "disabled-opacity": 0.45,
    "hover-opacity": 0.08,
    "focus-opacity": 0.14,
    "selected-opacity": 0.12,
    "activated-opacity": 0.20,
    "pressed-opacity": 0.18,
    "dragged-opacity": 0.12,
  },
};

export const appTheme = {
  defaultTheme: savedTheme || "light",
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
};

export default createVuetify({
  locale: {
    locale: "fa",
    fallback: "fa",
    messages: { fa },
    rtl: { fa: true },
  },
  theme: appTheme,
  defaults: {
    VCard: {
      elevation: 2,
      rounded: "lg",
    },
    VBtn: {
      rounded: "sm",
      elevation: 0,
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VAutocomplete: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VChip: {
      rounded: "pill",
    },
    VDataTable: {
      hover: true,
      density: "comfortable",
    },
  },
});
