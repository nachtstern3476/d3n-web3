const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const sharp = require('sharp');

const path = require('path');
const rootPath = path.resolve(__dirname);
const srcPath = rootPath + '/src';
const distPath = rootPath + '/dist';
const assetSrcPath = srcPath + '/assets';
const assetDistPath = distPath + '/assets';

function isProduction() {
    return process.argv.indexOf('--mode=production') !== -1 ? true : false;
}

module.exports = {
    mode: isProduction() ? 'production' : 'development',
    devServer: {
        static: srcPath,
        port: 5000,
        hot: true
    },
    devtool: false,
    optimization: {
        minimize: true,
        minimizer: [new CssMinimizerPlugin(), new ImageMinimizerPlugin({
            minimizer: {
                implementation: ImageMinimizerPlugin.sharpMinify,
                options: {
                    encodeOptions: {
                        resize: {
                            width: 500,
                            height: 1000,
                            fit: sharp.fit.inside,
                            withoutEnlargement: true,
                        },
                        png: {
                            quality: 95,
                            compressionLevel: 9,
                        },
                    },
                },
            },
        }),]
    },
    entry: {
        'assets/css/style.bundle': `${srcPath}/assets/css/style.css`,
        'assets/js/main': `${srcPath}/assets/js/main.js`,
    },
    output: {
        path: distPath,
        filename: '[name].bundle.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [isProduction() ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader'],
            },
            {
                test: /\.(png|gif|jpe?g)$/,
                include: srcPath,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: assetDistPath + '/img',
                            publicPath: (url, resourcePath, context) => {
                                return path.basename(url);
                            },
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: `${srcPath}/index.html`,
            filename: 'index.html',
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: assetSrcPath + '/img',
                    to: assetDistPath + '/img',
                }
            ]
        }),
    ]
};