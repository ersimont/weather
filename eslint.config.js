// @ts-check
const tseslint = require("typescript-eslint");
const slibs = require("@s-libs/eslint-config-ng/strict");

module.exports = tseslint.config(...slibs, {
  files: ["**/*.ts"],
  languageOptions: { parserOptions: { projectService: true } },
  rules: {
    "@angular-eslint/directive-selector": [
      "error",
      { type: "attribute", prefix: "app", style: "camelCase" },
    ],
    "@angular-eslint/component-selector": [
      "error",
      { type: "element", prefix: "app", style: "kebab-case" },
    ],
  },
});
