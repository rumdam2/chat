// Import Firebase SDK (untuk Firebase v9+ modular SDK)
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getDatabase, ref, push, onValue } from "firebase/database";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSPpm_Ufd10fa70HmCiZcDS53UpvZCVfE",
  authDomain: "chat-84023.firebaseapp.com",
  projectId: "chat-84023",
  storageBucket: "chat-84023.firebasestorage.app",
  messagingSenderId: "138879175931",
  appId: "1:138879175931:web:418c9dfc90849c4198745e",
  measurementId: "G-NGXY4DDEKW"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Auth dan Database
const auth = getAuth(app);
const db = getDatabase(app);

// Fungsi untuk login anonim
const loginButton = document.getElementById("login-button");
const chatBox = document.getElementById("chat-box");
const usernameInput = document.getElementById("username-input");

loginButton.addEventListener("click", () => {
  console.log("Button clicked"); // Pastikan tombol ditekan
  const username = usernameInput.value;
  if (username) {
    signInAnonymously(auth)
      .then(() => {
        console.log("Signed in anonymously");
        localStorage.setItem("username", username);
        chatBox.style.display = "block";
        usernameInput.style.display = "none";
        loginButton.style.display = "none";
      })
      .catch((error) => {
        console.error("Login failed", error);
      });
  } else {
    console.log("Username is empty");
  }
});

// Fungsi kirim pesan
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-message");

sendButton.addEventListener("click", () => {
  const message = messageInput.value;
  const username = localStorage.getItem("username");

  if (message && username) {
    // Mendapatkan referensi ke database untuk menulis pesan
    const messagesRef = ref(db, "messages");
    push(messagesRef, {
      username: username,
      text: message
    });
    messageInput.value = ""; // Reset input pesan setelah mengirim
  }
});

// Fungsi untuk menampilkan pesan dari Firebase
const messagesList = document.getElementById("messages-list");
const messagesRef = ref(db, "messages");

onValue(messagesRef, (snapshot) => {
  const messages = snapshot.val();
  messagesList.innerHTML = ''; // Reset daftar pesan

  for (let id in messages) {
    const messageData = messages[id];
    const li = document.createElement("li");
    li.textContent = `${messageData.username}: ${messageData.text}`;
    messagesList.appendChild(li);
  }
});
