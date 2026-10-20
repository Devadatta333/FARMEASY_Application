import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { chatWithAIApi, getAIHealthApi } from '../../api/aiApi';
import {
  Bot,
  User,
  Send,
  Sparkles,
  RefreshCw,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tractor,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
  Sprout,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Simple, secure, and resilient markdown renderer
function FormattedText({ content }) {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Horizontal divider
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-3 border-emerald-900/20" />;
        }

        // Headings: ### Header or ## Header
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-emerald-950 mt-3 mb-1">
              {renderInlineStyles(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-emerald-950 mt-4 mb-1">
              {renderInlineStyles(trimmed.slice(3))}
            </h3>
          );
        }

        // Bullet lists: * or -
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-emerald-600 font-bold mt-1 text-xs">•</span>
              <span className="flex-1 text-slate-800">{renderInlineStyles(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered lists: 1. 2. etc
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="font-semibold text-emerald-700 text-xs shrink-0 mt-0.5">
                {numMatch[1]}.
              </span>
              <span className="flex-1 text-slate-800">{renderInlineStyles(numMatch[2])}</span>
            </div>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-slate-800">
            {renderInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Inline formatting: **bold** and *italic*
function renderInlineStyles(text) {
  const parts = [];
  // Regex to match **bold** or *italic*
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-emerald-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export default function AIChatbot() {
  const { user } = useSelector((state) => state.auth);
  const userRole = (user?.role || 'consumer').toLowerCase();
  const isFarmer = userRole === 'farmer';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiOnline, setAiOnline] = useState(true);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [expandedSources, setExpandedSources] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check backend & AI service status on mount
  useEffect(() => {
    getAIHealthApi()
      .then((res) => {
        setAiOnline(res?.status === 'HEALTHY');
      })
      .catch(() => {
        setAiOnline(false);
      });
  }, []);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleSourceExpand = (msgId) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleClearChat = () => {
    setMessages([]);
    setLastFailedMessage(null);
    toast.success('Conversation reset', { icon: '🧹' });
  };

  // Farmer & Consumer suggested prompt starters
  const suggestedQuestions = isFarmer
    ? [
        {
          title: 'Tomato Late Blight Prevention',
          query: 'How do I prevent and manage late blight in my tomato crop?',
        },
        {
          title: 'Wheat Irrigation Schedule',
          query: 'What are the critical irrigation stages for wheat cultivation?',
        },
        {
          title: 'Organic Jeevamrutha Formulation',
          query: 'How do I prepare and apply Jeevamrutha for soil fertility?',
        },
        {
          title: 'Paddy Nutrient Management',
          query: 'What is the recommended NPK schedule and fertilizer dosage for paddy?',
        },
      ]
    : [
        {
          title: 'Available Vegetables in Store',
          query: 'What fresh vegetables are available to buy on FarmEasy right now?',
        },
        {
          title: 'Keeping Leafy Greens Fresh',
          query: 'How should I store leafy greens like spinach so they stay crisp for a week?',
        },
        {
          title: 'Storing Tomatoes Correctly',
          query: 'Why should ripe tomatoes be kept at room temperature instead of the fridge?',
        },
        {
          title: 'Potato & Onion Storage Tips',
          query: 'Can I store potatoes and onions together? What are the best storage conditions?',
        },
      ];

  const handleSendMessage = async (textToSend = null) => {
    const rawText = textToSend !== null ? textToSend : inputText;
    const text = rawText.trim();

    if (!text || loading) return;

    // Reset input
    setInputText('');
    setLastFailedMessage(null);

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage = {
      id: userMessageId,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setLoading(true);

    // Format bounded history for backend
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const data = await chatWithAIApi(text, historyPayload);

      const aiMessageId = `ai-${Date.now()}`;
      const newAiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: data.answer || 'No response received from assistant.',
        sources: Array.isArray(data.sources) ? data.sources : [],
        timestamp: new Date(),
      };

      setMessages([...updatedMessages, newAiMessage]);
      setAiOnline(true);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg =
        error.response?.data?.message ||
        'The FarmEasy AI service could not be reached. Please check that the service is running.';

      toast.error(errorMsg);
      setLastFailedMessage(text);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const retryLastMessage = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  return (
    <DashboardLayout
      title={isFarmer ? 'FarmEasy Agronomic AI Advisor' : 'FarmEasy Marketplace AI Guide'}
    >
      <div className="flex flex-col h-[calc(100vh-140px)] max-h-[860px] bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Top Header Bar */}
        <div
          className={`px-5 py-3.5 border-b flex items-center justify-between text-white ${
            isFarmer
              ? 'bg-gradient-to-r from-[#0a2315] via-[#0d2d1b] to-[#123924] border-emerald-900/60'
              : 'bg-gradient-to-r from-[#062624] via-[#0b3634] to-[#114b48] border-teal-900/60'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                isFarmer
                  ? 'bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950'
                  : 'bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950'
              }`}
            >
              {isFarmer ? <Tractor className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base tracking-tight text-white">
                  {isFarmer ? 'FarmEasy AI Agronomic Advisor' : 'FarmEasy Marketplace Assistant'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isFarmer
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                  }`}
                >
                  {isFarmer ? 'Farmer Telemetry' : 'Consumer Guide'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>
                  {aiOnline
                    ? 'Connected • Grounded in FAISS RAG & Gemini'
                    : 'AI service check in progress'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Messages Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#f8faf7]/60">
          {/* Empty State when no messages */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col justify-center items-center text-center max-w-2xl mx-auto py-6"
            >
              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-xl ${
                  isFarmer
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-teal-100 text-teal-700'
                }`}
              >
                <Sparkles className="w-8 h-8" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {isFarmer
                  ? `Welcome, ${user?.name || 'Farmer'}! How can I assist your farm today?`
                  : `Hello, ${user?.name || 'Shopper'}! What would you like to know about our fresh produce?`}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg leading-relaxed">
                {isFarmer
                  ? 'Ask questions about crop schedules, disease diagnostics, eco-friendly pest controls, soil nutrients, and irrigation techniques grounded in verified agricultural research.'
                  : 'Get expert guidance on vegetable and fruit storage, optimal freshness, nutritional benefits, and available produce directly from our local farmers.'}
              </p>

              {/* Suggested Questions Grid */}
              <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q.query)}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/80 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                        {q.title}
                      </span>
                      <Sprout className="w-3.5 h-3.5 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-2">
                      "{q.query}"
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Message History */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isExpanded = !!expandedSources[msg.id];

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-xs mt-1 ${
                      isUser
                        ? 'bg-emerald-700 text-white font-bold text-xs'
                        : isFarmer
                        ? 'bg-emerald-900 text-amber-300'
                        : 'bg-teal-900 text-emerald-300'
                    }`}
                  >
                    {isUser ? (
                      user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 shadow-xs ${
                      isUser
                        ? 'bg-emerald-700 text-white rounded-tr-sm'
                        : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed select-text font-medium">
                        {msg.content}
                      </p>
                    ) : (
                      <div>
                        <FormattedText content={msg.content} />

                        {/* Grounded Source References */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                              onClick={() => toggleSourceExpand(msg.id)}
                              className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>
                                {msg.sources.length}{' '}
                                {msg.sources.length === 1 ? 'Source Reference' : 'Source References'}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="mt-2 space-y-2">
                                {msg.sources.map((src, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600"
                                  >
                                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-0.5">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>{src.source}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 italic line-clamp-3">
                                      "{src.snippet}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1.5 text-right font-medium ${
                        isUser ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-xs mt-1 ${
                  isFarmer
                    ? 'bg-emerald-900 text-amber-300'
                    : 'bg-teal-900 text-emerald-300'
                }`}
              >
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl rounded-tl-sm bg-white border border-slate-200/90 shadow-xs flex items-center space-x-3">
                <div className="flex space-x-1.5 items-center">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {isFarmer
                    ? 'Consulting agricultural research & formulating advice...'
                    : 'Retrieving produce knowledge & market information...'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Inline Retry Alert */}
          {lastFailedMessage && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between gap-3 text-rose-800 text-xs"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Could not get a response for your last question.</span>
              </div>
              <button
                onClick={retryLastMessage}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isFarmer
                    ? 'Ask about crops, pests, fertilizers, soil, or irrigation...'
                    : 'Ask about produce freshness, storage tips, or market items...'
                }
                maxLength={1500}
                disabled={loading}
                className="w-full pl-4 pr-16 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400 disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium select-none pointer-events-none">
                {inputText.length > 0 && `${inputText.length}/1500`}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || inputText.trim().length === 0}
              className={`p-3 rounded-2xl font-bold flex items-center justify-center transition-all shadow-md shrink-0 ${
                inputText.trim().length > 0 && !loading
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Press <kbd className="font-sans px-1 py-0.5 bg-slate-100 rounded text-slate-600 border">Enter</kbd> to send</span>
            <span>FarmEasy Secure AI • End-to-End JWT Verified</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
