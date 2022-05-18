/* eslint-disable no-console */
const compression = require('compression');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const Sentry = require('@sentry/node');

// Importing @sentry/tracing patches the global hub for tracing to work.
const Tracing = require('@sentry/tracing');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const swaggerDefinition = require('./utils/swagger-def');

// var findOrCreate = require('mongoose-findorcreate')

const routes = require('./routes/routes');
const Google = require('./models/Google');
// const mail = require("./routes/api/mail");
const LivenessRoutes = require('./routes/liveness');

const app = express(); // Body parser middleware
app.use(compression()); // used for compressing the response size

// console.log('----RT------');
// console.log(process.env);

Sentry.init({
  dsn:
    'https://f8a83fd391d44d0a80b102392d65225e@o1202647.ingest.sentry.io/6328010',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({
      // to trace all requests to the default router
      app,
      // alternatively, you can specify the routes you want to trace:
      // router: someRouter,
    }),
  ],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

// middleware initialization
app.use('*', cors());
// respond to readiness/liveness checks
app.use('/', LivenessRoutes);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.log(err);
  });

// app.use("/api/mail", mail);

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID:
        '661844029597-kc33j74dnm774195dcrb07a1go5urvtg.apps.googleusercontent.com',
      clientSecret: 'EzXPIFKN3-bm6aKAriMILWYJ',
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // console.log('\naccessToken---'+accessToken);
      // console.log('\nrefreshToken--'+refreshToken);
      // console.log('\nprofile--'+Object.values(profile));
      // console.log('\nprofile-0-'+JSON.stringify(profile));
      // console.log('\nprofile-12-'+JSON.stringify(profile.emails[0].value));
      // console.log('\nprofile-1-'+Object.values(profile.emails));
      // console.log('\nprofile-2-'+JSON.stringify(profile.email));
      done(null, profile);

      Google.findOne({ googleId: profile.id }).then((user) => {
        if (user) {
          console.log('here if condition');
          // res.redirect('/api/routes/success');
        } else {
          const newUser = new Google({
            googleId: profile.id,
            accessToken,
          });
          // eslint-disable-next-line no-shadow
          newUser.save().then((user) => {
            console.log({ user });
            done(null, user); // callback to let passport know that we are done processing
          });
        }
      });
    },
  ),
);

app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

// app.get('/auth',passport.authenticate('google',{
//   scope:['profile','email']
// }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/api/success',
    failureRedirect: '/api/error',
  }),
  // eslint-disable-next-line no-unused-vars
  (_req, _res) => {
    // Successful authentication, redirect home.
    // res.redirect('/api/routes/success');
  },
);

// Use Routes
app.use('/api/auth/google/callback', routes);
app.use('/api', routes);

// ** Implementation of swagger;
const swaggerOptions = {
  swaggerDefinition,
  // ['app.js']
  apis: ['./routes/*.js', './utils/swagger-def.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // ** { explorer: true } inside setup for search

const port = process.env.PORT || 3000;
app.use('*', (req, res) => {
  res
    .send({
      status: 'fail',
      code: 404,
      message: 'route not found',
      error: true,
    })
    .status(404);
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// the rest of your app
app.use(Sentry.Handlers.errorHandler());
app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));
