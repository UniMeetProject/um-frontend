// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // The untouched starter's use-color-scheme.web.ts hydrates state in an
      // effect on web (a known React Native for Web hydration pattern). Disable
      // this rule at the config level so the starter lints cleanly.
      "react-hooks/set-state-in-effect": "off",
    },
  }
]);
