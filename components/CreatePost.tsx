
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, X, Wand2, Loader2, Gamepad2, ArrowLeft, Video, Camera, Mic, Square, Film, Image as ImageIcon, PlayCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateGamerCaption, suggestGameTag } from '../services/geminiService';

interface CreatePostProps {
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { addPost, showToast } = useApp();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [gameTag, setGameTag] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const resizeImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaType('image');
      if (file.size > 8 * 1024 * 1024) {
          showToast("Image is too large (max 8MB)", "error");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const resized = await resizeImage(base64);
        setSelectedMedia(resized);
        detectGame(resized, false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaType('video');
      if (file.size > 50 * 1024 * 1024) { 
          showToast("Clip is too large (max 50MB)", "error");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setSelectedMedia(base64);
        detectGame(base64, true);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
        setShowRecorder(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    } catch (err) {
        showToast("Permission denied or camera not available", "error");
        setShowRecorder(false);
    }
  };

  const startRecording = () => {
      if (!videoRef.current?.srcObject) return;
      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              setSelectedMedia(base64);
              setMediaType('video');
              detectGame(base64, true);
              setShowRecorder(false);
              stopStream();
          };
          reader.readAsDataURL(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };

  const detectGame = async (base64: string, isVideo: boolean) => {
    try {
      const game = await suggestGameTag(base64, isVideo);
      setGameTag(game);
    } catch (e) {
      console.error("Failed to detect game", e);
    }
  };

  const handleGenerateCaption = async () => {
    if (!selectedMedia) return;
    setIsGenerating(true);
    try {
      const generated = await generateGamerCaption(selectedMedia, mediaType === 'video');
      setCaption(generated);
    } catch (error) {
      console.error(error);
      setCaption("Check out this clip! #gaming");
      showToast("AI generation failed, using default caption", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!selectedMedia) return;
    addPost(selectedMedia, mediaType, caption, gameTag);
    onPostCreated();
  };

  const clearMedia = () => {
    setSelectedMedia(null);
    setCaption('');
    setGameTag('');
    setShowRecorder(false);
    stopStream();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  if (showRecorder && !selectedMedia) {
      return (
          <div className="fixed inset-0 bg-black z-[60] flex flex-col">
              <div className="relative flex-1 bg-black">
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <button onClick={clearMedia} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md border border-white/10"><X size={24} /></button>
                  <div className="absolute bottom-10 w-full flex justify-center items-center gap-8">
                      {isRecording ? (
                          <button onClick={stopRecording} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"><Square size={32} className="fill-white text-white" /></button>
                      ) : (
                          <button onClick={startRecording} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-red-500 hover:scale-105 transition-transform"><div className="w-6 h-6 rounded-full bg-white opacity-20" /></button>
                      )}
                  </div>
                  {isRecording && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white" />
                        Live Recording
                    </div>
                  )}
              </div>
          </div>
      )
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-in fade-in duration-300 pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Share Loot</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Deploy new content to the grid</p>
        </div>
        {selectedMedia && (
             <button onClick={clearMedia} className="text-red-500 hover:text-red-400 font-black text-[10px] uppercase tracking-widest border border-red-500/20 px-4 py-2 rounded-xl bg-red-500/5">Reset Slot</button>
        )}
      </div>

      {!selectedMedia ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Standard Post Slot */}
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-800 rounded-3xl aspect-video sm:aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-primary/50 transition-all shadow-inner">
                    <ImageIcon className="text-primary" size={32} />
                </div>
                <p className="text-sm font-black text-white uppercase tracking-tighter">Photo Drop</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Static Screenshots</p>
                <input type="file" ref={fileInputRef} onChange={handleImageFileChange} accept="image/*" className="hidden" />
            </div>

            {/* Reel Clip Slot */}
            <div onClick={() => videoInputRef.current?.click()} className="border-2 border-dashed border-slate-800 rounded-3xl aspect-video sm:aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all group relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-secondary/50 transition-all shadow-inner">
                    <PlayCircle className="text-secondary" size={32} />
                </div>
                <p className="text-sm font-black text-white uppercase tracking-tighter">Reel Clip</p>
                <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Motion Highlights</p>
                <input type="file" ref={videoInputRef} onChange={handleVideoFileChange} accept="video/*" className="hidden" />
            </div>

            {/* Instant Capture Slot */}
            <div onClick={startCamera} className="sm:col-span-2 border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white hover:bg-white/5 transition-all group relative">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-all shadow-inner">
                        <Camera className="text-white" size={32} />
                    </div>
                    <div>
                        <p className="text-lg font-black text-white uppercase tracking-tighter">Instant Gear Capture</p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Record Live Setup / Reaction</p>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-slate-800 bg-black shadow-2xl">
                {mediaType === 'video' ? (
                    <video src={selectedMedia} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                ) : (
                    <img src={selectedMedia} className="w-full h-full object-cover" alt="Preview" />
                )}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest">
                    {mediaType === 'video' ? 'Reel Clip' : 'Photo Drop'} Preview
                </div>
                <button onClick={clearMedia} className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-red-500 backdrop-blur-md rounded-xl text-white transition-all border border-white/10">
                    <X size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Caption & Lore</label>
                        <button 
                            onClick={handleGenerateCaption}
                            disabled={isGenerating}
                            className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                            AI Generate
                        </button>
                    </div>
                    <textarea 
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="What's the narrative?"
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary transition-all resize-none h-32 text-sm font-medium"
                    />
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Game Intel</label>
                        <div className="relative group">
                            <Gamepad2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="text" 
                                value={gameTag}
                                onChange={(e) => setGameTag(e.target.value)}
                                placeholder="e.g. Apex, Val, Elden"
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-primary transition-all text-sm font-black uppercase tracking-wider"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={handleShare}
                            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Commit Signal
                            <Film size={18} className="group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
