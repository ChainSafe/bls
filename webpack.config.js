module.exports = {
  entry: "./src/index.ts",
  mode: "production",
  node: {
    fs: "empty",
  },
  output: {
    filename: "dist/bundle.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [{test: /\.ts$/, use: {loader: "ts-loader", options: {transpileOnly: true}}}],
  },
  optimization: {
    // Disable minification for better debugging on Karma tests
    minimize: false,
  },
  devtool: "source-map",
};
