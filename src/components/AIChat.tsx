import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, Bot, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import Markdown from 'react-markdown';
import portfolioData from '../data/portfolio.json';
import { getGeminiApiKey } from '../lib/api-utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down';
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const initialMessage: Message = { role: 'assistant', content: "Hi! I'm Subhajit's AI assistant. Ask me anything about his experience, projects, or skills!" };
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('portfolio_chat_history');
    return saved ? JSON.parse(saved) : [initialMessage];
  });
  const [sessionStartIndex, setSessionStartIndex] = useState(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('portfolio_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const key = getGeminiApiKey();
    if (!key) {
      setApiKeyError("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your Secrets in Settings.");
    } else {
      setApiKeyError(null);
    }

    if (isOpen) {
      // Start a fresh visual session every time the chat is opened
      setSessionStartIndex(messages.length);
    }
  }, [isOpen]);

  const handleFeedback = (index: number, type: 'up' | 'down') => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, feedback: msg.feedback === type ? undefined : type } : msg
    ));
  };

  const startNewChat = () => {
    if (window.confirm("Start a new conversation? Your current history will be cleared.")) {
      setMessages([initialMessage]);
      localStorage.removeItem('portfolio_chat_history');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Prepare history for @google/genai format
      // Note: History must start with user message if provided, 
      // but generateContent can also take a simple prompt or array of contents.
      const history = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: `
            You are "Subhajit's Portfolio Assistant", a professional, proactive, and concise AI representative for Subhajit Chowdhury, a Data Engineer.
            
            STRICT ADHERENCE:
            1. Provide 100% accurate information based ONLY on the provided Data Source.
            2. Do NOT hallucinate or invent details. If information is missing, state it clearly and offer to connect with Subhajit.
            3. Responses must be super fast and precise.
            
            CONTEXT:
            Subhajit has 3.9+ years of experience, primarily at TCS, specializing in AWS Data Engineering.
            
            DATA SOURCE:
            ${JSON.stringify(portfolioData, null, 2)}
            
            GUIDELINES:
            1. Be professional, direct, and helpful.
            2. Use Markdown for structure (bolding, lists).
            3. Only use information from the Data Source.
            4. If unknown, provide Subhajit's email: ${portfolioData.basics.email}.
            5. Keep responses short (1-2 paragraphs).
            6. PROACTIVE GUIDANCE: At the end of your response, don't just list topics. Instead, ask a clarifying question or offer a specific, relevant highlight from the portfolio to pique interest. For example: "I noticed you're interested in ETL; would you like to hear how I optimized a pipeline to handle 500GB of daily data?" or "Since you asked about AWS, should we dive into my experience with Redshift or Glue first?"
          `
        }
      });

      const aiResponse = response.text;
      
      if (!aiResponse) {
        throw new Error("EMPTY_RESPONSE");
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setApiKeyError(null); // Clear any previous errors on success
    } catch (error: any) {
      console.error("AI Chat Full Error:", error);
      
      let errorMessage = "I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
      
      if (error.message === "API_KEY_MISSING") {
        const msg = "Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your Secrets in Settings.";
        setApiKeyError(msg);
        errorMessage = msg;
      } else if (error.message?.includes("API key not valid") || error.status === 403) {
        const msg = "The API key provided is not valid. Please check your Google AI Studio settings and ensure the key is correct.";
        setApiKeyError(msg);
        errorMessage = msg;
      } else if (error.message?.includes("quota") || error.status === 429) {
        errorMessage = "API quota exceeded. I've had too many conversations recently! Please try again in a few minutes.";
      } else if (error.message?.includes("404")) {
        errorMessage = "The AI model is currently unavailable. This might be a temporary service issue. Please try again later.";
      } else if (!navigator.onLine) {
        errorMessage = "You appear to be offline. Please check your network connection and try again.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] bg-bg border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-card flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-text text-sm">Portfolio Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${apiKeyError ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    <span className="text-[10px] text-text/40">{apiKeyError ? 'Configuration Error' : 'Online'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={startNewChat}
                  title="New Chat"
                  className="p-2 hover:bg-text/5 rounded-lg transition-colors group"
                >
                  <RotateCcw className="w-4 h-4 text-text/40 group-hover:text-blue-400" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-text/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text/40" />
                </button>
              </div>
            </div>

            {/* API Key Error Banner */}
            {apiKeyError && (
              <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20">
                <p className="text-[11px] text-red-400 leading-tight">
                  {apiKeyError}
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-border">
              {/* Initial Greeting for the fresh session */}
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-card text-text border border-border rounded-tl-none shadow-sm">
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                    <Markdown>{initialMessage.content}</Markdown>
                  </div>
                </div>
              </div>

              {messages.slice(sessionStartIndex).filter(m => m.content !== initialMessage.content).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none shadow-md shadow-blue-500/10' 
                      : 'bg-card text-text border border-border rounded-tl-none shadow-sm'
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-border">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-border/30">
                        <button
                          onClick={() => handleFeedback(sessionStartIndex + i, 'up')}
                          className={`p-1 rounded hover:bg-white/5 transition-colors ${msg.feedback === 'up' ? 'text-blue-400' : 'text-text/40'}`}
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(sessionStartIndex + i, 'down')}
                          className={`p-1 rounded hover:bg-white/5 transition-colors ${msg.feedback === 'down' ? 'text-red-400' : 'text-text/40'}`}
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-card text-text border border-border p-4 rounded-2xl rounded-tl-none shadow-sm w-[85%] space-y-3">
                    <div className="flex gap-1.5 mb-2">
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      />
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-text/10 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-text/10 rounded w-[90%] animate-pulse"></div>
                      <div className="h-3 bg-text/10 rounded w-[75%] animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about my experience..."
                  className="w-full bg-bg border border-border rounded-xl py-3 pl-4 pr-12 text-sm text-text focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-text/20"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300 disabled:text-text/20 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-text/40 text-center mt-2">
                Powered by Gemini AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
