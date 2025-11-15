import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import typescriptEslintParser from "@typescript-eslint/parser";
import js from "@eslint/js";

export default [
  jsdoc.configs['flat/recommended'],
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parser: typescriptEslintParser,
      parserOptions: {
        project: true,
        sourceType: "module",
        ecmaVersion: "latest"
      },
    },
    plugins: {
      jsdoc
    },
    rules: {
      "jsdoc/require-description": "warn"
    }
  },
];
