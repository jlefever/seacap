const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./src/index.ts",
    plugins: [
        new HtmlWebpackPlugin({ title: "SEA Captain" })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader"
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource"
            },
            {

                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource"
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    experiments: {
        topLevelAwait: true,
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true
    },
};