module.exports = {
  "root": true,
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "array-bracket-newline": ["error", "consistent"],
    "array-bracket-spacing": ["error", "always"],
    "array-element-newline": ["error", "consistent"],
    "arrow-parens": "error",
    "arrow-spacing": "error",
    "block-spacing": "error",
    "brace-style": ["error", "stroustrup"],
    "comma-dangle": ["error", "always-multiline"],
    "comma-spacing": "error",
    "comma-style": "error",
    "computed-property-spacing": "error",
    "eol-last": "error",
    "func-call-spacing": "error",
    "function-call-argument-newline": ["error", "consistent"],
    "implicit-arrow-linebreak": "error",
    "indent": ["error", 2],
    "key-spacing": "error",
    "no-duplicate-imports": "error",
    "no-var": "error",
    "rest-spread-spacing": "error",
    "semi": "error",
    "semi-spacing": "error",
    "semi-style": "error",
    "space-before-blocks": "error",
    "space-before-function-paren": ["error", {"anonymous": "always", "named": "never", "asyncArrow": "always"}],
    "space-in-parens": "error",
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    "spaced-comment": "error",
    "symbol-description": "error",
    "unicode-bom": "error"
  }
};
