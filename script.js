// Created by Deekay1085

const TIME_PER_QUESTION = 15; // seconds

const QUESTIONS = [
  { q: "Which HTML tag is used for the largest heading?", options: ["<h6>", "<h1>", "<head>", "<header>"], answer: 1 },
  { q: "Which CSS property changes the text color of an element?", options: ["font-color", "text-color", "color", "foreground"], answer: 2 },
  { q: "Which keyword declares a variable that cannot be reassigned in JavaScript?", options: ["var", "let", "const", "static"], answer: 2 },
  { q: "What does the CSS box model's 'padding' control?", options: ["Space outside the border", "Space between the content and the border", "The border thickness", "The element's position"], answer: 1 },
  { q: "Which method adds an element to the end of a JavaScript array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: 0 },
  { q: "Which CSS layout module is designed for two-dimensional layouts (rows and columns)?", options: ["Flexbox", "Float", "Grid", "Table-cell"], answer: 2 },
  { q: "What does 'DOM' stand for?", options: ["Document Object Model", "Data Object Mapping", "Display Output Method", "Document Order Markup"], answer: 0 },
  { q: "Which operator checks both value and type in JavaScript?", options: ["==", "=", "===", "!="], answer: 2 }
];

const $ = id => document.getElementById(id);
const screens = { start: $("start-screen"), quiz: $("quiz-screen"), result: $("result-screen") };

let current = 0;
let score = 0;
let answers = [];     // chosen option index per question, or null if unanswered / timed out
let selected = null;
let timeLeft = 0;
let timerId = null;

function show(name) {
  Object.entries(screens).forEach(([key, el]) => { el.hidden = key !== name; });
}

function startQuiz() {
  current = 0;
  score = 0;
  answers = [];
  show("quiz");
  showQuestion();
}

function showQuestion() {
  const item = QUESTIONS[current];
  selected = null;
  $("counter").textContent = `Question ${current + 1} of ${QUESTIONS.length}`;
  $("question").textContent = item.q;
  $("next-btn").disabled = true;
  $("next-btn").textContent = current === QUESTIONS.length - 1 ? "Submit" : "Next";

  const box = $("options");
  box.innerHTML = "";
  item.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.textContent = text; // textContent so tags like <h1> show as text
    btn.addEventListener("click", () => choose(i));
    box.appendChild(btn);
  });
  startTimer();
}

function choose(i) {
  selected = i;
  [...$("options").children].forEach((btn, idx) => btn.classList.toggle("selected", idx === i));
  $("next-btn").disabled = false;
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = TIME_PER_QUESTION;
  updateTimer();
  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      lockAndAdvance(); // time's up: counts as unanswered (or the current selection)
    }
  }, 1000);
}

function updateTimer() {
  $("timer").textContent = `${timeLeft}s`;
  const low = timeLeft <= 5;
  $("timer").classList.toggle("low", low);
  $("time-fill").classList.toggle("low", low);
  $("time-fill").style.width = (timeLeft / TIME_PER_QUESTION) * 100 + "%";
}

function lockAndAdvance() {
  clearInterval(timerId);
  const picked = selected; // null if nothing chosen before time ran out
  answers.push(picked);
  if (picked === QUESTIONS[current].answer) score++;
  current++;
  if (current < QUESTIONS.length) showQuestion();
  else showResults();
}

function showResults() {
  show("result");
  const total = QUESTIONS.length;
  $("score").textContent = `${score} / ${total}`;
  const pct = score / total;
  $("verdict").textContent =
    pct === 1 ? "Perfect score!" :
    pct >= 0.7 ? "Great job." :
    pct >= 0.4 ? "Not bad. Review the answers below and try again." :
    "Keep practicing. Check the correct answers below.";

  const review = $("review");
  review.innerHTML = "";
  QUESTIONS.forEach((item, i) => {
    const li = document.createElement("li");
    const picked = answers[i];
    const correct = picked === item.answer;

    const q = document.createElement("div");
    q.className = "q-text";
    q.textContent = item.q;

    const yours = document.createElement("p");
    yours.className = "ans " + (correct ? "ok" : "no");
    yours.textContent = "Your answer: " + (picked === null ? "No answer (time ran out)" : item.options[picked]) + (correct ? " ✓" : " ✗");

    li.append(q, yours);
    if (!correct) {
      const right = document.createElement("p");
      right.className = "ans right";
      right.textContent = "Correct answer: " + item.options[item.answer];
      li.appendChild(right);
    }
    review.appendChild(li);
  });
}

$("start-btn").addEventListener("click", startQuiz);
$("next-btn").addEventListener("click", lockAndAdvance);
$("restart-btn").addEventListener("click", startQuiz);