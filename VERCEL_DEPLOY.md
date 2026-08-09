# Deploy EVORA to Vercel

## 1. Upload

Extract the ZIP, then import the extracted folder into Vercel. The included
`vercel.json` publishes the prebuilt `public` directory and deploys
`api/evora/chat.mjs` as a Node.js Function.

## 2. Configure the API key

In Vercel, open **Project → Settings → Environment Variables** and add:

- Name: `OPENAI_API_KEY`
- Value: a valid key accepted by `https://xiaofeixia.chat`
- Environments: Production, Preview, and Development

Optional variables:

- `EVORA_API_BASE_URL` = `https://xiaofeixia.chat`
- `EVORA_MODEL` = `gpt-5.5`

Redeploy after adding or changing environment variables.

## 3. Verify

Open `https://YOUR-PROJECT.vercel.app/api/evora/chat` in a browser. A GET request
should return `Method not allowed`; this confirms that the function exists.
Then open `/robot/`, send a message, and check that EVORA replies.

If chat fails, inspect **Vercel → Project → Logs → Functions**. The API key is
never included in browser files or API responses.
