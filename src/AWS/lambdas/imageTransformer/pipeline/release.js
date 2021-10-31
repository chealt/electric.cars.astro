const {
  LambdaClient,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand
} = require('@aws-sdk/client-lambda');
const { readFileSync } = require('fs');

const region = 'us-west-2';

const lambda = new LambdaClient({ region });

const release = async () => {
  try {
    const updateConfigParams = {
      FunctionName: 'imageTransformer',
      Handler: 'src/index.handler',
      Runtime: 'nodejs14.x'
    };

    const configData = await lambda.send(new UpdateFunctionConfigurationCommand(updateConfigParams));
    console.log('Success', configData); // eslint-disable-line no-console

    const updateCodeParams = {
      FunctionName: 'imageTransformer',
      ZipFile: readFileSync('./build.zip')
    };

    const codeData = await lambda.send(new UpdateFunctionCodeCommand(updateCodeParams));
    console.log('Success', codeData); // eslint-disable-line no-console
  } catch (err) {
    console.log('Error', err); // eslint-disable-line no-console
  }
};

release();
