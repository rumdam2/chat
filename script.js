// Firebase configuration & initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref ,push, onChildAdded, onValue, get} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSPpm_Ufd10fa70HmCiZcDS53UpvZCVfE",
  authDomain: "chat-84023.firebaseapp.com",
  databaseURL: "https://chat-84023-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-84023",
  storageBucket: "chat-84023.firebasestorage.app",
  messagingSenderId: "138879175931",
  appId: "1:138879175931:web:418c9dfc90849c4198745e",
  measurementId: "G-NGXY4DDEKW",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const postsRef = ref(db, "posts");
const messagesRef = ref(db, "messages");

// DOM Elements
const loginContainer = document.getElementById("login-container");
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");

const postsListContainer = document.getElementById("posts-list");
const postList = document.getElementById("postList");

const createPostContainer = document.getElementById("create-post-container");
const postContentInput = document.getElementById("postContent");
const createPostBtn = document.getElementById("createPostBtn");

const chatContainer = document.getElementById("chat-container");
const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;
let currentPostId = null;

// Daftar warna gelap
const darkColors = ["#3b3b3b", "#2a2a2a", "#1b4f72", "#154734", "#4b3621", "#2c3e50"];

// Fungsi untuk mendapatkan warna dari ID (acak dari daftar warna gelap)
function getDarkColorFromId(id) {
  const hash = id.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return darkColors[hash % darkColors.length];
}

// Handle user login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username) {
    currentUser = username;
    loginContainer.style.display = "none";
    postsListContainer.style.display = "block";
    loadPosts();
  } else {
    alert("Please enter a valid ID!");
  }
});

// Load posts from Firebase
function loadPosts() {
  postList.innerHTML = "";
  get(postsRef).then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val();
        const postElement = document.createElement("li");
        postElement.textContent = `${post.content}`;  // Menggunakan key Firebase sebagai ID

        // Add click handler to join chat room
        postElement.addEventListener("click", () => joinChatRoom(childSnapshot.key, post));
        postList.appendChild(postElement);
      });
    } else {
      postList.innerHTML = "<li>No posts available.</li>";
    }
    // Menampilkan create-post-container setelah posts dimuat
    createPostContainer.style.display = "block";
  });
}


// Create a new post
createPostBtn.addEventListener("click", () => {
  const postContent = postContentInput.value.trim();
  if (postContent) {
    // Tidak perlu generate randomPostId lagi, karena Firebase push akan menghasilkan ID otomatis
    push(postsRef, {
      content: postContent,
      createdBy: currentUser,
      timestamp: Date.now(),
    });

    postContentInput.value = "";
    createPostContainer.style.display = "none";
    postsListContainer.style.display = "block";
    loadPosts();
  } else {
    alert("Please provide content for your post!");
  }
});


// Join chat room for a specific post
function joinChatRoom(postId, post) {
  currentPostId = postId;
  postsListContainer.style.display = "none";
  createPostContainer.style.display = "none";
  chatContainer.style.display = "flex";
  chatWindow.innerHTML = `<h2>Chat for Post: ${post.postId} by ${post.createdBy}</h2>`;
  loadMessages(postId);
}

// Load messages for the current post
function loadMessages(postId) {
  const postMessagesRef = ref(db, `messages/${postId}`);
  chatWindow.innerHTML = ""; // Clear chat window
  // Assign a dark background color
  onValue(postMessagesRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const messageData = childSnapshot.val();
      const messageElement = document.createElement("p");
      if (messageData) {
        messageElement.innerHTML = `<strong>${messageData.user}:</strong> ${messageData.text}`;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }

    });
  })
}

// // Send a message
sendBtn.addEventListener("click", () => {
  const messageText = messageInput.value;
  if (messageText.trim()) {
    sendMessage(messageText);
  }
  messageInput.value = ''; // Clear input after send
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});


function sendMessage() {
  const message = messageInput.value.trim(); // Ambil teks dari input
  if (message && currentPostId) {
    // Mengirim pesan ke Firebase
    push(ref(db, `messages/${currentPostId}`), {
      text: message,
      user: currentUser,
      timestamp: Date.now(),
    });

    // Clear input field
    messageInput.value = "";
  }
}

function updateChatWindow(messages) {
  // Membersihkan chat window sebelum merender ulang
  chatWindow.innerHTML = "";

  console.log(messages)
  // Iterasi semua pesan dari Firebase
  for (const id in messages) {
    const msg = messages[id];

    // Membuat elemen chat bubble
    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble");

    // Menambahkan class berdasarkan user ID (untuk styling berbeda)
    bubble.classList.add(msg.user === currentUser ? "own-message" : "other-message");

    bubble.textContent = msg.text; // Isi teks pesan

    // Menambahkan bubble chat ke dalam chat window
    chatWindow.appendChild(bubble);
  }

  // Scroll otomatis ke bawah
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Memantau data dari Firebase
onChildAdded(ref(db, `messages/${currentPostId}`), (snapshot) => {
  console.log(123123123123123123)
  const messages = snapshot.val();
  if (messages) {
    updateChatWindow(messages); // Perbarui chat window dengan pesan terbaru
  } else {
    chatWindow.innerHTML = "<p>No messages yet.</p>"; // Tampilkan pesan jika ruang chat kosong
  }
});

// Navigate back to posts list
function backToPosts() {
  chatContainer.style.display = "none";
  postsListContainer.style.display = "block";
  createPostContainer.style.display = "block";
  loadPosts();
}

const backButton = document.getElementById("backButton");
backButton.addEventListener("click", backToPosts);
