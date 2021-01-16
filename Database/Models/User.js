const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: { type: String, required: true, maxLength: 16 },
  email: { type: String, required: true, lowercase: true, maxlength: 256 },
  picture: { type: String },
  pass_hash: { type: String, required: true },
  counts: {
    golds: { type: Number, default: 0 },
    silvers: { type: Number, default: 0 },
    bronzes: { type: Number, default: 0 }
  },
  timestamps: {
    last_login: { type: Date, default: Date.now },
    signup_at: { type: Date, default: Date.now }
  }
})

userSchema.statics.testValidate = function (user) {
  return new Promise((resolve, reject) => {
    const userObj = new this(user)

    userObj.validate((err) => {
      if (err) return reject(err)

      resolve(userObj)
    })
  })
}

userSchema.index({ name: 'text', email: 'text' })

module.exports = mongoose.model('User', userSchema)
