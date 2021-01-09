const winston = require('winston')
// set default log level.
const logLevel = 'debug'
// Set up logger
const logger = winston.createLogger({
  level: logLevel,
  exitOnError: false,
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'app.log' })
  ]
})
// Extend logger object to properly log 'Error' types
const origLog = logger.log
logger.log = function (level, msg) {
  if (msg instanceof Error) {
    const args = Array.prototype.slice.call(arguments)
    args[1] = msg.stack
    origLog.apply(logger, args)
  } else {
    origLog.apply(logger, arguments)
  }
}
module.exports = logger
