/**
 * Premium Glass Morphism Design System
 * Core utilities and constants for consistent styling
 */

export const glassConfig = {
  // Glass morphism base classes
  glass: {
    base: "bg-white/80 backdrop-blur-md border border-white/20 shadow-xl",
    dark: "bg-black border-2 border-yellow-400",
    strong: "bg-white/90 backdrop-blur-lg border border-white/30 shadow-2xl",
  },

  // Background gradients
  backgrounds: {
    main: "bg-gradient-to-br from-slate-50 to-blue-50/30",
    hero: "bg-gradient-to-br from-slate-900/5 to-blue-900/10",
    accent: "bg-gradient-to-br from-amber-600 to-yellow-400",
  },

  // Color tokens aligned with design system
  colors: {
    primary: {
      50: 'text-slate-900',
      400: 'text-yellow-400', // Dark mode primary
    },
    secondary: {
      50: 'text-slate-600',
      400: 'text-yellow-200', // Dark mode secondary
    },
    tertiary: {
      50: 'text-slate-500',
      400: 'text-yellow-300', // Dark mode tertiary
    },
    accent: {
      600: 'text-amber-600',
      400: 'text-yellow-400',
    }
  },

  // Typography scale
  typography: {
    hero: "text-5xl font-light tracking-tight",
    sectionHeader: "text-3xl font-light tracking-tight",
    cardTitle: "text-2xl font-light",
    bodyText: "text-lg font-medium",
    label: "text-lg font-medium",
    small: "text-sm",
  },

  // Animation utilities
  animations: {
    hover: "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
    hoverStrong: "transition-all duration-300 hover:-translate-y-2 hover:scale-105",
    focus: "focus:ring-2 focus:ring-blue-500/20 focus:outline-none",
  },

  // Spacing scale
  spacing: {
    container: "max-w-7xl mx-auto p-8",
    cardPadding: "p-10",
    section: "mb-12",
    sectionLarge: "mb-16",
  },

  // Border radius
  radius: {
    card: "rounded-3xl",
    button: "rounded-2xl",
    input: "rounded-2xl",
  }
} as const;

// High contrast mode utility
export const getContrastClass = (baseClass: string, contrastClass: string, isHighContrast = false) => {
  return isHighContrast ? contrastClass : baseClass;
};

// Component class builders
export const buildGlassCard = (highContrast = false) => {
  return getContrastClass(
    glassConfig.glass.base + " " + glassConfig.radius.card + " " + glassConfig.spacing.cardPadding,
    glassConfig.glass.dark + " " + glassConfig.radius.card + " " + glassConfig.spacing.cardPadding,
    highContrast
  );
};

export const buildPrimaryButton = (highContrast = false) => {
  const base = "py-4 px-8 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg font-medium text-lg";
  const contrast = "py-4 px-8 rounded-2xl bg-yellow-400 text-black hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg font-medium text-lg";
  return getContrastClass(base, contrast, highContrast);
};

export const buildSecondaryButton = (highContrast = false) => {
  const base = "py-4 px-8 rounded-2xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 font-medium text-lg";
  const contrast = "py-4 px-8 rounded-2xl border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 font-medium text-lg";
  return getContrastClass(base, contrast, highContrast);
};

export const buildAccentButton = (highContrast = false) => {
  const base = "py-4 px-8 rounded-2xl bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg font-medium text-lg";
  const contrast = "py-4 px-8 rounded-2xl bg-yellow-400 text-black hover:bg-yellow-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg font-medium text-lg";
  return getContrastClass(base, contrast, highContrast);
};

export const buildFormInput = (highContrast = false) => {
  const base = "w-full p-4 border rounded-2xl text-lg border-slate-300 bg-white/90 backdrop-blur-sm focus:border-blue-500 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-lg transition-all";
  const contrast = "w-full p-4 border rounded-2xl text-lg border-yellow-400 bg-black text-yellow-400 focus:border-yellow-400 placeholder-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 shadow-lg transition-all";
  return getContrastClass(base, contrast, highContrast);
};

// Service card template builder
export const buildServiceCard = (highContrast = false) => {
  const base = "bg-white/80 backdrop-blur-md border border-white/20 hover:shadow-xl shadow-lg p-8 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group";
  const contrast = "bg-black border-2 border-yellow-400 hover:shadow-xl shadow-lg p-8 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group";
  return getContrastClass(base, contrast, highContrast);
};

// Hero section builder
export const buildHeroSection = (highContrast = false) => {
  const base = "bg-gradient-to-br from-slate-900/5 to-blue-900/10 backdrop-blur-md border border-white/20 p-10 rounded-3xl shadow-xl";
  const contrast = "bg-black border-2 border-yellow-400 p-10 rounded-3xl shadow-xl";
  return getContrastClass(base, contrast, highContrast);
};

// Form section builder
export const buildFormSection = (highContrast = false) => {
  const base = "bg-white/80 backdrop-blur-md border border-white/20 shadow-xl p-10 rounded-3xl";
  const contrast = "bg-black border-2 border-yellow-400 shadow-xl p-10 rounded-3xl";
  return getContrastClass(base, contrast, highContrast);
};

// Text color utilities
export const buildTextPrimary = (highContrast = false) => {
  return getContrastClass("text-slate-900", "text-yellow-400", highContrast);
};

export const buildTextSecondary = (highContrast = false) => {
  return getContrastClass("text-slate-600", "text-yellow-200", highContrast);
};

export const buildTextTertiary = (highContrast = false) => {
  return getContrastClass("text-slate-500", "text-yellow-300", highContrast);
};