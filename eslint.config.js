export default [
  {
    files: ["src/**/*.js", "test/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        performance: "readonly",
      },
    },
    rules: {
      // === STRICT MODE ===
      strict: ["error", "global"],

      // === TYPE SAFETY (the YDKJS stuff) ===
      eqeqeq: ["error", "always"], // no == ever, only ===
      "no-implicit-coercion": "error", // no !!x, +x, x+"" shortcuts
      "no-extra-boolean-cast": "error", // no Boolean(Boolean(x))
      "use-isnan": "error", // must use Number.isNaN(), never x === NaN
      "valid-typeof": "error", // catches typeof x === "strig" typos
      "no-unsafe-negation": "error", // catches !x in obj mistakes

      // === SCOPE & CLOSURES ===
      "no-var": "error", // const/let only
      "prefer-const": "error", // const unless you reassign
      "no-shadow": "error", // no variable shadowing
      "no-use-before-define": "error", // no hoisting tricks
      "block-scoped-var": "error", // var inside blocks = error
      "no-loop-func": "error", // no functions inside loops (closure trap)
      "no-inner-declarations": "error", // no function declarations inside blocks

      // === NO SLOPPY PATTERNS ===
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error", // no new Function()
      "no-new-wrappers": "error", // no new String(), new Number()
      "no-proto": "error", // no __proto__, use Object.getPrototypeOf
      "no-extend-native": "error", // don't touch Array.prototype etc
      "no-with": "error",
      "no-void": "error", // explicit about void usage
      "no-delete-var": "error",
      "no-label-var": "error",

      // === DISCIPLINE ===
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-redeclare": "error",
      "no-self-compare": "error", // catches x === x (NaN check)
      "no-throw-literal": "error", // only throw Error objects
      "no-unmodified-loop-condition": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-sparse-arrays": "warn", // warn because you'll study these
      "no-empty-function": "warn",
      "no-magic-numbers": [
        "warn",
        {
          ignore: [0, 1, -1, 2],
          ignoreArrayIndexes: true,
        },
      ],
      "no-param-reassign": "error", // forces you to think about references
      "prefer-template": "error", // template literals over string concat

      // === MODERN JS ===
      "prefer-arrow-callback": "error",
      "prefer-rest-params": "error", // rest params over arguments object
      "prefer-spread": "error", // spread over .apply()
      "symbol-description": "error", // Symbol("description") not Symbol()
      "no-duplicate-imports": "error",
      "no-useless-rename": "error",
      "object-shorthand": "error",
    },
  },
];
