const { eslintConfig } = require('@chealt/check');

module.exports = {
  ...eslintConfig,
  parserOptions: {
    babelOptions: {
      configFile: './.babelrc.js'
    }
  },
  overrides: [
    {
      files: ['src/AWS/lambdas/**/*.*', 'src/utils/**/*.*'],
      rules: {
        'no-console': 'off' // In AWS Lambdas we use the console log to track progress.
      }
    }
  ]
};
