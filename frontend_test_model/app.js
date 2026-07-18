const apiUrlInput = document.getElementById("apiUrl");
const messageInput = document.getElementById("message");
const predictBtn = document.getElementById("predictBtn");
const resultPanel = document.getElementById("result");
const statusEl = document.getElementById("status");
const detailsEl = document.getElementById("details");
const meterEl = document.getElementById("meter");

function setResultState({
  status,
  details = "",
  score = 0,
  isToxic = false,
  stateClass = "",
}) {
  statusEl.textContent = status;
  detailsEl.textContent = details;
  meterEl.style.width = `${Math.max(0, Math.min(100, score))}%`;
  resultPanel.classList.remove("toxic", "safe");
  if (stateClass) {
    resultPanel.classList.add(stateClass);
  }
  if (isToxic) {
    resultPanel.classList.add("toxic");
  } else if (score > 0) {
    resultPanel.classList.add("safe");
  }
}

async function predict() {
  const apiUrl = apiUrlInput.value.trim();
  const message = messageInput.value.trim();

  if (!apiUrl) {
    setResultState({ status: "Completa la URL de la API." });
    return;
  }

  if (!message) {
    setResultState({ status: "Escribe un mensaje para analizar." });
    return;
  }

  predictBtn.disabled = true;
  predictBtn.textContent = "Probando...";
  setResultState({ status: "Consultando modelo..." });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const scorePercent = Math.round((data.toxicity_score || 0) * 100);

    setResultState({
      status: data.is_toxic ? "Mensaje tóxico detectado" : "Mensaje no tóxico",
      details: `Score: ${data.toxicity_score} | Porcentaje: ${data.toxicity_percentage}`,
      score: scorePercent,
      isToxic: Boolean(data.is_toxic),
    });
  } catch (error) {
    setResultState({
      status: "Error al conectar con la API",
      details: error.message,
      stateClass: "",
      score: 0,
    });
  } finally {
    predictBtn.disabled = false;
    predictBtn.textContent = "Probar modelo";
  }
}

predictBtn.addEventListener("click", predict);
messageInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    predict();
  }
});
