const firebaseConfig = {
  apiKey: "AIzaSyBSPpm_Ufd10fa70HmCiZcDS53UpvZCVfE",
  authDomain: "chat-84023.firebaseapp.com",
  databaseURL: "https://chat-84023-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-84023",
  storageBucket: "chat-84023.firebasestorage.app",
  messagingSenderId: "138879175931",
  appId: "1:138879175931:web:418c9dfc90849c4198745e",
  measurementId: "G-NGXY4DDEKW"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, "messages");

// DOM Elements
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");
const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;

// Daftar warna gelap
const darkColors = ["#3b3b3b", "#2a2a2a", "#1b4f72", "#154734", "#4b3621", "#2c3e50"];

// Fungsi untuk mendapatkan warna dari ID (acak dari daftar warna gelap)
function getDarkColorFromId(id) {
  const hash = id.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return darkColors[hash % darkColors.length];
}

// Handle login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username) {
    currentUser = username;
    loginContainer.style.display = "none";
    chatContainer.style.display = "flex";
  } else {
    alert("Please enter a valid ID!");
  }
});

// Handle sending messages (with Enter or Send button)
function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    push(messagesRef, {
      text: message,
      user: currentUser,
      timestamp: Date.now(),
    });
    messageInput.value = ""; // Clear input field
  }
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Display messages
onChildAdded(messagesRef, (snapshot) => {
  const data = snapshot.val();
  const messageElement = document.createElement("p");

  // Assign a dark background color
  const userColor = getDarkColorFromId(data.user);

  messageElement.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
  messageElement.style.backgroundColor = userColor; // Apply background color
  messageElement.style.color = "#fff"; // Keep text white for contrast
  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
