
import React, { useState } from 'react';
import { X, BookOpen, MessageSquare, Edit2, Save, Send, CheckCircle } from 'lucide-react';
import { GuidancePost, Role, Message } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { USERS_DB } from '../constants';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidance: GuidancePost[];
  userRole: Role;
  onUpdateGuidance?: (post: GuidancePost) => void;
  // Feedback Props
  feedbackMessages: Message[]; // Kept for interface compatibility but not used for display
  onSendFeedback: (text: string) => void;
  onRestartTutorial?: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ 
    isOpen, onClose, guidance, userRole, onUpdateGuidance, 
    feedbackMessages, onSendFeedback, onRestartTutorial
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'FEEDBACK'>('GUIDE');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Feedback state for simple form
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!isOpen) return null;

  const startEdit = (post: GuidancePost) => {
      setEditingId(post.id);
      setEditContent(post.content);
  };

  const saveEdit = (post: GuidancePost) => {
      if (onUpdateGuidance) {
          onUpdateGuidance({ ...post, content: editContent, lastUpdated: new Date().toISOString().split('T')[0] });
      }
      setEditingId(null);
  };

  const handleSendFeedback = () => {
      if (!feedbackInput.trim()) return;
      onSendFeedback(feedbackInput);
      setFeedbackInput('');
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
  };

  // Everyone can see the Feedback tab
  const showFeedbackTab = true;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col h-[80vh] max-h-[700px] animate-fade-in overflow-hidden">
        
        {/* Header Tabs */}
        <div className="flex border-b border-brand-800 bg-brand-950/80">
            <button 
                onClick={() => setActiveTab('GUIDE')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'GUIDE' ? 'text-white border-b-2 border-brand-500 bg-brand-900' : 'text-gray-400 hover:text-white'}`}
            >
                <BookOpen className="w-4 h-4"/> {t.help.guideTab}
            </button>
            {showFeedbackTab && (
                <button 
                    onClick={() => setActiveTab('FEEDBACK')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${activeTab === 'FEEDBACK' ? 'text-white border-b-2 border-brand-500 bg-brand-900' : 'text-gray-400 hover:text-white'}`}
                >
                    <MessageSquare className="w-4 h-4"/> {t.help.feedbackTab}
                </button>
            )}
            <button onClick={onClose} className="px-4 text-gray-400 hover:text-white border-l border-brand-800">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative bg-brand-900">
            
            {/* TAB: GUIDANCE */}
            {activeTab === 'GUIDE' && (
                <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {onRestartTutorial && (
                        <div className="bg-brand-800/50 p-6 rounded-xl border border-brand-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white">{language === 'vi' ? 'Hướng dẫn sử dụng' : 'User Tutorial'}</h3>
                                <p className="text-sm text-gray-400 mt-1">{language === 'vi' ? 'Xem lại các bước hướng dẫn sử dụng hệ thống.' : 'Review the steps on how to use the system.'}</p>
                            </div>
                            <button 
                                onClick={onRestartTutorial}
                                className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-md whitespace-nowrap"
                            >
                                {language === 'vi' ? 'Xem hướng dẫn' : 'View Tutorial'}
                            </button>
                        </div>
                    )}
                    {guidance.map(post => (
                        <div key={post.id} className="bg-brand-800/50 p-6 rounded-xl border border-brand-700">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-white">{post.title}</h3>
                                {userRole === 'ADMIN' && onUpdateGuidance && (
                                    !editingId || editingId !== post.id ? (
                                        <button onClick={() => startEdit(post)} className="text-brand-400 hover:text-white p-1">
                                            <Edit2 className="w-4 h-4"/>
                                        </button>
                                    ) : null
                                )}
                            </div>

                            {editingId === post.id ? (
                                <div className="space-y-3">
                                    <textarea 
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={6}
                                        className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-gray-400 hover:text-white">{t.common.cancel}</button>
                                        <button onClick={() => saveEdit(post)} className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg flex items-center gap-2 font-medium">
                                            <Save className="w-3 h-3"/> {t.common.save}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                    {post.content}
                                </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-brand-700/50">
                                {t.help.lastUpdated}: {post.lastUpdated}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB: FEEDBACK */}
            {activeTab === 'FEEDBACK' && showFeedbackTab && (
                <div className="h-full flex flex-col p-6 overflow-hidden">
                    {/* Feedback List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6 pr-2">
                        {feedbackMessages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                {language === 'vi' ? 'Chưa có phản hồi nào.' : 'No feedback yet.'}
                            </div>
                        ) : (
                            feedbackMessages.map(msg => {
                                const sender = USERS_DB.find(u => u.id === msg.senderId);
                                return (
                                    <div key={msg.id} className="bg-brand-800/50 p-4 rounded-xl border border-brand-700">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img src={sender?.avatarUrl || `https://ui-avatars.com/api/?name=User&background=random`} alt="Avatar" className="w-8 h-8 rounded-full" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{sender?.name || 'Unknown User'}</p>
                                                <p className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-brand-800/80 p-4 rounded-xl border border-brand-700 shrink-0">
                        {feedbackSent ? (
                            <div className="text-center animate-fade-in py-4">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-green-500/50">
                                    <CheckCircle className="w-6 h-6 text-green-500"/>
                                </div>
                                <h3 className="text-lg font-bold text-white">{t.help.successTitle}</h3>
                                <button 
                                    onClick={() => setFeedbackSent(false)}
                                    className="mt-2 text-brand-400 hover:text-white text-sm underline"
                                >
                                    {t.help.sendAnother}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-brand-400"/>
                                    {t.help.title}
                                </h4>
                                <textarea 
                                    value={feedbackInput}
                                    onChange={(e) => setFeedbackInput(e.target.value)}
                                    rows={3}
                                    placeholder={t.help.placeholder}
                                    className="w-full bg-white border border-brand-700 rounded-xl p-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                                />
                                <button 
                                    onClick={handleSendFeedback}
                                    disabled={!feedbackInput.trim()}
                                    className="w-full bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                                >
                                    <Send className="w-4 h-4"/> {t.help.send}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
