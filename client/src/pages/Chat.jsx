
// import { useState, useEffect, useRef } from "react"
// import { IoSendSharp } from "react-icons/io5"
// import "./Chat.css"
// // --- NEW IMPORTS ---
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
// import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa"
// // --------------------

// const Chat = () => {
//   const [messages, setMessages] = useState([])
//   const [query, setQuery] = useState("")
//   const [loading, setLoading] = useState(false)
//   const chatContainerRef = useRef(null)

//   // --- NEW: Speech Recognition Hooks ---
//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition
//   } = useSpeechRecognition()

//   // Sync the transcript from the microphone with our input box
//   useEffect(() => {
//     setQuery(transcript)
//   }, [transcript])
//   // ------------------------------------

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!query.trim()) return

//     const userMessage = { text: query, sender: "user" }
//     setMessages((prev) => [...prev, userMessage])
//     const currentQuery = query
//     setQuery("")
//     setLoading(true)
//     resetTranscript() // --- NEW: Reset the transcript after sending ---

//     try {
//       const token = localStorage.getItem("token")
//       const response = await fetch("http://127.0.0.1:8000/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ message: currentQuery }),
//       })

//       if (!response.ok) {
//         throw new Error("Failed to get a response from the server.")
//       }

//       const data = await response.json()
//       const aiResponse = { text: data.response || "Sorry, I couldn't process that.", sender: "ai" }
//       setMessages((prev) => [...prev, aiResponse])
//     } catch (error) {
//       console.error("Error:", error)
//       const errorResponse = { text: "An error occurred.", sender: "ai" }
//       setMessages((prev) => [...prev, errorResponse])
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault()
//       handleSubmit(e)
//     }
//   }

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
//     }
//   }, [messages])

//   // --- NEW: Check for browser support ---
//   if (!browserSupportsSpeechRecognition) {
//     return <span>Browser doesn't support speech recognition. Please use Chrome.</span>
//   }
//   // --------------------------------------

//   return (
//     <div className="chat-wrapper dark">
//       {/* Background */}
//       <div className="chat-background">
//         <div className="bg-gradient"></div>
//         <div className="mesh-gradient"></div>
//       </div>

//       {/* Chat Body */}
//       <div ref={chatContainerRef} className="chat-body">
//         {messages.map((msg, index) => (
//           <div key={index} className={`message-container ${msg.sender === "user" ? "user-container" : "ai-container"}`}>
//             <div className="message-bubble">
//               <div className="message-content">
//                 <div className="message-text">{msg.text}</div>
//               </div>
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="message-container ai-container">
//             <div className="message-bubble typing-bubble">
//               <div className="typing-indicator">
//                 <div className="typing-dots">
//                   <span></span>
//                   <span></span>
//                   <span></span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Input Dialog */}
//       <div className="input-dialog-container">
//         <form onSubmit={handleSubmit} className="input-dialog">
//           <div className="input-field-container">
//             <textarea
//               className="input-field"
//               value={query}
//               onChange={(e) => setQuery(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Message AI Assistant..."
//               rows="1"
//             />
//             {/* --- NEW: Microphone Button --- */}
//             <button
//               type="button"
//               className={`mic-btn ${listening ? "listening" : ""}`}
//               onClick={listening ? SpeechRecognition.stopListening : SpeechRecognition.startListening}
//             >
//               {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
//             </button>
//             {/* ----------------------------- */}
//             <button type="submit" className={`send-btn ${query.trim() ? "active" : ""}`} disabled={!query.trim()}>
//               <IoSendSharp />
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default Chat



import { useState, useEffect, useRef } from "react";
import { IoSendSharp } from "react-icons/io5";
import "./Chat.css";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
// --- NEW: Import Form for the dropdown ---
import { Form } from "react-bootstrap";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  // --- NEW: State to store the selected language ---
  const [listenLanguage, setListenLanguage] = useState('en-IN'); // Default to English (India)

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    setQuery(transcript);
  }, [transcript]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { text: query, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");
    setLoading(true);
    resetTranscript();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: currentQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to get a response from the server.");
      }

      const data = await response.json();
      const aiResponse = { text: data.response || "Sorry, I couldn't process that.", sender: "ai" };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error:", error);
      const errorResponse = { text: "An error occurred.", sender: "ai" };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition. Please use Chrome.</span>;
  }

  // --- NEW: Function to start listening in the selected language ---
  const startListening = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: listenLanguage,
    });
  };

  return (
    <div className="chat-wrapper dark">
      {/* Background */}
      <div className="chat-background">
        <div className="bg-gradient"></div>
        <div className="mesh-gradient"></div>
      </div>

      {/* Chat Body */}
      <div ref={chatContainerRef} className="chat-body">
        {/* ... (rest of your chat body JSX is the same) ... */}
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
        {/* --- NEW: Language Selector Dropdown --- */}
        <Form.Select 
            size="sm" 
            value={listenLanguage} 
            onChange={(e) => setListenLanguage(e.target.value)}
            style={{ width: '150px', marginBottom: '5px' }}
            aria-label="Select speech language"
        >
            <option value="en-IN">English</option>
            <option value="te-IN">Telugu (తెలుగు)</option>
        </Form.Select>
        
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
            <button
              type="button"
              className={`mic-btn ${listening ? "listening" : ""}`}
              // --- UPDATE: Use our new startListening function ---
              onClick={listening ? SpeechRecognition.stopListening : startListening}
            >
              {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <button type="submit" className={`send-btn ${query.trim() ? "active" : ""}`} disabled={!query.trim()}>
              <IoSendSharp />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Chat;