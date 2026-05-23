const mongoose = require('mongoose')

const transcriptionSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },

  transcription: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Transcription', transcriptionSchema)