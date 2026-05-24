import { useState} from 'react'
import axios from 'axios'
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa'

function App() {
  const [audio, setAudio] = useState(null)
  const [transcription, setTranscription] = useState('')
  const [loading, setLoading] = useState(false)
  const [micOn, setMicOn] = useState(false)
  

  // Upload selected file
  const handleUpload = async (audioFile) => {
    if (!audioFile) {
      alert('Please select or record audio')
      return
    }

    const formData = new FormData()
    formData.append('audio', audioFile)

    try {
      setLoading(true)

      const response = await axios.post(
        'http://localhost:5000/upload',
        formData
      )

      setTranscription(response.data.transcription)
    } catch (error) {
      console.log(error)
      alert('Upload failed')
    } finally {
      setLoading(false)
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

      <div className="flex gap-4 mt-10">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudio(e.target.files[0])}
          className="flex-1 border border-gray-300 rounded-lg p-3"
        />

        <button
          onClick={() => handleUpload(audio)}
          className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700"
        >
          {loading ? 'Transcribing...' : 'Upload'}
        </button>
      </div>

      <div className="mt-12 text-center">
        <button
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition ${
            micOn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setMicOn(!micOn)}
        >
          {micOn ? (
            <FaMicrophone />
          ) : (
            <FaMicrophoneSlash />
          )}
        </button>

        <p className="mt-4 text-xl font-semibold">
          {micOn ? 'Mic is ON' : 'Mic is OFF'}
        </p>
      </div>

      {(micOn || transcription) && (
        <div className="mt-12 border rounded-xl p-6 bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">
            {micOn
              ? 'Live Transcription'
              : 'Transcription'}
          </h2>

          <p className="text-gray-700 text-lg">
            {transcription || 'Listening...'}
          </p>
        </div>
      )}
    </div>
  </div>
)
}

export default App