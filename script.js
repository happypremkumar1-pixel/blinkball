
const playArea = document.getElementById("playArea");
const ball = document.getElementById("ball");
const timerDisplay = document.getElementById("timer");
const durationSelect = document.getElementById("duration");
const speedSelect = document.getElementById("speed");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const statusMessage = document.getElementById("status");
const areaHint = document.getElementById("areaHint");
const liveLabel = document.querySelector(".live-label");

let remaining = Number(durationSelect.value);
let running = false;
let deadline = 0;
let timerInterval = null;
let animationFrame = null;
let phase = 0;
let lastFrame = 0;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return String(mins).padStart(2, "0") + ":" +
         String(secs).padStart(2, "0");
}

function showTime() {
  timerDisplay.textContent = formatTime(remaining);
}

function placeBall(timestamp) {
  if (!running) return;

  if (!lastFrame) lastFrame = timestamp;
  const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
  lastFrame = timestamp;

  const speed = speedSelect.value === "slow" ? 0.55 : 1.0;
  phase += delta * speed;

  const width = playArea.clientWidth;
  const height = playArea.clientHeight;

  const marginX = Math.min(35, width * 0.1);
  const marginY = Math.min(35, height * 0.12);

  const usableX = Math.max(20, width / 2 - marginX);
  const usableY = Math.max(20, height / 2 - marginY);

  const x = width / 2 + Math.sin(phase) * usableX;
  const y = height / 2 + Math.sin(phase * 0.7) * usableY;

  ball.style.left = x + "px";
  ball.style.top = y + "px";

  animationFrame = requestAnimationFrame(placeBall);
}

function stopAnimation() {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  lastFrame = 0;
}

function stopTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function finishExercise() {
  running = false;
  stopTimer();
  stopAnimation();

  remaining = 0;
  showTime();

  startBtn.textContent = "Start again";
  statusMessage.textContent =
    "Session complete. Take a comfortable break.";
  areaHint.textContent = "Well done!";
  liveLabel.innerHTML = "<span></span> COMPLETE";
}

function updateTimer() {
  remaining = Math.max(
    0,
    Math.ceil((deadline - Date.now()) / 1000)
  );

  showTime();

  if (remaining <= 0) {
    finishExercise();
  }
}

function startExercise() {
  if (running) {
    running = false;
    stopTimer();
    stopAnimation();

    remaining = Math.max(
      0,
      Math.ceil((deadline - Date.now()) / 1000)
    );
    showTime();

    startBtn.textContent = "Resume exercise";
    statusMessage.textContent = "Paused. Resume when comfortable.";
    areaHint.textContent = "Take your time";
    liveLabel.innerHTML = "<span></span> PAUSED";
    return;
  }

  if (remaining <= 0) {
    remaining = Number(durationSelect.value);
  }

  running = true;
  deadline = Date.now() + remaining * 1000;
  lastFrame = 0;

  startBtn.textContent = "Pause exercise";
  statusMessage.textContent = "Follow the ball at a comfortable pace.";
  areaHint.textContent = "Follow the moving dot";
  liveLabel.innerHTML = "<span></span> IN SESSION";

  stopTimer();
  timerInterval = setInterval(updateTimer, 200);

  animationFrame = requestAnimationFrame(placeBall);
}

function resetExercise() {
  running = false;
  stopTimer();
  stopAnimation();

  remaining = Number(durationSelect.value);
  phase = 0;

  showTime();

  ball.style.left = "50%";
  ball.style.top = "50%";

  startBtn.textContent = "Start exercise";
  statusMessage.textContent = "Ready when you are.";
  areaHint.textContent = "Your little adventure starts here";
  liveLabel.innerHTML = "<span></span> READY";
}

startBtn.addEventListener("click", startExercise);
resetBtn.addEventListener("click", resetExercise);

durationSelect.addEventListener("change", () => {
  if (!running) {
    remaining = Number(durationSelect.value);
    showTime();
  }
});

showTime();
