import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import next from "eslint-plugin-next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Explicitly define the configuration without relying on `compat.extends()`
export default [
  js.configs.recommended,
  next.configs["core-web-vitals"], // Use Next.js's recommended settings directly
  {
    rules: {
      // Override rules if necessary
      "no-restricted-syntax": "off", // To avoid function serialization errors
    },
  },
];
