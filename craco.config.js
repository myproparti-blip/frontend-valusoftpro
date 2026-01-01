module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.forEach((rule) => {
        if (rule.loader === 'source-map-loader') {
          rule.exclude = [
            /node_modules\/jspdf/,
            /node_modules\/html2canvas/,
          ];
        }
      });
      return webpackConfig;
    },
  },
};
