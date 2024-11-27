import { initializeApp } from "firebase/app";  // Inisialisasi Firebase
import { getAuth, signInAnonymously } from "firebase/auth";  // Autentikasi
import { getDatabase, ref, push } from "firebase/database";  // Realtime Database

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSPpm_Ufd10fa70HmCiZcDS53UpvZCVfE",
  authDomain: "chat-84023.firebaseapp.com",
  projectId: "chat-84023",
  storageBucket: "chat-84023.firebasestorage.app",
  messagingSenderId: "138879175931",
  appId: "1:138879175931:web:418c9dfc90849c4198745e",
  measurementId: "G-NGXY4DDEKW"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

const usernameInput = document.getElementById("username");
const enterChatButton = document.getElementById("enter-chat");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendMessageButton = document.getElementById("send-message");
const messagesList = document.getElementById("messages");

// Enter chat function
enterChatButton.addEventListener("click", () => {
  const username = usernameInput.value;
  if (username) {
    auth.signInAnonymously().then(() => {
      localStorage.setItem("username", username);
      chatBox.style.display = "block";
      usernameInput.style.display = "none";
      enterChatButton.style.display = "none";
      loadMessages();
    });
  }
});

// Load messages from Firebase
function loadMessages() {
  db.ref("messages").on("child_added", (snapshot) => {
    const message = snapshot.val();
    const li = document.createElement("li");
    li.textContent = `${message.username}: ${message.text}`;
    messagesList.appendChild(li);
    messagesList.scrollTop = messagesList.scrollHeight;
  });
}

// Send message function
sendMessageButton.addEventListener("click", () => {
  const text = messageInput.value;
  const username = localStorage.getItem("username");

  if (text && username) {
    db.ref("messages").push({
      username: username,
      text: text,
    });
    messageInput.value = "";
  }
});
