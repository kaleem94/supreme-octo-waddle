const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env) => {
    const shouldClean = env && env.clean;

    return {
        mode: 'production',
        entry: './src/index.js',
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'build')
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin()],
        },
        module: {
            rules: [
                // {
                //     test: /\.js$/,
                //     exclude: /node_modules/,
                //     use: {
                //         loader: 'babel-loader',
                //         options: {
                //             presets: ['@babel/preset-env']
                //         }
                //     }
                // },
                {
                    // Load CSS files. They can be imported into JS files.
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html', // Path to your HTML template
                filename: 'index.html', // Output filename
                chunks: ['main'] // Include only the main chunk
            }),
            ...(shouldClean ? [new CleanWebpackPlugin()] : [])
        ],

    };
};