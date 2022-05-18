module.exports = {
  // mongoURI: 'mongodb://localhost:27017/m-housie',
  // mongoURI:'mongodb+srv://housie-development:IDmkqabvcKHlrBqV@housie.koxm9.mongodb.net/m-housie',
  mongoURI: process.env.MONGOURI,
  // mongoURI:
  // 'mongodb+srv://housie-development:IDmkqabvcKHlrBqV@housie.koxm9.mongodb.net/m-housie',
  secretOrKey: 'secret',
};

// mongorestore --uri mongodb+srv://housie-development:IDmkqabvcKHlrBqV@housie.koxm9.mongodb.net

// mongodump --uri mongodb+srv://housie-development:IDmkqabvcKHlrBqV@housie.koxm9.mongodb.net/m-housie
