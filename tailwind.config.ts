import type { Config } from "tailwindcss";

export default {
  content: ["src/**/*.tsx"],
  theme: {
    fontFamily: {
      sans: ["system-ui", "sans-serif"],
      serif: ["Spectral", "ui-serif", "Georgia", "serif"],
    },
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    backdropOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    ringOpacity: false,
    textOpacity: false,
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
} as Config;
