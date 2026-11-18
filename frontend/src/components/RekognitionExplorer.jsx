import { useState } from 'react';

export default function RekognitionExplorer() {
  // Simulator Controls
  const [simSmile, setSimSmile] = useState(true);
  const [simEyesOpen, setSimEyesOpen] = useState(true);
  const [simMultipleFaces, setSimMultipleFaces] = useState(false);
  const [simSunglasses, setSimSunglasses] = useState(false);
  const [simPhotoSpoof, setSimPhotoSpoof] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Computed Evaluation
  const faceCount = simMultipleFaces ? 2 : 1;
  const isSmileOk = simSmile && !simPhotoSpoof;
  const isEyesOk = simEyesOpen && !simSunglasses && !simPhotoSpoof;
  const isLivenessOk = !simPhotoSpoof;
  const isSoloOk = !simMultipleFaces;
  const isGlassesOk = !simSunglasses;

  const isPassed = isSmileOk && isEyesOk && isLivenessOk && isSoloOk && isGlassesOk;
  const confidence = isPassed ? 99.4 : simPhotoSpoof ? 31.5 : simMultipleFaces ? 74.0 : 82.3;

  // Exact failure reason
  let failReason = '';
  if (simPhotoSpoof) {
    failReason = 'Liveness check failed: 2D static printed photo detected. Genuine 3D face required.';
  } else if (simMultipleFaces) {
    failReason = 'Multiple faces detected in frame (2 faces). Single-person rule violated.';
  } else if (simSunglasses) {
    failReason = 'Eyes obstructed by sunglasses. Both pupils and eye landmarks must be clearly visible.';
  } else if (!simEyesOpen) {
    failReason = 'Eyes closed. Presence verification requires open eyes looking at the camera.';
  } else if (!simSmile) {
    failReason = 'Smile not detected. Presence challenge requires a natural facial smile.';
  }

  return (
    <div className="explorer-container">
      {/* Hero Header */}
      <div className="explorer-hero-neo">
        <div className="hero-top-row">
          <span className="neo-pill pill-yellow">⚡ AWS COMPUTER VISION LAB</span>
          <span className="neo-pill pill-green">DEEP CONVOLUTIONAL NETWORKS</span>
        </div>
        <h1 className="hero-title">How Amazon Rekognition Works</h1>
        <p className="hero-subtitle">
          Computer vision that detects, measures, and authenticates human faces in 50 milliseconds. Test landmarks, presence challenges, and anti-spoofing in the live simulator below!
        </p>

        {/* 4 Big Stat Metrics */}
        <div className="hero-stats-grid">
          <div className="stat-card">
            <span className="stat-num">100+</span>
            <span className="stat-label">FACIAL LANDMARKS</span>
            <small>Pupils, nose, lips &amp; jaw</small>
          </div>
          <div className="stat-card">
            <span className="stat-num">99.4%</span>
            <span className="stat-label">CNN ACCURACY</span>
            <small>Trained on billions of faces</small>
          </div>
          <div className="stat-card">
            <span className="stat-num">&lt; 50ms</span>
            <span className="stat-label">ANALYSIS SPEED</span>
            <small>Cloud inference in real time</small>
          </div>
          <div className="stat-card">
            <span className="stat-num">3D</span>
            <span className="stat-label">ANTI-SPOOF LIVENESS</span>
            <small>Rejects printed photos &amp; screens</small>
          </div>
        </div>
      </div>

      {/* THE LIVE SIMULATOR (HERO PLAYGROUND) */}
      <div className="neo-card simulator-master-card">
        <div className="sim-title-bar">
          <div>
            <span className="stage-chip chip-green">LIVE LAB PLAYGROUND</span>
            <h2 className="sim-heading">Interactive Facial Analysis Simulator</h2>
          </div>
          <span className="live-indicator">● LIVE SIMULATION ENGINE</span>
        </div>

        {/* Big Verdict Banner */}
        <div className={`verdict-banner ${isPassed ? 'verdict-pass' : 'verdict-fail'}`}>
          <div className="verdict-icon">
            {isPassed ? '✅' : '⛔'}
          </div>
          <div className="verdict-info">
            <div className="verdict-tag-row">
              <span className="verdict-status">
                {isPassed ? 'ACCESS GRANTED • PASSED' : 'ACCESS DENIED • REJECTED'}
              </span>
              <span className="verdict-conf">
                CONFIDENCE: {confidence}%
              </span>
            </div>
            <p className="verdict-desc">
              {isPassed
                ? 'All 5 biometric security policies satisfied: Single live student face detected with smile and open eyes.'
                : failReason}
            </p>
          </div>
        </div>

        {/* Simulator Main Stage */}
        <div className="sim-stage-grid">
          {/* Left: Animated Cyberpunk HUD Canvas */}
          <div className="hud-canvas-wrap">
            <div className="hud-header-bar">
              <span className="hud-dot">● REC</span>
              <span className="hud-title">AWS REKOGNITION • DETECTFACES STREAM</span>
              <span className="hud-coords">RES: 1080P</span>
            </div>

            <div className={`hud-viewscreen ${simPhotoSpoof ? 'is-spoof' : ''}`}>
              {/* Laser Scanning Line */}
              <div className="hud-laser"></div>

              {/* Corner Reticle Brackets */}
              <div className="corner-bracket top-left"></div>
              <div className="corner-bracket top-right"></div>
              <div className="corner-bracket bottom-left"></div>
              <div className="corner-bracket bottom-right"></div>

              {/* Primary Face Target Bounding Box */}
              <div className={`face-target-box ${isPassed ? 'target-pass' : 'target-fail'}`}>
                <div className="target-tag">
                  FACE #1 &bull; {confidence}% CONF
                </div>

                {/* Dynamic SVG Face Visualization */}
                <svg className="face-vector" viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Head Outline / Jawline */}
                  <ellipse cx="100" cy="120" rx="70" ry="90" stroke={isPassed ? '#00e599' : '#ff4f81'} strokeWidth="3" strokeDasharray="6 3" />

                  {/* Eyebrows */}
                  <path d={simSmile ? "M 48 76 Q 66 66 84 76" : "M 48 78 Q 66 75 84 78"} stroke="#ffe600" strokeWidth="4" strokeLinecap="round" />
                  <path d={simSmile ? "M 116 76 Q 134 66 152 76" : "M 116 78 Q 134 75 152 78"} stroke="#ffe600" strokeWidth="4" strokeLinecap="round" />

                  {/* Eyes */}
                  {!simSunglasses ? (
                    <>
                      {simEyesOpen ? (
                        <>
                          {/* Left Eye Open */}
                          <ellipse cx="66" cy="94" rx="14" ry="9" stroke="#ffe600" strokeWidth="2.5" fill="#121824" />
                          <circle cx="66" cy="94" r="5" fill="#00e599" />
                          <circle cx="68" cy="92" r="1.5" fill="#ffffff" />
                          {/* Right Eye Open */}
                          <ellipse cx="134" cy="94" rx="14" ry="9" stroke="#ffe600" strokeWidth="2.5" fill="#121824" />
                          <circle cx="134" cy="94" r="5" fill="#00e599" />
                          <circle cx="136" cy="92" r="1.5" fill="#ffffff" />
                        </>
                      ) : (
                        <>
                          {/* Eyes Closed */}
                          <path d="M 52 95 Q 66 102 80 95" stroke="#ff4f81" strokeWidth="3.5" strokeLinecap="round" />
                          <path d="M 120 95 Q 134 102 148 95" stroke="#ff4f81" strokeWidth="3.5" strokeLinecap="round" />
                        </>
                      )}
                    </>
                  ) : (
                    /* Cool Dark Sunglasses */
                    <g className="sunglasses-graphic">
                      <rect x="42" y="82" width="50" height="26" rx="6" fill="#111" stroke="#ffe600" strokeWidth="2.5" />
                      <rect x="108" y="82" width="50" height="26" rx="6" fill="#111" stroke="#ffe600" strokeWidth="2.5" />
                      <line x1="92" y1="92" x2="108" y2="92" stroke="#ffe600" strokeWidth="3" />
                      <line x1="45" y1="88" x2="88" y2="102" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                      <line x1="112" y1="88" x2="154" y2="102" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    </g>
                  )}

                  {/* Nose Bridge and Tip */}
                  <path d="M 100 88 L 100 125 L 92 132 L 108 132" stroke="#ffe600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Mouth */}
                  {simSmile ? (
                    <g>
                      {/* Big Smiling Mouth with teeth */}
                      <path d="M 68 155 Q 100 195 132 155 Z" fill="#ffffff" stroke="#00e599" strokeWidth="3" />
                      <path d="M 68 155 Q 100 162 132 155" stroke="#00e599" strokeWidth="2" />
                    </g>
                  ) : (
                    /* Neutral Flat Mouth */
                    <line x1="72" y1="162" x2="128" y2="162" stroke="#8892b0" strokeWidth="3.5" strokeLinecap="round" />
                  )}

                  {/* Facial Landmark Points */}
                  <circle cx="66" cy="94" r="3" fill="#ffe600" />
                  <circle cx="134" cy="94" r="3" fill="#ffe600" />
                  <circle cx="100" cy="132" r="3" fill="#ffe600" />
                  <circle cx="68" cy="155" r="3" fill="#ffe600" />
                  <circle cx="132" cy="155" r="3" fill="#ffe600" />
                  <circle cx="100" cy="180" r="3" fill="#ffe600" />
                  <circle cx="100" cy="208" r="3" fill="#00e599" />
                </svg>

                {/* Status Badges Overlay */}
                <div className="target-bottom-badges">
                  <span className={`hud-mini-chip ${simSmile ? 'chip-ok' : 'chip-bad'}`}>
                    SMILE: {simSmile ? '99.4%' : '4.1%'}
                  </span>
                  <span className={`hud-mini-chip ${simEyesOpen ? 'chip-ok' : 'chip-bad'}`}>
                    EYES: {simEyesOpen ? '98.2%' : '12%'}
                  </span>
                </div>
              </div>

              {/* Second Face Alert (Intruder) */}
              {simMultipleFaces && (
                <div className="intruder-box">
                  <span className="intruder-tag">⚠️ FACE #2 [TAILGATING]</span>
                  <div className="intruder-avatar">👤</div>
                </div>
              )}

              {/* Spoof Alert Watermark */}
              {simPhotoSpoof && (
                <div className="spoof-overlay-banner">
                  <span>⚠️ 2D PAPER PHOTO DETECTED &bull; LIVENESS FAILED</span>
                </div>
              )}

              {/* Live HUD Footer Stats */}
              <div className="hud-footer">
                <span>FPS: 60.0</span>
                <span>MODEL: Rekognition-Vision-V4</span>
                <span>LANDMARKS: 104 PTS</span>
              </div>
            </div>
          </div>

          {/* Right: Chunky Interactive Controls & Live Checklist */}
          <div className="sim-controls-column">
            <h3 className="controls-heading">Biometric Parameters</h3>
            <p className="controls-sub">Click any toggle to test how Rekognition reacts to real-world edge cases:</p>

            <div className="toggle-btn-list">
              {/* Smile Toggle */}
              <button
                type="button"
                className={`chunky-toggle-btn ${simSmile ? 'active-green' : 'inactive'}`}
                onClick={() => setSimSmile(!simSmile)}
              >
                <div className="btn-left">
                  <span className="btn-emoji">{simSmile ? '😊' : '😐'}</span>
                  <div>
                    <strong>Facial Smile Expression</strong>
                    <small>{simSmile ? 'Positive smile detected' : 'Neutral / unsmiling face'}</small>
                  </div>
                </div>
                <span className="toggle-state-badge">
                  {simSmile ? 'PASS [99.4%]' : 'FAIL [4.1%]'}
                </span>
              </button>

              {/* Eyes Open Toggle */}
              <button
                type="button"
                className={`chunky-toggle-btn ${simEyesOpen ? 'active-green' : 'inactive'}`}
                onClick={() => setSimEyesOpen(!simEyesOpen)}
              >
                <div className="btn-left">
                  <span className="btn-emoji">{simEyesOpen ? '👀' : '🙈'}</span>
                  <div>
                    <strong>Eyes Open &amp; Tracking</strong>
                    <small>{simEyesOpen ? 'Both pupils open & visible' : 'Eyes shut or blinking'}</small>
                  </div>
                </div>
                <span className="toggle-state-badge">
                  {simEyesOpen ? 'PASS [98.2%]' : 'FAIL [12%]'}
                </span>
              </button>

              {/* Second Person Toggle */}
              <button
                type="button"
                className={`chunky-toggle-btn ${!simMultipleFaces ? 'active-green' : 'active-pink'}`}
                onClick={() => setSimMultipleFaces(!simMultipleFaces)}
              >
                <div className="btn-left">
                  <span className="btn-emoji">{simMultipleFaces ? '👥' : '👤'}</span>
                  <div>
                    <strong>Single Person in Camera</strong>
                    <small>{simMultipleFaces ? '2 people in frame (Tailgating)' : '1 single student detected'}</small>
                  </div>
                </div>
                <span className="toggle-state-badge">
                  {simMultipleFaces ? 'FAIL [2 FACES]' : 'PASS [SOLO]'}
                </span>
              </button>

              {/* Sunglasses Toggle */}
              <button
                type="button"
                className={`chunky-toggle-btn ${!simSunglasses ? 'active-green' : 'active-pink'}`}
                onClick={() => setSimSunglasses(!simSunglasses)}
              >
                <div className="btn-left">
                  <span className="btn-emoji">{simSunglasses ? '🕶️' : '👓'}</span>
                  <div>
                    <strong>Eyewear &amp; Obstructions</strong>
                    <small>{simSunglasses ? 'Dark sunglasses blocking eyes' : 'Face completely clear'}</small>
                  </div>
                </div>
                <span className="toggle-state-badge">
                  {simSunglasses ? 'FAIL [BLOCKED]' : 'PASS [CLEAR]'}
                </span>
              </button>

              {/* Liveness Spoof Toggle */}
              <button
                type="button"
                className={`chunky-toggle-btn ${!simPhotoSpoof ? 'active-green' : 'active-pink'}`}
                onClick={() => setSimPhotoSpoof(!simPhotoSpoof)}
              >
                <div className="btn-left">
                  <span className="btn-emoji">{simPhotoSpoof ? '🖼️' : '🛡️'}</span>
                  <div>
                    <strong>Anti-Spoof Liveness Check</strong>
                    <small>{simPhotoSpoof ? '2D printed paper photo' : 'Genuine live 3D human'}</small>
                  </div>
                </div>
                <span className="toggle-state-badge">
                  {simPhotoSpoof ? 'SPOOF DETECTED' : 'GENUINE LIVE'}
                </span>
              </button>
            </div>

            {/* Live Security Checklist */}
            <div className="security-checklist-card">
              <h4>Security Rule Validation:</h4>
              <div className="check-items-grid">
                <div className={`check-pill ${isSoloOk ? 'pill-ok' : 'pill-fail'}`}>
                  {isSoloOk ? '✓' : '✕'} Single Person (1 face)
                </div>
                <div className={`check-pill ${isEyesOk ? 'pill-ok' : 'pill-fail'}`}>
                  {isEyesOk ? '✓' : '✕'} Eyes Open &amp; Visible
                </div>
                <div className={`check-pill ${isSmileOk ? 'pill-ok' : 'pill-fail'}`}>
                  {isSmileOk ? '✓' : '✕'} Smile Detected (&gt;90%)
                </div>
                <div className={`check-pill ${isLivenessOk ? 'pill-ok' : 'pill-fail'}`}>
                  {isLivenessOk ? '✓' : '✕'} 3D Liveness Verified
                </div>
              </div>
            </div>

            {/* Collapsible Technical JSON Inspection */}
            <div className="json-collapsible-neo">
              <button
                type="button"
                className="toggle-json-btn"
                onClick={() => setShowJson(!showJson)}
              >
                <span>{showJson ? '▼ Hide' : '▶ Show'} AWS Rekognition JSON Response</span>
                <span className="json-cmd-tag">DetectFacesCommand</span>
              </button>

              {showJson && (
                <pre className="json-pre-block">
{JSON.stringify({
  FaceDetails: [
    {
      BoundingBox: { Width: 0.44, Height: 0.58, Left: 0.28, Top: 0.15 },
      Confidence: confidence,
      Smile: { Value: isSmileOk, Confidence: isSmileOk ? 99.4 : 4.1 },
      EyesOpen: { Value: isEyesOk, Confidence: isEyesOk ? 98.2 : 12.0 },
      Eyeglasses: { Value: false, Confidence: 99.1 },
      Sunglasses: { Value: simSunglasses, Confidence: simSunglasses ? 99.8 : 2.1 },
      Pose: { Roll: -0.8, Yaw: 1.2, Pitch: 2.1 }
    },
    ...(simMultipleFaces ? [{ BoundingBox: { Width: 0.25, Height: 0.35, Left: 0.72, Top: 0.45 }, Confidence: 84.1 }] : [])
  ],
  Decision: isPassed ? "ACCESS_GRANTED" : "ACCESS_DENIED",
  Reason: failReason || "ALL_CHECKS_PASSED"
}, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 CORE REKOGNITION SUPERPOWERS (BIG VISUAL CARDS, MINIMAL TEXT) */}
      <div className="section-title-wrap">
        <span className="stage-chip chip-yellow">CAPABILITIES</span>
        <h2 className="section-main-heading">4 Core Computer Vision Superpowers</h2>
      </div>

      <div className="superpower-grid">
        <div className="power-card card-yellow">
          <div className="power-icon">📐</div>
          <span className="power-step">01. DETECTION</span>
          <h3>Instant Bounding Box</h3>
          <p>Locates every human face in milliseconds, returning coordinate boxes ($x, y, w, h$) regardless of skin tone, lighting, or tilt.</p>
        </div>

        <div className="power-card card-cyan">
          <div className="power-icon">🎯</div>
          <span className="power-step">02. GEOMETRY</span>
          <h3>100+ Facial Landmarks</h3>
          <p>Pins 3D coordinates for pupils, nose bridge, nostrils, lip borders, and jaw contours to map face geometry.</p>
        </div>

        <div className="power-card card-green">
          <div className="power-icon">😊</div>
          <span className="power-step">03. EXPRESSION</span>
          <h3>Emotion &amp; Mood Analysis</h3>
          <p>Deep neural networks evaluate emotional states (happy, calm, surprised) and calculates high-confidence smile percentages.</p>
        </div>

        <div className="power-card card-pink">
          <div className="power-icon">🛡️</div>
          <span className="power-step">04. ANTI-SPOOF</span>
          <h3>3D Face Liveness</h3>
          <p>Deters presentation attacks by verifying skin texture depth and active reflection, rejecting printed photos, screens, and masks.</p>
        </div>
      </div>

      {/* 3-STEP REAL-WORLD ARCHITECTURE WORKFLOW */}
      <div className="neo-card workflow-card">
        <div className="sim-title-bar">
          <div>
            <span className="stage-chip chip-cyan">HOW THIS DEMO RUNS</span>
            <h2 className="sim-heading">The 3-Step Campus Verification Pipeline</h2>
          </div>
        </div>

        <div className="workflow-steps-neo">
          <div
            className={`workflow-step-box ${activeStep === 1 ? 'selected' : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <span className="wf-num">STEP 1</span>
            <div className="wf-icon">📸</div>
            <strong>Webcam Snapshot</strong>
            <p>HTML5 canvas grabs a 640x480 frame from your browser camera.</p>
          </div>

          <div className="wf-arrow">➔</div>

          <div
            className={`workflow-step-box ${activeStep === 2 ? 'selected' : ''}`}
            onClick={() => setActiveStep(2)}
          >
            <span className="wf-num">STEP 2</span>
            <div className="wf-icon">⚡</div>
            <strong>AWS Rekognition</strong>
            <p>Node.js backend sends signed SigV4 DetectFaces request to us-east-1.</p>
          </div>

          <div className="wf-arrow">➔</div>

          <div
            className={`workflow-step-box ${activeStep === 3 ? 'selected' : ''}`}
            onClick={() => setActiveStep(3)}
          >
            <span className="wf-num">STEP 3</span>
            <div className="wf-icon">🔓</div>
            <strong>Policy Access Granted</strong>
            <p>Confidence &ge; 90% + smile verified &rarr; Campus IT Chatbot unlocks!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
