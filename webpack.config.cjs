const path = require('path');
const ResolveTypeScriptPlugin = require("resolve-typescript-plugin");

module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  output: {
    filename: "dist/bundle.js",
  },
  module: {
    rules: [
      {test: /\.(ts)$/, use: {loader: "ts-loader", options: {transpileOnly: true}}},
      {
        test: /@chainsafe\/blst/,
        use: 'null-loader',
      },
    ],
  },
  optimization: {
    // Disable minification for better debugging on Karma tests
    minimize: false,
    //splitChunks: false, runtimeChunk: false,
  },
  devtool: "source-map",
  resolve: {
    plugins: [
      new ResolveTypeScriptPlugin(),
    ],
    alias: {
      "crypto": "crypto-browserify",
      './blst-native/index.js': path.resolve(__dirname, './src/herumi/index.js')
    },
    fallback: {
      fs: false,
      path: false,
      stream: false,
    },
  },
  experiments: {
    topLevelAwait: true,
  },
};
