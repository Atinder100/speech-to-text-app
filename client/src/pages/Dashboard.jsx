import {
  useState,
  useRef,
  useEffect,
} from 'react'

import {
  Navigate,
} from 'react-router-dom'

import { io } from 'socket.io-client'

import axios from 'axios'

import {
  FaMicrophone,
  FaMicrophoneSlash,
} from 'react-icons/fa'





function Dashboard() {

  

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

  const [uploadSuccess, setUploadSuccess] =
  useState('')

  const [copiedId, setCopiedId] =
  useState(null)

  const mediaRecorderRef =
    useRef(null)

  const socketRef = useRef(null)

  const token =
  localStorage.getItem(
    'token'
  )

  if (!token) {

    return (
      <Navigate to="/login" />
    )
  }

  // SOCKET + HISTORY
 useEffect(() => {

  // CREATE SOCKET CONNECTION
  socketRef.current =
    io('https://speech-to-text-backend-rayx.onrender.com')
    socketRef.current.emit(

      'authenticate',

      token
    )

  // LIVE TRANSCRIPTION
  socketRef.current.on(
    'transcription-result',

    (text) => {

      setTranscription((prev) => {

        return prev + ' ' + text
      })
    }
  )

  // DEEPGRAM READY
socketRef.current.on(
  'deepgram-ready',

  () => {

    console.log(
      'Deepgram ready'
    )

    // START RECORDING NOW
    if (
      mediaRecorderRef.current
      &&
      mediaRecorderRef.current.state ===
        'inactive'
    ) {

      mediaRecorderRef.current.start(
        250
      )
    }
  }
)

  // FETCH HISTORY
  const fetchHistory = async () => {

    try {

      const response =
        await axios.get(

          'https://speech-to-text-backend-rayx.onrender.com/transcriptions',

          {

            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        )

      setHistory(response.data)

    } catch (error) {

      console.log(error)
    }
  }

  fetchHistory()

  return () => {

    socketRef.current.off(
      'transcription-result'
    )

    socketRef.current.disconnect()
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

    setUploadSuccess('')

    // UPLOAD AUDIO
    const response =
     await axios.post(

          'https://speech-to-text-backend-rayx.onrender.com/upload',

          formData,

          {

            headers: {

              Authorization:
                `Bearer ${token}`,
            },

            timeout: 120000,
          }
        )

    console.log(response.data)

    // SHOW TRANSCRIPTION
    setTranscription(
      response.data.transcription
    )

    // FETCH UPDATED HISTORY
    const historyResponse =
      await axios.get(
        'https://speech-to-text-backend-rayx.onrender.com/transcriptions',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          timeout: 120000,
        }
      )

setHistory(historyResponse.data)

setUploadSuccess(
  'Transcription generated successfully. Check Audio Files section below.'
)

// AUTO CLOSE AFTER 5 SECONDS
setTimeout(() => {

  // HIDE UPLOAD BOX
  document
    .getElementById('uploadBox')
    .classList.add('hidden')

  // RESET AUDIO
  setAudio(null)

   // CLEAR FILE INPUT
  document.getElementById(
    'audioInput'
  ).value = ''

  // CLEAR SUCCESS MESSAGE
  setUploadSuccess('')

}, 5000)

  } catch (error) {

    console.log(error)

    console.log(error)

      console.log(
  error.response?.data
)

console.log(error.message)

if (
  error.code === 'ECONNABORTED'
) {

  alert(
    'Server is taking too long. Please wait and refresh page. Your transcription may already be saved.'
  )

} else {

  alert(

    error.response?.data?.error ||

    error.message ||

    'Upload failed'
  )
}

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
              audio: {
                noiseSuppression: true,
                echoCancellation: true,
                autoGainControl: true,
              },
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

          // SEND AUDIO CHUNKS
          mediaRecorder.ondataavailable =
            async (event) => {

              if (
                event.data.size > 0
              ) {

                const arrayBuffer =
                  await event.data
                    .arrayBuffer()

                socketRef.current.emit(
                  'audio-chunk',
                  arrayBuffer
                )
              }
            }

        socketRef.current.emit(
  'start-stream'
)





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

      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        )

      socketRef.current.emit(
        'stop-stream'
      )

      setMicOn(false)

      // REFRESH HISTORY
      try {

        const response =
          await axios.get(

            'https://speech-to-text-backend-rayx.onrender.com/transcriptions',

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        setHistory(
          response.data
        )

      } catch (error) {

        console.log(error)
      }
    }
  }

  const deleteTranscription =
  async (id) => {

    try {

      await axios.delete(

        `https://speech-to-text-backend-rayx.onrender.com/transcriptions/${id}`,

        {

          headers: {

            Authorization:
              `Bearer ${token}`,
          },
        }
      )

      // REMOVE FROM UI
      setHistory((prev) =>
        prev.filter(
          (item) =>
            item._id !== id
        )
      )

    } catch (error) {

      console.log(error)

      alert(
        'Delete failed'
      )
    }
  }

  const micRecordings =
  history.filter(
    (item) =>
      item.fileName ===
      'Live Mic'
  )

const audioFiles =
  history.filter(
    (item) =>
      item.fileName !==
      'Live Mic'
  )

  return (

<div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] px-3 sm:px-5 md:px-8 py-4 sm:py-8">

  {/* MAIN CONTAINER */}
  <div className="max-w-7xl mx-auto bg-[#1e293b]/90 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">

    {/* HEADER */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

      {/* TITLE */}
      <div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight break-words">

          Dashboard

        </h1>

        <p className="text-slate-400 mt-2 text-sm sm:text-base md:text-lg">

          Speech To Text Transcription System

        </p>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">

        {/* MIC BUTTON */}
        <button
          onClick={toggleMic}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-xl transition-all duration-300 hover:scale-105 ${
            micOn
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse'
              : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
          }`}
        >

          {
            micOn
              ? <FaMicrophone />
              : <FaMicrophoneSlash />
          }

        </button>

        {/* UPLOAD BUTTON */}
        <button
          onClick={() => {

            setMicOn(false)

            document
              .getElementById('uploadBox')
              .classList.remove('hidden')
          }}
          className="px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm sm:text-base shadow-xl hover:scale-105 transition-all duration-300"
        >

          Upload File

        </button>

        {/* LOGOUT */}
        <button

          onClick={() => {

            localStorage.removeItem('token')

            localStorage.removeItem('user')

            window.location.href =
              '/login'
          }}

          className="px-5 sm:px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-sm sm:text-base font-semibold shadow-lg transition-all duration-300"
        >

          Logout

        </button>

      </div>

    </div>

    {/* RECORDING BOX */}
    {micOn && (

      <div className="mt-8 sm:mt-10 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 w-full">

        <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-5">

          Speak Now

        </h2>

        <div className="min-h-[160px] sm:min-h-[180px] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed shadow-inner break-words">

          {
            transcription ||
            'Recording...'
          }

        </div>

        <div className="mt-6 sm:mt-8 flex justify-center">

          <button
            onClick={toggleMic}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm sm:text-base font-semibold shadow-lg hover:scale-105 transition-all duration-300"
          >

            Stop Recording

          </button>

        </div>

      </div>
    )}

    {/* UPLOAD BOX */}
    <div
      id="uploadBox"
      className="hidden mt-8 sm:mt-10 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 w-full"
    >

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-6">

        Upload Audio File

      </h2>

      <div className="flex flex-col gap-4">

        <input
          id="audioInput"
          type="file"
          accept="audio/*"
          onChange={(e) =>
            setAudio(
              e.target.files[0]
            )
          }
          className="w-full border border-slate-700 rounded-2xl p-4 bg-slate-800 text-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500"
        />

        <button
          onClick={() =>
            handleUpload(audio)
          }
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
        >

          {
            loading
              ? 'Transcribing...'
              : 'Upload'
          }

        </button>

        {/* SUCCESS MESSAGE */}
        {uploadSuccess && (

          <div className="mt-5 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">

            <p className="text-green-400 text-sm sm:text-base font-medium">

              {uploadSuccess}

            </p>

          </div>
        )}

      </div>

      {audio && (

        <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 shadow-sm break-words">

          <p className="font-semibold text-slate-200">

            Uploaded File

          </p>

          <p className="mt-2 text-slate-400 break-all">

            {audio.name}

          </p>

        </div>
      )}

    </div>

    {/* HISTORY */}
    <div className="mt-12">

      <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-8 leading-tight">

        Your Previous Transcriptions

      </h2>

      {/* MIC RECORDINGS */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-8">

        <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-6">

          Recordings from Mic

        </h3>

        <div className="space-y-5">

  {micRecordings.length === 0 ? (

    <div className="text-center py-12">

      <p className="text-slate-400 text-lg">

        No microphone recordings yet.

      </p>

      <p className="text-slate-500 mt-2">

        Click the microphone button above to create your first recording.

      </p>

    </div>

  ) : (

    micRecordings.map((item) => (

              <div
                key={item._id}
                className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300"
              >

                <div>

                  <p className="font-bold text-lg sm:text-xl text-slate-100">

                    Live Mic Recording

                  </p>

                  <p className="mt-4 text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed break-words">

                    {
                      item.transcription
                    }

                  </p>

                  <p className="text-xs sm:text-sm text-slate-500 mt-5">

                    {
                      new Date(
                        item.createdAt
                      ).toLocaleString()
                    }

                  </p>

                </div>

                {/* BUTTONS */}
                <div className="flex flex-wrap gap-3 mt-6">

                  <button
                    onClick={() => {

                      navigator.clipboard.writeText(
                        item.transcription
                      )

                      setCopiedId(item._id)

                      setTimeout(() => {

                        setCopiedId(null)

                      }, 2000)
                    }}
                    className="flex-1 sm:flex-none bg-slate-600 hover:bg-slate-700 text-white text-sm px-5 py-2 rounded-lg transition duration-300"
                  >
                    {
                      copiedId === item._id
                        ? 'Copied'
                        : 'Copy'
                    }
                  </button>

                  <button
                    onClick={() => {

                      const confirmDelete =
                        window.confirm(
                          'Are you sure you want to delete this transcription?'
                        )

                      if (confirmDelete) {

                        deleteTranscription(
                          item._id
                        )
                      }
                    }}
                    className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 text-white text-sm px-5 py-2 rounded-lg transition duration-300"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))
          )}

        </div>

      </div>

      {/* AUDIO FILES */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">

        <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-6">

          Audio Files

        </h3>

        <div className="space-y-5">


  {audioFiles.length === 0 ? (

    <div className="text-center py-12">

      <p className="text-slate-400 text-lg">

        No uploaded audio files yet.

      </p>

      <p className="text-slate-500 mt-2">

        Upload an audio file to generate your first transcription.

      </p>

    </div>

  ) : (

    audioFiles.map((item) => (

              <div
                key={item._id}
                className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300"
              >

                <div>

                  <p className="font-bold text-lg sm:text-xl text-slate-100 break-all">

                    {item.fileName}

                  </p>

                  <p className="mt-4 text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed break-words">

                    {
                      item.transcription
                    }

                  </p>

                  <p className="text-xs sm:text-sm text-slate-500 mt-5">

                    {
                      new Date(
                        item.createdAt
                      ).toLocaleString()
                    }

                  </p>

                </div>

                <div className="flex flex-wrap gap-3 mt-6">

                  <button
                    onClick={() => {

                      navigator.clipboard.writeText(
                        item.transcription
                      )

                      setCopiedId(item._id)

                      setTimeout(() => {

                        setCopiedId(null)

                      }, 2000)
                    }}
                    className="flex-1 sm:flex-none bg-slate-600 hover:bg-slate-700 text-white text-sm px-5 py-2 rounded-lg transition duration-300"
                  >
                    {
                      copiedId === item._id
                        ? 'Copied'
                        : 'Copy'
                    }
                  </button>

                  <button
                  onClick={() => {

                      const confirmDelete =
                        window.confirm(
                          'Are you sure you want to delete this transcription?'
                        )

                      if (confirmDelete) {

                        deleteTranscription(
                          item._id
                        )
                      }
                    }}
                    className="flex-1 sm:flex-none bg-rose-500 hover:bg-rose-600 text-white text-sm px-5 py-2 rounded-lg transition duration-300"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))
          )}

        </div>

      </div>

    </div>

  </div>

</div>
)
}

export default Dashboard