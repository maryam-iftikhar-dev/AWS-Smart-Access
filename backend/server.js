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

const rekognition = new RekognitionClient({ region });
const bedrock = new BedrockRuntimeClient({ region });

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

// Amazon Bedrock campus IT helpdesk assistant.
app.post('/api/assistant/chat', async (req, res) => {
  if (!modelId) {
    return res.status(503).json({ error: 'Bedrock is not configured yet. Set BEDROCK_MODEL_ID in backend/.env.' });
  }

  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = incoming
    .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .slice(-12)
    .map(m => ({ role: m.role, content: [{ text: m.content.slice(0, 4000) }] }));

  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Send a user message to the assistant.' });
  }

  try {
    const response = await bedrock.send(new ConverseCommand({
      modelId,
      system: [{
        text: [
          'You are Campus IT Assistant, a concise and helpful assistant in a classroom demonstration.',
          'Help with general campus technology topics such as Wi-Fi troubleshooting, learning management system access, cloud-computing lab setup, and basic account-security guidance.',
          'Give safe, step-by-step suggestions. Never ask for passwords, one-time codes, secret keys, or other credentials.',
          'Do not claim to reset accounts, access university systems, or perform actions you cannot actually perform.',
          'If the user has an account-specific problem, direct them to the official campus IT support team.'
        ].join(' ')
      }],
      messages,
      inferenceConfig: { maxTokens: 500, temperature: 0.3 }
    }));

    const answer = (response.output?.message?.content || [])
      .map(part => part.text || '')
      .join('\n')
      .trim();

    if (!answer) throw new Error('Bedrock returned an empty response.');
    res.json({ answer });
  } catch (error) {
    console.error('Bedrock Converse failed:', error);
    res.status(500).json({ error: 'The AI assistant could not respond. Check the selected model, Region, model access and IAM permissions.' });
  }
});

app.listen(port, () => {
  console.log(`Smart Access API listening on http://localhost:${port} (${region})`);
});