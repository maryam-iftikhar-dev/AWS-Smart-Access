import { useEffect, useRef, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Classroom-only demo credentials. Not suitable for production.
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'Demo123!';

export default function App() {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');

  function startVerification(event) {
    event.preventDefault();
    setError('');
    if (email.trim() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('Demo login failed. Use demo@example.com and Demo123!');
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
      if (!response.ok) throw new Error(data.error || 'Unable to verify.');
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
    event.preventDefault();
    const text = question.trim();
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

  function reset() {
    setStage('login');
    setResult(null);
    setError('');
    setMessages([]);
    setQuestion('');
    setPassword('');
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="brandmark">SA</div>
        <div><strong>Smart Access</strong><span>Campus IT • AI-powered assistance</span></div>
        <div className="aws-label">POWERED BY AWS</div>
      </header>

      <section className="hero">
        <p className="eyebrow">CLOUD COMPUTING • LIVE DEMO</p>
        <h1>Secure access.<br /><em>Smarter campus support.</em></h1>
        <p className="intro">A campus IT helpdesk demo combining Amazon Rekognition face detection with an Amazon Bedrock conversational assistant.</p>
      </section>

      <section className="panel">
        {stage === 'login' && <>
          <div className="step">01 / DEMO LOGIN</div>
          <h2>Welcome to Campus IT</h2>
          <p className="muted">Sign in with the demo credentials, then complete live-person verification.</p>
          <form onSubmit={startVerification}>
            <label htmlFor="email">Demo email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <label htmlFor="password">Demo password</label>
            <input id="password" type="password" placeholder="Enter demo password" value={password}
              onChange={e => setPassword(e.target.value)} required />
            <button disabled={busy}>{busy ? 'Starting…' : 'Sign in and verify'} <span>→</span></button>
          </form>
          <div className="demo-creds"><strong>Presentation credentials</strong><br />demo@example.com &nbsp; / &nbsp; Demo123!</div>
          <p className="fineprint">These hardcoded credentials are for the classroom demo only. They do not represent real authentication.</p>
        </>}

        {stage === 'liveness' && <>
          <div className="step">02 / AMAZON REKOGNITION</div>
          <h2>Verify you are present</h2>
          <p className="muted">Allow camera access, face the camera in good light, then <strong>smile</strong> and click Capture. Amazon Rekognition DetectFaces checks for one face, a smile and open eyes.</p>
          <FaceCapture busy={busy} onCapture={verifySnapshot} onError={setError} />
          {busy && <p className="muted">Checking verification result…</p>}
          <button className="secondary" onClick={reset}>Cancel and return</button>
        </>}

        {stage === 'dashboard' && <>
          <div className="success-icon">✓</div>
          <div className="step">03 / ACCESS GRANTED</div>
          <h2>Welcome to Campus IT</h2>
          <p className="muted">Presence check passed. Now try the Bedrock-powered campus IT assistant.</p>
          <div className="metrics">
            <div><span>Face confidence</span><strong>{result?.confidence}%</strong></div>
            <div><span>Session status</span><strong>{result?.status}</strong></div>
          </div>
          <div className="assistant-card">
            <div className="assistant-head"><span className="spark">✦</span><div><strong>Campus IT Assistant</strong><small>Powered by Amazon Bedrock</small></div><span className="coming">LIVE DEMO</span></div>
            <p>Ask about campus Wi-Fi, LMS login troubleshooting, or setting up an AWS cloud-computing lab.</p>
            <div className="chat-log" aria-live="polite">
              {messages.length === 0 && <div className="chat-empty">Try: “My campus Wi-Fi keeps disconnecting. What should I check?”</div>}
              {messages.map((m, i) => <div className={`chat-message ${m.role}`} key={i}><strong>{m.role === 'user' ? 'You' : 'Assistant'}</strong><p>{m.content}</p></div>)}
              {busy && <div className="chat-empty">Assistant is thinking…</div>}
            </div>
            <form className="chat-form" onSubmit={askAssistant}>
              <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a campus IT question…" aria-label="Ask a campus IT question" />
              <button disabled={busy || !question.trim()}>{busy ? '…' : 'Ask'} <span>→</span></button>
            </form>
          </div>
          <button onClick={reset}>Sign out of demo <span>→</span></button>
        </>}

        {stage === 'failed' && <>
          <div className="step">VERIFICATION RESULT</div>
          <h2>Verification not completed</h2>
          <p className="muted">{result?.message || error || 'The presence check could not be completed.'}</p>
          {result && <div className="metrics"><div><span>Confidence</span><strong>{result.confidence}%</strong></div><div><span>Demo threshold</span><strong>{result.threshold}%</strong></div></div>}
          <button onClick={reset}>Try again <span>→</span></button>
        </>}

        {error && <div className="error" role="alert">{error}</div>}
      </section>

      <footer><span>AMAZON REKOGNITION</span><i /> <span>AMAZON BEDROCK</span><i /> <span>REACT + AWS SDK</span></footer>
    </main>
  );
}

function FaceCapture({ busy, onCapture, onError }) {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream;
    navigator.mediaDevices?.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => setReady(true);
        }
      })
      .catch(() => onError('Camera access was blocked. Allow the camera in your browser and try again.'));
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  function capture() {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.85));
  }

  return (
    <div className="camera">
      <video ref={videoRef} autoPlay playsInline muted />
      <button type="button" onClick={capture} disabled={!ready || busy}>
        {busy ? 'Checking…' : ready ? 'Smile and capture' : 'Starting camera…'} <span>→</span>
      </button>
    </div>
  );
}