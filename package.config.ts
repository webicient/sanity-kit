import preserveDirectives from 'rollup-preserve-directives';
import { defineConfig } from "@sanity/pkg-utils";

export default defineConfig({
  dist: "dist",
  tsconfig: "tsconfig.dist.json",
  rollup: {
    plugins: [preserveDirectives()],
  },
  extract: {
    rules: {
      "ae-forgotten-export": "off",
      "ae-incompatible-release-tags": "off",
      "ae-internal-missing-underscore": "off",
      "ae-missing-release-tag": "off",
    },
  },
});
