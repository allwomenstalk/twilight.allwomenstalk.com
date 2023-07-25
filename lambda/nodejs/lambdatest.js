const lambda = require('./app');

const event = require('./event.json');
const context = {};

lambda.handler(event, context, (error, result) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Result:', result);
  }
});