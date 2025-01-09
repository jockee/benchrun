import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCq8hCEihBoaiGkfeCLbEvLTgJSc2Ax4kU",
  authDomain: "benchrun-ef548.firebaseapp.com",
  projectId: "benchrun-ef548",
  storageBucket: "benchrun-ef548.firebasestorage.app",
  messagingSenderId: "1017917216219",
  appId: "1:1017917216219:web:7323069c81180c3f2383fe",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Save score function
window.saveScore = async function (score) {
  const today = new Date().toISOString().split("T")[0];
  await addDoc(collection(db, "highScores"), {
    score: score,
    date: today,
    timestamp: serverTimestamp(),
  });
  loadHighScores();
};

window.loadHighScores = async function () {
  const today = new Date().toISOString().split("T")[0];
  const highScoresDiv = document.getElementById("highScores");

  const q = query(
    collection(db, "highScores"),
    where("date", "==", today),
    orderBy("score", "desc"),
    limit(5),
  );
  const querySnapshot = await getDocs(q);

  let scoresHtml =
    '<h3 class="text-2xl text-blue-700 font-bold mb-4">Today\'s Top Scores:</h3><ul>';

  querySnapshot.forEach((doc) => {
    scoresHtml += `<li class="text-lg mb-2">${doc.data().score.toFixed(2)}</li>`;
  });

  scoresHtml += "</ul>";
  highScoresDiv.innerHTML = scoresHtml;
};

// Load high scores when page loads
document.addEventListener("DOMContentLoaded", function () {
  window.loadHighScores();
});

function validateMinutes(input) {
  // Remove any decimal points and non-numeric characters
  input.value = input.value.replace(/[^\d]/g, "");

  // Only enforce maximum limit during typing
  let value = parseInt(input.value) || 0;
  if (value > 100) input.value = 100;
}

function validateSeconds(input) {
  // Remove any decimal points and non-numeric characters
  input.value = input.value.replace(/[^\d]/g, "");

  // Ensure the value is within bounds
  let value = parseInt(input.value) || 0;
  if (value > 59) input.value = 59;
  if (value < 0) input.value = 0;
}

function calculate() {
  // Get input values and ensure they're integers
  const minutes =
    Math.floor(parseInt(document.getElementById("minutes").value)) || 0;
  const seconds =
    Math.floor(parseInt(document.getElementById("seconds").value)) || 0;
  const benchPress =
    Math.floor(parseInt(document.getElementById("benchPress").value)) || 0;

  // Validate inputs
  if (
    minutes < 26 ||
    minutes > 100 ||
    seconds < 0 ||
    seconds > 60 ||
    benchPress === 0
  ) {
    alert("Please enter valid values for both run time and bench press");
    return;
  }

  // Convert time to minutes
  const totalTimeInMinutes = minutes + seconds / 60;

  const result = benchPress + 6210000 / Math.pow(totalTimeInMinutes, 3);

  // Save score to Firebase
  window.saveScore(result);

  // Display result
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <div class="bg-white p-6 rounded-xl shadow-md">
      <h3 class="text-2xl text-blue-700 font-bold mb-4">Results:</h3>
      <p class="text-lg mb-2">10K Time: ${minutes}:${seconds.toString().padStart(2, "0")} (${totalTimeInMinutes.toFixed(2)} minutes)</p>
      <p class="text-lg mb-4">Bench Press: ${benchPress} kg</p>
      <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl text-center text-2xl shadow-lg shadow-green-500/30 animate-pop">
        <strong>Score:</strong><br>
        ${result.toFixed(2)}
      </div>
    </div>
  `;
}

// Make functions globally available
window.validateMinutes = validateMinutes;
window.validateSeconds = validateSeconds;
window.calculate = calculate;
