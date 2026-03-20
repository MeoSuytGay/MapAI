import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, User, Sparkles, Search, ChevronRight, ChevronLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MapLibreView from '../components/MapLibreView';
import SearchBar from '../components/SearchBar';

const MapPage = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Chào mừng bạn đến với MapAI Đà Nẵng! Tôi có thể giúp gì cho bạn hôm nay?',
      time: '10:00 AM'
    }
  ]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
    
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        text: 'Đang tìm kiếm thông tin về "' + input + '" tại Đà Nẵng...',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-gray-100 overflow-hidden font-sans relative">
      
      {/* --- PHẦN BẢN ĐỒ --- */}
      <motion.div 
        animate={{ width: isChatCollapsed ? '100%' : '65%' }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative h-full bg-[#121212] overflow-hidden"
      >
        <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/')}
            className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-all shadow-xl group"
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
          </motion.button>
          
          <SearchBar />
        </div>

        <MapLibreView />
        
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
      </motion.div>

      {/* --- NÚT TOGGLE CHAT (Lơ lửng giữa 2 phần) --- */}
      <button
        onClick={() => setIsChatCollapsed(!isChatCollapsed)}
        className="absolute z-50 top-1/2 -translate-y-1/2 transition-all duration-300 flex items-center justify-center w-8 h-12 bg-slate-900 border border-white/10 text-white rounded-l-xl hover:bg-blue-600 shadow-2xl"
        style={{ right: isChatCollapsed ? '0' : '35%' }}
      >
        {isChatCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {/* --- PHẦN CHAT UI --- */}
      <motion.div 
        animate={{ 
          width: isChatCollapsed ? '0%' : '35%',
          opacity: isChatCollapsed ? 0 : 1,
          x: isChatCollapsed ? 100 : 0
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="h-full flex flex-col bg-[#0f0f12] relative border-l border-white/5 overflow-hidden"
      >
        {/* Header Chat */}
        <header className="p-6 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">MapAI Assistant</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-gray-400 font-medium">Hỏi để khám phá Đà Nẵng</p>
              </div>
            </div>
          </div>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.type === 'user' ? 'bg-blue-600' : 'bg-white/10'
                  }`}>
                    {msg.type === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-blue-400" />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className={`px-4 py-3 rounded-2xl text-sm ${
                      msg.type === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-500 px-1">{msg.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 pt-2 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về Đà Nẵng..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>

   
    </div>
  );
};

export default MapPage;
