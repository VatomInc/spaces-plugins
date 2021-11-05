const path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: 'development',
    // mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'WebpackShowcase.min.js',
        library: {
            name: 'module.exports',
            type: 'assign',
            export: 'default'
        }
    },
    module: {
        rules: []
    }
}

// Add support for JS and JSX
module.exports.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
        loader: "babel-loader"
    }
})

// Add support for resource files
module.exports.module.rules.push({
    test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf|ico|mp3|mp4|wav|hdr|glb)$/,
    use: [
        {
            loader: 'url-loader',
            options: {
                esModule: false, // Required so that calling `require()` on a file actually works.
                limit: 10000000
            },
        },
    ],
})
