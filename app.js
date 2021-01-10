const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const compression = require('compression')
const cors = require('cors')
const helmet = require('helmet')

// const airbrake = require('./bin/airbrake')()
// var passport = require('./bin/passport')()
// const jwt = require('./bin/jwt')

const leagueRouter = require('./routes/LeagueRouter')()
const authRouter = require('./routes/AuthRouter')()
// const usersRouter = require('./routes/users')()
// const conversationsRouter = require('./routes/conversations')()
// const reportsRouter = require('./routes/reports')()
// const adminRouter = require('./routes/admin/index')()

const app = express()

app.use(compression())

app.use(helmet())

if (process.env.NODE_ENV !== 'testing') {
  app.use(logger('dev'))
}

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin
    if (!origin) return callback(null, true)
    // if (config.get('cors_whitelist').indexOf(origin) === -1) {
    //   const message = 'The CORS policy for this origin doesn\'t allow access from the particular origin.'
    //   return callback(new Error(message), false)
    // }
    return callback(null, true)
  },
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true
}

app.use(cors(corsOptions))

// /**
//  * Set up user sessions. Memory store for dev, mongoDB for prod
//  */
// app.use(require('./bin/sessions')((err) => {
//   if (err) {
//     debug(err)
//   }
// }))

// view engine setup
// app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// app.use('/', indexRouter)
app.use('/leagues', leagueRouter)
app.use('/auth', authRouter)
// app.use('/users', usersRouter)
// app.use('/conversations', conversationsRouter)
// app.use('/reports', reportsRouter)
// app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)

  if (req.app.get('env') !== 'production') {
    console.error(err)
    res.json({ status: err.status, reason: err })
  } else {
    res.json({ status: err.status || 500 })
  }
})

module.exports = app
