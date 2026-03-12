const botNameInput = document.getElementById("botName");
const subjectInput = document.getElementById("subject");
const topicInput = document.getElementById("topic");
const studentLevelInput = document.getElementById("studentLevel");
const startLessonBtn = document.getElementById("startLessonBtn");
const exampleBtn = document.getElementById("exampleBtn");
const quizBtn = document.getElementById("quizBtn");
const checkBackendBtn = document.getElementById("checkBackendBtn");
const clearBtn = document.getElementById("clearBtn");
const chatOutput = document.getElementById("chatOutput");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const botStatus = document.getElementById("botStatus");
const chipsContainer = document.getElementById("chipsContainer");

const state = {
  backendReady: false,
  lessonStarted: false,
  history: []
};

function getConfig() {
  return {
    botName: botNameInput.value.trim() || "teacherBot",
    subject: subjectInput.value.trim() || "JavaScript",
    topic: topicInput.value.trim() || "strings",
    studentLevel: studentLevelInput.value
  };
}

function setStatus(text, tone = "default") {
  botStatus.textContent = text;
  botStatus.dataset.tone = tone;
}

function createMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = role === "bot" ? getConfig().botName : "You";

  const body = document.createElement("div");
  body.textContent = text;

  wrapper.appendChild(label);
  wrapper.appendChild(body);
  chatOutput.appendChild(wrapper);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

function createTypingBubble() {
  const wrapper = document.createElement("div");
  wrapper.className = "message bot";
  wrapper.id = "typingBubble";

  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = getConfig().botName;

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";

  wrapper.appendChild(label);
  wrapper.appendChild(typing);
  chatOutput.appendChild(wrapper);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

function removeTypingBubble() {
  document.getElementById("typingBubble")?.remove();
}

function pushHistory(role, text) {
  state.history.push({ role, text });
  if (state.history.length > 12) {
    state.history = state.history.slice(-12);
  }
}

async function callAI(message, task = "chat") {
  const config = getConfig();

  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message,
      task,
      config,
      history: state.history
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "The AI backend could not complete the request.");
  }

  return data;
}

async function checkBackend() {
  setStatus("Checking backend...", "working");

  try {
    const response = await fetch("/.netlify/functions/chat?ping=1");
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Backend check failed.");
    }

    state.backendReady = true;
    setStatus(`Backend ready · ${data.model}`, "ok");
    createMessage(
      "bot",
      `Backend is ready. I can now teach ${getConfig().topic} in ${getConfig().subject} using real AI.`
    );
  } catch (error) {
    state.backendReady = false;
    setStatus("Backend not ready", "error");
    createMessage(
      "bot",
      `Backend check failed. ${error.message} Make sure your Netlify env var GEMINI_API_KEY is set.`
    );
  }
}

async function sendToAI(message, task = "chat") {
  createMessage("user", message);
  pushHistory("user", message);
  setStatus("Thinking...", "working");
  createTypingBubble();

  try {
    const data = await callAI(message, task);
    removeTypingBubble();
    createMessage("bot", data.reply);
    pushHistory("bot", data.reply);
    state.backendReady = true;
    setStatus(`Ready · ${data.model}`, "ok");
  } catch (error) {
    removeTypingBubble();
    createMessage(
      "bot",
      `I could not reach the AI backend. ${error.message}`
    );
    setStatus("Backend error", "error");
  }
}

function buildStarterPrompt(type) {
  const { subject, topic, studentLevel } = getConfig();

  if (type === "lesson") {
    return `Start a ${studentLevel} lesson on ${topic} in ${subject}. Teach step by step, keep it clear, and end with one small practice question.`;
  }

  if (type === "example") {
    return `Give me practical examples for ${topic} in ${subject}. Keep them easy to understand and useful in real projects.`;
  }

  if (type === "quiz") {
    return `Quiz me on ${topic} in ${subject} at ${studentLevel} level. Ask one question first, wait for my answer, then explain.`;
  }

  return "Teach me clearly.";
}

function clearChat() {
  chatOutput.innerHTML = "";
  state.history = [];
  state.lessonStarted = false;
  welcomeMessage();
}

function welcomeMessage() {
  const { botName, subject, topic } = getConfig();
  createMessage(
    "bot",
    `Welcome! I am ${botName}. I am connected to a backend-ready AI lesson flow for ${subject} and ${topic}. Press Check Backend, then start chatting.`
  );
}

startLessonBtn.addEventListener("click", () => {
  state.lessonStarted = true;
  sendToAI(buildStarterPrompt("lesson"), "lesson");
});

exampleBtn.addEventListener("click", () => {
  sendToAI(buildStarterPrompt("example"), "example");
});

quizBtn.addEventListener("click", () => {
  sendToAI(buildStarterPrompt("quiz"), "quiz");
});

checkBackendBtn.addEventListener("click", checkBackend);
clearBtn.addEventListener("click", clearChat);

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  messageInput.value = "";
  sendToAI(message, "chat");
});

chipsContainer.addEventListener("click", (event) => {
  const target = event.target.closest(".chip");
  if (!target) return;
  sendToAI(target.textContent, "chat");
});

[botNameInput, subjectInput, topicInput, studentLevelInput].forEach((input) => {
  input.addEventListener("input", () => {
    const { topic } = getConfig();
    setStatus(`Updated for ${topic}`, "default");
  });
});

welcomeMessage();
