import mongoose from 'mongoose';
const { Schema } = mongoose;

const leagueSchema = new Schema({
  title: { type: String, required: true, maxlength: 16 },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  league_length: {
    type: String,
    default: ['Weekly','Monthly', 'Quaterly', 'Yearly']
  },
  timestamps: {
    start_date: { type: Date }
  },
  history: [{
    winner: { type: Schema.Types.ObjectId, ref: 'User' }
  }]
})

exports.module = mongoose.model('League', leagueSchema);