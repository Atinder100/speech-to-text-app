const express = require('express')
const multer = require('multer')
const path = require('path')

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

// Test route
app.get('/', (req, res) => {
  res.send('Backend server is running')
})

// Upload route
app.post('/upload', upload.single('audio'), (req, res) => {
  res.json({
    message: 'File uploaded successfully',
    file: req.file,
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})