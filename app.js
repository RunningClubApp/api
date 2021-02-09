const createError = require('http-errors')
const express = require('express')
const logger = require('morgan')
const compression = require('compression')
const cors = require('cors')
const helmet = require('helmet')
const config = require('./server.config')

// const airbrake = require('./bin/airbrake')()
// var passport = require('./bin/passport')()
// const jwt = require('./bin/jwt')

const AuthController = require('./Controllers/AuthController')

const leagueRouter = require('./routes/LeagueRouter')()
const authRouter = require('./routes/AuthRouter')()
const exerciseRouter = require('./routes/ExerciseRouter')()
const userRouter = require('./routes/UserRouter')()

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
    if (config.cors_whitelist.indexOf(origin) === -1) {
      const message = 'The CORS policy for this origin doesn\'t allow access from the particular origin.'
      return callback(new Error(message), false)
    }
    return callback(null, true)
  },
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true
}

app.use(cors(corsOptions))

// view engine setup
// app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Intercept all traffic and decode a jwt from the header if provided.
// or from the query param 'token'
// the stored user _id is kept in req.user
app.all('*', async (req, res, next) => {
  req.user = { _id: undefined }
  let token
  if (req.headers.authorization !== undefined) {
    token = req.headers.authorization.split(' ')[1]
  }
  if (req.query.token !== undefined) {
    token = req.query.token
  }
  if (token !== undefined) {
    if (process.env.NODE_ENV === 'testing' && req.query.eztoken) {
      req.user = {
        _id: token
      }
    } else {
      const result = await AuthController.DecodeJWT(token).catch(err => next(err))
      if (result.ok) {
        req.user = {
          _id: JSON.parse(JSON.stringify(result.token.sub._id))
        }
      }
    }
  }

  return next()
})

// app.use('/', indexRouter)
app.use('/leagues', leagueRouter)
app.use('/auth', authRouter)
app.use('/exercise', exerciseRouter)
app.use('/users', userRouter)

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
