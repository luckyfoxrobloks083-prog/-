import React, { useState, useRef, useEffect } from 'react';
import { Send, Lock, Unlock, Settings, Loader2, KeyRound, AlertTriangle } from 'lucide-react';
import { Message, Sender, AppConfig, DEFAULT_CONFIG, ADMIN_CODE } from './types';
import { streamResponse } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import AdminPanel from './components/AdminPanel';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Real active users for a client-side only app is always 1
  const [activeUsers, setActiveUsers] = useState(1);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load config from LocalStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('loksbox_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        sender: Sender.MODEL,
        text: "Привет! Я НЕЙРОБОТ. Чем могу помочь сегодня?",
        timestamp: Date.now()
      }
    ]);
  }, []);

  // Save config wrapper to persist to LocalStorage
  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    localStorage.setItem('loksbox_config', JSON.stringify(newConfig));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Safety check for maintenance mode (though input is hidden)
    if (!config.isSystemActive && !isAdmin) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: Sender.USER,
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Temporary message placeholder for streaming
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        sender: Sender.MODEL,
        text: '',
        timestamp: Date.now()
      }]);

      await streamResponse(
        messages.concat(userMsg), // Pass full history including new user msg
        input,
        config,
        (textChunk) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: textChunk } : msg
          ));
        }
      );
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        sender: Sender.MODEL,
        text: "Извините, произошла ошибка при соединении с сервером.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCodeInput === ADMIN_CODE) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminCodeInput('');
      setShowAdminPanel(true); // Open panel immediately on login
    } else {
      alert("Неверный код доступа");
      setAdminCodeInput('');
    }
  };

  const handleEditMessage = (id: string, newText: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: newText } : m));
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  // Maintenance View
  if (!config.isSystemActive && !isAdmin) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-950 text-slate-200 p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2 text-white">Система на обслуживании</h1>
          <p className="text-slate-400 mb-8">
            Чат временно недоступен. Администратор проводит технические работы. Пожалуйста, зайдите позже.
          </p>
          <button 
            onClick={() => setShowAdminLogin(true)}
            className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
          >
            Вход для администратора
          </button>
        </div>
        
        {/* Admin Login Modal (Reusable) */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-left border border-slate-800">
              <div className="bg-slate-950 text-white p-6 text-center border-b border-slate-800">
                <KeyRound className="w-10 h-10 mx-auto mb-3 opacity-80 text-indigo-400" />
                <h3 className="text-xl font-bold">Вход для администратора</h3>
              </div>
              <form onSubmit={handleAdminLogin} className="p-6">
                <input
                  type="password"
                  value={adminCodeInput}
                  onChange={(e) => setAdminCodeInput(e.target.value)}
                  placeholder="Код доступа..."
                  className="w-full px-4 py-3 mb-4 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest text-white placeholder-slate-600"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium transition shadow-lg shadow-indigo-900/20"
                  >
                    Войти
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 relative overflow-hidden text-slate-200">
      
      {/* Navbar */}
      <header className="flex-none bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-lg ${
            config.isSystemActive ? 'bg-gradient-to-tr from-indigo-500 to-purple-600' : 'bg-slate-700'
          }`}>
            NB
          </div>
          <div>
            <h1 className="font-bold text-slate-100 leading-tight tracking-tight">НЕЙРОБОТ</h1>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
              {config.modelName}
              {!config.isSystemActive && <span className="text-amber-400 font-bold bg-amber-950/50 border border-amber-900 px-1 rounded ml-1 text-[10px]">OFFLINE</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <>
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600/20 rounded-lg transition text-sm font-medium"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Админ Панель</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="p-2 text-slate-500 hover:text-indigo-400 transition"
              title="Admin Login"
            >
              <Lock className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-slate-950">
        {/* Maintenance Banner for Admin */}
        {!config.isSystemActive && isAdmin && (
          <div className="max-w-3xl mx-auto mb-6 bg-amber-950/30 border border-amber-900/50 p-3 rounded-lg flex items-center gap-3 text-amber-200 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
            <p><strong>Режим обслуживания включен.</strong> Обычные пользователи не видят этот чат. Вы можете использовать его для тестирования.</p>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {messages.map(msg => (
            <ChatBubble 
              key={msg.id} 
              message={msg} 
              isAdmin={isAdmin}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          ))}
          {isLoading && messages[messages.length - 1]?.text === '' && (
            <div className="flex items-center gap-2 text-slate-500 text-sm ml-12 animate-pulse">
               <Loader2 className="w-4 h-4 animate-spin" />
               Думаю...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-slate-900 border-t border-slate-800 p-4 z-10">
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={config.isSystemActive ? "Напишите сообщение..." : "Тестовый ввод (Система отключена)..."}
            className="w-full pl-5 pr-12 py-3.5 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-slate-900 transition shadow-inner text-white placeholder-slate-600 outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-lg shadow-indigo-900/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </footer>

      {/* Admin Login Modal (Reusable logic handled in render above if maintenance mode is active, but we need it here if maintenance is OFF and admin wants to login) */}
      {showAdminLogin && config.isSystemActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-800">
            <div className="bg-slate-950 text-white p-6 text-center border-b border-slate-800">
              <KeyRound className="w-10 h-10 mx-auto mb-3 opacity-80 text-indigo-400" />
              <h3 className="text-xl font-bold">Вход для администратора</h3>
              <p className="text-slate-400 text-sm mt-1">Введите код доступа для продолжения</p>
            </div>
            <form onSubmit={handleAdminLogin} className="p-6">
              <input
                type="password"
                value={adminCodeInput}
                onChange={(e) => setAdminCodeInput(e.target.value)}
                placeholder="Код доступа..."
                className="w-full px-4 py-3 mb-4 bg-slate-950 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest text-white placeholder-slate-600"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium transition shadow-lg shadow-indigo-900/20"
                >
                  Войти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Component */}
      <AdminPanel 
        isOpen={showAdminPanel} 
        onClose={() => setShowAdminPanel(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onClearHistory={() => setMessages([])}
        activeUsers={activeUsers}
      />
    </div>
  );
}

export default App;