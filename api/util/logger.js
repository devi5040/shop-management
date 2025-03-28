const winston = require ('winston');

const logger = winston.createLogger ({
  level: 'info',
  format: winston.format.combine (
    winston.format.timestamp (),
    winston.format.printf (({timestamp, level, message}) => {
      return `${timestamp} [${level.toUpperCase ()}]:${message}`;
    })
  ),
  transports: [
    new winston.transports.Console (),
    // will save the logs into other files
    // new winston.transports.File ({filename: 'logs/app.log'}),
    // new winston.transports.File ({filename: 'logs/error.log', level: 'error'}),
  ],
});

module.exports = logger;
