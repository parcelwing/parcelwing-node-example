const form = document.querySelector("#send-form");
const submitButton = document.querySelector("#submit-button");
const responseOutput = document.querySelector("#response-output");
const apiKeyHelp = document.querySelector("#api-key-help");
const baseUrlInput = document.querySelector("#baseUrl");

loadConfig();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = Object.fromEntries(new FormData(form).entries());

  setLoading(true);
  writeResponse("Sending test email…");

  try {
    const response = await fetch("/api/send-test-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      writeResponse(data, "error");
      return;
    }

    writeResponse(data, "success");
  } catch (error) {
    writeResponse(
      {
        error: error instanceof Error ? error.message : "Unable to send test email.",
      },
      "error",
    );
  } finally {
    setLoading(false);
  }
});

async function loadConfig() {
  try {
    const response = await fetch("/api/config");
    const config = await response.json();

    if (config.defaultBaseUrl) {
      baseUrlInput.value = config.defaultBaseUrl;
    }

    if (config.hasEnvApiKey) {
      apiKeyHelp.textContent = "Using PARCELWING_API_KEY from the server unless you override it here.";
    }
  } catch {
    // The form can still work without preloaded config.
  }
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Sending…" : "Send test email";
}

function writeResponse(value, state) {
  responseOutput.classList.remove("success", "error");

  if (state) {
    responseOutput.classList.add(state);
  }

  responseOutput.textContent =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
}
