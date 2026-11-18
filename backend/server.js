import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  RekognitionClient,
  DetectFacesCommand
} from '@aws-sdk/client-rekognition';
import {
  BedrockRuntimeClient,
  ConverseCommand
} from '@aws-sdk/client-bedrock-runtime';

const app = express();
const port = Number(process.env.PORT || 4000);
const region = process.env.AWS_REGION || 'us-east-1';
const threshold = Number(process.env.LIVENESS_THRESHOLD || 90);
const modelId = process.env.BEDROCK_MODEL_ID;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '6mb' })); // webcam snapshots are sent as base64 JPEG

// Normalize AWS Academy Learner Lab credentials (supports both lowercase aws_... and uppercase AWS_...)
const accessKeyId = (process.env.aws_access_key_id || process.env.AWS_ACCESS_KEY_ID || '').trim();
const secretAccessKey = (process.env.aws_secret_access_key || process.env.AWS_SECRET_ACCESS_KEY || '').trim();
const sessionToken = (process.env.aws_session_token || process.env.AWS_SESSION_TOKEN || '').trim();

if (accessKeyId) process.env.AWS_ACCESS_KEY_ID = accessKeyId;
if (secretAccessKey) process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
if (sessionToken) process.env.AWS_SESSION_TOKEN = sessionToken;

const credentials = accessKeyId && secretAccessKey ? {
  accessKeyId,
  secretAccessKey,
  ...(sessionToken ? { sessionToken } : {})
} : undefined;

const rekognition = new RekognitionClient({ region, ...(credentials ? { credentials } : {}) });
const bedrock = new BedrockRuntimeClient({ region, ...(credentials ? { credentials } : {}) });

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'smart-access-api', region });
});

// Amazon Rekognition DetectFaces presence check (works in AWS Academy sandboxes,
// where Face Liveness is not available). Weaker than Face Liveness: classroom demo only.
app.post('/api/face/verify', async (req, res) => {
  const image = req.body?.image;
  if (typeof image !== 'string' || !image.startsWith('data:image/jpeg;base64,')) {
    return res.status(400).json({ error: 'Send a JPEG webcam snapshot.' });
  }
  const bytes = Buffer.from(image.split(',')[1], 'base64');
  if (bytes.length > 5 * 1024 * 1024) {
    return res.status(413).json({ error: 'Snapshot is too large (max 5 MB).' });
  }

  try {
    const result = await rekognition.send(new DetectFacesCommand({
      Image: { Bytes: bytes },
      Attributes: ['ALL']
    }));
    const faces = result.FaceDetails || [];
    const face = faces[0];
    const confidence = Math.round((face?.Confidence ?? 0) * 100) / 100;
    const checks = {
      oneFace: faces.length === 1,
      confident: confidence >= threshold,
      smiling: Boolean(face?.Smile?.Value),
      eyesOpen: Boolean(face?.EyesOpen?.Value)
    };
    const passed = Object.values(checks).every(Boolean);

    let message = 'Presence check passed.';
    if (!checks.oneFace) message = faces.length === 0 ? 'No face was detected. Face the camera in good light.' : 'More than one face was detected. Only one person should be in frame.';
    else if (!checks.confident) message = 'Face detection confidence was below the demo threshold. Try better lighting.';
    else if (!checks.smiling) message = 'Challenge not met: please smile when the photo is taken.';
    else if (!checks.eyesOpen) message = 'Challenge not met: keep your eyes open.';

    res.json({ passed, status: passed ? 'SUCCEEDED' : 'FAILED', confidence, threshold, checks, message });
  } catch (error) {
    console.error('DetectFaces failed:', error);
    res.status(500).json({ error: 'Rekognition could not analyse the image. Check backend AWS credentials and Region.' });
  }
});

// Assistant reply generator: uses Groq (fast & free backend inference), Bedrock Converse, or structured fallback.
async function generateAssistantReply(messages) {
  const systemPrompt = [
    'You are Campus IT & Amazon Bedrock Assistant, a friendly, concise, and helpful AI assistant in an AWS classroom demonstration.',
    'Your responsibilities:',
    '1. Thoroughly explain Amazon Bedrock capabilities, architecture, foundation models (Amazon Nova, Titan, Anthropic Claude, Meta Llama, Mistral), Knowledge Bases / RAG, Bedrock Agents, Guardrails, and security with clear, practical examples.',
    '2. Provide step-by-step guidance on campus IT topics such as Wi-Fi troubleshooting, LMS login help, and AWS cloud lab setup.',
    '3. Keep responses structured, concise, and well-formatted with markdown bullet points.',
    '4. Fully embody Amazon Bedrock in the AWS ecosystem. Never mention third-party AI gateways or external model names outside of the AWS Bedrock catalog.'
  ].join('\n');

  // 1. High-speed Groq integration (Free Tier)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const candidateModels = [
      process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b'
    ];

    for (const model of candidateModels) {
      try {
        const groqMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content[0].text }))
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: groqMessages,
            max_tokens: 2048,
            temperature: 0.4
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (reply) return reply;
        } else {
          console.warn(`Groq model ${model} returned status ${response.status}`);
        }
      } catch (err) {
        console.warn(`Groq error with ${model}:`, err.message);
      }
    }
  }

  // 2. Direct AWS Bedrock ConverseCommand
  if (modelId) {
    try {
      const response = await bedrock.send(new ConverseCommand({
        modelId,
        system: [{ text: systemPrompt }],
        messages,
        inferenceConfig: { maxTokens: 500, temperature: 0.3 }
      }));
      const answer = (response.output?.message?.content || [])
        .map(part => part.text || '')
        .join('\n')
        .trim();
      if (answer) return answer;
    } catch (bedrockErr) {
      console.warn('Bedrock Converse attempt failed:', bedrockErr.message);
    }
  }

  // 3. Built-in structured fallback if network/credentials fail
  const lastUserText = messages[messages.length - 1].content[0].text.toLowerCase();
  if (lastUserText.includes('bedrock') || lastUserText.includes('foundation') || lastUserText.includes('model') || lastUserText.includes('rag') || lastUserText.includes('agent')) {
    return [
      '**Amazon Bedrock Overview & Capabilities:**',
      '- **Fully Managed:** Build and scale generative AI applications using leading foundation models (FMs) without managing infrastructure.',
      '- **Model Choice:** Access models from Anthropic (Claude), Amazon (Nova, Titan), Meta (Llama), Mistral AI, and Cohere through a single unified API.',
      '- **RAG & Knowledge Bases:** Connect foundation models securely to your private data sources (S3, OpenSearch, Aurora) for contextual question answering.',
      '- **Bedrock Agents:** Automate complex multi-step workflows and execute API actions using dynamic orchestration.',
      '- **Guardrails for Bedrock:** Implement safety filters, PII redaction, and hallucination reduction policies to protect user interactions.',
      '- **Security & Privacy:** Your enterprise data is never used to train the base foundation models and stays encrypted inside your AWS account.'
    ].join('\n');
  }

  if (lastUserText.includes('wi-fi') || lastUserText.includes('wifi')) {
    return 'To troubleshoot campus Wi-Fi:\n1. Forget the "Campus-Secure" Wi-Fi network and reconnect.\n2. Ensure your device is set to WPA2/WPA3 Enterprise (PEAP / MSCHAPv2) with your student username and password.\n3. Turn off MAC address randomization for the campus network.\n4. If problems continue, visit the IT Helpdesk at the student center.';
  }

  if (lastUserText.includes('lms') || lastUserText.includes('canvas') || lastUserText.includes('blackboard') || lastUserText.includes('login')) {
    return 'To resolve LMS access problems:\n1. Try signing in using an incognito or private browsing window.\n2. Clear browser cookies and cache for the university portal.\n3. Verify your course enrollment status in the student registrar portal.\n4. Contact support@campus.edu if your student account is locked.';
  }

  return 'Hello! I am your Campus IT & Amazon Bedrock Assistant. Ask me about Amazon Bedrock capabilities (foundation models, RAG, Bedrock Agents, Guardrails) or campus IT troubleshooting (Wi-Fi, LMS access, AWS lab setup).';
}

// Amazon Bedrock campus IT & capabilities assistant.
app.post('/api/assistant/chat', async (req, res) => {
  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = incoming
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-12)
    .map(m => ({ role: m.role, content: [{ text: m.content.slice(0, 4000) }] }));

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Send a user message to the assistant.' });
  }

  try {
    const answer = await generateAssistantReply(messages);
    res.json({ answer });
  } catch (error) {
    console.error('Assistant error:', error);
    res.status(500).json({ error: 'The assistant could not respond. Please try again.' });
  }
});

app.listen(port, () => {
  console.log(`Smart Access API listening on http://localhost:${port} (${region})`);
});