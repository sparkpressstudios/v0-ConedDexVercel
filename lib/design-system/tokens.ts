/**
 * ConeDex Design System Tokens
 *
 * This file defines the core design tokens used throughout the application.
 * Any changes to these tokens should be carefully considered as they affect
 * the entire application's visual consistency.
 */

export const tokens = {
  // Color palette
  colors: {
    // Primary brand colors
    primary: {
      50: "hsl(var(--primary-50))",
      100: "hsl(var(--primary-100))",
      200: "hsl(var(--primary-200))",
      300: "hsl(var(--primary-300))",
      400: "hsl(var(--primary-400))",
      500: "hsl(var(--primary-500))",
      600: "hsl(var(--primary-600))",
      700: "hsl(var(--primary-700))",
      800: "hsl(var(--primary-800))",
      900: "hsl(var(--primary-900))",
      950: "hsl(var(--primary-950))",
    },
    // Secondary accent colors
    accent: {
      orange: {
        50: "hsl(var(--orange-50))",
        100: "hsl(var(--orange-100))",
        500: "hsl(var(--orange-500))",
        600: "hsl(var(--orange-600))",
        700: "hsl(var(--orange-700))",
      },
      teal: {
        50: "hsl(var(--teal-50))",
        100: "hsl(var(--teal-100))",
        500: "hsl(var(--teal-500))",
        600: "hsl(var(--teal-600))",
        700: "hsl(var(--teal-700))",
      },
      coral: {
        50: "hsl(var(--coral-50))",
        100: "hsl(var(--coral-100))",
        500: "hsl(var(--coral-500))",
        600: "hsl(var(--coral-600))",
        700: "hsl(var(--coral-700))",
      },
    },
    // Semantic colors
    semantic: {
      success: "hsl(var(--success))",
      warning: "hsl(var(--warning))",
      error: "hsl(var(--error))",
      info: "hsl(var(--info))",
    },
    // Neutral colors
    neutral: {
      50: "hsl(var(--neutral-50))",
      100: "hsl(var(--neutral-100))",
      200: "hsl(var(--neutral-200))",
      300: "hsl(var(--neutral-300))",
      400: "hsl(var(--neutral-400))",
      500: "hsl(var(--neutral-500))",
      600: "hsl(var(--neutral-600))",
      700: "hsl(var(--neutral-700))",
      800: "hsl(var(--neutral-800))",
      900: "hsl(var(--neutral-900))",
      950: "hsl(var(--neutral-950))",
    },
  },

  // Spacing system
  spacing: {
    0: "0px",
    0.5: "0.125rem", // 2px
    1: "0.25rem", // 4px
    1.5: "0.375rem", // 6px
    2: "0.5rem", // 8px
    2.5: "0.625rem", // 10px
    3: "0.75rem", // 12px
    3.5: "0.875rem", // 14px
    4: "1rem", // 16px
    5: "1.25rem", // 20px
    6: "1.5rem", // 24px
    7: "1.75rem", // 28px
    8: "2rem", // 32px
    9: "2.25rem", // 36px
    10: "2.5rem", // 40px
    11: "2.75rem", // 44px
    12: "3rem", // 48px
    14: "3.5rem", // 56px
    16: "4rem", // 64px
    20: "5rem", // 80px
    24: "6rem", // 96px
    28: "7rem", // 112px
    32: "8rem", // 128px
    36: "9rem", // 144px
    40: "10rem", // 160px
    44: "11rem", // 176px
    48: "12rem", // 192px
    52: "13rem", // 208px
    56: "14rem", // 224px
    60: "15rem", // 240px
    64: "16rem", // 256px
    72: "18rem", // 288px
    80: "20rem", // 320px
    96: "24rem", // 384px
  },

  // Typography
  typography: {
    fontFamily: {
      sans: "var(--font-sans)",
      mono: "var(--font-mono)",
    },
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
      "5xl": "3rem", // 48px
      "6xl": "3.75rem", // 60px
      "7xl": "4.5rem", // 72px
      "8xl": "6rem", // 96px
      "9xl": "8rem", // 128px
    },
    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
    lineHeight: {
      none: "1",
      tight: "1.25",
      snug: "1.375",
      normal: "1.5",
      relaxed: "1.625",
      loose: "2",
    },
    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },
  },

  // Border radius
  borderRadius: {
    none: "0px",
    sm: "0.125rem", // 2px
    DEFAULT: "0.25rem", // 4px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    "3xl": "1.5rem", // 24px
    full: "9999px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    none: "none",
  },

  // Z-index
  zIndex: {
    0: "0",
    10: "10",
    20: "20",
    30: "30",
    40: "40",
    50: "50",
    auto: "auto",
    dropdown: "1000",
    sticky: "1100",
    fixed: "1200",
    modal: "1300",
    popover: "1400",
    tooltip: "1500",
  },

  // Transitions
  transitions: {
    duration: {
      75: "75ms",
      100: "100ms",
      150: "150ms",
      200: "200ms",
      300: "300ms",
      500: "500ms",
      700: "700ms",
      1000: "1000ms",
    },
    timing: {
      linear: "linear",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  // Breakpoints
  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
}

// Role-specific theme variants
export const themeVariants = {
  explorer: {
    primary: "purple",
    accent: "orange",
    background: "white",
  },
  shopOwner: {
    primary: "teal",
    accent: "coral",
    background: "white",
  },
  admin: {
    primary: "blue",
    accent: "amber",
    background: "white",
  },
}

export default tokens
