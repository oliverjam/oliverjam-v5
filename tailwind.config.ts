import type { Config } from "tailwindcss";

export default {
  content: ["src/**/*.tsx"],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    fontFamily: false,
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
