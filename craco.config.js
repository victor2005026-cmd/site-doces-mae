const webpack = require('webpack');

// pix-utils (via qrcode) usa o módulo `buffer` do Node em tempo de build.
// Webpack 5 não polyfilla módulos core do Node automaticamente, então
// precisamos apontar manualmente pro pacote `buffer` do npm.
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve('buffer/'),
      };
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
      return webpackConfig;
    },
  },
};
