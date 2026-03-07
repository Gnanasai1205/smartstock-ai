import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Bot, X, Send, User, GripHorizontal } from 'lucide-react';
import api from '../services/api';

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your SmartStock AI. Ask me about your inventory, low stock items, or what we should restock today." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const nodeRef = useRef(null);
  const fabRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting to the network right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Draggable nodeRef={fabRef} bounds="parent">
        <div ref={fabRef} className={`fixed bottom-6 right-6 z-40 transition-opacity cursor-move ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button 
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-cyan-600 hover:bg-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-transform transform hover:scale-110"
          >
            <Bot className="w-7 h-7 text-white" />
          </button>
        </div>
      </Draggable>

      {/* Chat Window */}
      <Draggable nodeRef={nodeRef} handle=".chat-drag-handle" bounds="parent">
        <div ref={nodeRef} className={`fixed top-24 right-6 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 transition-opacity duration-300 flex flex-col ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}>
          
          {/* Header */}
          <div className="chat-drag-handle cursor-move flex items-center justify-between bg-slate-900/80 p-4 rounded-t-2xl border-b border-slate-700 text-white hover:bg-slate-900 transition-colors">
            <div className="flex items-center space-x-3">
              <GripHorizontal className="w-4 h-4 text-slate-500 opacity-50" />
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                <Bot className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">SmartStock AI</h3>
              <p className="text-[10px] text-cyan-400 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] space-x-2 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-1 ${m.role === 'user' ? 'bg-slate-600' : 'bg-cyan-900/50 border border-cyan-500/30'}`}>
                  {m.role === 'user' ? <User className="w-3.5 h-3.5 text-slate-300" /> : <Bot className="w-3.5 h-3.5 text-cyan-400" />}
                </div>

                <div className={`p-3 text-sm rounded-2xl leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-sm' 
                    : 'bg-slate-700 text-slate-200 border border-slate-600 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="flex space-x-2">
                 <div className="w-6 h-6 rounded-full bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-cyan-400" /></div>
                 <div className="bg-slate-700 border border-slate-600 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-400 flex space-x-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                 </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-3 bg-slate-900/80 border-t border-slate-700 rounded-b-2xl">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about inventory..."
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-xl py-2.5 pl-4 pr-12 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="absolute right-2 p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        </div>
      </Draggable>
    </>
  );
}

export default AIAssistantWidget;
