import { useState, useRef } from 'react'
import { useSignOut, useUserEmail } from '@nhost/react'

const DEEPGRAM_API_KEY = import.meta.env.VITE_DATAGRAM_API_KEY;

function Dashboard() {
  const { signOut } = useSignOut()
  const email = useUserEmail()

  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [status, setStatus] = useState('Idle')

  const socketRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)

  const startRecording = async () => {
    try {
      setStatus('Requesting mic access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      setStatus('Connecting to Deepgram...')
      const socket = new WebSocket(
        'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&interim_results=true',
        ['token', DEEPGRAM_API_KEY]
      )
      socketRef.current = socket

      socket.onopen = () => {
        setStatus('Listening...')
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data)
          }
        }

        mediaRecorder.start(250)
        setIsRecording(true)
      }

      socket.onmessage = (message) => {
        const data = JSON.parse(message.data)
        const alt = data.channel?.alternatives?.[0]
        if (!alt) return

        const text = alt.transcript
        if (!text) return

        if (data.is_final) {
          setTranscript((prev) => (prev ? prev + ' ' + text : text))
          setInterim('')
        } else {
          setInterim(text)
        }
      }

      socket.onerror = (err) => {
        console.error('WebSocket error:', err)
        setStatus('Error - check console & API key')
      }

      socket.onclose = () => {
        setStatus('Disconnected')
      }
    } catch (err) {
      console.error(err)
      setStatus('Mic access denied or error')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    socketRef.current?.close()
    setIsRecording(false)
    setStatus('Idle')
    setInterim('')
  }

  return (
    <div className="dashboard">
      <header>
        <span>Logged in as {email}</span>
        <button onClick={signOut}>Sign Out</button>
      </header>

      <main>
        <h2>Live Speech-to-Text</h2>
        <p className="status">Status: {status}</p>

        <button onClick={isRecording ? stopRecording : startRecording} className="mic-btn">
          {isRecording ? 'Stop' : 'Start Speaking'}
        </button>

        <div className="transcript-box">
          <p>{transcript} <span className="interim">{interim}</span></p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
