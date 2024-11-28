// Firebase configuration & initialization (already present)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, get, child } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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
const postsRef = ref(db, "posts");
const messagesRef = ref(db, "messages");

// DOM Elements
const loginContainer = document.getElementById("login-container");
const createPostContainer = document.getElementById("create-post-container");
const postsListContainer = document.getElementById("posts-list");
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");
const postIdInput = document.getElementById("postIdInput");
const postContentInput = document.getElementById("postContent");
const createPostBtn = document.getElementById("createPostBtn");
const chatContainer = document.getElementById("chat-container");
const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;
let currentPostId = null;

// Handle login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username) {
    currentUser = username;
    loginContainer.style.display = "none";
    createPostContainer.style.display = "flex";
  } else {
    alert("Please enter a valid ID!");
  }
});

// Create a new post
createPostBtn.addEventListener("click", () => {
  const postId = postIdInput.value.trim();
  const postContent = postContentInput.value.trim();
  
  if (postId && postContent) {
    // Save new post to Firebase
    push(postsRef, {
      postId: postId,
      content: postContent,
      createdBy: currentUser,
      timestamp: Date.now(),
    });

    postIdInput.value = "";
    postContentInput.value = "";

    // Show post list and go back to it
    loadPosts();
    createPostContainer.style.display = "none";
    postsListContainer.style.display = "block";
  } else {
    alert("Please provide both Post ID and content!");
  }
});

// Load and display all posts
function loadPosts() {
  postsListContainer.innerHTML = "";
  get(postsRef).then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val();
        const postElement = document.createElement("li");
        postElement.textContent = `${post.postId} - ${post.content}`;
        
        // Click handler to join chat room for that post
        postElement.addEventListener("click", () => joinChatRoom(childSnapshot.key, post));
        
        postsListContainer.appendChild(postElement);
      });
    }
  });
}

// Join chat room for a specific post
function joinChatRoom(postId, post) {
  currentPostId = postId;
  postsListContainer.style.display = "none";
  chatContainer.style.display = "flex";
  chatWindow.innerHTML = `<h2>Chat for Post: ${post.postId} by ${post.createdBy}</h2>`;
  loadMessages(postId);
}

// Load messages from a specific post's chat room
function loadMessages(postId) {
  const postMessagesRef = ref(db, `messages/${postId}`);
  onChildAdded(postMessagesRef, (snapshot) => {
    const messageData = snapshot.val();
    const messageElement = document.createElement("p");
    messageElement.innerHTML = `<strong>${messageData.user}:</strong> ${messageData.text}`;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  });
}

// Send a message in the chat room
sendBtn.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message && currentPostId) {
    push(ref(db, `messages/${currentPostId}`), {
      text: message,
      user: currentUser,
      timestamp: Date.now(),
    });
    messageInput.value = "";
  }
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (message && currentPostId) {
    push(ref(db, `messages/${currentPostId}`), {
      text: message,
      user: currentUser,
      timestamp: Date.now(),
    });
    messageInput.value = ""; // Clear input field
  }
}

// Initial load of posts list
loadPosts();
