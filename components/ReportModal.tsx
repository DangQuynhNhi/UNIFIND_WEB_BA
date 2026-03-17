
import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ReportType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  type: ReportType;
  targetName?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, type, targetName }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { t, language } = useLanguage();

  const getReasons = () => {
      if (language === 'vi') {
          switch(type) {
              case 'ITEM': return ['Nội dung không phù hợp', 'Spam/Lừa đảo', 'Đã tìm thấy', 'Thông tin sai lệch'];
              case 'USER': return ['Quấy rối', 'Hồ sơ giả mạo', 'Spamming', 'Hoạt động nghi ngờ'];
              case 'CHAT': return ['Quấy rối/Bắt nạt', 'Ngôn ngữ không phù hợp', 'Nỗ lực lừa đảo', 'Khác'];
              default: return ['Khác'];
          }
      }
      switch(type) {
          case 'ITEM': return ['Inappropriate Content', 'Spam/Scam', 'Already Found', 'False Information'];
          case 'USER': return ['Harassment', 'Fake Profile', 'Spamming', 'Suspicious Activity'];
          case 'CHAT': return ['Harassment/Bullying', 'Inappropriate Language', 'Scam Attempt', 'Other'];
          default: return ['Other'];
      }
  };

  const handleSubmit = () => {
      if (!reason) return;
      onSubmit(reason, details);
      setSubmitted(true);
      setTimeout(() => {
          setSubmitted(false);
          setReason('');
          setDetails('');
          onClose();
      }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-fade-in">
        
        {submitted ? (
            <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                <h3 className="text-xl font-bold text-white">{language === 'vi' ? 'Đã gửi báo cáo' : 'Report Submitted'}</h3>
                <p className="text-gray-400 mt-2">{language === 'vi' ? 'Cảm ơn bạn đã giúp giữ cho cộng đồng của chúng ta an toàn.' : 'Thank you for helping keep our community safe.'}</p>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-amber-500"/>
                            {language === 'vi' ? 'Báo cáo' : 'Report'} {type === 'ITEM' ? (language === 'vi' ? 'Bài đăng' : 'Post') : type === 'USER' ? (language === 'vi' ? 'Người dùng' : 'User') : (language === 'vi' ? 'Trò chuyện' : 'Chat')}
                        </h2>
                        {targetName && <p className="text-sm text-gray-400 mt-1">{language === 'vi' ? 'Đối tượng' : 'Target'}: <span className="text-white font-medium">{targetName}</span></p>}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{language === 'vi' ? 'Lý do' : 'Reason'}</label>
                        <select 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-600 outline-none"
                        >
                            <option value="" className="text-gray-500">{language === 'vi' ? 'Chọn một lý do...' : 'Select a reason...'}</option>
                            {getReasons().map(r => <option key={r} value={r} className="text-gray-900 bg-white">{r}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{language === 'vi' ? 'Chi tiết bổ sung (Tùy chọn)' : 'Additional Details (Optional)'}</label>
                        <textarea 
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            rows={3}
                            className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-600 outline-none"
                            placeholder={language === 'vi' ? 'Cung cấp thêm bối cảnh...' : 'Provide more context...'}
                        />
                    </div>

                    <button 
                        onClick={handleSubmit}
                        disabled={!reason}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {language === 'vi' ? 'Gửi báo cáo' : 'Submit Report'}
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
