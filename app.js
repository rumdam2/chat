// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
