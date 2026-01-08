import React, { useState, useEffect, useRef } from "react";
import "./ChatBot.css";
import { sendChatMessage, getQuickActions } from "../services/api";

function ChatBot({ analysisResult, jobRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [quickActions, setQuickActions] = useState([]);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load quick actions when chat opens
  // Load quick actions when chat opens
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isOpen && quickActions.length === 0) {
      loadQuickActions();
    }
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const loadQuickActions = async () => {
    try {
      const contextData = analysisResult
        ? JSON.stringify({ analysisResult, jobRole })
        : null;
      const response = await getQuickActions(contextData);
      if (response.success) {
        setQuickActions(response.actions);
      }
    } catch (error) {
      console.error("Error loading quick actions:", error);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    // Add user message to UI
    const userMessage = {
      role: "user",
      message: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const contextData = analysisResult
        ? JSON.stringify({ analysisResult, jobRole })
        : null;

      const response = await sendChatMessage(
        textToSend,
        sessionId,
        contextData
      );

      if (response.success) {
        // Update session ID
        if (!sessionId) {
          setSessionId(response.sessionId);
        }

        // Add assistant response
        const assistantMessage = {
          role: "assistant",
          message: response.message,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error.message || "Failed to send message. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  // Initial welcome message
  const getWelcomeMessage = () => {
    if (analysisResult) {
      return `Hello! I'm your AI career advisor. I can see you're targeting a ${
        jobRole || "position"
      } with a ${
        analysisResult.matchPercentage || ""
      }% match. How can I help you today?`;
    }
    return "Hello! I'm your AI career advisor. I'm here to help you with skill gaps, career advice, and learning paths. How can I assist you today?";
  };

  return (
    <>
      {/* Chat Button */}
      <div
        className={`chat-button ${isOpen ? "hidden" : ""}`}
        onClick={toggleChat}
        title="Open AI Career Advisor"
      >
        <span className="chat-icon">💬</span>
        <span className="chat-badge">AI</span>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chat-window ${isMinimized ? "minimized" : ""}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <span className="chat-header-icon">🤖</span>
              <div>
                <div className="chat-header-title">AI Career Advisor</div>
                <div className="chat-header-status">Online</div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-header-btn"
                onClick={toggleMinimize}
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? "▢" : "▁"}
              </button>
              <button
                className="chat-header-btn"
                onClick={clearChat}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                className="chat-header-btn"
                onClick={toggleChat}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container */}
          {!isMinimized && (
            <>
              <div className="chat-messages">
                {/* Welcome Message */}
                {messages.length === 0 && (
                  <div className="chat-message assistant">
                    <div className="chat-message-avatar">🤖</div>
                    <div className="chat-message-content">
                      <div className="chat-message-text">
                        {getWelcomeMessage()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.role}`}>
                    {msg.role === "assistant" && (
                      <div className="chat-message-avatar">🤖</div>
                    )}
                    <div className="chat-message-content">
                      <div className="chat-message-text">{msg.message}</div>
                      <div className="chat-message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <div className="chat-message-avatar user">👤</div>
                    )}
                  </div>
                ))}

                {/* Loading */}
                {isLoading && (
                  <div className="chat-message assistant">
                    <div className="chat-message-avatar">🤖</div>
                    <div className="chat-message-content">
                      <div className="chat-message-text">
                        <span className="chat-typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="chat-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)}>✕</button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length === 0 && quickActions.length > 0 && (
                <div className="chat-quick-actions">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="chat-quick-action-btn"
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="chat-input-container">
                {messages.length > 0 && (
                  <button
                    className="chat-clear-btn"
                    onClick={clearChat}
                    title="Clear conversation"
                  >
                    🗑️
                  </button>
                )}
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your career..."
                  disabled={isLoading}
                  rows="1"
                />
                <button
                  className="chat-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  {isLoading ? "..." : "➤"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default ChatBot;
