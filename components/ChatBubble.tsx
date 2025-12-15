import React from 'react';
import { Message, Sender } from '../types';
import { Bot, User, Edit2, Trash2 } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  isAdmin: boolean;
  onEdit: (id: string, newText: string) => void;
  onDelete: (id: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isAdmin, onEdit, onDelete }) => {
  const isUser = message.sender === Sender.USER;
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(message.text);

  const handleSave = () => {
    onEdit(message.id, editText);
    setIsEditing(false);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg shadow-black/20 ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
            : 'bg-emerald-600 text-white'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble Content */}
        <div className="flex flex-col gap-1 min-w-[120px]">
          <div className={`relative px-4 py-3 rounded-2xl shadow-md text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
            isUser 
              ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-br-none border border-indigo-500/30' 
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
          }`}>
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-2 text-slate-200 bg-slate-900 rounded border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400 hover:text-white underline decoration-slate-600">Отмена</button>
                  <button onClick={handleSave} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition-colors">Сохранить</button>
                </div>
              </div>
            ) : (
              message.text
            )}
          </div>
          
          {/* Admin Controls */}
          {isAdmin && !isEditing && (
            <div className={`flex gap-3 text-xs text-slate-500 ${isUser ? 'justify-end' : 'justify-start'} px-1`}>
              <button onClick={() => setIsEditing(true)} className="hover:text-indigo-400 flex items-center gap-1 transition-colors">
                <Edit2 size={10} /> Ред.
              </button>
              <button onClick={() => onDelete(message.id)} className="hover:text-red-400 flex items-center gap-1 transition-colors">
                <Trash2 size={10} /> Удл.
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;