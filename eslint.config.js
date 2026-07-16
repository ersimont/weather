// @ts-check
const tseslint = require('typescript-eslint');
const slibs = require('@s-libs/eslint-config-ng/strict');

module.exports = tseslint.config(...slibs, {
  files: ['**/*.ts'],
  languageOptions: { parserOptions: { projectService: true } },
  rules: {
    '@angular-eslint/directive-selector': [
      'error',
      { type: 'attribute', prefix: 'app', style: 'camelCase' },
    ],
    '@angular-eslint/component-selector': [
      'error',
      { type: 'element', prefix: 'app', style: 'kebab-case' },
    ],

    // This causes a stack overflow bug inside eslint. Try again after upgrades.
    '@typescript-eslint/no-unnecessary-type-assertion': 'off',

    // a lot of APIs require snake_case params
    camelcase: 'off',
  },
});
