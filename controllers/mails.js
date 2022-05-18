/* eslint-disable no-console */
const logger = require('../utils/logger');
// const { sendJsonResponse } = require('../utils/responseUtils');

/* https://www.makeuseof.com/nodejs-google-authentication/ */

// Load User model
const User = require('../models/User');

const emailVerification = async (req, res) => {
  try {
    const val = Math.floor(1000 + Math.random() * 9000);
    const myquery = { email_id: req.to };
    const newvalues = { $set: { email_id_verification_code: val } };
    await User.updateOne(myquery, newvalues, (err, response) => {
      if (err) {
        return response.status(400).json({
          status: 'fail',
          code: 400,
          message: err,
        });
      }
      return response.status(200).json({
        status: 'success',
        code: 200,
        otp: val,
        message: 'Successfully Mail send',
      });
    }).catch((err) => {
      if (err.name === 'ValidationError') {
        const errors = {};
        errors.status = 400;
        Object.keys(err.errors).forEach((key) => {
          errors[key] = err.errors[key].message;
        });
        return res.status(400).send(errors);
      }
      return res.status(500).send('Something went wrong');
    });
  } catch (err) {
    logger.error(`Error in creating match ${err}`);
    console.log(err);
  }
};

const emailOtpVerification = async (req, res) => {
  try {
    await User.findOne({
      _id: req.user.id,
      email_id_verification_code: req.body.otp,
    }).then((user) => {
      const errors = {};
      if (user) {
        /** ************************************ */
        const myquery = { _id: req.user.id };
        const setting = {
          is_email_id_verified: true,
          email_id_verification_code: 0,
        };
        const newvalues = { $set: setting };
        User.updateOne(myquery, newvalues, (err, response) => {
          if (err) {
            return response.status(400).json({
              status: 'fail',
              code: 400,
              message: err,
              error: true,
            });
          }

          errors.error = false;
          errors.message = 'Email verification successfully done!';
          errors.code = 200;
          errors.status = 'success';
          return response.status(200).json(errors);
        }).catch((err) => {
          if (err.name === 'ValidationError') {
            errors.status = 400;
            Object.keys(err.errors).forEach((key) => {
              errors[key] = err.errors[key].message;
            });

            return res.status(400).send(errors);
          }
          return res.status(500).send('Something went wrong');
        });
        /** ************************************ */
      } else {
        errors.error = false;
        errors.message = 'Email verification failed!';
        errors.status = 400;
        res.status(400).json(errors);
      }
    });
  } catch (err) {
    logger.error(`Error in creating match ${err}`);
    console.log(err);
  }
};

const mobileVerification = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      code: 200,
      otp: 1200,
      message: 'Successfully Mail send',
      error: false,
    });
  } catch (err) {
    logger.error(`Error in creating match ${err}`);
    console.log(err);
  }
};

module.exports = {
  emailVerification,
  emailOtpVerification,
  mobileVerification,
};
