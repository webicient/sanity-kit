const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

module.exports = {
  extends: [
    require.resolve("@vercel/style-guide/eslint/node"),
    require.resolve("@vercel/style-guide/eslint/typescript"),
    require.resolve("@vercel/style-guide/eslint/browser"),
    require.resolve("@vercel/style-guide/eslint/react"),
    "sanity",
    "sanity/typescript",
    "sanity/react",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "plugin:react/jsx-runtime",
  ],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    "*.js",
    ".eslintrc.js",
    "commitlint.config.js",
    "dist",
    "lint-staged.config.js",
    "package.config.ts",
    "studio",
  ],
  rules: {
    "unicorn/filename-case": "off",
    "simple-import-sort/imports": "off",
  },
};
