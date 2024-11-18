import eslintLoveConfig from "eslint-config-love";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default [
  eslintLoveConfig,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,

  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          modules: true,
        },
        ecmaVersion: "latest",
        project: "./tsconfig.json",
        extraFileExtensions: [".md"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
    },
  },
  {
    settings: {
      react: {
        createClass: "createReactClass", // Regex for Component Factory to use,
        // default to "createReactClass"
        pragma: "React", // Pragma to use, default to "React"
        fragment: "Fragment", // Fragment to use (may be a property of <pragma>), default to "Fragment"
        version: "detect", // React version. "detect" automatically picks the version you have installed.
        // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
        // It will default to "latest" and warn if missing, and to "detect" in the future
        flowVersion: "0.53", // Flow version
      },
      propWrapperFunctions: [
        // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
        "forbidExtraProps",
        { property: "freeze", object: "Object" },
        { property: "myFavoriteWrapper" },
        // for rules that check exact prop wrappers
        { property: "forbidExtraProps", exact: true },
      ],
      componentWrapperFunctions: [
        // The name of any function used to wrap components, e.g. Mobx `observer` function. If this isn't set, components wrapped by these functions will be skipped.
        "observer", // `property`
        { property: "styled" }, // `object` is optional
        { property: "observer", object: "Mobx" },
        { property: "observer", object: "<pragma>" }, // sets `object` to whatever value `settings.react.pragma` is set to
      ],
      formComponents: [
        // Components used as alternatives to <form> for forms, eg. <Form endpoint={ url } />
        "CustomForm",
        { name: "Form", formAttribute: "endpoint" },
      ],
      linkComponents: [
        // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
        "Hyperlink",
        { name: "Link", linkAttribute: "to" },
      ],
    },
  },
  {
    files: ["**/*.{ts,js,tsx,json}"],
    rules: {
      semi: ["error", "always"], // require semicolons ending statements
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-magic-numbers": [
        "error",
        { ignore: [0, 1, -1, 2] },
      ],
      "@typescript-eslint/prefer-literal-enum-member": "off",
      "@typescript-eslint/prefer-destructuring": [
        "error",
        {
          array: false,
          object: true,
        },
      ],
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
    },
  },
  {
    ignores: [
      "**/node_modules/**",
      "**/*.json",
      "**/src/api/_autogen/**",
      "**/tailwind.config.js",
      "**/vite.config.ts",
      "**/tsconfig.json",
      "**/vite-env.d.ts",
    ],
  },
];
