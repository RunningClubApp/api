const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.Types.ObjectId

const exerciseSchema = new Schema({
  owner: { type: ObjectId, ref: 'User', required: true },
  path: [{
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    elevation: { type: Number, required: true },
    timestamp: { type: Date, required: true }
  }],
  timestamps: {
    start_date: { type: Date, default: Date.now, required: true },
    end_date: { type: Date, default: Date.now, required: true }
  },
  kudos: [{
    emoji: { type: String, enum: ['Smiley', 'Heart', 'Wow', 'Thumbs Up', '100'], default: 'Smiley' },
    user: { type: ObjectId, ref: 'User', required: true }
  }],
  verified: { type: Boolean, default: true }
})

exerciseSchema.statics.testValidate = function (exercise) {
  return new Promise((resolve, reject) => {
    const exerciseObj = new this(exercise)

    exerciseObj.validate((err) => {
      if (err) return reject(err)

      resolve(exerciseObj)
    })
  })
}

module.exports = mongoose.model('Exercise', exerciseSchema)
