// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  // ... reste de la config
  plugins: [
    require("tailwindcss-animate"), // Assurez-vous que cette ligne est présente
  ],
};

export default config;