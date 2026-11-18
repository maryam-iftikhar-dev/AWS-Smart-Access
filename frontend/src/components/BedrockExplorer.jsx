import { useState } from 'react';

export default function BedrockExplorer() {
  const [activeTab, setActiveTab] = useState('rag'); // 'rag' | 'agents' | 'guardrails' | 'models'

  // RAG Interactive Simulator State
  const [ragScenario, setRagScenario] = useState('wifi');
  const ragScenarios = {
    wifi: {
      query: 'Why does my campus Wi-Fi keep disconnecting in the dorms?',
      docName: 'Campus_Network_Standard_2026.pdf',
      docPage: 'Page 4, Section 2.1 (Wi-Fi 802.1X PEAP)',
      score: '97.8% Semantic Match',
      chunks: 'Found 3 relevant paragraphs in S3 vector database.',
      answer: 'Campus Wi-Fi requires WPA2/WPA3 Enterprise with 802.1X PEAP authentication. Ensure your device is configured to trust the "Campus-Root-CA" certificate and disable randomized MAC addresses.'
    },
    quota: {
      query: 'How much AWS cloud budget do students receive for labs?',
      docName: 'Student_Cloud_Handbook_v3.pdf',
      docPage: 'Page 12, Section 4 (Learner Lab Quotas)',
      score: '99.1% Semantic Match',
      chunks: 'Found 2 relevant paragraphs in S3 vector database.',
      answer: 'Each enrolled student receives a $100.00 AWS Academy Learner Lab credit per semester. Credits automatically refresh upon enrolling in subsequent cloud computing modules.'
    },
    password: {
      query: 'Where do I submit my cloud computing final project?',
      docName: 'LMS_Submission_Guidelines.pdf',
      docPage: 'Page 8, Section 3.2 (GitHub & S3 Submission)',
      score: '96.4% Semantic Match',
      chunks: 'Found 4 relevant paragraphs in S3 vector database.',
      answer: 'Projects must be submitted via the University Canvas LMS portal under "Assignments > Cloud Capstone". Ensure your GitHub repository is public or your IAM role grants grading access.'
    }
  };

  // Agent Interactive Simulator State
  const [agentScenario, setAgentScenario] = useState('provision');
  const agentScenarios = {
    provision: {
      instruction: 'Check my student balance and spin up an EC2 cloud lab instance.',
      thought: '1. First, call DynamoDB to check if student "s5452233" has remaining budget. If budget > $0, invoke EC2 provisioning Lambda.',
      action: 'lambda:InvokeFunction(ProvisionStudentLabInstance, { studentId: "s5452233", instanceType: "t3.medium" })',
      observation: '{ status: "SUCCESS", instanceId: "i-08a9f21b", publicIp: "54.210.82.14", remainingCredits: "$85.00" }',
      result: 'Verified your lab balance is $85.00. Launched a t3.medium cloud lab instance at IP 54.210.82.14 in us-east-1!'
    },
    resetMac: {
      instruction: 'My laptop MAC address is blocked on the campus network. Please unblock it.',
      thought: '1. Query Campus RADIUS server for MAC 00:1A:2B:3C:4D:5E. 2. Verify student enrollment status. 3. Call NetworkAPI to clear temporary quarantine.',
      action: 'lambda:InvokeFunction(ClearMacQuarantine, { mac: "00:1A:2B:3C:4D:5E", studentId: "s5452233" })',
      observation: '{ quarantineRemoved: true, vlan: "STUDENT_SECURE", status: "ONLINE" }',
      result: 'Quarantine cleared for MAC 00:1A:2B:3C:4D:5E. Your laptop has been re-authorized on the STUDENT_SECURE network!'
    },
    quotaBoost: {
      instruction: 'Request a $25 GPU quota extension for my deep learning project.',
      thought: '1. Check student attendance and active course enrollment. 2. Verify capstone project prerequisite. 3. Invoke IAM credit approval Lambda.',
      action: 'lambda:InvokeFunction(RequestQuotaBoost, { studentId: "s5452233", amount: 25.00, course: "CS-480" })',
      observation: '{ approved: true, newBalance: "$110.00", expires: "2026-12-15" }',
      result: 'Quota extension of $25.00 approved! Your new cloud lab balance is $110.00 valid through semester end.'
    }
  };

  // Guardrails Interactive Simulator State
  const [guardrailScenario, setGuardrailScenario] = useState('safe');
  const guardrailScenarios = {
    safe: {
      input: 'How do I install the AWS CLI and configure my credentials on Windows?',
      status: 'ALLOWED',
      statusClass: 'status-pass',
      badge: 'CLEAN PROMPT • ALLOWED',
      l1: 'PASSED (0% Toxicity)',
      l2: 'PASSED (Permitted Topic)',
      l3: 'PASSED (No PII Detected)',
      l4: 'PASSED (Grounded)',
      output: 'Download the AWS CLI MSI installer for Windows, open PowerShell, and run "aws configure" with your Learner Lab credentials.'
    },
    harmful: {
      input: 'How do I launch a distributed denial of service attack on the campus LMS?',
      status: 'BLOCKED',
      statusClass: 'status-block',
      badge: 'BLOCKED • DENIED TOPICS',
      l1: 'BLOCKED (Harmful cyber exploitation policy triggered)',
      l2: 'BLOCKED (Restricted attack tools & security circumvention)',
      l3: 'PASSED (No PII)',
      l4: 'SKIPPED (Blocked at Input)',
      output: 'I cannot provide instructions for launching attacks or compromising campus systems. Refer to the University Acceptable Use Policy.'
    },
    pii: {
      input: 'My student SSN is 123-45-6789 and credit card is 4111-2222-3333-4444. Can you refund my lab fee?',
      status: 'REDACTED',
      statusClass: 'status-warn',
      badge: 'PII MASKED • ANONYMIZED',
      l1: 'PASSED (Clean text)',
      l2: 'PASSED (Permitted Topic)',
      l3: 'TRIGGERED (2 Sensitive PII Entities Masked)',
      l4: 'PASSED (Grounded)',
      output: 'Sanitized Prompt: "My student SSN is [REDACTED_SSN] and card is [REDACTED_CARD]..." — To request a lab refund, visit student accounts at campus hall.'
    },
    hallucination: {
      input: 'Invent a fake campus policy that says all final exams are canceled tomorrow.',
      status: 'BLOCKED',
      statusClass: 'status-block',
      badge: 'BLOCKED • ANTI-HALLUCINATION',
      l1: 'PASSED (No toxicity)',
      l2: 'PASSED (Normal query)',
      l3: 'PASSED (No PII)',
      l4: 'BLOCKED (Claim unsupported by S3 Knowledge Base documents)',
      output: 'Blocked by Contextual Grounding: Claims regarding exam cancellations cannot be grounded in official university source records.'
    }
  };

  return (
    <div className="explorer-container">
      {/* Hero Header */}
      <div className="explorer-hero-neo">
        <div className="hero-top-row">
          <span className="neo-pill pill-yellow">🧠 AWS GENERATIVE AI ARCHITECTURE</span>
          <span className="neo-pill pill-green">ENTERPRISE FOUNDATION PLATFORM</span>
        </div>
        <h1 className="hero-title">Inside Amazon Bedrock</h1>
        <p className="hero-subtitle">
          Amazon Bedrock gives foundation models enterprise superpowers. Explore how Knowledge Bases stop hallucinations, Agents take real actions, and Guardrails enforce safety!
        </p>
      </div>

      {/* Chunky Main Tab Switcher */}
      <div className="bedrock-nav-pills">
        <button
          type="button"
          className={`bedrock-pill-tab ${activeTab === 'rag' ? 'active' : ''}`}
          onClick={() => setActiveTab('rag')}
        >
          📚 1. Knowledge Bases &amp; RAG
        </button>
        <button
          type="button"
          className={`bedrock-pill-tab ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          ⚡ 2. Autonomous Agents
        </button>
        <button
          type="button"
          className={`bedrock-pill-tab ${activeTab === 'guardrails' ? 'active' : ''}`}
          onClick={() => setActiveTab('guardrails')}
        >
          🛡️ 3. Bedrock Guardrails
        </button>
        <button
          type="button"
          className={`bedrock-pill-tab ${activeTab === 'models' ? 'active' : ''}`}
          onClick={() => setActiveTab('models')}
        >
          🤖 4. Model Roster
        </button>
      </div>

      {/* =========================================================================
          TAB 1: KNOWLEDGE BASES & RAG (NO MORE HALLUCINATIONS)
          ========================================================================= */}
      {activeTab === 'rag' && (
        <div className="bedrock-tab-pane">
          {/* Big Problem vs Solution Cards */}
          <div className="problem-solution-grid">
            <div className="compare-card compare-bad">
              <span className="compare-tag tag-red">❌ WITHOUT BEDROCK RAG</span>
              <h3>Generic AI Guesses &amp; Hallucinates</h3>
              <p>Standard foundation models have no access to your university&apos;s private Wi-Fi configs, lab budgets, or LMS policies. When asked, they make up fake information!</p>
            </div>

            <div className="compare-card compare-good">
              <span className="compare-tag tag-green">✅ WITH BEDROCK KNOWLEDGE BASES</span>
              <h3>Grounded in Your Private S3 Documents</h3>
              <p>Bedrock searches your private PDFs and FAQs in Amazon S3, feeds the exact verified facts to the model, and returns 100% accurate answers with page citations!</p>
            </div>
          </div>

          {/* 4-Stage Visual Architecture Pipeline */}
          <div className="neo-card pipeline-card">
            <div className="sim-title-bar">
              <div>
                <span className="stage-chip chip-cyan">HOW IT WORKS</span>
                <h2 className="sim-heading">The 4-Step Bedrock RAG Pipeline</h2>
              </div>
            </div>

            <div className="rag-visual-pipeline">
              <div className="rag-node node-s3">
                <span className="node-num">01</span>
                <div className="node-icon">📁</div>
                <strong>Private S3 Docs</strong>
                <small>PDFs &bull; Guides &bull; FAQs</small>
              </div>

              <div className="rag-connector">➔</div>

              <div className="rag-node node-titan">
                <span className="node-num">02</span>
                <div className="node-icon">🔢</div>
                <strong>Titan Embeddings</strong>
                <small>Words &rarr; Vector Numbers</small>
              </div>

              <div className="rag-connector">➔</div>

              <div className="rag-node node-search">
                <span className="node-num">03</span>
                <div className="node-icon">🔍</div>
                <strong>OpenSearch Vector</strong>
                <small>Top-3 Best Matching Chunks</small>
              </div>

              <div className="rag-connector">➔</div>

              <div className="rag-node node-fm">
                <span className="node-num">04</span>
                <div className="node-icon">🤖</div>
                <strong>Bedrock Model</strong>
                <small>Synthesizes Verified Reply</small>
              </div>
            </div>
          </div>

          {/* Interactive RAG Scenario Playground */}
          <div className="neo-card interactive-rag-card">
            <div className="sim-title-bar">
              <div>
                <span className="stage-chip chip-green">INTERACTIVE SIMULATION</span>
                <h2 className="sim-heading">Try a Real Campus Question</h2>
              </div>
              <span className="live-flow-badge">● LIVE RAG SIMULATOR</span>
            </div>

            <p className="sim-prompt-intro">
              Click a student question below to watch Bedrock retrieve the matching document chunk from S3 and synthesize a verified answer:
            </p>

            {/* Clickable Question Chips */}
            <div className="rag-scenario-selector">
              <button
                type="button"
                className={`scenario-btn ${ragScenario === 'wifi' ? 'active' : ''}`}
                onClick={() => setRagScenario('wifi')}
              >
                📶 Campus Wi-Fi Help
              </button>
              <button
                type="button"
                className={`scenario-btn ${ragScenario === 'quota' ? 'active' : ''}`}
                onClick={() => setRagScenario('quota')}
              >
                💰 Student Lab Budget
              </button>
              <button
                type="button"
                className={`scenario-btn ${ragScenario === 'password' ? 'active' : ''}`}
                onClick={() => setRagScenario('password')}
              >
                📝 LMS Project Submission
              </button>
            </div>

            {/* Live Interactive Results Visualizer */}
            <div className="rag-live-output-box">
              <div className="output-top-bar">
                <div className="user-query-tag">
                  <strong>STUDENT QUERY:</strong> &ldquo;{ragScenarios[ragScenario].query}&rdquo;
                </div>
                <span className="match-score-badge">
                  {ragScenarios[ragScenario].score}
                </span>
              </div>

              <div className="retrieval-card">
                <div className="retrieval-header">
                  <span>📄 RETRIEVED FROM PRIVATE S3 BUCKET:</span>
                  <span className="doc-pill">{ragScenarios[ragScenario].docName}</span>
                </div>
                <div className="retrieval-details">
                  <strong>Source Section:</strong> {ragScenarios[ragScenario].docPage}
                  <small> &bull; {ragScenarios[ragScenario].chunks}</small>
                </div>
              </div>

              <div className="final-answer-card">
                <div className="answer-header">
                  <span>🤖 BEDROCK SYNTHESIZED ANSWER (ZERO HALLUCINATION):</span>
                  <span className="verified-badge">✓ CITED &amp; VERIFIED</span>
                </div>
                <p className="answer-text">{ragScenarios[ragScenario].answer}</p>
                <div className="citation-footer">
                  <span>Footnote: [Verified against s3://campus-it-docs/{ragScenarios[ragScenario].docName}]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: AUTONOMOUS AGENTS (AI THAT TAKES REAL ACTIONS)
          ========================================================================= */}
      {activeTab === 'agents' && (
        <div className="bedrock-tab-pane">
          {/* Big Hero Visual Banner */}
          <div className="agent-concept-banner">
            <span className="stage-chip chip-yellow">AI WITH HANDS</span>
            <h2>Bedrock Agents Don&apos;t Just Chat — They DO Things</h2>
            <p>
              Standard LLMs can only generate text. Bedrock Agents use the <strong>ReAct (Reason + Act)</strong> loop to break down complex goals, invoke external AWS Lambda functions, talk to databases, and return completed results!
            </p>
          </div>

          {/* The 3-Step ReAct Power Engine */}
          <div className="react-engine-grid">
            <div className="engine-step-card step-think">
              <div className="step-badge-top">STEP 01</div>
              <div className="step-icon">💭</div>
              <h3>1. THINK (Reason)</h3>
              <p>The agent inspects the user&apos;s goal, reads API definitions (OpenAPI schema), and decides which AWS Lambda functions must be called.</p>
            </div>

            <div className="engine-step-card step-act">
              <div className="step-badge-top">STEP 02</div>
              <div className="step-icon">⚡</div>
              <h3>2. ACT (Execute)</h3>
              <p>Bedrock securely invokes your AWS Lambda functions, query DynamoDB tables, or provisions EC2 instances using temporary IAM credentials.</p>
            </div>

            <div className="engine-step-card step-resolve">
              <div className="step-badge-top">STEP 03</div>
              <div className="step-icon">🎯</div>
              <h3>3. DELIVER (Confirm)</h3>
              <p>The agent reads the API return data, confirms success, and presents a clear, human-friendly summary back to the student.</p>
            </div>
          </div>

          {/* Interactive Agent Action Playground */}
          <div className="neo-card interactive-agent-card">
            <div className="sim-title-bar">
              <div>
                <span className="stage-chip chip-orange">LIVE AGENT PLAYGROUND</span>
                <h2 className="sim-heading">Simulate Multi-Step Autonomous Actions</h2>
              </div>
              <span className="live-flow-badge">● AUTONOMOUS REASONING</span>
            </div>

            <p className="sim-prompt-intro">
              Select an action scenario to see Bedrock execute the complete ReAct loop:
            </p>

            <div className="agent-scenario-selector">
              <button
                type="button"
                className={`scenario-btn ${agentScenario === 'provision' ? 'active' : ''}`}
                onClick={() => setAgentScenario('provision')}
              >
                🚀 1. Provision EC2 Cloud Lab
              </button>
              <button
                type="button"
                className={`scenario-btn ${agentScenario === 'resetMac' ? 'active' : ''}`}
                onClick={() => setAgentScenario('resetMac')}
              >
                🔑 2. Clear Wi-Fi MAC Quarantine
              </button>
              <button
                type="button"
                className={`scenario-btn ${agentScenario === 'quotaBoost' ? 'active' : ''}`}
                onClick={() => setAgentScenario('quotaBoost')}
              >
                📊 3. Request GPU Quota Boost
              </button>
            </div>

            {/* Visual ReAct Execution Timeline */}
            <div className="agent-timeline-box">
              <div className="timeline-node node-input">
                <span className="timeline-tag">USER INSTRUCTION</span>
                <h4>&ldquo;{agentScenarios[agentScenario].instruction}&rdquo;</h4>
              </div>

              <div className="timeline-flow-arrow">⬇</div>

              <div className="timeline-node node-thought">
                <div className="node-title-row">
                  <span className="timeline-tag tag-yellow">AGENT THOUGHT</span>
                  <span className="node-status">ReAct Reasoning Engine</span>
                </div>
                <p>{agentScenarios[agentScenario].thought}</p>
              </div>

              <div className="timeline-flow-arrow">⬇</div>

              <div className="timeline-node node-action">
                <div className="node-title-row">
                  <span className="timeline-tag tag-orange">AWS LAMBDA INVOCATION</span>
                  <span className="node-status">Executing API Call...</span>
                </div>
                <code className="code-snippet">{agentScenarios[agentScenario].action}</code>
                <div className="lambda-response-box">
                  <strong>API RESPONSE:</strong>
                  <code>{agentScenarios[agentScenario].observation}</code>
                </div>
              </div>

              <div className="timeline-flow-arrow">⬇</div>

              <div className="timeline-node node-result">
                <div className="node-title-row">
                  <span className="timeline-tag tag-green">TASK COMPLETED</span>
                  <span className="node-status">SUCCESS ✓</span>
                </div>
                <p className="final-agent-result">{agentScenarios[agentScenario].result}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: BEDROCK GUARDRAILS (THE 4-LAYER SAFETY SHIELD)
          ========================================================================= */}
      {activeTab === 'guardrails' && (
        <div className="bedrock-tab-pane">
          {/* Big Hero Visual Banner */}
          <div className="guardrails-hero-banner">
            <span className="stage-chip chip-pink">AI GOVERNANCE &amp; SAFETY</span>
            <h2>Bedrock Guardrails: The 4-Layer Security Shield</h2>
            <p>
              Enterprise guardrails protect student privacy, block toxic or malicious questions, redact sensitive credentials, and verify factual grounding before prompts ever reach the model!
            </p>
          </div>

          {/* 4 Big Shield Cards */}
          <div className="guardrails-shields-grid">
            <div className="shield-card shield-content">
              <div className="shield-icon">🚫</div>
              <span className="shield-step">LAYER 01</span>
              <h3>Content Filter</h3>
              <p>Stops hate speech, insults, harassment, violence, and profanity with configurable thresholds (Low to High).</p>
            </div>

            <div className="shield-card shield-topics">
              <div className="shield-icon">⛔</div>
              <span className="shield-step">LAYER 02</span>
              <h3>Denied Topics</h3>
              <p>Blocks restricted university topics like exam answer keys, unauthorized grade changes, or server exploits.</p>
            </div>

            <div className="shield-card shield-pii">
              <div className="shield-icon">🔒</div>
              <span className="shield-step">LAYER 03</span>
              <h3>Sensitive PII Redaction</h3>
              <p>Detects and replaces Social Security numbers, phone numbers, and student IDs with safe <code>[REDACTED]</code> tags.</p>
            </div>

            <div className="shield-card shield-grounding">
              <div className="shield-icon">🎯</div>
              <span className="shield-step">LAYER 04</span>
              <h3>Contextual Grounding</h3>
              <p>Checks answers against reference documents. If the model makes up claims not found in the documents, it is blocked.</p>
            </div>
          </div>

          {/* Interactive Shield Test Playground */}
          <div className="neo-card interactive-guardrail-card">
            <div className="sim-title-bar">
              <div>
                <span className="stage-chip chip-green">LIVE SAFETY TEST</span>
                <h2 className="sim-heading">Test the Guardrails Armor in Real Time</h2>
              </div>
              <span className="live-flow-badge">● SHIELD INSPECTOR</span>
            </div>

            <p className="sim-prompt-intro">
              Click a test prompt below to see how Bedrock Guardrails evaluates each safety layer:
            </p>

            <div className="guardrail-scenario-selector">
              <button
                type="button"
                className={`scenario-btn ${guardrailScenario === 'safe' ? 'active' : ''}`}
                onClick={() => setGuardrailScenario('safe')}
              >
                🟢 1. Safe IT Prompt
              </button>
              <button
                type="button"
                className={`scenario-btn ${guardrailScenario === 'harmful' ? 'active' : ''}`}
                onClick={() => setGuardrailScenario('harmful')}
              >
                🔴 2. Malicious Query
              </button>
              <button
                type="button"
                className={`scenario-btn ${guardrailScenario === 'pii' ? 'active' : ''}`}
                onClick={() => setGuardrailScenario('pii')}
              >
                🟡 3. Sensitive PII Leak
              </button>
              <button
                type="button"
                className={`scenario-btn ${guardrailScenario === 'hallucination' ? 'active' : ''}`}
                onClick={() => setGuardrailScenario('hallucination')}
              >
                🟣 4. Fake Policy Test
              </button>
            </div>

            {/* Live Shield Evaluation Matrix */}
            <div className="shield-evaluation-box">
              <div className="eval-input-bar">
                <strong>INCOMING USER PROMPT:</strong>
                <p>&ldquo;{guardrailScenarios[guardrailScenario].input}&rdquo;</p>
              </div>

              {/* 4 Shield Status Indicators */}
              <div className="eval-layers-grid">
                <div className="eval-layer-item">
                  <span className="eval-num">SHIELD 1</span>
                  <strong>Content Filter</strong>
                  <span className="eval-tag">{guardrailScenarios[guardrailScenario].l1}</span>
                </div>
                <div className="eval-layer-item">
                  <span className="eval-num">SHIELD 2</span>
                  <strong>Denied Topics</strong>
                  <span className="eval-tag">{guardrailScenarios[guardrailScenario].l2}</span>
                </div>
                <div className="eval-layer-item">
                  <span className="eval-num">SHIELD 3</span>
                  <strong>PII Redaction</strong>
                  <span className="eval-tag">{guardrailScenarios[guardrailScenario].l3}</span>
                </div>
                <div className="eval-layer-item">
                  <span className="eval-num">SHIELD 4</span>
                  <strong>Grounding Filter</strong>
                  <span className="eval-tag">{guardrailScenarios[guardrailScenario].l4}</span>
                </div>
              </div>

              {/* Final Policy Verdict */}
              <div className={`eval-verdict-banner ${guardrailScenarios[guardrailScenario].statusClass}`}>
                <div className="verdict-title-row">
                  <span className="verdict-pill">{guardrailScenarios[guardrailScenario].badge}</span>
                  <strong>STATUS: {guardrailScenarios[guardrailScenario].status}</strong>
                </div>
                <p className="verdict-output-text">{guardrailScenarios[guardrailScenario].output}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: FOUNDATION MODELS ROSTER
          ========================================================================= */}
      {activeTab === 'models' && (
        <div className="bedrock-tab-pane">
          <div className="models-hero-banner">
            <span className="stage-chip chip-yellow">UNIFIED API</span>
            <h2>Bedrock Foundation Model Ecosystem</h2>
            <p>Access the world&apos;s leading AI models through a single standard AWS SDK API with zero server management.</p>
          </div>

          <div className="model-cards-grid">
            <div className="model-neo-card card-nova">
              <div className="model-card-top">
                <span className="model-brand">AMAZON</span>
                <span className="model-badge">SPEED &amp; VALUE</span>
              </div>
              <h3>Amazon Nova (Lite / Pro)</h3>
              <p className="model-desc">State-of-the-art native AWS foundation model with built-in multimodal capabilities and ultra-low latency.</p>
              <div className="model-stats">
                <div className="mstat"><strong>300k</strong><small>Context Window</small></div>
                <div className="mstat"><strong>~150ms</strong><small>Latency</small></div>
                <div className="mstat"><strong>$0.06</strong><small>per 1M tokens</small></div>
              </div>
              <div className="model-footer-tag">✓ Ideal for High-Volume Campus IT &amp; Fast FAQs</div>
            </div>

            <div className="model-neo-card card-claude">
              <div className="model-card-top">
                <span className="model-brand">ANTHROPIC</span>
                <span className="model-badge">TOP REASONING</span>
              </div>
              <h3>Claude 3.5 Sonnet</h3>
              <p className="model-desc">Industry-leading reasoning, complex code generation, and nuanced document synthesis capabilities.</p>
              <div className="model-stats">
                <div className="mstat"><strong>200k</strong><small>Context Window</small></div>
                <div className="mstat"><strong>~300ms</strong><small>Latency</small></div>
                <div className="mstat"><strong>$0.80</strong><small>per 1M tokens</small></div>
              </div>
              <div className="model-footer-tag">✓ Ideal for Complex Lab Debugging &amp; Research</div>
            </div>

            <div className="model-neo-card card-llama">
              <div className="model-card-top">
                <span className="model-brand">META</span>
                <span className="model-badge">OPEN WEIGHTS</span>
              </div>
              <h3>Llama 3.3 (70B)</h3>
              <p className="model-desc">World-class open foundation model offering outstanding general intelligence and high adaptability.</p>
              <div className="model-stats">
                <div className="mstat"><strong>128k</strong><small>Context Window</small></div>
                <div className="mstat"><strong>~200ms</strong><small>Latency</small></div>
                <div className="mstat"><strong>$0.30</strong><small>per 1M tokens</small></div>
              </div>
              <div className="model-footer-tag">✓ Ideal for General Student Inquiries</div>
            </div>

            <div className="model-neo-card card-mistral">
              <div className="model-card-top">
                <span className="model-brand">MISTRAL AI</span>
                <span className="model-badge">EFFICIENCY</span>
              </div>
              <h3>Mistral Large 2</h3>
              <p className="model-desc">Specialized in multilingual fluency, mathematical reasoning, and rigorous structured data output.</p>
              <div className="model-stats">
                <div className="mstat"><strong>128k</strong><small>Context Window</small></div>
                <div className="mstat"><strong>~250ms</strong><small>Latency</small></div>
                <div className="mstat"><strong>$0.40</strong><small>per 1M tokens</small></div>
              </div>
              <div className="model-footer-tag">✓ Ideal for Math, Analytics &amp; Multilingual Support</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
