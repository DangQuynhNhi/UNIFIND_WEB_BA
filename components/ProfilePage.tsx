
import React, { useState } from 'react';
import { UserProfile, FoundItem, ItemStatus } from '../types';
import { ItemCard } from './ItemCard';
import { User, Mail, Phone, Calendar, Edit2, Save, X, BookUser, Lock, Key, Check, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useConfirm } from '../contexts/ConfirmContext';

interface ProfilePageProps {
  user: UserProfile;
  userItems: FoundItem[];
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onContact: (item: FoundItem) => void;
  onUpdateStatus?: (itemId: string, status: ItemStatus) => void;
  readOnly?: boolean; // New prop
}

type ItemStatusFilter = 'ALL' | 'PROCESSING' | 'COMPLETED' | 'NOT_PROCESSED';

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
    user, userItems, onUpdateUser, onContact, onUpdateStatus, readOnly = false 
}) => {
  const { t, language } = useLanguage();
  const { confirm } = useConfirm();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState(user);

  // Status Filters
  const [lostFilter, setLostFilter] = useState<ItemStatusFilter>('ALL');
  const [foundFilter, setFoundFilter] = useState<ItemStatusFilter>('ALL');

  // Password Change State
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // --- Filtering Logic ---
  const checkStatus = (item: FoundItem, filter: ItemStatusFilter) => {
      if (filter === 'ALL') return true;
      if (filter === 'PROCESSING') return item.status === 'PUBLISHED' || item.status === 'PENDING';
      if (filter === 'COMPLETED') return item.status === 'COMPLETED';
      if (filter === 'NOT_PROCESSED') return item.status === 'EXPIRED';
      return false;
  };

  const myLostItems = userItems.filter(item => item.type === 'LOST' && checkStatus(item, lostFilter));
  const myFoundItems = userItems.filter(item => item.type === 'FOUND' && checkStatus(item, foundFilter));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    if (user.lastProfileUpdate) {
      const daysSinceUpdate = (Date.now() - user.lastProfileUpdate) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 7) {
        const daysLeft = Math.ceil(7 - daysSinceUpdate);
        alert(language === 'vi' 
          ? `Bạn chỉ có thể cập nhật thông tin cá nhân 7 ngày một lần. Vui lòng thử lại sau ${daysLeft} ngày.` 
          : `You can only update your personal information once every 7 days. Please try again in ${daysLeft} days.`);
        return;
      }
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (formData.name === user.name && formData.phone === user.phone) {
      setIsEditing(false);
      return;
    }

    const isConfirmed = await confirm(
      language === 'vi' ? "Xác nhận lưu" : "Confirm Save",
      language === 'vi' 
        ? "Nếu nhấn lưu bạn chỉ có thể chỉnh sửa lại sau 7 ngày nữa. Bạn có chắc chắn muốn lưu không?" 
        : "If you save, you can only edit again after 7 days. Are you sure you want to save?"
    );

    if (!isConfirmed) return;

    if (onUpdateUser) {
      onUpdateUser({
        ...formData,
        lastProfileUpdate: Date.now()
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      setPassError('');
      setPassLoading(true);

      setTimeout(() => {
          if (passData.current !== user.studentId) {
              setPassError(language === 'vi' ? "Mật khẩu hiện tại không chính xác." : "Incorrect current password.");
              setPassLoading(false);
              return;
          }
          if (passData.new !== passData.confirm) {
              setPassError(language === 'vi' ? "Mật khẩu mới không khớp." : "New passwords do not match.");
              setPassLoading(false);
              return;
          }
          if (passData.new.length < 6) {
              setPassError(language === 'vi' ? "Mật khẩu phải có ít nhất 6 ký tự." : "Password must be at least 6 characters.");
              setPassLoading(false);
              return;
          }
          setPassLoading(false);
          setIsChangingPassword(false);
          setPassData({ current: '', new: '', confirm: '' });
          alert(language === 'vi' ? "Yêu cầu đổi mật khẩu thành công!" : "Password Change Requested successfully!");
      }, 1500);
  };

  const renderFilterTabs = (current: ItemStatusFilter, setFilter: (s: ItemStatusFilter) => void) => (
      <div className="flex flex-wrap gap-2 mb-4">
          {(['ALL', 'PROCESSING', 'COMPLETED', 'NOT_PROCESSED'] as ItemStatusFilter[]).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    current === status 
                    ? 'bg-brand-600 border-brand-500 text-white' 
                    : 'bg-brand-900 border-brand-800 text-gray-400 hover:text-white'
                }`}
              >
                  {status === 'ALL' && (language === 'vi' ? 'Tất cả' : 'All')}
                  {status === 'PROCESSING' && t.common.processing}
                  {status === 'COMPLETED' && t.common.completed}
                  {status === 'NOT_PROCESSED' && t.common.notProcessed}
              </button>
          ))}
      </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 w-full">
      
      {/* Change Password Modal - Only if NOT readOnly */}
      {!readOnly && isChangingPassword && (
           <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsChangingPassword(false)} />
              <div className="relative bg-brand-900 border border-brand-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-brand-800 bg-brand-950/50">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Lock className="w-5 h-5 text-brand-500"/> {t.profile.changePassword}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{language === 'vi' ? 'Cập nhật bảo mật tài khoản của bạn' : 'Update your account security'}</p>
                  </div>
                  
                  <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                      {passError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                              {passError}
                          </div>
                      )}
                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'vi' ? 'Mật khẩu mới' : 'New Password'}</label>
                          <input 
                              type="password"
                              required
                              value={passData.new}
                              onChange={e => setPassData({...passData, new: e.target.value})}
                              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-black focus:ring-2 focus:ring-brand-600 outline-none"
                              placeholder={language === 'vi' ? 'Tối thiểu 6 ký tự' : 'Min 6 characters'}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'vi' ? 'Xác nhận mật khẩu mới' : 'Confirm New Password'}</label>
                           <input 
                              type="password"
                              required
                              value={passData.confirm}
                              onChange={e => setPassData({...passData, confirm: e.target.value})}
                              className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-black focus:ring-2 focus:ring-brand-600 outline-none"
                          />
                      </div>
                      <div className="pt-2 flex gap-3">
                          <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 py-2.5 bg-brand-800 text-gray-300 rounded-xl">{t.common.cancel}</button>
                          <button type="submit" className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl">{language === 'vi' ? 'Cập nhật' : 'Update'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Profile Card */}
      <div className="bg-brand-800 rounded-2xl border border-brand-700 overflow-hidden mb-8 shadow-xl">
        <div className="h-32 bg-gradient-to-r from-brand-700 to-brand-600 relative">
            <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-full border-4 border-brand-800 bg-brand-900 overflow-hidden">
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
        
        <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    {isEditing ? (
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="bg-brand-900 border border-brand-600 rounded px-3 py-1 text-2xl font-bold text-white mb-1 w-full max-w-md focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                    )}
                    <p className="text-brand-accent font-medium">{language === 'vi' ? 'Sinh viên' : 'Student'} • ID: {user.studentId}</p>
                </div>
                
                {/* Only show Edit/Password buttons if NOT readOnly */}
                {!readOnly && (
                    <div className="flex flex-wrap gap-2">
                        {!isEditing ? (
                            <>
                                <button 
                                    onClick={() => setIsChangingPassword(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-950 text-gray-300 rounded-lg transition text-sm font-medium border border-brand-700"
                                >
                                    <Key className="w-4 h-4" /> {t.profile.changePassword}
                                </button>
                                <button 
                                    onClick={handleEditClick}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-600 text-white rounded-lg transition text-sm font-medium border border-brand-600"
                                >
                                    <Edit2 className="w-4 h-4" /> {t.profile.editProfile}
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-900 hover:bg-brand-950 text-white rounded-lg transition text-sm font-medium border border-brand-700"
                                >
                                    <X className="w-4 h-4" /> {t.common.cancel}
                                </button>
                                <button 
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition text-sm font-medium shadow-lg shadow-brand-600/20"
                                >
                                    <Save className="w-4 h-4" /> {t.common.save}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-brand-500">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">{t.profile.email}</p>
                        <p className="text-sm font-medium">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-brand-500">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">{t.profile.phone}</p>
                        {isEditing ? (
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-brand-900 border border-brand-600 rounded px-2 py-1 text-sm font-medium text-white w-full focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        ) : (
                            <p className="text-sm font-medium">{user.phone}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-brand-900 flex items-center justify-center text-brand-500">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">{t.profile.joined}</p>
                        <p className="text-sm font-medium">{new Date(user.joinedDate).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* User Items */}
      <div className="space-y-8">
        
        {/* Lost Items */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-amber-500 rounded-full inline-block"></span>
                {readOnly ? (language === 'vi' ? `Đồ thất lạc của ${user.name}` : `${user.name}'s Lost Items`) : t.profile.myLost}
                <span className="text-gray-500 text-sm font-normal">({userItems.filter(i => i.type === 'LOST').length} {t.profile.total})</span>
            </h2>
            
            {renderFilterTabs(lostFilter, setLostFilter)}

            {myLostItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myLostItems.map(item => (
                        <div key={item.id} className="relative group">
                            <ItemCard item={item} onContact={onContact} userRole={readOnly ? 'USER' : undefined} />
                            {/* Action Overlay - Only if NOT readOnly */}
                            {!readOnly && onUpdateStatus && item.status === 'PUBLISHED' && (
                                <div className="absolute top-48 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pointer-events-none group-hover:pointer-events-auto">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, 'COMPLETED'); }}
                                        className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4"/> {t.item.markFound}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-brand-800/30 border border-dashed border-brand-700 rounded-xl p-8 text-center text-gray-500">
                    <p>{t.profile.noLost}</p>
                </div>
            )}
        </div>

        {/* Found Items */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-brand-500 rounded-full inline-block"></span>
                {readOnly ? (language === 'vi' ? `Đồ ${user.name} nhặt được` : `Items ${user.name} Found`) : t.profile.myFound}
                <span className="text-gray-500 text-sm font-normal">({userItems.filter(i => i.type === 'FOUND').length} {t.profile.total})</span>
            </h2>
            
            {renderFilterTabs(foundFilter, setFoundFilter)}

            {myFoundItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myFoundItems.map(item => (
                        <div key={item.id} className="relative group">
                             <ItemCard item={item} onContact={onContact} userRole={readOnly ? 'USER' : undefined} />
                             {/* Action Overlay - Only if NOT readOnly */}
                            {!readOnly && onUpdateStatus && item.status === 'PUBLISHED' && (
                                <div className="absolute top-48 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pointer-events-none group-hover:pointer-events-auto">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(item.id, 'COMPLETED'); }}
                                        className="bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4"/> {t.item.markReturned}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-brand-800/30 border border-dashed border-brand-700 rounded-xl p-8 text-center text-gray-500">
                    <p>{t.profile.noFound}</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
