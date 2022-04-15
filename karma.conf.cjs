// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpackConfig = require("./webpack.config.cjs");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: [
      "webpack",
      "mocha",
      "chai",
    ],
    files: [
      "test/unit-web/run-web-implementation.test.ts",
      "test/unit/index-named-exports.test.ts",
    ],
    exclude: [],
    preprocessors: {
      "test/**/*.ts": ["webpack"],
    },
    webpack: {
      mode: "production",
      module: webpackConfig.module,
      resolve: webpackConfig.resolve,
      experiments: webpackConfig.experiments,
      optimization: webpackConfig.optimization,
      stats: {warnings:false},
    },
    reporters: ["spec"],

    browsers: ["ChromeHeadless"],

    singleRun: true,
  });
};
