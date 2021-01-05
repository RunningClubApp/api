/**
 * Logging with winston
 */
var winston = require('winston')
var expressWinston = require('express-winston')

var logger = winston.createLogger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
})

exports.module = logger