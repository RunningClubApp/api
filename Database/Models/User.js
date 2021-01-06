import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, maxLength: 16 },
  email: { type: String, required: true, lowercase: true, maxlength: 256},
  picture: { type: String },
  pass_hash: { type: String, required: true, maxLength: 32 },
  counts: {
    golds: { type: Number, default: 0 },
    silvers: { type: Number, default: 0 },
    bronzes: { type: Number, default: 0 },
  },
  timestamps: {
    last_login: { type: Date, default: Date.now },
    signup_at: { type: Date, default: Date.now }
  }
})

exports.module = mongoose.model('User', userSchema);