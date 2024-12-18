// Firebase configuration & initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref ,push, onChildAdded, onValue, get, set} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";


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
const auth = getAuth();
const db = getDatabase(app);
const postsRef = ref(db, "posts");
const messagesRef = ref(db, "messages");

// DOM Elements
const loginContainer = document.getElementById("login-container");
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");

const postsListContainer = document.getElementById("posts-list");
const postList = document.getElementById("postList");
const mainContainer = document.getElementById("main-container");

const createPostContainer = document.getElementById("create-post-container");
const postContentInput = document.getElementById("postContent");
const createPostBtn = document.getElementById("createPostBtn");

const chatContainer = document.getElementById("chat-container");
const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;
let currentPostId = null;

// Menampilkan form ketika icon diklik
const iconContainer = document.getElementById('icon-container');
const postForm = document.getElementById('postForm');

// Daftar warna gelap
const darkColors = ["#3b3b3b", "#2a2a2a", "#1b4f72", "#154734", "#4b3621", "#2c3e50"];

function getFormattedTimestamp() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0'); // Tanggal (2 digit)
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Bulan (2 digit, Januari = 0)
  const hours = String(now.getHours()).padStart(2, '0'); // Jam (2 digit)
  const minutes = String(now.getMinutes()).padStart(2, '0'); // Menit (2 digit)

  return `${day}/${month} ${hours}:${minutes}`;
}

// Inisialisasi audio untuk notifikasi
const notificationSound = new Audio('media/notification.mp3');

// Fungsi untuk memutar suara notifikasi
function playNotificationSound() {
  notificationSound.play();
}

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
    mainContainer.style.display = "none";
    postsListContainer.style.display = "flex";
	postsListContainer.style.flexDirection = "column";
    loadPosts();
	iconContainer.style.display = "block";
    // Setelah login, tampilkan icon pensil

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
        const postElement = document.createElement("div");
        postElement.classList.add('card');
		postElement.style.minWidth =  "95vw"
        postElement.classList.add('text-bg-secondary');
        postElement.classList.add('mb-3');
        const childDiv = document.createElement('div')
        childDiv.classList.add('card-body')
        const childContent = document.createElement('p')
        childContent.classList.add('card-text')
        childContent.innerHTML = `${post.content} <span class="timestamp">${post.timestamp}</span>`;  // Menggunakan key Firebase sebagai ID
		
		
		 //bubble.innerHTML = `<strong>${message.user}:</strong> <br> ${message.text} <span class="timestamp">${message.timestamp}</span>`;;
        childDiv.appendChild(childContent)
        postElement.appendChild(childDiv)

        // Add click handler to join chat room
        postElement.addEventListener("click", () => joinChatRoom(childSnapshot.key, post));
        postList.appendChild(postElement);
      });
    } else {
      postList.innerHTML = "<li>No posts available.</li>";
    }
    // Menampilkan create-post-container setelah posts dimuat
    iconContainer.style.display = "block";
	createPostContainer.style.display = "none";
  });
}


createPostContainer.style.display = "none";
// Saat icon diklik, toggle form create post
iconContainer.addEventListener('click', function() {
  if (createPostContainer.style.display === 'none' || createPostContainer.style.display === '') {
    createPostContainer.style.display = 'block';
	createPostContainer.style.position = "absolute";
	createPostContainer.style.bottom = "0";
	postList.style.maxHeight = '73vh';
  } else {
    createPostContainer.style.display = 'none';
	postList.style.maxHeight = '100vh';
  }
});

// Fungsi untuk submit new post
createPostBtn.addEventListener("click", () => {
  const postContent = postContentInput.value.trim();
  if (postContent) {
    // Tidak perlu generate randomPostId lagi, karena Firebase push akan menghasilkan ID otomatis
    push(postsRef, {
      content: postContent,
      createdBy: currentUser,
      timestamp: getFormattedTimestamp(),
    });

    postContentInput.value = "";
    createPostContainer.style.display = "none";
    postsListContainer.style.display = "flex";
    loadPosts(); // Fungsi untuk memuat posts yang terbaru
  } else {
    alert("Please provide content for your post!");
  }
});


// Join chat room for a specific post
function joinChatRoom(postId, post) {
  currentPostId = postId;
  postsListContainer.style.display = "none";
  createPostContainer.style.display = "none";
  iconContainer.style.display = "none";
  chatContainer.style.display = "flex";
  chatWindow.innerHTML = `<h2>Chat for Post: ${post.postId} by ${post.createdBy}</h2>`;
  loadMessages(postId);
}

// Load messages for the current post
function loadMessages(postId) {
  const postMessagesRef = ref(db, `messages/${postId}`);
  // Assign a dark background color
  chatWindow.innerHTML = ""; // Clear chat window
  onChildAdded(postMessagesRef, (snapshot) => {
    const messageData = snapshot.val();
    if (messageData) {
      chatWindow.appendChild(updateChatWindow(messageData));
      chatWindow.scrollTop = chatWindow.scrollHeight;
	  if (messageData.user !== currentUser) {
        // Notifikasi suara dan browser hanya untuk pesan dari pengguna lain
        playNotificationSound();
        showNotification(messageData);
      }
	}
  })
}

function updateChatWindow(message) {
  const bubble = document.createElement("div");
  const userColor = getDarkColorFromId(message.user);
  bubble.style.backgroundColor = userColor;
  bubble.classList.add("chat-bubble");
  // Menambahkan class berdasarkan user ID (untuk styling berbeda)
  bubble.classList.add(message.user === currentUser ? "own-message" : "other-message");
  bubble.innerHTML = `<strong>${message.user}:</strong> <br> ${message.text} <span class="timestamp">${message.timestamp}</span>`;; // Isi teks pesan

  return bubble
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
      timestamp: getFormattedTimestamp(),
    });

    // Clear input field
    messageInput.value = "";
  }
}
// Navigate back to posts list
function backToPosts() {
  chatContainer.style.display = "none";
  postsListContainer.style.display = "flex";
  createPostContainer.style.display = "block";
  loadPosts();
}

// Minta izin untuk menampilkan notifikasi
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message) {
  if (Notification.permission === "granted") {
    const notification = new Notification('New Message', {
      body: `${message.user}: ${message.text}`,
      icon: 'icon.png' // Ganti dengan ikon yang sesuai
    });

    notification.onclick = () => {
      window.focus();
    };
  }
}

const backButton = document.getElementById("backButton");
backButton.addEventListener("click", backToPosts);
