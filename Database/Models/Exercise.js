import mongoose from 'mongoose'
const { Schema } = mongoose

const exerciseSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  verified: { type: Boolean, required: true }
})

exports.module = mongoose.model('Exercise', exerciseSchema)
