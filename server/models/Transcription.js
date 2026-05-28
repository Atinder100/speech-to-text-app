const mongoose =
  require('mongoose')

const transcriptionSchema =
  new mongoose.Schema({

    userId: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref: 'User',

      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    transcription: {
      type: String,
      required: true,
    },

  }, {

    timestamps: true,
  })

module.exports =
  mongoose.model(
    'Transcription',
    transcriptionSchema
  )