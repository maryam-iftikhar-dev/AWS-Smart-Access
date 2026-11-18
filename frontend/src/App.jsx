import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RekognitionExplorer from './components/RekognitionExplorer';
import BedrockExplorer from './components/BedrockExplorer';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

// Classroom-only demo credentials.
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'Demo123!';

export default function App() {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState('login'); // 'login' | 'liveness' | 'dashboard' | 'failed'
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'rekognition' | 'bedrock'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, busy]);

  function copyText(text, index) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }

  function autofillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  }

  function startVerification(event) {
    event.preventDefault();
    setError('');
    if (email.trim() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('Demo authentication failed. Use demo@example.com and Demo123!');
      return;
    }
    setResult(null);
    setStage('liveness');
  }

  async function verifySnapshot(image) {
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/face/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Face verification failed.');
      setResult(data);
      setStage(data.passed ? 'dashboard' : 'failed');
    } catch (e) {
      setError(e.message);
      setStage('failed');
    } finally {
      setBusy(false);
    }
  }

  async function askAssistant(event) {
    if (event) event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    sendMessage(text);
  }

  async function sendMessage(text) {
    if (!text || busy) return;
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setQuestion('');
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Assistant request failed.');
      setMessages([...nextMessages, { role: 'assistant', content: data.answer }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  function reset() {
    setStage('login');
    setResult(null);
    setError('');
    setMessages([]);
    setQuestion('');
    setPassword('');
  }

  const stepIndex = stage === 'login' ? 1 : stage === 'liveness' ? 2 : 3;

  return (
    <div className="neo-layout">
      {/* Top System Ticker */}
      <div className="neo-ticker">
        <span className="ticker-badge">AWS DEMO</span>
        <span className="ticker-text">AMAZON REKOGNITION (DETECTFACES) + AMAZON BEDROCK (CONVERSE API)</span>
        <span className="ticker-status">
          <span className="live-dot"></span> LIVE ENVIRONMENT
        </span>
      </div>

      <header className="neo-header">
        <div className="brand-group">
          <div className="brand-logo">SA</div>
          <div>
            <h1 className="brand-title">SMART ACCESS <span className="brand-tag">v2.0</span></h1>
            <p className="brand-subtitle">CAMPUS IT // AI-POWERED FACIAL RECOGNITION &amp; ASSISTANCE</p>
          </div>
        </div>
        <div className="header-badges">
          <span className="neo-pill pill-yellow">AWS US-EAST-1</span>
          <span className="neo-pill pill-green">AI SERVICES ACTIVE</span>
        </div>
      </header>

      {/* Top Interactive Page Navigation */}
      <nav className="neo-nav-tabs">
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          ⚡ 1. LIVE ACCESS DEMO
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'rekognition' ? 'active' : ''}`}
          onClick={() => setActiveTab('rekognition')}
        >
          👁️ 2. HOW REKOGNITION WORKS (Face Simulator)
        </button>
        <button
          type="button"
          className={`nav-tab-btn ${activeTab === 'bedrock' ? 'active' : ''}`}
          onClick={() => setActiveTab('bedrock')}
        >
          🧠 3. HOW BEDROCK WORKS (RAG • Agents • Guardrails)
        </button>
      </nav>

      <main className="neo-main">
        {activeTab === 'rekognition' && <RekognitionExplorer />}
        {activeTab === 'bedrock' && <BedrockExplorer />}

        {activeTab === 'demo' && (
          <>
            {/* Step Progress Tracker */}
            <div className="stepper-bar">
              <div className={`step-item ${stepIndex >= 1 ? 'active' : ''} ${stepIndex > 1 ? 'completed' : ''}`}>
                <span className="step-num">01</span>
                <span className="step-name">DEMO LOGIN</span>
              </div>
              <div className="step-divider">→</div>
              <div className={`step-item ${stepIndex >= 2 ? 'active' : ''} ${stepIndex > 2 ? 'completed' : ''}`}>
                <span className="step-num">02</span>
                <span className="step-name">REKOGNITION SCAN</span>
              </div>
              <div className="step-divider">→</div>
              <div className={`step-item ${stepIndex === 3 ? 'active' : ''}`}>
                <span className="step-num">03</span>
                <span className="step-name">BEDROCK ASSISTANT</span>
              </div>
            </div>

            {/* Dynamic Stage Panel */}
            <div className="neo-card main-panel">
          {stage === 'login' && (
            <div className="stage-content">
              <div className="section-header">
                <span className="stage-chip chip-yellow">STEP 01 // AUTHENTICATION</span>
                <h2>Welcome to Campus IT</h2>
                <p className="section-desc">
                  Sign in with classroom presentation credentials, then proceed to real-time face verification.
                </p>
              </div>

              <form onSubmit={startVerification} className="neo-form">
                <div className="form-group">
                  <label htmlFor="email">DEMO EMAIL ADDRESS</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="demo@example.com"
                  />
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="password">DEMO PASSWORD</label>
                    <button type="button" onClick={autofillDemo} className="text-btn">
                      ⚡ Quick Fill Demo
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter demo password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={busy} className="neo-btn btn-primary">
                  <span>{busy ? 'PROCESSING AUTH…' : 'SIGN IN & VERIFY IDENTITY'}</span>
                  <span className="btn-arrow">→</span>
                </button>
              </form>

              <div className="credentials-sticker">
                <div className="sticker-header">
                  <span className="sticker-pin">📌</span>
                  <strong>PRESENTATION CREDENTIALS</strong>
                </div>
                <div className="creds-values">
                  <code>demo@example.com</code> / <code>Demo123!</code>
                </div>
                <p className="sticker-note">
                  Classroom demo credentials for testing presence and Bedrock flows without production SSO.
                </p>
              </div>
            </div>
          )}

          {stage === 'liveness' && (
            <div className="stage-content">
              <div className="section-header">
                <span className="stage-chip chip-green">STEP 02 // REKOGNITION</span>
                <h2>Verify You Are Present</h2>
                <p className="section-desc">
                  Position your face in the reticle with good light. <strong>Smile</strong> and keep your eyes open, then capture the snapshot for Amazon Rekognition DetectFaces.
                </p>
              </div>

              <FaceCapture busy={busy} onCapture={verifySnapshot} onError={setError} />

              <button type="button" className="neo-btn btn-secondary" onClick={reset}>
                <span>← CANCEL &amp; RETURN</span>
              </button>
            </div>
          )}

          {stage === 'dashboard' && (
            <div className="stage-content">
              <div className="dash-top-banner">
                <div className="verified-badge">
                  <span className="badge-check">✓</span>
                  <div>
                    <strong>ACCESS GRANTED</strong>
                    <small>Amazon Rekognition Verified</small>
                  </div>
                </div>

                <button type="button" className="neo-btn btn-small btn-danger" onClick={reset}>
                  SIGN OUT ✕
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-box">
                  <span className="metric-label">FACE CONFIDENCE</span>
                  <strong className="metric-val">{result?.confidence || 98.4}%</strong>
                  <div className="metric-meter">
                    <div
                      className="metric-fill"
                      style={{ width: `${Math.min(result?.confidence || 98, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="metric-box">
                  <span className="metric-label">PRESENCE CHECK</span>
                  <strong className="metric-val text-green">PASSED ✓</strong>
                  <span className="metric-sub">Single face + smile + open eyes</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">AI ENGINE</span>
                  <strong className="metric-val text-purple">BEDROCK CONVERSE</strong>
                  <span className="metric-sub">AWS Cloud Native</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">AWS REGION</span>
                  <strong className="metric-val">{AWS_REGION.toUpperCase()}</strong>
                  <span className="metric-sub">N. Virginia</span>
                </div>
              </div>

              {/* Assistant Section */}
              <div className="chat-container">
                <div className="chat-toolbar">
                  <div className="assistant-badge">
                    <span className="sparkle">✦</span>
                    <div>
                      <strong>CAMPUS IT &amp; BEDROCK ASSISTANT</strong>
                      <small>Powered by Amazon Bedrock Architecture</small>
                    </div>
                  </div>

                  <div className="toolbar-actions">
                    {messages.length > 0 && (
                      <button type="button" onClick={clearChat} className="mini-btn">
                        🗑 CLEAR
                      </button>
                    )}
                    <span className="status-pill">ONLINE</span>
                  </div>
                </div>

                {/* Chat Log */}
                <div className="chat-box" ref={chatBoxRef} aria-live="polite">
                  {messages.length === 0 && (
                    <div className="empty-chat-state">
                      <div className="empty-icon">🤖</div>
                      <h3>Ready to assist you!</h3>
                      <p>
                        Click any prompt chip below to explore Amazon Bedrock capabilities, or ask any campus IT troubleshooting question.
                      </p>
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div className={`chat-bubble ${m.role}`} key={i}>
                      <div className="bubble-header">
                        <span className="bubble-role">
                          {m.role === 'user' ? '👤 YOU' : '✦ AMAZON BEDROCK'}
                        </span>
                        {m.role === 'assistant' && (
                          <button
                            type="button"
                            className="bubble-copy"
                            onClick={() => copyText(m.content, i)}
                          >
                            {copiedIndex === i ? '✓ COPIED' : '📋 COPY'}
                          </button>
                        )}
                      </div>

                      <div className="bubble-content">
                        {m.role === 'user' ? (
                          <p>{m.content}</p>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  ))}

                  {busy && (
                    <div className="chat-bubble assistant typing">
                      <div className="bubble-header">
                        <span className="bubble-role">✦ AMAZON BEDROCK</span>
                      </div>
                      <div className="typing-animation">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestion Chips */}
                <div className="chips-tray">
                  <button
                    type="button"
                    className="chip chip-yellow"
                    onClick={() => sendMessage('What is Amazon Bedrock and how does it work?')}
                  >
                    💡 What is Bedrock?
                  </button>
                  <button
                    type="button"
                    className="chip chip-mint"
                    onClick={() => sendMessage('Which foundation models are available in Amazon Bedrock?')}
                  >
                    🤖 Foundation Models
                  </button>
                  <button
                    type="button"
                    className="chip chip-cyan"
                    onClick={() => sendMessage('How do Bedrock Knowledge Bases and RAG work?')}
                  >
                    📚 Knowledge Bases (RAG)
                  </button>
                  <button
                    type="button"
                    className="chip chip-orange"
                    onClick={() => sendMessage('What are Amazon Bedrock Agents and how do they execute actions?')}
                  >
                    ⚡ Bedrock Agents
                  </button>
                  <button
                    type="button"
                    className="chip chip-pink"
                    onClick={() => sendMessage('How do Guardrails for Amazon Bedrock enforce AI safety?')}
                  >
                    🛡️ Guardrails &amp; Safety
                  </button>
                  <button
                    type="button"
                    className="chip chip-purple"
                    onClick={() => sendMessage('My campus Wi-Fi keeps disconnecting. What should I check?')}
                  >
                    📶 Campus Wi-Fi Help
                  </button>
                </div>

                {/* Input Bar */}
                <form onSubmit={askAssistant} className="chat-input-bar">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about AWS Bedrock capabilities or campus IT support…"
                    aria-label="Ask about campus IT or Bedrock"
                    disabled={busy}
                  />
                  <button type="submit" disabled={busy || !question.trim()} className="neo-btn btn-send">
                    {busy ? '…' : 'SEND ↵'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {stage === 'failed' && (
            <div className="stage-content">
              <div className="failed-card">
                <div className="failed-icon">✕</div>
                <div className="section-header">
                  <span className="stage-chip chip-pink">SCAN FAILED</span>
                  <h2>Presence Not Verified</h2>
                  <p className="failed-msg">
                    {result?.message || error || 'The facial presence check could not be completed.'}
                  </p>
                </div>

                {result && (
                  <div className="metrics-grid">
                    <div className="metric-box">
                      <span className="metric-label">DETECTED CONFIDENCE</span>
                      <strong className="metric-val text-pink">{result.confidence}%</strong>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">REQUIRED THRESHOLD</span>
                      <strong className="metric-val">{result.threshold}%</strong>
                    </div>
                  </div>
                )}

                <button type="button" className="neo-btn btn-primary" onClick={reset}>
                  <span>TRY AGAIN</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
          )}

          {error && <div className="neo-alert alert-error">{error}</div>}
        </div>
        </>
        )}
      </main>

      <footer className="neo-footer">
        <div className="footer-tag">AWS SMART ACCESS // ARCHITECTURE</div>
        <div className="footer-links">
          <span>AMAZON REKOGNITION</span>
          <span>•</span>
          <span>AMAZON BEDROCK</span>
          <span>•</span>
          <span>REACT + VITE</span>
          <span>•</span>
          <span>EXPRESS API</span>
        </div>
      </footer>
    </div>
  );
}

function FaceCapture({ busy, onCapture, onError }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false
      })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      })
      .catch(() =>
        onError('Camera access was blocked. Please allow webcam permissions in your browser and reload.')
      );
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.85));
  }

  return (
    <div className="viewfinder-container">
      <div className="camera-frame">
        <div className="corner-bracket top-left"></div>
        <div className="corner-bracket top-right"></div>
        <div className="corner-bracket bottom-left"></div>
        <div className="corner-bracket bottom-right"></div>

        <div className="camera-badge">
          <span className="rec-dot"></span> LIVE SCANNER [640×480]
        </div>

        <div className="scan-crosshair"></div>

        <video ref={videoRef} autoPlay playsInline muted />
      </div>

      <div className="camera-prompt">
        <span className="prompt-emoji">😊</span>
        <span>Challenge: Look directly at the camera with eyes open and <strong>smile</strong>!</span>
      </div>

      <button
        type="button"
        onClick={capture}
        disabled={!ready || busy}
        className="neo-btn btn-primary btn-camera"
      >
        <span>{busy ? 'ANALYZING FACIAL DETAIL…' : ready ? '📸 SMILE & VERIFY PRESENCE' : 'INITIALIZING SENSOR…'}</span>
        <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}
