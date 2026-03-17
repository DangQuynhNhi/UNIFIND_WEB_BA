
import React, { useState } from 'react';
import { Report } from '../../types';
import { AlertTriangle, SkipForward, CheckCircle2, Trash2, Ban, ShieldAlert, Link as LinkIcon, Eye, ExternalLink, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface AdminReportsTabProps {
  reports: Report[];
  onUpdateReportStatus: (id: string, action: 'RESOLVED' | 'DISMISSED') => void;
  onDeleteItem: (id: string) => void;
  onDeleteUser: (userId: string) => void;
  onViewItem: (itemId: string) => void;
  onViewUser: (userId: string) => void;
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({ 
    reports, onUpdateReportStatus, onDeleteItem, onDeleteUser, onViewItem, onViewUser 
}) => {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  const filteredReports = reports.filter(r => filter === 'ALL' ? true : r.status === filter);

  // --- Handlers for processing reports ---
  const handleProcessItemReport = (report: Report, action: 'DELETE_ITEM' | 'KEEP_ITEM') => {
      if (!report.targetId) return;

      if (action === 'DELETE_ITEM') {
          const confirmMsg = language === 'vi' 
            ? `Hành động mạnh: Xóa vật phẩm ID: ${report.targetId}?\nHành động này không thể hoàn tác.`
            : `Strong action: Delete item ID: ${report.targetId}?\nThis action cannot be undone.`;
          
          if (window.confirm(confirmMsg)) {
              onDeleteItem(report.targetId);
              onUpdateReportStatus(report.id, 'RESOLVED');
              alert(language === 'vi' ? `Đã xóa vật phẩm và đóng báo cáo.` : `Item deleted and report closed.`);
          }
      } else {
          const confirmMsg = language === 'vi'
            ? "Giữ lại vật phẩm và đánh dấu báo cáo là 'Đã giải quyết'?"
            : "Keep item and mark report as 'Resolved'?";
          
          if (window.confirm(confirmMsg)) {
              onUpdateReportStatus(report.id, 'RESOLVED');
          }
      }
  };

  const handleProcessUserReport = (report: Report, action: 'BAN_USER' | 'WARN_USER') => {
      if (!report.targetId) return;

      if (action === 'BAN_USER') {
          const confirmMsg = language === 'vi'
            ? `CẢNH BÁO: Bạn sắp BAN người dùng ID: ${report.targetId}?\nTất cả vật phẩm của họ sẽ bị xóa.`
            : `WARNING: You are about to BAN user ID: ${report.targetId}?\nAll their items will be deleted.`;
          
          if (window.confirm(confirmMsg)) {
              onDeleteUser(report.targetId);
              onUpdateReportStatus(report.id, 'RESOLVED');
          }
      } else {
          const confirmMsg = language === 'vi'
            ? "Đánh dấu báo cáo là 'Đã giải quyết' (Không ban user)?"
            : "Mark report as 'Resolved' (No user ban)?";
          
           if (window.confirm(confirmMsg)) {
              onUpdateReportStatus(report.id, 'RESOLVED');
          }
      }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-amber-500"/>
                {language === 'vi' ? 'Trung tâm Báo cáo' : 'Report Center'}
            </h2>
            <div className="bg-brand-900 p-1 rounded-lg border border-brand-800 flex">
                <button onClick={() => setFilter('ALL')} className={`px-4 py-1 text-xs font-bold rounded ${filter === 'ALL' ? 'bg-brand-700 text-white' : 'text-gray-400'}`}>{language === 'vi' ? 'Tất cả' : 'All'}</button>
                <button onClick={() => setFilter('PENDING')} className={`px-4 py-1 text-xs font-bold rounded ${filter === 'PENDING' ? 'bg-amber-600 text-white' : 'text-gray-400'}`}>{language === 'vi' ? 'Chờ xử lý' : 'Pending'}</button>
                <button onClick={() => setFilter('RESOLVED')} className={`px-4 py-1 text-xs font-bold rounded ${filter === 'RESOLVED' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>{language === 'vi' ? 'Đã xử lý' : 'Resolved'}</button>
            </div>
        </div>

        <div className="grid gap-4">
            {filteredReports.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-brand-800 rounded-xl">
                    <CheckCircle2 className="w-12 h-12 text-green-500/20 mx-auto mb-3"/>
                    <p className="text-gray-500">{language === 'vi' ? 'Không có báo cáo nào trong mục này.' : 'No reports in this category.'}</p>
                </div>
            ) : (
                filteredReports.map(report => (
                    <div key={report.id} className={`relative bg-brand-800 border ${report.status === 'PENDING' ? 'border-amber-500/30' : 'border-brand-700'} p-5 rounded-xl shadow-lg transition hover:shadow-xl`}>
                        {report.status === 'PENDING' && (
                            <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-black text-[10px] font-bold rounded-bl-lg rounded-tr-lg">
                                {language === 'vi' ? 'CHỜ XỬ LÝ' : 'PENDING'}
                            </div>
                        )}
                        
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Info Section */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        report.type === 'USER' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                                        report.type === 'ITEM' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
                                        'bg-gray-700 border-gray-600 text-gray-400'
                                    }`}>
                                        {report.type === 'USER' ? (language === 'vi' ? 'NGƯỜI DÙNG' : 'USER') : (language === 'vi' ? 'VẬT PHẨM' : 'ITEM')} {language === 'vi' ? 'BÁO CÁO' : 'REPORT'}
                                    </span>
                                    <span className="text-gray-500 text-xs">• {new Date(report.timestamp).toLocaleString()}</span>
                                </div>
                                
                                <h3 className="text-white font-bold text-lg">{report.reason}</h3>
                                
                                <div className="bg-brand-900/50 p-4 rounded-lg border border-brand-700/50">
                                    <p className="text-sm text-gray-300"><span className="text-gray-500 text-xs uppercase tracking-wide font-bold mr-2">{language === 'vi' ? 'Chi tiết:' : 'Details:'}</span> {report.details || (language === 'vi' ? "Không có mô tả chi tiết." : "No detailed description.")}</p>
                                    
                                    <div className="mt-4 pt-3 border-t border-brand-700/50 flex flex-col sm:flex-row gap-4">
                                        {/* Target Info */}
                                        <div className="flex-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{language === 'vi' ? 'Đối tượng bị báo cáo' : 'Reported Target'}</p>
                                            <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-brand-700/30">
                                                <div>
                                                    <p className="text-xs font-mono text-gray-300">ID: {report.targetId || 'N/A'}</p>
                                                    {report.targetName && <p className="text-xs text-brand-400 font-bold">{report.targetName}</p>}
                                                </div>
                                                
                                                {report.targetId && report.type === 'ITEM' && (
                                                    <button 
                                                        onClick={() => onViewItem(report.targetId!)} 
                                                        className="px-3 py-1 bg-brand-700 hover:bg-brand-600 text-white text-xs rounded-lg flex items-center gap-1 transition shadow"
                                                    >
                                                        <ExternalLink className="w-3 h-3"/> {language === 'vi' ? 'Xem vật phẩm' : 'View Item'}
                                                    </button>
                                                )}
                                                {report.targetId && report.type === 'USER' && (
                                                    <button 
                                                        onClick={() => onViewUser(report.targetId!)} 
                                                        className="px-3 py-1 bg-brand-700 hover:bg-brand-600 text-white text-xs rounded-lg flex items-center gap-1 transition shadow"
                                                    >
                                                        <User className="w-3 h-3"/> {language === 'vi' ? 'Xem người dùng' : 'View User'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reporter Info */}
                                        <div className="flex-1">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{language === 'vi' ? 'Người báo cáo' : 'Reporter'}</p>
                                            <div className="flex items-center justify-between bg-black/20 p-2 rounded border border-brand-700/30">
                                                <div>
                                                    <p className="text-xs font-mono text-gray-300">{report.reporterId}</p>
                                                </div>
                                                <button 
                                                    onClick={() => onViewUser(report.reporterId)} 
                                                    className="p-1.5 text-brand-400 hover:text-white hover:bg-brand-800 rounded transition" 
                                                    title={language === 'vi' ? 'Xem hồ sơ người báo cáo' : "View Reporter Profile"}
                                                >
                                                     <ExternalLink className="w-3 h-3"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Section */}
                            {report.status === 'PENDING' && (
                                <div className="lg:w-64 flex flex-col gap-2 justify-center border-l border-brand-700/50 lg:pl-6">
                                    <p className="text-xs font-bold text-gray-400 mb-1 uppercase text-center lg:text-left">{language === 'vi' ? 'Xử lý vi phạm' : 'Process Violation'}</p>
                                    
                                    {/* ITEM ACTIONS */}
                                    {report.type === 'ITEM' && (
                                        <button 
                                            onClick={() => handleProcessItemReport(report, 'DELETE_ITEM')}
                                            className="w-full py-2.5 px-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 group"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover:animate-bounce"/> {language === 'vi' ? 'Xóa Item & Xử lý' : 'Delete Item & Process'}
                                        </button>
                                    )}

                                    {/* USER ACTIONS */}
                                    {report.type === 'USER' && (
                                        <button 
                                            onClick={() => handleProcessUserReport(report, 'BAN_USER')}
                                            className="w-full py-2.5 px-3 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/30 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 group"
                                        >
                                            <Ban className="w-4 h-4 group-hover:scale-110"/> {language === 'vi' ? 'Ban User & Xử lý' : 'Ban User & Process'}
                                        </button>
                                    )}

                                    {/* COMMON ACTIONS */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onUpdateReportStatus(report.id, 'DISMISSED')}
                                            className="flex-1 py-2 px-3 bg-brand-900 hover:bg-brand-800 text-gray-400 border border-brand-700 rounded-lg text-xs font-medium transition"
                                        >
                                            {language === 'vi' ? 'Bỏ qua' : 'Dismiss'}
                                        </button>
                                        <button 
                                            onClick={() => onUpdateReportStatus(report.id, 'RESOLVED')}
                                            className="flex-1 py-2 px-3 bg-green-600/10 hover:bg-green-600 text-green-400 hover:text-white border border-green-600/30 rounded-lg text-xs font-bold transition"
                                        >
                                            {language === 'vi' ? 'Giữ lại' : 'Resolve'}
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {report.status !== 'PENDING' && (
                                <div className="lg:w-64 flex flex-col justify-center items-center lg:items-end opacity-50">
                                    <div className="flex items-center gap-2 text-green-500 font-bold bg-green-900/20 px-4 py-2 rounded-lg border border-green-500/30">
                                        <CheckCircle2 className="w-5 h-5"/> {language === 'vi' ? 'Đã giải quyết' : 'Resolved'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
