
import React, { useState, useRef, ChangeEvent } from 'react';
import { ArrowLeft, Save, Camera, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface EditProfileProps {
  onBack: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ onBack }) => {
  const { currentUser, updateProfile, showToast } = useApp();
  
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bio, setBio] = useState(currentUser.bio);
  const [mainGame, setMainGame] = useState(currentUser.mainGame || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize image to 200x200 for profile pics
  const resizeProfileImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const size = 200;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Draw centered and cropped
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;
        ctx?.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please select an image file", "error");
      return;
    }

    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const resized = await resizeProfileImage(base64);
      setAvatarUrl(resized);
      setIsProcessingImage(false);
      showToast("Preview updated! Don't forget to save.", "info");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({
        displayName,
        bio,
        mainGame,
        avatarUrl
    });
    onBack();
  };

  return (
    <div className="max-w-xl mx-auto pt-6 px-4 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-black uppercase tracking-tighter">Edit Profile</h2>
        <button onClick={handleSave} className="text-primary font-black text-sm uppercase tracking-widest hover:text-white transition-colors">
            Done
        </button>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative">
                <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className={`w-32 h-32 rounded-full object-cover ring-4 ring-slate-800 transition-all group-hover:opacity-75 ${isProcessingImage ? 'animate-pulse' : ''}`} 
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={32} className="text-white drop-shadow-lg" />
                </div>
                {isProcessingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                        <Loader2 size={32} className="text-white animate-spin" />
                    </div>
                )}
            </div>
        </div>
        <button 
            onClick={handleAvatarClick}
            className="mt-4 text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
        >
            Modify Avatar Signal
        </button>
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
        />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Callsign / Display Name</label>
            <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-bold"
                placeholder="How others see you"
            />
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bio / Lore</label>
            <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all resize-none leading-relaxed"
                placeholder="Tell your story..."
            />
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Objective / Main Game</label>
            <input 
                type="text" 
                value={mainGame}
                onChange={(e) => setMainGame(e.target.value)}
                placeholder="e.g. Valorant, Apex Legends"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-bold"
            />
        </div>
      </div>
      
      <div className="pt-8">
        <button 
            onClick={handleSave}
            disabled={isProcessingImage}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-purple-500/10 active:scale-[0.98] group"
        >
            <div className="flex items-center justify-center gap-3 text-xs tracking-[0.2em] uppercase">
                <Save size={18} className="group-hover:scale-110 transition-transform" />
                Commit Profile Changes
            </div>
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
