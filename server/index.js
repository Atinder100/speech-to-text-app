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

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const authMiddleware =
  require(
    './middleware/authMiddleware'
  )

const User = require(
  './models/User'
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

app.use(express.json())

// ======================
// REGISTER USER
// ======================

app.post(
  '/register',

  async (req, res) => {

    try {

      const {
        name,
        email,
        password,
      } = req.body

      // VALIDATIONS
      if (
        !name ||
        !email ||
        !password
      ) {

        return res
          .status(400)
          .json({
            message:
              'All fields are required',
          })
      }

      // EMAIL CHECK
      const existingUser =
        await User.findOne({
          email,
        })

      if (existingUser) {

        return res
          .status(400)
          .json({
            message:
              'Email already exists',
          })
      }

      // HASH PASSWORD
      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        )

      // SAVE USER
      const user =
        await User.create({

          name,

          email,

          password:
            hashedPassword,
        })

      const token =
  jwt.sign(

    {
      id: user._id,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: '7d',
    }
  )

res.status(201).json({

  token,

  user: {

    id: user._id,

    name: user.name,

    email: user.email,
  },
})

    } catch (error) {

      console.log(error)

      res.status(500).json({

        message:
          'Server error',
      })
    }
  }
)

// ======================
// LOGIN USER
// ======================

app.post(
  '/login',

  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body

      // FIND USER
      const user =
        await User.findOne({
          email,
        })

      // USER NOT FOUND
      if (!user) {

        return res
          .status(400)
          .json({

            message:
              'Invalid email or password',
          })
      }

      // PASSWORD CHECK
      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        )

      if (!isMatch) {

        return res
          .status(400)
          .json({

            message:
              'Invalid email or password',
          })
      }

      // SUCCESS
      const token =
  jwt.sign(

    {
      id: user._id,
    },

    process.env.JWT_SECRET,

    {
      expiresIn: '7d',
    }
  )

res.status(200).json({

  token,

  user: {

    id: user._id,

    name: user.name,

    email: user.email,
  },
})

    } catch (error) {

      console.log(error)

      res.status(500).json({

        message:
          'Server error',
      })
    }
  }
)

// ======================
// FILE UPLOAD TRANSCRIPTION
// ======================

app.post(
  '/upload',

   authMiddleware,

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

        userId:
          req.user,

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

  authMiddleware,

  async (req, res) => {

    try {

      const transcriptions =
        await Transcription
          .find({

            userId:
              req.user,
          })
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

app.delete(
  '/transcriptions/:id',

  async (req, res) => {

    try {

      await Transcription.findByIdAndDelete(
        req.params.id
      )

      res.status(200).json({

        message:
          'Deleted successfully',
      })

    } catch (error) {

      console.log(error)

      res.status(500).json({

        error:
          'Delete failed',
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

    socket.on(
  'authenticate',

  (token) => {

    try {

      const decoded =
        jwt.verify(

          token,

          process.env.JWT_SECRET
        )

      userId =
        decoded.id

      console.log(
        'Socket Authenticated'
      )

    } catch (error) {

      console.log(
        'Socket auth failed'
      )
    }
  }
)

    let deepgramLive = null

    let fullTranscript = ''

    let userId = null

    // ======================
    // START STREAM
    // ======================

    socket.on(
      'start-stream',

      () => {

        fullTranscript = ''

        // CREATE NEW DEEPGRAM CONNECTION
        deepgramLive =
          new WebSocket(
            'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&interim_results=true&language=en-IN',

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

              // TELL FRONTEND READY
              socket.emit(
                'deepgram-ready'
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
                transcript.trim() !== '' &&
                response.is_final
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

                // SAVE FINAL TEXT
                if (
                  response.is_final
                ) {

                  fullTranscript +=
                    ' ' + transcript
                }
              }

            } catch (error) {

              console.log(error)
            }
          }
        )

        // ERROR
        deepgramLive.on(
          'error',

          (error) => {

            console.log(
              'Deepgram Error:',
              error.message
            )
          }
        )

        // CLOSE
        deepgramLive.on(
          'close',

          () => {

            console.log(
              'Deepgram closed'
            )
          }
        )
      }
    )

    // ======================
    // RECEIVE AUDIO CHUNKS
    // ======================

    socket.on(
      'audio-chunk',

      (chunk) => {

        if (
          deepgramLive &&
          deepgramLive.readyState ===
            WebSocket.OPEN
        ) {

          deepgramLive.send(
            chunk
          )

        } else {

          console.log(
            'Deepgram not ready yet'
          )
        }
      }
    )

    // ======================
    // STOP STREAM
    // ======================

    socket.on(
      'stop-stream',

      async () => {

        console.log(
          'Mic stopped'
        )

        // SAVE TRANSCRIPT
        if (
          fullTranscript.trim() !== ''
        ) {

          try {

            await Transcription.create({

              userId,

              fileName:
                'Live Mic',

              transcription:
                fullTranscript.trim(),
            })

            console.log(
              'Saved complete transcription'
            )

          } catch (error) {

            console.log(
              'Mongo Save Error:',
              error.message
            )
          }
        }

        // CLOSE DEEPGRAM
        if (
          deepgramLive &&
          deepgramLive.readyState ===
            WebSocket.OPEN
        ) {

          deepgramLive.close()
        }
      }
    )

    // ======================
    // DISCONNECT
    // ======================

    socket.on(
      'disconnect',

      () => {

        console.log(
          'User disconnected'
        )

        if (
          deepgramLive &&
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