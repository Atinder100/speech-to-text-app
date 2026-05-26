import {
  useState,
  useRef,
  useEffect,
} from 'react'

import { io } from 'socket.io-client'

import axios from 'axios'

import {
  FaMicrophone,
  FaMicrophoneSlash,
} from 'react-icons/fa'

const socket = io('http://localhost:5000')

function App() {

  const [audio, setAudio] =
    useState(null)

  const [transcription, setTranscription] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [micOn, setMicOn] =
    useState(false)

  const [history, setHistory] =
    useState([])

  const mediaRecorderRef =
    useRef(null)

  // SOCKET + HISTORY
  useEffect(() => {

    // LIVE TRANSCRIPTION
    socket.on(
      'transcription-result',
      (text) => {

        setTranscription((prev) => {

          return prev + ' ' + text
        })
      }
    )

    // FETCH HISTORY
    const fetchHistory = async () => {

      try {

        const response =
          await axios.get(
            'http://localhost:5000/transcriptions'
          )

        setHistory(response.data)

      } catch (error) {

        console.log(error)
      }
    }

    fetchHistory()

    return () => {

      socket.off('transcription-result')
    }

  }, [])

  // FILE UPLOAD
  const handleUpload = async (
  audioFile
) => {

  if (!audioFile) {

    alert(
      'Please select or record audio'
    )

    return
  }

  const formData =
    new FormData()

  formData.append(
    'audio',
    audioFile
  )

  try {

    setLoading(true)

    // UPLOAD AUDIO
    const response =
      await axios.post(
        'http://localhost:5000/upload',
        formData
      )

    console.log(response.data)

    // SHOW TRANSCRIPTION
    setTranscription(
      response.data.transcription
    )

    // FETCH UPDATED HISTORY
    const historyResponse =
      await axios.get(
        'http://localhost:5000/transcriptions'
      )

    setHistory(
      historyResponse.data
    )

  } catch (error) {

    console.log(error)

    alert('Upload failed')

  } finally {

    setLoading(false)
  }
}

  // MIC TOGGLE
  const toggleMic = async () => {

    // START MIC
    if (!micOn) {

      try {

        setTranscription('')

        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({
              audio: true,
            })

        const mediaRecorder =
          new MediaRecorder(
            stream,
            {
              mimeType:
                'audio/webm',
            }
          )

        mediaRecorderRef.current =
          mediaRecorder

        socket.emit(
          'start-stream'
        )

        mediaRecorder.ondataavailable =
          async (event) => {

            if (
              event.data.size > 0
            ) {

              const arrayBuffer =
                await event.data
                  .arrayBuffer()

              socket.emit(
                'audio-chunk',
                arrayBuffer
              )
            }
          }

        mediaRecorder.start(1000)

        setMicOn(true)

      } catch (error) {

        console.log(error)

        alert(
          'Microphone access denied'
        )
      }
    }

    // STOP MIC
    else {

      mediaRecorderRef.current.stop()

      socket.emit(
        'stop-stream'
      )

      setMicOn(false)

      // REFRESH HISTORY
      try {

        const response =
          await axios.get(
            'http://localhost:5000/transcriptions'
          )

        setHistory(
          response.data
        )

      } catch (error) {

        console.log(error)
      }
    }
  }

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-lg p-8">

        <h1 className="text-5xl font-bold text-center text-gray-900">
          Speech To Text App
        </h1>

        <p className="text-center text-gray-500 mt-4 text-lg">
          Upload audio or use mic for live captions
        </p>

        {/* FILE UPLOAD */}
        <div className="flex gap-4 mt-10">

          <input
            type="file"
            accept="audio/*"
            onChange={(e) =>
              setAudio(
                e.target.files[0]
              )
            }
            className="flex-1 border border-gray-300 rounded-lg p-3"
          />

          <button
            onClick={() =>
              handleUpload(audio)
            }
            className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
          >

            {
              loading
                ? 'Transcribing...'
                : 'Upload'
            }

          </button>
        </div>

        {/* MIC */}
        <div className="mt-12 text-center">

          <button
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition ${
              micOn
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
            onClick={toggleMic}
          >

            {
              micOn
                ? <FaMicrophone />
                : <FaMicrophoneSlash />
            }

          </button>

          <p className="mt-4 text-xl font-semibold">

            {
              micOn
                ? 'Mic is ON'
                : 'Mic is OFF'
            }

          </p>
        </div>

        {/* LIVE TRANSCRIPTION */}
        {(micOn || transcription) && (

          <div className="mt-12 border rounded-xl p-6 bg-gray-50">

            <h2 className="text-2xl font-bold mb-4">

              {
                micOn
                  ? 'Live Transcription'
                  : 'Transcription'
              }

            </h2>

            <p className="text-gray-700 text-lg">

              {
                transcription ||
                'Listening...'
              }

            </p>

          </div>
        )}

        {/* HISTORY */}
        <div className="mt-10">

          <h2 className="text-2xl font-bold mb-4">
            Previous Transcriptions
          </h2>

          <div className="space-y-4">

            {history.map((item) => (

              <div
                key={item._id}
                className="bg-white border rounded-xl p-4 shadow-sm"
              >

                <h3 className="font-semibold text-blue-700 mb-2">

                  {item.fileName ||
                    'Previous Audio'}

                </h3>

                <p className="text-gray-800">

                  {item.transcription || item.text}

                </p>

              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  )
}

export default App