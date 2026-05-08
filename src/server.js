import "dotenv/config";

import path from "node:path";
import { fileURLToPath } from "node:url";

import express from "express";
import { ParcelWing, isParcelWingError } from "@parcelwing/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "1mb" }));
app.get("/pico.min.css", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "node_modules", "@picocss", "pico", "css", "pico.min.css"));
});
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/config", (_req, res) => {
  res.json({
    hasEnvApiKey: Boolean(process.env.PARCELWING_API_KEY),
    defaultBaseUrl: process.env.PARCELWING_BASE_URL || "https://parcelwing.com",
  });
});

app.post("/api/send-test-email", async (req, res) => {
  const {
    apiKey,
    baseUrl,
    from,
    to,
    subject,
    text,
    html,
    replyTo,
  } = req.body ?? {};

  const resolvedApiKey = stringOrEmpty(apiKey) || process.env.PARCELWING_API_KEY;
  const resolvedBaseUrl = stringOrEmpty(baseUrl) || process.env.PARCELWING_BASE_URL || "https://parcelwing.com";

  const validationError = validatePayload({
    apiKey: resolvedApiKey,
    from,
    to,
    subject,
    text,
    html,
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const parcelwing = new ParcelWing({
      apiKey: resolvedApiKey,
      baseUrl: resolvedBaseUrl,
      timeoutMs: 30_000,
    });

    const result = await parcelwing.emails.send({
      from: from.trim(),
      to: normalizeRecipients(to),
      subject: subject.trim(),
      text: stringOrEmpty(text),
      html: stringOrEmpty(html) || undefined,
      reply_to: stringOrEmpty(replyTo) || undefined,
      tags: {
        source: "parcelwing-node-example",
      },
    });

    return res.status(202).json({
      ok: true,
      message: "Email queued successfully.",
      result,
    });
  } catch (error) {
    if (isParcelWingError(error)) {
      return res.status(error.status || 502).json({
        error: error.message,
        code: error.code,
        type: error.type,
        status: error.status,
        requestId: error.requestId,
        details: error.details,
      });
    }

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown server error.",
    });
  }
});

app.listen(port, () => {
  console.log(`Parcel Wing example app running at http://localhost:${port}`);
});

function stringOrEmpty(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRecipients(value) {
  const recipients = stringOrEmpty(value)
    .split(",")
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  return recipients.length === 1 ? recipients[0] : recipients;
}

function validatePayload({ apiKey, from, to, subject, text, html }) {
  if (!stringOrEmpty(apiKey)) return "Enter a Parcel Wing API key.";
  if (!stringOrEmpty(from)) return "Enter a sender address from a verified sending domain.";
  if (!stringOrEmpty(to)) return "Enter at least one recipient email address.";
  if (!stringOrEmpty(subject)) return "Enter a subject.";
  if (!stringOrEmpty(text) && !stringOrEmpty(html)) return "Enter a plain text or HTML message body.";
  return null;
}
