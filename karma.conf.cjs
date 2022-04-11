// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpackConfig = require("./webpack.config.cjs");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["mocha", "chai"],
    files: ["test/unit-web/run-web-implementation.test.ts", "test/unit/index-named-exports.test.ts"],
    exclude: [],
    preprocessors: {
      "test/**/*.ts": ["webpack"],
    },
    webpack: {
      mode: "production",
      node: webpackConfig.node,
      module: webpackConfig.module,
      resolve: webpackConfig.resolve,
    },
    reporters: ["spec"],

    browsers: ["ChromeHeadless"],

    singleRun: true,
  });
};
