// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angularPlugin from "@angular-eslint/eslint-plugin";
import angularTemplatePlugin from "@angular-eslint/eslint-plugin-template";
import tsParser from "@typescript-eslint/parser";
import angularTemplateParser from "@angular-eslint/template-parser";

export default tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@angular-eslint": angularPlugin,
    },
    processor: angularTemplatePlugin.processors["extract-inline-html"],
    rules: {
      "@angular-eslint/component-class-suffix": "error",
      "@angular-eslint/contextual-lifecycle": "error",
      "@angular-eslint/directive-class-suffix": "error",
      "@angular-eslint/no-empty-lifecycle-method": "error",
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-inputs-metadata-property": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-outputs-metadata-property": "error",
      "@angular-eslint/prefer-standalone": "error",
      "@angular-eslint/use-pipe-transform-interface": "error",
      "@angular-eslint/use-lifecycle-interface": "warn",
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      "@angular-eslint/template": angularTemplatePlugin,
    },
    rules: {
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/eqeqeq": "error",
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/alt-text": "error",
      "@angular-eslint/template/click-events-have-key-events": "error",
      "@angular-eslint/template/elements-content": "error",
      "@angular-eslint/template/interactive-supports-focus": "error",
      "@angular-eslint/template/label-has-associated-control": "error",
      "@angular-eslint/template/mouse-events-have-key-events": "error",
      "@angular-eslint/template/no-autofocus": "error",
      "@angular-eslint/template/no-distracting-elements": "error",
      "@angular-eslint/template/role-has-required-aria": "error",
      "@angular-eslint/template/table-scope": "error",
      "@angular-eslint/template/valid-aria": "error",
    },
  }
);
