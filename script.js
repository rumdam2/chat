// Firebase configuration & initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, get } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-database.js";

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
const createPostContainer = document.getElementById("create-post-container");
const postsListContainer = document.getElementById("posts-list");
const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");
const postContentInput = document.getElementById("postContent");
const createPostBtn = document.getElementById("createPostBtn");
const chatContainer = document.getElementById("chat-container");
const chatWindow = document.getElementById("chat-window");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const showCreatePostBtn = document.getElementById("showCreatePostBtn");
const cancelPostBtn = document.getElementById("cancelPostBtn");

let currentUser = null;
let currentPostId = null;

// Handle login
loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (username) {
    currentUser = username;
    loginContainer.style.display = "none";
    postsListContainer.style.display = "block";
    showCreatePostBtn.style.display = "block"; // Show the button to create posts
    loadPosts(); // Load existing posts
  } else {
    alert("Please enter a valid ID!");
  }
});

// Show the create post form
showCreatePostBtn.addEventListener("click", () => {
  createPostContainer.style.display = "block";
  postsListContainer.style.display = "none";
});

// Cancel the create post form
cancelPostBtn.addEventListener("click", () => {
  createPostContainer.style.display = "none";
  postsListContainer.style.display = "block";
});

// Create a new post with random ID
createPostBtn.addEventListener("click", () => {
  const postContent = postContentInput.value.trim();

  if (postContent) {
    const randomPostId = generateRandomId(); // Generate random ID for the post

    // Save new post to Firebase
    push(postsRef, {
      postId: randomPostId,
      content: postContent,
      createdBy: currentUser,
      timestamp: Date.now(),
    });

    postContentInput.value = ""; // Clear input field

    // Load the new posts list
    loadPosts();
    createPostContainer.style.display = "none";
    postsListContainer.style.display = "block";
  } else {
    alert("Please provide content for your post!");
  }
});

// Generate random ID for post
function generateRandomId() {
  return "post-" + Math.random().toString(36).substr(2, 9); // Random string for post ID
}

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
    } else {
      postsListContainer.innerHTML = "No posts available.";
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
  sendMessage();
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
