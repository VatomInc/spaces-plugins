const path = require('path');


module.exports = {
    entry: './src/index.js',
    // mode: 'development',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'plugin.js',
        library: {
            name: 'module.exports',
            type: 'assign',
            export: 'default'
        }
    },
    module: {
        rules: []
    },
    plugins: []
}

// Add support for JS
module.exports.module.rules.push({
    test: /\.(js)$/,
    exclude: /node_modules/,
    use: {
        loader: "babel-loader"
    }
})

// Add support for require()'ing resource files. These files will be bundled into
// the plugin as a data URI. Generally you should use `this.paths.absolute()` to
// get a path to a resource in the resources/ folder instead.
module.exports.module.rules.push({
    test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf|ico|mp3|mp4|wav|hdr|glb)$/,
    use: [
        {
            loader: 'url-loader',
            options: {
                esModule: false,
                limit: 100000000, 
            },
        },
    ],
})

// Copy all files from the resources/ folder into the dist/ folder when building
const CopyPlugin = require("copy-webpack-plugin")
module.exports.plugins.push(new CopyPlugin({
    patterns: [
        { from: path.resolve(__dirname, 'resources'), to: "./" },
    ],
}))

// Add support for the dev server
module.exports.devServer = {
    static: {
        directory: path.join(__dirname, 'resources'),
    },
    compress: true,
    port: 9000,
    hot: false,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization"
    }
}