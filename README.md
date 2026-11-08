# Smart Access & Campus IT Assistant — AWS class demo

A React + Express starter demonstrating two AWS AI services in one use case:
- **Amazon Rekognition Face Liveness** checks whether a real person is present during the demo login flow.
- **Amazon Bedrock** powers a Campus IT Assistant that answers general questions about campus Wi-Fi, LMS access, and cloud-computing lab setup.

The demo login credentials are hardcoded in the frontend:
- Email: `demo@example.com`
- Password: `Demo123!`

These credentials are intentionally for classroom use only. They are not secure authentication and must not be used in production.

## Architecture
React/Vite frontend → Express backend → Amazon Rekognition Face Liveness and Amazon Bedrock Converse API.
The React FaceLivenessDetector uses Cognito Identity Pool temporary credentials. No database or Cognito User Pool is required for this classroom flow.

## Prerequisites
- Node.js 20+
- AWS account access (your teammate can configure this)
- An AWS Region supporting Face Liveness and a Bedrock model available in that Region
- Cognito Identity Pool with unauthenticated/guest identities enabled for this classroom demo
- Backend AWS credentials configured through an IAM role or AWS shared credentials profile. Do not put AWS access keys in frontend code.

## Backend setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Configure these values in `backend/.env`:
- `AWS_REGION`: same Region used for Rekognition, Cognito and the selected Bedrock model where possible
- `BEDROCK_MODEL_ID`: exact model ID available and enabled for your AWS account and Region
- `LIVENESS_THRESHOLD`: classroom demo threshold (default 90; not a universal security recommendation)
- `FRONTEND_ORIGIN`: frontend origin, default `http://localhost:5173`

The backend IAM role/user needs:
- Rekognition: `rekognition:CreateFaceLivenessSession`, `rekognition:GetFaceLivenessSessionResults`
- Bedrock: `bedrock:InvokeModel` for the selected model / Converse API
Use least-privilege policies. AWS may require model access to be enabled or other model-specific setup in the Bedrock console.

## Frontend setup
In another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Configure `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_AWS_REGION=your-aws-region
VITE_COGNITO_IDENTITY_POOL_ID=your-identity-pool-id
```
Open the Vite URL shown in the terminal. The browser needs camera permission.

## Demo flow
1. Sign in with `demo@example.com` / `Demo123!`.
2. Follow the Face Liveness camera prompts.
3. If liveness passes, the Campus IT Assistant appears.
4. Ask: “My campus Wi-Fi keeps disconnecting. What should I check?” or “How do I prepare an AWS lab for my cloud computing class?”
5. Bedrock responds using the selected foundation model.

## What your teammate needs to configure
1. Create/configure a Cognito Identity Pool with guest identities and the minimum permissions required by the current Amplify Face Liveness component.
2. Configure backend IAM credentials and permissions for Rekognition and Bedrock.
3. Enable/access a Bedrock model in the chosen Region and set `BEDROCK_MODEL_ID`.
4. Install dependencies and test both flows.

Official docs:
- Rekognition Face Liveness: https://docs.aws.amazon.com/rekognition/latest/dg/face-liveness.html
- Amplify React Face Liveness: https://ui.docs.amplify.aws/react/connected-components/liveness?platform=javascript
- Bedrock Converse API: https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html

## Limitations / safety
- Face Liveness checks live presence; it does not establish a person's identity.
- The demo email/password is hardcoded and bypassable. It is not a security control.
- The frontend submits chat history to the backend; the backend limits it to the last 12 messages and truncates message text.
- Do not enter passwords, OTPs, personal data, or confidential university information into the demo assistant.
- For production, replace demo login with real authentication, validate/authorize sessions server-side, add rate limiting, protect session ownership, configure secure deployment, and review privacy and data-retention needs.
