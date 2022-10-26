const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: {
    index: "./src/main.ts",
  },
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/db/migrations"),
          to: path.resolve(__dirname, ".webpack/main/migrations"),
        },
      ],
    }),
  ],
  externals: {
    pg: "pg",
    "pg-native": "pg-native",
    "better-sqlite3": "better-sqlite3",
    mysql: "mysql",
    mysql2: "mysql2",
    oracledb: "oracledb",
    tedious: "tedious",
    "pg-query-stream": "pg-query-stream",
  },
};
