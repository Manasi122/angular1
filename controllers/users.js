/* eslint-disable consistent-return */
/* eslint-disable no-console */

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Sentry = require('@sentry/node');
const keys = require('../config/keys');
const logger = require('../utils/logger');
const { sendJsonResponse } = require('../utils/responseUtils');
const User = require('../models/User');

const logout = async (req, res) => {
  req.logout();
  res.json({ message: 'User successfully logout' });
};

async function registerUser(req, res) {
  try {
    const responseMessage = {};
    const email = req.body.email_id;

    if (typeof email === 'undefined') {
      sendJsonResponse(res, 401, {
        status: 'fail',
        code: 401,
        message: 'Please enter email id',
      });
    }
    await User.findOne({ email_id: email }).then((user) => {
      if (user) {
        responseMessage.message = 'Email already exist.';
        sendJsonResponse(res, 401, {
          status: 'fail',
          code: 401,
          message: responseMessage.message,
        });
      } else {
        const avatar = gravatar.url(req.body.user_id, {
          s: '200', // Size
          r: 'pg', // Rating
          d: 'mm', // Default
        });

        const newUser = new User({
          user_id: req.body.user_id,
          avatar,
          password: req.body.password,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          full_name: req.body.full_name,
          email_id: req.body.email_id,
          gender: req.body.gender,
          mobile_no: req.body.mobile_no,
          device_id: req.body.device_id,
          register_types: req.body.register_types,
          date_of_birth: req.body.date_of_birth,
          providerId: req.body.providerId,
          device_name: req.body.device_name,
          os_type: req.body.os_type,
          os_version_no: req.body.os_version_no,
          fcm_token: req.body.fcm_token,
          app_version: req.body.app_version,
          is_user_session_active: req.body.is_user_session_active,
          ProfilePicURL: avatar,
          term_condition_accepted: req.body.term_condition_accepted,
          is_active: req.body.is_active,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (errs, hash) => {
            if (errs) throw errs;
            newUser.password = hash;
            newUser
              .save()
              .then((userResponse) => {
                bcrypt
                  .compare(req.body.password, newUser.password)
                  // eslint-disable-next-line consistent-return
                  .then((isMatch) => {
                    if (isMatch) {
                      // User Matched
                      const payload = {
                        id: userResponse.id,
                        name: userResponse.name,
                        avatar: userResponse.avatar,
                      }; // Create JWT Payload

                      // Sign Token
                      jwt.sign(
                        payload,
                        keys.secretOrKey,
                        { expiresIn: 3600 },
                        (_err, token) => {
                          res.status(200).json({
                            status: 'success',
                            code: 200,
                            message: 'User Registered Successfully',
                            data: {
                              user_id: userResponse.user_id,
                              is_email_id_verified: userResponse.is_email_id_verified,
                              is_mobile_no_verified: userResponse.is_email_id_verified,
                              first_name: userResponse.first_name,
                              last_name: userResponse.last_name,
                              full_name: userResponse.full_name,
                              email_id: userResponse.email_id,
                              gender: userResponse.gender,
                              mobile_no: userResponse.mobile_no,
                              date_of_birth: userResponse.date_of_birth,
                              providerId: userResponse.providerId,
                              device_name: userResponse.device_name,
                              os_type: userResponse.os_type,
                              os_version_no: userResponse.os_version_no,
                              app_version: userResponse.app_version,
                              is_user_session_active: userResponse.is_user_session_active,
                              profile_pic_url: userResponse.profile_pic_url,
                              term_condition_accepted: userResponse.term_condition_accepted,
                              is_active: userResponse.is_active,
                              date: userResponse.date,
                            },
                            token,
                          });
                        },
                      );
                    } else {
                      return res.status(400).json({
                        status: 'fail',
                        code: 400,
                        message: 'User Registered failed',
                      });
                    }
                  });
              })
              .catch((error) => {
                if (error.name === 'ValidationError') {
                  const errors = {};
                  errors.status = 400;
                  Object.keys(error.errors).forEach((key) => {
                    errors[key] = error.errors[key].message;
                  });

                  return res.status(400).send(errors);
                }
                return res.status(500).send('Something went wrong');
              });
            // .catch(err => res.status(400).json({status:400,message:'Registration Failed.'}));
          });
        });
      }
    });
  } catch (err) {
    logger.error(`User: ${err}`);
  }
}

const getAll = async (req, res) => {
  try {
    await User.find({}, (err, users) => {
      if (err) {
        sendJsonResponse(res, 400, {
          status: 'fail',
          code: 400,
          message: err,
        });
      }
      sendJsonResponse(res, 200, {
        status: 'success',
        code: 200,
        message: 'Successfully fetch data',
        data: users,
      });
    });
  } catch (err) {
    logger.error(`User: ${err}`);
    Sentry.captureException(err);
    console.log(err);
  }
};

const register = async (req, res) => {
  try {
    await registerUser(req, res);
  } catch (err) {
    logger.error(`User: ${err}`);
    Sentry.captureException(err);
  }
};

const current = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (err) {
    logger.error(`User: ${err}`);
    Sentry.captureException(err);

    console.log(err);
  }
};

const updateSetting = async (req, res) => {
  try {
    const myquery = { _id: req.user.id };
    const setting = { setting: req.body.setting };
    const newvalues = { $set: setting };

    await User.updateOne(myquery, newvalues, (err, response) => {
      if (err) {
        return response.status(400).json({
          status: 'fail',
          code: 400,
          message: err,
          error: true,
        });
      }
      return response.status(200).json({
        status: 'success',
        code: 200,
        message: 'successfully updated',
        error: false,
        data: setting,
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
    logger.error(`User: ${err}`);
    Sentry.captureException(err);

    console.log(err);
  }
};

const login = async (req, res) => {
  try {
    // eslint-disable-next-line camelcase
    const { email_id } = req.body;
    const { password } = req.body;
    const errors = {};
    // Find user by email
    // TODO: @santosh return
    // eslint-disable-next-line camelcase
    await User.findOne({ email_id }).then((user) => {
      if (!user) {
        errors.message = 'User not found';
        errors.code = 401;
        errors.status = 'success';
        return res.status(401).json(errors);
      }

      // Check Password
      // TODO: @santosh return
      // eslint-disable-next-line consistent-return
      bcrypt.compare(password, user.password).then((isMatch) => {
        // const errors = {};
        if (isMatch) {
          // User Matched
          const payload = { id: user.id, name: user.name, avatar: user.avatar };

          // Sign Token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                status: 'success',
                code: 200,
                message: 'User Logged in Successfully',
                error: false,
                token,
              });
            },
          );
        } else {
          return res.status(401).json({
            status: 'success',
            code: 401,
            message: 'Password incorrect',
            error: true,
          });
        }
      }).catch((err) => {
        logger.error(`User: ${err}`);
        Sentry.captureException(err);
        console.log(err);
      });
    }).catch((err) => {
      logger.error(`User: ${err}`);
      Sentry.captureException(err);
      console.log(err);
    });
  } catch (err) {
    logger.error(`User: ${err}`);
    Sentry.captureException(err);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const errors = {};
    await User.findOne({ user_id: req.body.user_id }).then((user) => {
      if (!user) {
        errors.code = 401;
        errors.status = 'success';
        errors.message = 'User not found';
        res.status(401).json(errors);
      } else {
        const val = Math.floor(1000 + Math.random() * 9000);
        const myquery = { user_id: req.body.user_id };
        const newvalues = { $set: { token: val } };
        User.updateOne(myquery, newvalues, (err, response) => {
          if (err) {
            response.status(400).json({
              status: 'fail',
              code: 400,
              message: err,
            });
          }
        }).catch((err) => {
          if (err.name === 'ValidationError') {
            errors.status = 400;
            Object.keys(err.errors).forEach((key) => {
              errors[key] = err.errors[key].message;
            });
            res.status(400).send(errors);
          }
          res.status(500).send('Something went wrong');
        });

        const mailData = {
          from: 'santosh.vishwakarma@sts.in',
          to: user.email_id,
          subject: 'Reset Password',
          text: 'successfully updated',
          html: `<b>Hey there! </b><br> OTP : ${val} <br/>`,
        };

        const transporter = nodemailer.createTransport({
          port: 465,
          host: 'smtp.gmail.com',
          auth: {
            user: 'santosh.vishwakarma@sts.in',
            pass: 'babna2grmistry',
          },
          secure: true, // upgrades later with STARTTLS -- change this based on the PORT
        });
        // eslint-disable-next-line no-unused-vars
        transporter.sendMail(mailData, (error, info) => {
          if (error) {
            res.status(200).json({
              status: 'fail',
              code: 400,
              message: error,
              error: true,
            });
            return;
          }
          res.status(200).json({
            status: 'success',
            code: 200,
            val,
            message:
              'Please check your email register with us. OTP Successfully Mail send',
            error: false,
          });
        });
      }
    });
  } catch (err) {
    logger.error(`User: ${err}`);
    Sentry.captureException(err);

    console.log(err);
  }
};

const resetPassword = async (req, res) => {
  try {
    // const errors = {};
    const newUser = {};
    newUser.password = req.body.password;
    await bcrypt.genSalt(10, (_err, salt) => {
      // eslint-disable-next-line consistent-return
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          return res.status(400).json({
            status: 'fail',
            code: 400,
            message: err,
            error: true,
          });
        }
        newUser.password = hash;
        const myquery = { user_id: req.body.user_id };
        const newvalues = { $set: { password: newUser.password } };

        User.findOneAndUpdate(myquery, newvalues, (errs) => {
          if (errs) {
            return res.status(400).json({
              status: 'fail',
              code: 400,
              message: 'Reset password failed',
              error: true,
            });
          }
          return res.status(201).json({
            status: 'success',
            code: 200,
            message: 'Password Reset succesfully',
            error: true,
          });
        });
      });
    });
  } catch (err) {
    logger.error(`User: ${err}`);
    console.log(err);
  }
};

const fpov = async (req, res) => {
  try {
    const errors = {};

    await User.findOne({ _id: req.req.body.user_id, token: req.body.otp }).then(
      (user) => {
        if (user) {
          /** ************************************ */
          const myquery = { _id: req.body.user_id };
          const setting = { token: 0 };
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

            errors.message = 'OTP verification successfully done!';
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
          errors.message = 'OTP verification failed!';
          errors.status = 400;
          res.status(400).json(errors);
        }
      },
    );
  } catch (err) {
    logger.error(`User: ${err}`);
    console.log(err);
  }
};

const updateTermsAndCondition = async (req, res) => {
  try {
    // eslint-disable-next-line no-underscore-dangle
    const myquery = { email_id: req.user.email_id };
    const termConditionAccepted = { setting: req.user.term_condition_accepted };
    const newvalues = { $set: termConditionAccepted };

    await User.updateOne(myquery, newvalues, (err, response) => {
      if (err) {
        return response.status(400).json({
          status: 'fail',
          code: 400,
          message: err,
          error: true,
        });
      }
      return response.status(200).json({
        status: 'success',
        code: 200,
        message: 'successfully updated',
        error: false,
        data: termConditionAccepted,
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
    logger.error(`User: ${err}`);
    Sentry.captureException(err);

    console.log(err);
  }
};

module.exports = {
  getAll,
  register,
  current,
  login,
  updateSetting,
  forgotPassword,
  resetPassword,
  fpov,
  logout,
  updateTermsAndCondition,
};
