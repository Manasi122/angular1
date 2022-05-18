# README

**VS Code extensions required :-**

1. ES Lint
2. Prettier **Disabled** 
3. Better Comments
4. Import Cost
5. Indent-rainbow
6. Vscode-icons

**Dev dependencies :-**

1. npm install eslint --save-dev
2. TO apply the style guide of airbnb use command : `npx eslint --init`
  Follow the questions as mentioned below : (`https://github.com/airbnb/javascript`)
     1. How would you like to use ESLint? . select the third option
     2. What type of modules does your project use? · commonjs
     3. Which framework does your project use? · none
     4. Does your project use TypeScript? · No
     5. Where does your code run? · node
     6. How would you like to define a style for your project? · guide
     7. Which style guide do you want to follow? · airbnb
     8. What format do you want your config file to be in? · JSON
     9. Would you like to install them now with npm? · No / Yes
3. Install swagger-ui using command : `npm i swagger-ui-express`
  - Is used for viewing the live API documentation and test the API.
  - ## Follow the Open API 3.0 standards.
4. Install swagger-jsdoc using command : `npm i swagger-jsdoc`
  - Is used to create swagger documentation using comments.
5. Install compression using command - `npm install compression`
  - Is used to gzip decrease the size of the response body.

**Project Structure :-**

- server.js — Main entry point
- routes — to handle the Routing
- middleware — to handle the authentication
- controllers — to handle the REST API requests
- logs — to store the log files
- utils —to implement the logger

**Devlopment tools requirement and steps to Run :-**

1. Required Node, NPM and Mongo DB.
2. Run command in terminal in root path : `npm install`
3. Run command in terminal in root path after finish installtion : `npm run server`
