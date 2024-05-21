const path = require("path")
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: "main.ts",
  target: "es2017",
  externals: [nodeExternals()],
  mode: "development",
  output: {
    path: path.resolve(__dirname, "bin"),
    chunkFormat: "module",
    filename: "main.js",
  },
  resolve: {
    extensions: [".ts", ".js"],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.build.json' })],
  },
  module: {
    rules: [{
      test: /\.ts$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      ]
    }],
  },
}


