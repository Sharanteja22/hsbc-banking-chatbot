// import { useState, useEffect, useRef } from "react";
// import { IoSendSharp } from "react-icons/io5";
// import './Chat.css'
// const Chat = () => {
//   const [messages, setMessages] = useState([]);
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const chatContainerRef = useRef(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!query.trim()) return;

//     const userMessage = { text: query, sender: "user" };
//     setMessages(prev => [...prev, userMessage]);
//     setQuery("");
//     setLoading(true);

//     try {
//       // IMPORTANT: Get the token to authorize the request
//       const token = localStorage.getItem('token');

//       const response = await fetch("http://127.0.0.1:8000/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           // Add the Authorization header
//           "Authorization": `Bearer ${token}` 
//         },
//         body: JSON.stringify({ message: query }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to get a response from the server.");
//       }

//       const data = await response.json();
//       const aiResponse = { text: data.response || "Sorry, I couldn't process that.", sender: "ai" };
//       setMessages(prev => [...prev, aiResponse]);

//     } catch (error) {
//       console.error("Error:", error);
//       const errorResponse = { text: "An error occurred.", sender: "ai" };
//       setMessages(prev => [...prev, errorResponse]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   return (
//     <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
//       <div ref={chatContainerRef} style={{ height: '75vh', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
//         {messages.map((msg, index) => (
//           <div key={index} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '10px 0' }}>
//             <div style={{ display: 'inline-block', padding: '10px', borderRadius: '10px', backgroundColor: msg.sender === 'user' ? '#0b93f6' : '#e5e5ea', color: msg.sender === 'user' ? 'white' : 'black' }}>
//               {msg.text}
//             </div>
//           </div>
//         ))}
//         {loading && <div style={{ textAlign: 'left', margin: '10px 0' }}>...typing</div>}
//       </div>
//       <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Message AI Assistant..."
//           style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
//         />
//         <button type="submit" disabled={!query.trim()} style={{ padding: '10px', marginLeft: '10px' }}>
//           <IoSendSharp />
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Chat;

"use client"

import { useState, useEffect, useRef } from "react"
import { IoSendSharp } from "react-icons/io5"
import "./Chat.css"

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const chatContainerRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    const userMessage = { text: query, sender: "user" }
    setMessages((prev) => [...prev, userMessage])
    const currentQuery = query // Store the query before clearing
    setQuery("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: currentQuery }), // Use stored query
      })

      if (!response.ok) {
        throw new Error("Failed to get a response from the server.")
      }

      const data = await response.json()
      const aiResponse = { text: data.response || "Sorry, I couldn't process that.", sender: "ai" }
      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error:", error)
      const errorResponse = { text: "An error occurred.", sender: "ai" }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="chat-wrapper dark">
      {/* Background */}
      <div className="chat-background">
        <div className="bg-gradient"></div>
        <div className="mesh-gradient"></div>
      </div>

      {/* Chat Body */}
      <div ref={chatContainerRef} className="chat-body">
        {messages.map((msg, index) => (
          <div key={index} className={`message-container ${msg.sender === "user" ? "user-container" : "ai-container"}`}>
            <div className="message-bubble">
              <div className="message-content">
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-container ai-container">
            <div className="message-bubble typing-bubble">
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Dialog */}
      <div className="input-dialog-container">
        <form onSubmit={handleSubmit} className="input-dialog">
          <div className="input-field-container">
            <textarea
              className="input-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI Assistant..."
              rows="1"
            />
            <button type="submit" className={`send-btn ${query.trim() ? "active" : ""}`} disabled={!query.trim()}>
              <IoSendSharp />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat
