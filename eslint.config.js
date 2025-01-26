import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions } },
    rules: {
      "no-undef": "error",
      "no-console": [
        "error",
        {
          allow: ["info", "error"]
        }
      ],
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_"
        }
      ]
    }
  },
  { ignores: ["node_modules", "commitlint.config.js", "dist", "src/assets/xlsx"] },
  pluginJs.configs.recommended,
  eslintConfigPrettier
];
