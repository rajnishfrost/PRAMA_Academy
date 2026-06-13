import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'

export default function ScreenRecording() {
  const [status, setStatus] = useState('idle') // idle | recording | paused | stopped
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const streamRef = useRef(null)

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
  }

  const stopTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = null
  }

  const startRecording = useCallback(async () => {
    setError('')
    setRecordedUrl(null)
    setDuration(0)
    chunksRef.current = []

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setError('Screen recording is not supported in this browser or requires a secure (HTTPS) connection.')
      return
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      })

      // Try to get mic audio too and mix it
      let combinedStream = displayStream
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const ctx = new AudioContext()
        const dest = ctx.createMediaStreamDestination()

        // Add system audio tracks if present
        displayStream.getAudioTracks().forEach((track) => {
          const source = ctx.createMediaStreamSource(new MediaStream([track]))
          source.connect(dest)
        })

        // Add mic audio
        micStream.getAudioTracks().forEach((track) => {
          const source = ctx.createMediaStreamSource(new MediaStream([track]))
          source.connect(dest)
        })

        combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...dest.stream.getAudioTracks(),
        ])

        // Stop mic when display stream ends
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          micStream.getTracks().forEach((t) => t.stop())
        })
      } catch {
        // Mic not available — continue with display audio only
      }

      streamRef.current = combinedStream

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm',
      })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedUrl(URL.createObjectURL(blob))
        setStatus('stopped')
        stopTimer()
      }

      // Handle user clicking browser's "Stop sharing" button
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (recorder.state !== 'inactive') recorder.stop()
        combinedStream.getTracks().forEach((t) => t.stop())
      })

      mediaRecorderRef.current = recorder
      recorder.start(1000)
      setStatus('recording')
      startTimer()
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Screen sharing was cancelled or denied. Please allow screen sharing when prompted.')
      } else if (!navigator.mediaDevices?.getDisplayMedia) {
        setError('Screen recording requires HTTPS. This feature won\'t work on an insecure (HTTP) connection.')
      } else {
        setError(`Could not start screen recording: ${err.message}`)
      }
    }
  }, [])

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setStatus('paused')
      stopTimer()
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setStatus('recording')
      startTimer()
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }

  const downloadRecording = () => {
    if (!recordedUrl) return
    const a = document.createElement('a')
    a.href = recordedUrl
    a.download = `recording-${Date.now()}.webm`
    a.click()
  }

  const resetRecording = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedUrl(null)
    setStatus('idle')
    setDuration(0)
    setError('')
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 bg-gray-900">
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-primary font-semibold text-sm tracking-wider uppercase mb-3">Free Tool</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Screen Recording</h1>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Record your entire screen or a specific application window with audio. No installation required.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative">
            <Link to="/tools" className="absolute top-4 left-4 md:top-6 md:left-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to Tools
            </Link>
          <div className="text-center">
            {status === 'idle' && !recordedUrl && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to Record</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Click the button below to start recording. You'll be able to choose your entire screen or a specific window.
                </p>
                <button
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
                >
                  Start Recording
                </button>
              </>
            )}

            {(status === 'recording' || status === 'paused') && (
              <>
                <div className="mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    status === 'recording' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      status === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
                    }`} />
                    {status === 'recording' ? 'Recording' : 'Paused'}
                  </div>
                </div>
                <p className="text-4xl font-mono font-bold text-gray-900 mb-8">{formatTime(duration)}</p>
                <div className="flex items-center justify-center gap-4">
                  {status === 'recording' ? (
                    <button
                      onClick={pauseRecording}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                    >
                      Resume
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Stop Recording
                  </button>
                </div>
              </>
            )}

            {status === 'stopped' && recordedUrl && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recording Complete</h2>
                <p className="text-sm text-gray-500 mb-4">Duration: {formatTime(duration)}</p>
                <video
                  src={recordedUrl}
                  controls
                  className="w-full rounded-xl bg-black mb-6"
                />
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={downloadRecording}
                    className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Download
                  </button>
                  <button
                    onClick={resetRecording}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Record Again
                  </button>
                </div>
              </>
            )}
          </div>
          </div>

          {/* Info */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'Screen or Window', desc: 'Choose to record your entire screen or just a specific app window.' },
              { title: 'With Audio', desc: 'Captures system audio and microphone for narration.' },
              { title: 'Instant Download', desc: 'No upload needed. Your recording stays on your device.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
