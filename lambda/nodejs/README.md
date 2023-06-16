sam local invoke MyLambdaFunction --event event.json


sam build

sam deploy --guided // for the first ime 
sam deploy // after 


to udapte lamba: 
- copy ./src to lambda/nodejs/src
> nodejs % cp -r ../../src/ ./src

- delete _data/db.js
rm ./src/_data/db.js 

- sam build && sam deploy

opitinal: remove src to avoid confustion with files