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

  const mediaRecorderRef =
    useRef(null)

  const socketRef = useRef(null)

  // SOCKET + HISTORY
 useEffect(() => {

  // CREATE SOCKET CONNECTION
  socketRef.current =
    io('http://localhost:5000')

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
          'http://localhost:5000/transcriptions'
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

  const deleteTranscription =
  async (id) => {

    try {

      await axios.delete(
        `http://localhost:5000/transcriptions/${id}`
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

  return (

<div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] p-8">

  {/* MAIN DASHBOARD */}
  <div className="max-w-6xl mx-auto bg-[#1e293b]/90 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-3xl p-8">

    {/* HEADER */}
    <div className="flex items-center justify-between flex-wrap gap-4">

      <div>

        <h1 className="text-5xl font-extrabold text-slate-100 tracking-tight">
          Dashboard
        </h1>

        <p className="text-slate-400 mt-2 text-lg">
          Speech To Text Transcription System
        </p>

      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-4">

        {/* MIC BUTTON */}
        <button
          onClick={toggleMic}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all duration-300 hover:scale-110 ${
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
              .getElementById(
                'uploadBox'
              )
              .classList.remove(
                'hidden'
              )
          }}

          className="px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
        >

          Upload File

        </button>

      </div>

    </div>

    {/* ========================= */}
    {/* MIC RECORDING BOX */}
    {/* ========================= */}

    {micOn && (

      <div className="mt-10 bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl p-8 max-w-2xl animate-pulse">

        <h2 className="text-3xl font-bold text-slate-100 mb-6">
          Speak Now
        </h2>

        {/* RECORDING DISPLAY */}
        <div className="min-h-[180px] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 text-xl text-slate-200 leading-relaxed shadow-inner">

          {
            transcription ||
            'Recording...'
          }

        </div>

        {/* STOP BUTTON */}
        <div className="mt-8 flex justify-center">

          <button
            onClick={toggleMic}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
          >

            Stop Recording

          </button>

        </div>

      </div>
    )}

    {/* ========================= */}
    {/* UPLOAD BOX */}
    {/* ========================= */}

    <div
      id="uploadBox"
      className="hidden mt-10 bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl p-8 max-w-2xl"
    >

      <h2 className="text-3xl font-bold text-slate-100 mb-6">
        Upload Audio File
      </h2>

      <div className="flex flex-col md:flex-row gap-4">

        {/* FILE INPUT */}
        <input
          type="file"
          accept="audio/*"
          onChange={(e) =>
            setAudio(
              e.target.files[0]
            )
          }
          className="flex-1 border border-slate-700 rounded-2xl p-4 bg-slate-800 text-slate-200 focus:outline-none focus:ring-4 focus:ring-cyan-500"
        />

        {/* UPLOAD BUTTON */}
        <button
          onClick={() =>
            handleUpload(audio)
          }
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg hover:scale-105 transition-all duration-300"
        >

          {
            loading
              ? 'Transcribing...'
              : 'Upload'
          }

        </button>

      </div>

      {/* FILE NAME */}
      {audio && (

        <div className="mt-6 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 shadow-sm">

          <p className="font-semibold text-slate-200">
            Uploaded File
          </p>

          <p className="mt-2 text-slate-400">
            {audio.name}
          </p>

        </div>
      )}

    </div>

    {/* ========================= */}
    {/* PREVIOUS TRANSCRIPTIONS */}
    {/* ========================= */}

    <div className="mt-14">

      <h2 className="text-4xl font-bold text-slate-100 mb-8">

        Your Previous Transcriptions

      </h2>

      {/* ========================= */}
      {/* MIC RECORDINGS */}
      {/* ========================= */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8 mb-10">

        <h3 className="text-3xl font-bold text-slate-100 mb-8">

          Recordings from Mic

        </h3>

        <div className="space-y-5">

          {history
            .filter(
              (item) =>
                item.fileName ===
                'Live Mic'
            )
            .map((item) => (

              <div
                key={item._id}
                className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col lg:flex-row justify-between gap-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >

                <div className="flex-1">

                  <p className="font-bold text-xl text-slate-100">
                    Live Mic Recording
                  </p>

                  <p className="mt-4 text-slate-300 text-lg leading-relaxed">
                    {
                      item.transcription
                    }
                  </p>

                  <p className="text-sm text-slate-500 mt-5">

                    {
                      new Date(
                        item.createdAt
                      ).toLocaleString()
                    }

                  </p>

                </div>

                {/* BUTTONS */}
                <div className="flex gap-2 ml-4">

                  {/* COPY */}
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        item.transcription
                      )
                    }
                    className="bg-slate-600 hover:bg-slate-700 text-white text-xs px-4 h-8 rounded-md transition duration-300 shadow-sm"
                  >
                    Copy
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() =>
                      deleteTranscription(
                        item._id
                      )
                    }
                    className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-4 h-8 rounded-md transition duration-300 shadow-sm"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

        </div>

      </div>

      {/* ========================= */}
      {/* AUDIO FILES */}
      {/* ========================= */}

      <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8">

        <h3 className="text-3xl font-bold text-slate-100 mb-8">

          Audio Files

        </h3>

        <div className="space-y-5">

          {history
            .filter(
              (item) =>
                item.fileName !==
                'Live Mic'
            )
            .map((item) => (

              <div
                key={item._id}
                className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col lg:flex-row justify-between gap-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >

                <div className="flex-1">

                  <p className="font-bold text-xl text-slate-100">

                    {item.fileName}

                  </p>

                  <p className="mt-4 text-slate-300 text-lg leading-relaxed">

                    {
                      item.transcription
                    }

                  </p>

                  <p className="text-sm text-slate-500 mt-5">

                    {
                      new Date(
                        item.createdAt
                      ).toLocaleString()
                    }

                  </p>

                </div>

                {/* BUTTONS */}
                <div className="flex gap-2 ml-4">

                    {/* COPY */}
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          item.transcription
                        )
                      }
                      className="bg-slate-600 hover:bg-slate-700 text-white text-xs px-4 h-8 rounded-md transition duration-300 shadow-sm"
                    >
                      Copy
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() =>
                        deleteTranscription(
                          item._id
                        )
                      }
                      className="bg-rose-500 hover:bg-rose-600 text-white text-xs px-4 h-8 rounded-md transition duration-300 shadow-sm"
                    >
                      Delete
                    </button>

                  </div>

              </div>
            ))}

        </div>

      </div>

    </div>

  </div>

</div>
)
}

export default Dashboard