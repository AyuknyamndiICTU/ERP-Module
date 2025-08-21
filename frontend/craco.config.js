const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Fix webpack dev server deprecation warnings
      if (env === 'development') {
        // Remove deprecated onBeforeSetupMiddleware and onAfterSetupMiddleware
        if (webpackConfig.devServer) {
          delete webpackConfig.devServer.onBeforeSetupMiddleware;
          delete webpackConfig.devServer.onAfterSetupMiddleware;
          
          // Use the new setupMiddlewares option
          webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
            return middlewares;
          };
        }
      }
      
      return webpackConfig;
    },
  },
  devServer: {
    // Suppress webpack dev server deprecation warnings
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    },
  },
};
