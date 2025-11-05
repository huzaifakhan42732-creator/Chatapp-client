import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const SOCKET_URL = "https://chatapp-server-production-b48e.up.railway.app";

let socket;

function App() {
  const [joined, setJoined] = useState(false);
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // 🔌 Connect to Socket.io server
  useEffect(() => {
    socket = io(SOCKET_URL);

    socket.on("connect", () => console.log("✅ Connected to Socket.io Server"));

    socket.on("disconnect", () => console.log("❌ Disconnected from server"));

    // 📥 Listen for messages from server
    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 🚪 Join group
  const handleJoin = (e) => {
    e.preventDefault();
    if (name && group) {
      socket.emit("join", group);
      setJoined(true);
    }
  };

  // 📤 Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      const msgData = { sender: name, text: input, room: group };
      setMessages((prev) => [...prev, msgData]); // show instantly
      socket.emit("send", msgData); // send to backend
      setInput("");
    }
  };

  // 🚪 Leave group
  const handleLeave = () => {
    socket.emit("leave", group);
    setJoined(false);
    setMessages([]);
    setGroup("");
  };

  // 🧹 Clear chat locally
  const handleClearChat = () => {
    if (window.confirm("Clear all messages?")) setMessages([]);
  };

  return (
    <div className="app">
      {!joined ? (
        <div className="login-container">
          <div className="login-card">
            <h1 className="neon-text">💠 NexaChat</h1>
            <form onSubmit={handleJoin}>
              <input
                type="text"
                placeholder="Group Name"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              />
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button type="submit">Join Chat</button>
            </form>
          </div>

          <div className="right-side">
            <h1 className="logo-glow">👨🏻‍💻 NexaChat</h1>
            <p className="quote">"Where every message lights a spark ⚡"</p>
          </div>
        </div>
      ) : (
        <div className="chat-layout">
          {/* Sidebar */}
          <div className="sidebar">
            <h2 className="sidebar-title">💬 Groups</h2>
            <ul>
              <li className="active-group">{group}</li>
              <li>🌐 Global</li>
              <li>🎮 Gaming</li>
              <li>💼 Work</li>
            </ul>

            <button className="clear-btn" onClick={handleClearChat}>
              🧹 Clear Chat
            </button>

            <button className="clear-btn" onClick={handleLeave}>
              🚪 Leave Group
            </button>
          </div>

          {/* Chat Box */}
          <div className="chat-box">
            <div className="chat-header">
              <h2>{group} 💬</h2>
              <span>Logged in as {name}</span>
            </div>

            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`message ${
                    msg.sender === name ? "own" : "other"
                  }`}
                >
                  <strong>{msg.sender}: </strong> {msg.text}
                </div>
              ))}
            </div>

            <form className="chat-input" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
