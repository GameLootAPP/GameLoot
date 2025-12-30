import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Gamepad2, User, Trophy, Rocket, Camera, Check, ArrowRight, Zap, Target, Star, Smile, Loader2, X, FastForward } from 'lucide-react';

const STARTER_ROLES = [
    { id: 'Casual', icon: <Smile />, desc: 'Playing for the vibes' },
    { id: 'Competitive', icon: <Target />, desc: 'Climbing the ranks' },
    { id: 'Speedrunner', icon: <Rocket />, desc: 'Breaking world records' },
    { id: 'Cosplayer', icon: <Zap />, desc: 'Bringing chars to life' },
    { id: 'Content Creator', icon: <Camera />, desc: 'Building a community' },
    { id: 'Lore Master', icon: <Star />, desc: 'Obsessed with the story' },
    { id: 'Casual RPG', icon: <Gamepad2 />, desc: 'Adventuring slowly' },
    { id: 'Gear Head', icon: <Zap />, desc: 'PC setup enthusiast' }
];

const Onboarding: React.FC = () => {
    const { currentUser, updateProfile, showToast } = useApp();
    const [step, setStep] = useState(1);
    const [displayName, setDisplayName] = useState(currentUser?.username || '');
    const [mainGame, setMainGame] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    
    if (!currentUser) return null;

    const toggleRole = (roleId: string) => {
        setSelectedRoles(prev => 
            prev.includes(roleId) 
            ? prev.filter(r => r !== roleId) 
            : prev.length < 3 ? [...prev, roleId] : prev
        );
    };

    const handleComplete = async () => {
        setIsFinalizing(true);
        
        // Brief artificial delay for "System Calibration" feel
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setIsExiting(true);
        
        // Wait for fade out animation
        await new Promise(resolve => setTimeout(resolve, 300));

        updateProfile({
            displayName: displayName || currentUser.username,
            mainGame: mainGame || 'Gaming',
            badges: [...currentUser.badges, ...selectedRoles],
            onboarded: true
        });
        
        showToast("System Calibration Complete. Welcome to LootDrop.", "success");
    };

    return (
        <div className={`min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden transition-opacity duration-300 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100'}`}>
            {/* HUD Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 border-l-2 border-t-2 border-primary/20 rounded-tl-3xl" />
                <div className="absolute bottom-10 right-10 w-32 h-32 border-r-2 border-b-2 border-primary/20 rounded-br-3xl" />
                <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
            </div>

            <div className="max-w-md w-full relative z-10 space-y-8 bg-slate-900/40 p-8 rounded-[3rem] border border-white/5 backdrop-blur-sm">
                
                {/* Fast Track / Skip Button in Top Right */}
                <button 
                    onClick={handleComplete}
                    disabled={isFinalizing}
                    className="absolute top-6 right-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all group"
                    title="Skip Calibration"
                >
                    <span className="hidden group-hover:block animate-in fade-in slide-in-from-right-2">Fast Track</span>
                    <FastForward size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-3 mb-10">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-slate-800'}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/30">
                                <User className="text-primary" size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Identify Yourself</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Initialize your operator callsign</p>
                        </div>
                        
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Callsign / Display Name</label>
                                <input 
                                    type="text" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold text-lg"
                                    placeholder="Enter your name..."
                                />
                            </div>
                            <button 
                                onClick={() => setStep(2)}
                                disabled={!displayName.trim()}
                                className="w-full bg-primary hover:bg-violet-600 disabled:opacity-30 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 uppercase text-xs tracking-[0.2em]"
                            >
                                Continue Calibration <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-secondary/30">
                                <Trophy className="text-secondary" size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Primary Objective</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">What game are you maining right now?</p>
                        </div>
                        
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Focus / Game</label>
                                <input 
                                    type="text" 
                                    value={mainGame}
                                    onChange={(e) => setMainGame(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition-all font-bold text-lg"
                                    placeholder="e.g. Elden Ring, Valorant..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-white hover:bg-slate-800 transition-all"><ArrowRight size={18} className="rotate-180" /></button>
                                <button 
                                    onClick={() => setStep(3)}
                                    disabled={!mainGame.trim()}
                                    className="flex-1 bg-primary hover:bg-violet-600 disabled:opacity-30 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 uppercase text-xs tracking-[0.2em]"
                                >
                                    Define Class <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right duration-500">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Zap className="text-white" size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Operator Class</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Select up to 3 starter ranks to display on your profile</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-4">
                            {STARTER_ROLES.map(role => (
                                <button 
                                    key={role.id}
                                    onClick={() => toggleRole(role.id)}
                                    disabled={isFinalizing}
                                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 relative overflow-hidden group ${
                                        selectedRoles.includes(role.id) 
                                        ? 'bg-primary/20 border-primary text-white ring-2 ring-primary/20' 
                                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    {selectedRoles.includes(role.id) && (
                                        <div className="absolute top-2 right-2 text-primary animate-in zoom-in duration-300">
                                            <Check size={14} />
                                        </div>
                                    )}
                                    <div className={`${selectedRoles.includes(role.id) ? 'text-primary' : 'text-slate-600 group-hover:text-slate-400'} transition-colors`}>
                                        {/* Fix: Cast to React.ReactElement<any> to allow passing 'size' prop to the cloned icon */}
                                        {React.cloneElement(role.icon as React.ReactElement<any>, { size: 20 })}
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black uppercase tracking-tight">{role.id}</div>
                                        <div className="text-[8px] font-bold uppercase tracking-widest opacity-50">{role.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="pt-6 space-y-4">
                            <button 
                                onClick={handleComplete}
                                disabled={selectedRoles.length === 0 || isFinalizing}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/20 uppercase text-xs tracking-[0.3em] hover:scale-[1.02] active:scale-95 disabled:opacity-30 relative overflow-hidden"
                            >
                                {isFinalizing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Calibrating Systems...
                                    </>
                                ) : (
                                    <>
                                        Finalize Signal <Zap size={18} className="fill-white" />
                                    </>
                                )}
                                {isFinalizing && (
                                    <div className="absolute inset-0 bg-white/10 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                                )}
                            </button>
                            <button 
                                onClick={() => setStep(2)} 
                                disabled={isFinalizing}
                                className="w-full text-slate-600 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors disabled:opacity-0"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;