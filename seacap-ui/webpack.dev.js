const path = require("path");
const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        historyApiFallback: true,
        compress: true,
        port: 9000,
        proxy: {
            "/api": "http://localhost:3000",
            "/clustering": "http://localhost:5000"
        }
    },
});