const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const leagueSchema = new Schema({
  title: { type: String, required: true, maxlength: 16 },
  creator: { type: ObjectId, ref: 'User' },
  participants: [{ type: ObjectId, ref: 'User' }],
  league_length: {
    type: String,
    default: ['Weekly', 'Monthly', 'Quaterly', 'Yearly']
  },
  timestamps: {
    start_date: { type: Date }
  },
  history: [{
    winner: { type: ObjectId, ref: 'User' }
  }],
  private: { type: Boolean, default: true },
  invited_users: [{ type: ObjectId, ref: 'User' }]
})

leagueSchema.statics.testValidate = function (league) {
  return new Promise((resolve, reject) => {
    const leagueObj = new this(league)

    leagueObj.validate((err) => {
      if (err) return reject(err)

      resolve(leagueObj)
    })
  })
}

module.exports = mongoose.model('League', leagueSchema)
