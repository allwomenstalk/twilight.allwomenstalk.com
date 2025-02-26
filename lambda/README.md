test
sam local invoke MyLambdaFunction --event event.json
temp solution: 
node lambdatest.js 


sam build

sam deploy --guided // for the first ime 
sam deploy // after 


to udapte lamba: 
- copy ./src to lambda/nodejs/src
> nodejs % cp -r ../../src/ ./src
cd
- delete _data/db.js
rm ./src/_data/db.js 

- sam build && sam deploy

or 
> sh build.sh 

opitinal: remove src to avoid confustion with files

to add new module 
> cd nodejs 
> npm i [module]


if any change in eleventy (filter or similr)


Direct functin build 

aws lambda create-function \    
    --function-name NJKPostLambdaGithubSAM \
    --runtime nodejs20.x \
    --role arn:aws:iam::487610858442:role/njkpost-MyLambdaFunctionRole-ZXAB03V08RV \
    --handler app.handler \
    --zip-file fileb://../function.zip \
    --timeout 15


update

aws lambda update-function-code \
    --function-name NJKPostLambdaGithubSAM \
    --zip-file fileb://../function.zip

update configuration

aws lambda update-function-configuration \
    --function-name NJKPostLambdaGithubSAM \
    --environment "{\"Variables\":{\"ELEVENTY_PRODUCTION\":\"true\",\"ATLAS_DATA_API_URL\":\"https://data.mongodb-api.com/app/data-paobg/endpoint/data/v1\",\"ATLAS_DATA_API_KEY\":\"7vqeWzN9Cfe9zq70DPL7ZeY3ATWqWciYwBcuwURAUTqwEndAlbhylEFol2RvaVRB\"}}"

aws lambda update-function-configuration \
    --function-name NJKPostLambdaGithubSAM \
    --timeout 60
    --function-name NJKPostLambdaGithubSAM \
    --auth-type NONE

aws lambda create-function-url-config \
    --function-name NJKPostLambdaGithubSAM \
    --auth-type NONE