
import React, { useState, useEffect } from 'react';
import { Gamepad2, Mail, Lock, User, ArrowRight, Loader2, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Auth: React.FC = () => {
  const { login, signup, checkEmailExists, resetPassword } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentEmailContent, setSentEmailContent] = useState<string | null>(null);
  const [isValidEmail, setIsValidEmail] = useState(false);

  // Real-time account verification
  useEffect(() => {
    if ((isLogin || isForgotPassword) && email.includes('@')) {
        setIsValidEmail(checkEmailExists(email));
    } else {
        setIsValidEmail(false);
    }
  }, [email, isLogin, isForgotPassword, checkEmailExists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        if (isForgotPassword) {
            const content = await resetPassword(email);
            if (content) {
                setSentEmailContent(content);
            } else {
                setError('SIGNAL ERROR: Email address not recognized in our database.');
            }
            setLoading(false);
            return;
        }

        if (isLogin) {
            if (!checkEmailExists(email)) {
                setError('ACCESS DENIED: Signal not found in archives. Please Sign Up.');
                setLoading(false);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            const success = login(email);
            if (!success) {
                setError('Authentication error. Try "demo@lootdrop.gg"');
                setLoading(false);
            }
        } else {
            if (!username || !email || !password) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }
            if (checkEmailExists(email)) {
                setError('Signal already exists. Please Sign In.');
                setLoading(false);
                return;
            }
            const emailContent = await signup(username, email);
            setSentEmailContent(emailContent);
            setLoading(false);
        }
    } catch (e) {
        console.error(e);
        setError('Connection interrupted');
        setLoading(false);
    }
  };

  const handleFinishSignup = () => {
      setSentEmailContent(null);
      setIsForgotPassword(false);
      login(email);
  };

  if (sentEmailContent) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
              <div className="max-w-md w-full bg-surface border border-slate-700 rounded-2xl p-6 shadow-2xl animate-in zoom-in fade-in duration-300">
                  <div className="flex items-center gap-3 mb-4 text-green-400">
                      <CheckCircle size={32} />
                      <h2 className="text-xl font-bold text-white">Transmission Received</h2>
                  </div>
                  <p className="text-slate-400 mb-4">
                    Secure data sent to <span className="text-white font-mono">{email}</span>.
                  </p>
                  
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 mb-6 font-mono text-sm text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar">
                      {sentEmailContent}
                  </div>

                  <button 
                    onClick={handleFinishSignup} 
                    className="w-full bg-primary hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                      {isForgotPassword ? 'Back to Hangar' : 'Let\'s Go! 🚀'}
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      
      <div className="relative w-full max-w-md p-8 bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300 mx-4">
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <Gamepad2 className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">LootDrop</h1>
            <p className="text-slate-400 mt-2">The ultimate social hub for gamers</p>
        </div>

        {/* Tabs */}
        {!isForgotPassword && (
            <div className="flex p-1 bg-slate-800 rounded-xl mb-6">
                <button 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isLogin ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => { setIsLogin(true); setError(''); setEmail(''); }}
                >
                    Login
                </button>
                <button 
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isLogin ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => { setIsLogin(false); setError(''); setEmail(''); }}
                >
                    Sign Up
                </button>
            </div>
        )}

        {isForgotPassword && (
            <div className="mb-6">
                <button onClick={() => setIsForgotPassword(false)} className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                    <ArrowRight size={14} className="rotate-180" /> Return to Login
                </button>
                <h2 className="text-xl font-bold text-white mt-4">Reset Signal</h2>
            </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="GamerTag"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Gamer Email</label>
                    {(isLogin || isForgotPassword) && email && (
                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${isValidEmail ? 'text-green-500' : 'text-red-500'}`}>
                            {isValidEmail ? <><ShieldCheck size={10} /> Verified Signal</> : <><AlertTriangle size={10} /> Unknown Signal</>}
                        </div>
                    )}
                </div>
                <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isValidEmail ? 'text-primary' : 'text-slate-500'}`} size={18} />
                    <input 
                        type="email" 
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-slate-950 border rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none transition-all ${(isLogin || isForgotPassword) && email ? (isValidEmail ? 'border-primary/50 ring-1 ring-primary/20' : 'border-red-900 ring-1 ring-red-900/20') : 'border-slate-700 focus:border-primary'}`}
                    />
                    {(isLogin || isForgotPassword) && isValidEmail && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        </div>
                    )}
                </div>
            </div>

            {!isForgotPassword && (
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                        {isLogin && (
                            <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[9px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest">Forgot?</button>
                        )}
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                    </div>
                </div>
            )}

            {error && <div className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 py-3 rounded-lg border border-red-500/20 animate-in shake duration-300">{error}</div>}
            
            <button 
                type="submit" 
                disabled={loading || ((isLogin || isForgotPassword) && !isValidEmail && email !== '')}
                className={`w-full font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.99] mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] ${
                    (isLogin || isForgotPassword) && !isValidEmail && email !== '' 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-purple-900/20'
                }`}
            >
                {loading ? <Loader2 className="animate-spin" /> : (
                    <>
                        {isForgotPassword ? (
                            <><RefreshCw size={16} /> Recover Signal</>
                        ) : (
                            <>
                                {isLogin ? 'Establish Connection' : 'Register Signal'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </>
                )}
            </button>
        </form>
        
        {/* Footer */}
        <p className="text-center text-slate-500 text-[9px] font-bold uppercase tracking-[0.1em] mt-8">
            Protocol: Secure transmission only • Version 1.5.2
        </p>
      </div>
    </div>
  );
};

export default Auth;
