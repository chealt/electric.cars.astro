const { LambdaClient, UpdateFunctionCodeCommand } = require('@aws-sdk/client-lambda');
const { readFileSync } = require('fs');

const region = 'us-west-2';

const lambda = new LambdaClient({ region });

// Set the parameters.
const params = {
  FunctionName: 'imageTransformer',
  Handler: 'index.handler',
  Runtime: 'nodejs14.x',
  ZipFile: readFileSync('./build.zip')
};

const run = async () => {
  try {
    const data = await lambda.send(new UpdateFunctionCodeCommand(params));
    console.log('Success', data); // successful response
  } catch (err) {
    console.log('Error', err); // an error occurred
  }
};
run();
