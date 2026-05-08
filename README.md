# Parcel Wing Node.js Example App

A tiny web app that demonstrates sending a test email with the official `@parcelwing/node` SDK.

It is intentionally small enough to use as both:

1. A real-world smoke test for the Parcel Wing Node SDK.
2. A starter example for developers who want to send their first email.

## What it includes

- Express server
- Official `@parcelwing/node` SDK
- Pico CSS for a lightweight, polished UI
- A local browser form for entering an API key, sender, recipient, subject, and message body
- Optional `PARCELWING_API_KEY` and `PARCELWING_BASE_URL` environment variables for repeat testing

## Requirements

- Node.js 18.17 or newer
- A Parcel Wing API key. Don't have one? Get one for free [here](https://parcelwing.com/signup)
- A verified sending domain in Parcel Wing

## Quick start

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

Paste your Parcel Wing API key, fill in the sender and recipient fields, and send a test email.

## Environment variables

You can create a `.env` file or export these in your shell:

```bash
PARCELWING_API_KEY=pw_live_your_api_key_here
PARCELWING_BASE_URL=https://parcelwing.com
PORT=3000
```

The app still lets you override the API key and base URL from the UI. API keys are only used by the local server for the current request and are not stored by the app.

## Project structure

```text
.
├── public
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── src
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Notes

- The browser calls the local Express server.
- The Express server creates a `ParcelWing` client and calls `client.emails.send(...)`.
- This keeps the example focused on the Node SDK while still giving users a friendly web UI.
