require('dotenv').config()

const mongoose = require('mongoose')
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const WebSocket = require('ws')

const Transcription = require(
  './models/Transcription'
)

const app = express()

app.use(cors())

const PORT = 5000

// ======================
// MULTER STORAGE
// ======================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, 'uploads/')
  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() +
        path.extname(
          file.originalname
        )
    )
  },
})

const upload = multer({ storage })

// ======================
// MONGODB CONNECTION
// ======================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log(
      'MongoDB connected'
    )
  )
  .catch((error) =>
    console.log(error)
  )

// ======================
// TEST ROUTE
// ======================

app.get('/', (req, res) => {

  res.send(
    'Backend server is running'
  )
})

// ======================
// FILE UPLOAD TRANSCRIPTION
// ======================

app.post(
  '/upload',
  upload.single('audio'),

  async (req, res) => {

    try {

      // READ AUDIO FILE
      const audioBuffer =
        fs.readFileSync(
          req.file.path
        )

      // SEND TO DEEPGRAM
      const response =
        await axios.post(
          'https://api.deepgram.com/v1/listen',

          audioBuffer,

          {
            headers: {

              Authorization:
                `Token ${process.env.DEEPGRAM_API_KEY}`,

              'Content-Type':
                req.file.mimetype,
            },
          }
        )

      // GET TRANSCRIPT
      const transcription =
        response.data.results
          .channels[0]
          .alternatives[0]
          .transcript

      console.log(
        'Uploaded Transcript:',
        transcription
      )

      // SAVE TO DATABASE
      await Transcription.create({

        fileName:
          req.file.originalname,

        transcription:
          transcription,
      })

      // SEND RESPONSE
      res.status(200).json({

        transcription,
      })

    } catch (error) {

      console.log(
        error.response?.data ||
        error.message
      )

      res.status(500).json({

        error:
          'Transcription failed',
      })
    }
  }
)

// ======================
// GET TRANSCRIPT HISTORY
// ======================

app.get(
  '/transcriptions',

  async (req, res) => {

    try {

      const transcriptions =
        await Transcription
          .find()
          .sort({
            createdAt: -1,
          })

      res.status(200).json(
        transcriptions
      )

    } catch (error) {

      console.log(error)

      res.status(500).json({

        error:
          'Failed to fetch transcriptions',
      })
    }
  }
)

// ======================
// SOCKET.IO SERVER
// ======================

const server =
  http.createServer(app)

const io = new Server(server, {

  cors: {
    origin:
      'http://localhost:5173',
  },
})

// ======================
// LIVE MIC TRANSCRIPTION
// ======================

io.on(
  'connection',

  (socket) => {

    console.log(
      'User connected'
    )

    // CREATE DEEPGRAM WEBSOCKET
    const deepgramLive =
      new WebSocket(

        'wss://api.deepgram.com/v1/listen?model=nova-2&language=en&punctuate=true&interim_results=true',

        {
          headers: {

            Authorization:
              `Token ${process.env.DEEPGRAM_API_KEY}`,
          },
        }
      )

    // DEEPGRAM CONNECTED
    deepgramLive.on(
      'open',

      () => {

        console.log(
          'Deepgram connected'
        )
      }
    )

    // RECEIVE TRANSCRIPT
    deepgramLive.on(
      'message',

      async (data) => {

        try {

          const response =
            JSON.parse(
              data.toString()
            )

          const transcript =
            response.channel
              ?.alternatives?.[0]
              ?.transcript

          // IGNORE EMPTY
          if (
            transcript &&
            transcript.trim() !== ''
          ) {

            console.log(
              'Transcript:',
              transcript
            )

            // SEND TO FRONTEND
            socket.emit(
              'transcription-result',
              transcript
            )

            // SAVE FINAL RESULT
            if (
              response.is_final
            ) {

              try {

                await Transcription.create({

                  fileName:
                    'Live Mic',

                  transcription:
                    transcript,
                })

              } catch (error) {

                console.log(
                  'Mongo Save Error:',
                  error.message
                )
              }
            }
          }

        } catch (error) {

          console.log(error)
        }
      }
    )

    // RECEIVE AUDIO CHUNKS
    socket.on(
      'audio-chunk',

      (chunk) => {

        if (
          deepgramLive.readyState ===
          WebSocket.OPEN
        ) {

          deepgramLive.send(
            chunk
          )
        }
      }
    )

    // STOP MIC
    socket.on(
      'stop-stream',

      () => {

        console.log(
          'Mic stopped'
        )

        if (
          deepgramLive.readyState ===
          WebSocket.OPEN
        ) {

          deepgramLive.close()
        }
      }
    )

    // USER DISCONNECT
    socket.on(
      'disconnect',

      () => {

        console.log(
          'User disconnected'
        )

        if (
          deepgramLive.readyState ===
          WebSocket.OPEN
        ) {

          deepgramLive.close()
        }
      }
    )
  }
)

// ======================
// START SERVER
// ======================

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  )
})