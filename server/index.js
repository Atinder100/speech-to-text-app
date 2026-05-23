
require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const axios = require('axios')

const app = express()

const PORT = 5000



// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.log(error))

// Test route
app.get('/', (req, res) => {
  res.send('Backend server is running')
})

// Upload route
app.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const audioBuffer = fs.readFileSync(req.file.path)

    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      audioBuffer,
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/mp4',
        },
      }
    )

    const transcription =
      response.data.results.channels[0].alternatives[0].transcript

    res.json({
      transcription,
    })
  } catch (error) {
    console.log(error.response?.data || error.message)

    res.status(500).json({
      error: 'Transcription failed',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})