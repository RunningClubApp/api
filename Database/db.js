const mongoose = require('mongoose')

const cfg = require('../db.config')

let url
if (process.env.NODE_ENV === 'production') {
  url = `mongodb+srv://${cfg.user}:${cfg.pwd}@${cfg.url}/${cfg.db}`
} else {
  url = `mongodb://${cfg.url}:${cfg.port}/${cfg.db}`
}

mongoose.set('useUnifiedTopology', true)

mongoose.connect(url, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })

mongoose.Promise = global.Promise
const db = mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB Connection Error: '))

db.once('open', function () {
  console.log('Connected to database!')
})

module.exports = db
