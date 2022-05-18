// swagger-def.js
module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'M-Housie API for User-end',
    version: '1.0.0',
    description:
      'This is a REST API application made with Express. It retrieves all the user end data from MongoDB.',
    contact: {
      name: 'STS',
      email: 'info@sts.in',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'Users',
    },
    {
      name: 'Games',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
    },
  },
};
