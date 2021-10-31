const { eslintConfig } = require('@chealt/check');

module.exports = {
  ...eslintConfig,
  parserOptions: {
    babelOptions: {
      configFile: './.babelrc.js'
    }
  }
};
