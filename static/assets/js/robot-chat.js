(() => {
  const form = document.querySelector("#evora-chat-form");
  const input = document.querySelector("#evora-message-input");
  const messages = document.querySelector("#evora-messages");
  const clearButton = document.querySelector("#evora-clear-chat");
  const stage = document.querySelector(".evora-stage");

  if (!form || !input || !messages || !stage) return;

  const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const API_ENDPOINT = window.EVORA_API_URL
    || (isLocalPreview ? "http://127.0.0.1:8787/v1/evora/chat" : "/api/evora/chat");
  const welcome = "Hello. I am EVORA. The signal is live now. Ask me anything, and I will answer from this little window between memory and the void.";
  const conversation = [];
  let busy = false;
  let typingTimer = 0;
  let poseTimer = 0;
  let activeRequest = null;

  function scrollToLatest() {
    messages.scrollTop = messages.scrollHeight;
  }

  function createMessage(role) {
    const row = document.createElement("article");
    row.className = `evora-message evora-message--${role}`;

    if (role === "evora") {
      const avatar = document.createElement("img");
      avatar.className = "evora-message-avatar";
      avatar.src = "/assets/images/robot-chat/evora-chat-avatar-v3.png";
      avatar.alt = "EVORA";
      row.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "evora-message-bubble";
    const author = document.createElement("span");
    author.className = "evora-message-author";
    author.textContent = role === "evora" ? "EVORA //" : "YOU //";
    const text = document.createElement("p");
    bubble.append(author, text);
    row.appendChild(bubble);
    messages.appendChild(row);
    scrollToLatest();
    return text;
  }

  function addUserMessage(text) {
    createMessage("user").textContent = text;
  }

  function addThinkingMessage() {
    const target = createMessage("evora");
    target.className = "evora-thinking-dots";
    target.setAttribute("aria-label", "EVORA is thinking");
    target.replaceChildren(document.createElement("i"), document.createElement("i"), document.createElement("i"));
    return target.closest(".evora-message");
  }

  function setSpeaking(active) {
    window.clearTimeout(poseTimer);
    stage.classList.toggle("is-speaking", active);
    if (active) poseTimer = window.setTimeout(() => stage.classList.remove("is-speaking"), 1500);
  }

  function typeEvoraMessage(text, onDone) {
    const target = createMessage("evora");
    target.classList.add("is-typing");
    let index = 0;
    setSpeaking(true);
    window.clearInterval(typingTimer);
    typingTimer = window.setInterval(() => {
      index += 1;
      target.textContent = text.slice(0, index);
      scrollToLatest();
      if (index >= text.length) {
        window.clearInterval(typingTimer);
        target.classList.remove("is-typing");
        onDone?.();
      }
    }, 18);
  }

  async function requestEvoraReply() {
    activeRequest = new AbortController();
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation }),
      signal: activeRequest.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    if (!data.reply) throw new Error("EVORA returned an empty signal");
    return data.reply;
  }

  async function submitMessage(value) {
    const message = value.trim();
    if (!message || busy) return;
    busy = true;
    input.value = "";
    input.disabled = true;
    addUserMessage(message);
    conversation.push({ role: "user", content: message });
    const thinkingMessage = addThinkingMessage();

    try {
      const reply = await requestEvoraReply();
      thinkingMessage.remove();
      conversation.push({ role: "assistant", content: reply });
      typeEvoraMessage(reply, finishRequest);
    } catch (error) {
      thinkingMessage.remove();
      if (error?.name !== "AbortError") {
        const friendlyMessage = error instanceof TypeError
          ? "I cannot reach the local signal relay. Please start the EVORA proxy on port 8787 and try again."
          : "The signal reached the relay, but the AI service rejected or lost it. Please check the proxy terminal for details.";
        console.error("[EVORA chat]", error);
        typeEvoraMessage(friendlyMessage, finishRequest);
      } else {
        finishRequest();
      }
    }
  }

  function finishRequest() {
    busy = false;
    activeRequest = null;
    input.disabled = false;
    input.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitMessage(input.value);
  });

  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => submitMessage(button.dataset.prompt || ""));
  });

  clearButton.addEventListener("click", () => {
    activeRequest?.abort();
    window.clearInterval(typingTimer);
    window.clearTimeout(poseTimer);
    stage.classList.remove("is-speaking");
    conversation.length = 0;
    messages.replaceChildren();
    finishRequest();
    typeEvoraMessage(welcome);
  });

  typeEvoraMessage(welcome, finishRequest);
})();
