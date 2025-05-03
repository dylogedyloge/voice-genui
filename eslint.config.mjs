import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals"; // Import globals

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Apply default Next.js rules first
  ...compat.extends("next/core-web-vitals", "plugin:@typescript-eslint/recommended"), // Use recommended TS rules

  // Add custom rule overrides
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Add browser globals
        ...globals.node, // Add node globals
      },
      parserOptions: {
         project: ['./tsconfig.json'], // Point to your tsconfig for type-aware linting
      },
    },
    rules: {
      // Warn about unused variables instead of erroring
      // Allows variables starting with _ to be unused (common convention)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      // Warn about explicit 'any' type instead of erroring
      "@typescript-eslint/no-explicit-any": "warn",
      // Add any other specific rule overrides here if needed
    },
  },
];

export default eslintConfig;
