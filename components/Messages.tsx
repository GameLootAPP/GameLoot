import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Search, MoreVertical, Shield, Clock, PlusCircle, MessageSquare, Gamepad2, Volume2, UserX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ChatSession, User } from '../types';

interface MessagesProps {
  initialChatId: string | null;
  onUserClick: (userId: string) => void;
}

const Messages: React.FC<MessagesProps> = ({ initialChatId, onUserClick }) => {
  const { chats, currentUser, getUser, sendMessage, showToast } = useApp();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChatId);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialChatId) setSelectedChatId(initialChatId);
  }, [initialChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChatId, chats]);

  if (!currentUser) return null;

  const sortedChats = [...chats].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  
  const filteredChats = sortedChats.filter(chat => {
    const otherId = chat.participantIds.find(id => id !== currentUser.id);
    const otherUser = otherId ? getUser(otherId) : null;
    if (!otherUser) return false;
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
           otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeChat = chats.find(c => c.id === selectedChatId);
  const otherParticipantId = activeChat?.participantIds.find(id => id !== currentUser.id);
  const activeUser = otherParticipantId ? getUser(otherParticipantId) : null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !messageText.trim()) return;
    sendMessage(selectedChatId, messageText);
    setMessageText('');
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative">
      
      {/* Sidebar: Conversation List */}
      {/* On mobile: visible only when no chat is selected. On tablet/desktop: always 320px-384px wide */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/20 z-10 transition-all duration-300 ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-6 lg:p-7 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic">Comms</h2>
            <button 
                onClick={() => showToast("Search for new gamer signals...", "info")}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-primary hover:bg-slate-800 hover:scale-105 transition-all shadow-lg active:scale-95"
            >
              <PlusCircle size={22} />
            </button>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Scan active frequencies..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl py-3 pl-11 pr-5 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-950/10">
          {filteredChats.map(chat => {
            const otherId = chat.participantIds.find(id => id !== currentUser.id);
            const user = otherId ? getUser(otherId) : null;
            const lastMsg = chat.messages[chat.messages.length - 1];
            
            if (!user) return null;

            return (
              <button 
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full flex items-center gap-4 p-4 md:p-5 hover:bg-white/5 transition-all border-l-4 group ${selectedChatId === chat.id ? 'border-primary bg-primary/10' : 'border-transparent'}`}
              >
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-slate-800 object-cover relative z-10" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-4 border-slate-950 rounded-full z-20" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-black text-white truncate text-sm uppercase tracking-tight italic">{user.username}</span>
                    <span className="text-[9px] text-slate-600 font-bold uppercase shrink-0">
                      {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">
                    {lastMsg ? (lastMsg.senderId === currentUser.id ? 'YOU: ' : '') + lastMsg.text : 'SIGNAL OPENED...'}
                  </p>
                </div>
              </button>
            );
          })}

          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-8 text-center opacity-30">
              <MessageSquare size={48} className="text-slate-500 mb-6" />
              <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em]">No active transmissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      {/* On mobile: Slides in from right when a chat is selected. On tablet/desktop: Fills remaining space. */}
      <div className={`flex-1 flex flex-col bg-slate-950/30 relative transition-all duration-300 ${!selectedChatId ? 'hidden md:flex' : 'flex animate-in slide-in-from-right duration-300'}`}>
        {activeChat && activeUser ? (
          <>
            {/* Active Header */}
            <header className="h-16 md:h-20 lg:h-24 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-20 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedChatId(null)} className="md:hidden p-2.5 text-slate-400 hover:text-white transition-all bg-slate-900/50 rounded-xl border border-slate-800">
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onUserClick(activeUser.id)}>
                  <div className="relative">
                    <img src={activeUser.avatarUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-primary/20 object-cover group-hover:scale-105 transition-transform" alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-slate-950" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm md:text-base uppercase tracking-tight italic">{activeUser.username}</span>
                      {activeUser.badges.includes('Pro') && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-black tracking-tighter hidden sm:block">PRO</span>}
                    </div>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest animate-pulse">Signal Live</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden sm:flex p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                    <Volume2 size={20} />
                </button>
                <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all">
                    <MoreVertical size={20} />
                </button>
              </div>
            </header>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 no-scrollbar bg-gradient-to-b from-slate-950/40 to-transparent">
              <div className="flex flex-col items-center py-12 opacity-10 select-none">
                <Shield size={64} className="text-slate-500 mb-4" />
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-center">End-to-End Encryption Enabled</p>
                <p className="text-[10px] font-bold mt-2 uppercase tracking-widest italic">Communication synced: {new Date(activeChat.lastMessageTimestamp).toLocaleDateString()}</p>
              </div>

              {activeChat.messages.map((msg, idx) => {
                const isMine = msg.senderId === currentUser.id;
                const showAvatar = idx === 0 || activeChat.messages[idx-1].senderId !== msg.senderId;
                
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                        {!isMine && showAvatar && (
                             <img src={activeUser.avatarUrl} className="w-8 h-8 rounded-full border border-slate-800 self-end mb-1" alt="" />
                        )}
                        <div className={!isMine && !showAvatar ? 'ml-11' : ''}>
                            <div className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-2xl relative ${
                                isMine 
                                    ? 'bg-primary text-white rounded-br-none shadow-primary/20' 
                                    : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700/50 backdrop-blur-md shadow-slate-950/50'
                            }`}>
                                <p className="font-medium">{msg.text}</p>
                                <div className={`text-[8px] mt-2 font-black opacity-30 uppercase tracking-widest ${isMine ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Chat Input Area */}
            <div className="p-4 md:p-6 lg:p-8 bg-slate-950/60 border-t border-slate-800/50 backdrop-blur-2xl">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 md:gap-4 max-w-5xl mx-auto">
                <div className="relative flex-1">
                    <input 
                    type="text" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Broadcast your signal..."
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl px-6 py-4 md:py-5 text-sm font-medium text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-slate-600 shadow-inner"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                    </div>
                </div>
                <button 
                  type="submit"
                  disabled={!messageText.trim()}
                  className="w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-3xl shadow-2xl shadow-primary/30 hover:bg-violet-600 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all flex items-center justify-center shrink-0 border border-primary/40"
                >
                  <Send size={24} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center p-10 text-center bg-slate-950/10">
             <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-900/50 border border-slate-800 rounded-[3rem] flex items-center justify-center mb-10 shadow-3xl group transition-all hover:border-primary/40">
                <Gamepad2 size={56} className="text-slate-800 animate-pulse group-hover:text-primary transition-colors" />
             </div>
             <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-4">Initialize Gear Comms</h2>
             <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-sm leading-loose opacity-60">
               Select an active gamer frequency from the archives to establish a secure transmission link.
             </p>
             <div className="mt-12 flex items-center gap-2 bg-slate-900/50 px-5 py-2.5 rounded-full border border-slate-800">
                <Clock size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Protocol Version 2.4.0</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;