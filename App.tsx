
import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Feed from './components/Feed';
import Profile from './components/Profile';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import Explore from './components/Explore';
import Notifications from './components/Notifications';
import EditProfile from './components/EditProfile';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Reels from './components/Reels';
import Messages from './components/Messages';
import AdminPanel from './components/AdminPanel';
import Onboarding from './components/Onboarding';
import { ArrowLeft, Gamepad2, Loader2 } from 'lucide-react';

type SwipeView = 'messages' | 'feed' | 'explore' | 'reels' | 'profile';
type ViewState = SwipeView | 'create' | 'post' | 'edit-profile' | 'settings' | 'notifications' | 'admin';

const MainContent: React.FC = () => {
  const { posts, getUser, isAuthenticated, currentUser, getOrCreateChat } = useApp();
  const [currentView, setCurrentView] = useState<ViewState>('feed');
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [viewPostId, setViewPostId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInternalScroll = useRef(false);

  // View mapping for swipe navigation
  const swipeViews: SwipeView[] = ['messages', 'feed', 'explore', 'reels', 'profile'];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const timer = setTimeout(() => {
      setIsSplashActive(false);
    }, 2000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Handle scrolling synchronization (Mobile Only)
  useEffect(() => {
    if (!scrollContainerRef.current || isSplashActive || !isAuthenticated || !currentUser?.onboarded || !isMobile) return;

    const handleScroll = () => {
      if (isInternalScroll.current) return;
      const container = scrollContainerRef.current;
      if (!container) return;

      const index = Math.round(container.scrollLeft / container.clientWidth);
      const newView = swipeViews[index];
      
      if (newView && currentView !== newView && swipeViews.includes(currentView as SwipeView)) {
        setCurrentView(newView);
      }
    };

    const container = scrollContainerRef.current;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isSplashActive, isAuthenticated, currentView, currentUser?.onboarded, isMobile]);

  // Sync scroll position when currentView changes via navigation (Mobile Only)
  useEffect(() => {
    if (isMobile && scrollContainerRef.current && swipeViews.includes(currentView as SwipeView)) {
      const index = swipeViews.indexOf(currentView as SwipeView);
      const targetX = index * scrollContainerRef.current.clientWidth;
      
      if (Math.abs(scrollContainerRef.current.scrollLeft - targetX) > 5) {
        isInternalScroll.current = true;
        scrollContainerRef.current.scrollTo({
          left: targetX,
          behavior: 'smooth'
        });
        
        const unlock = () => {
          isInternalScroll.current = false;
        };
        
        const timeout = setTimeout(unlock, 600);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentView, isMobile]);

  if (isSplashActive) {
    return (
      <div className="fixed inset-0 bg-background z-[9999] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] flex items-center justify-center relative z-10 animate-logo-pulse">
                <Gamepad2 size={48} className="text-white" />
            </div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-[2.5rem] animate-ping" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2 italic">LootDrop</h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-12">Booting Core Systems...</p>
        <div className="w-64 h-2 bg-slate-900 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-[1500ms] ease-out w-full" />
            <div className="absolute inset-0 bg-white/10 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
      return <Auth />;
  }
  
  if (!currentUser) return null;

  if (currentUser.onboarded === false) {
      return <Onboarding />;
  }

  const navigateToProfile = (userId: string) => {
    setViewProfileId(userId);
    setCurrentView('profile');
  };

  const navigateToFeed = () => {
    setCurrentView('feed');
    setViewProfileId(null);
  };

  const navigateToMessages = (targetUserId?: string) => {
    if (targetUserId) {
      const chatId = getOrCreateChat(targetUserId);
      setActiveChatId(chatId);
    }
    setCurrentView('messages');
  };

  const navigateToPost = (postId: string) => {
    setViewPostId(postId);
    setCurrentView('post');
  };

  const isSwipeView = swipeViews.includes(currentView as SwipeView);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'messages': return <Messages initialChatId={activeChatId} onUserClick={navigateToProfile} />;
      case 'feed': return <Feed onUserClick={navigateToProfile} />;
      case 'explore': return <Explore onPostClick={navigateToPost} />;
      case 'reels': return <Reels onUserClick={navigateToProfile} />;
      case 'profile': return (
        <Profile 
          userId={viewProfileId || currentUser.id} 
          onPostClick={navigateToPost}
          onEditProfile={() => setCurrentView('edit-profile')}
          onSettingsClick={() => setCurrentView('settings')}
          onMessageClick={(userId) => navigateToMessages(userId)}
        />
      );
      case 'notifications': return <Notifications onNavigatePost={navigateToPost} onNavigateProfile={navigateToProfile} />;
      case 'edit-profile': return <EditProfile onBack={() => setCurrentView('profile')} />;
      case 'settings': return <Settings onBack={() => setCurrentView('profile')} />;
      case 'admin': return <AdminPanel onBack={() => setCurrentView('feed')} />;
      case 'create': return <CreatePost onPostCreated={navigateToFeed} />;
      case 'post': {
        const post = posts.find(p => p.id === viewPostId);
        if (!post) return (
            <div className="flex flex-col items-center justify-center p-20 text-center">
                <h3 className="text-xl font-bold text-slate-400">Post not found</h3>
                <button onClick={() => setCurrentView('explore')} className="mt-4 text-primary font-bold">Back to Explore</button>
            </div>
        );
        return (
            <div className="max-w-xl mx-auto pt-6 px-0 md:px-4 pb-24">
                <button onClick={() => setCurrentView('explore')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 px-4 md:px-0 font-black uppercase text-[10px] tracking-widest">
                    <ArrowLeft size={16} /> Back to Explore
                </button>
                <PostCard post={post} author={getUser(post.userId)} onUserClick={navigateToProfile} />
            </div>
        );
      }
      default: return <Feed onUserClick={navigateToProfile} />;
    }
  };

  return (
      <Layout 
        currentView={isSwipeView ? (currentView as string) : (['post', 'edit-profile', 'settings', 'notifications', 'admin'].includes(currentView) ? (currentView === 'notifications' ? 'notifications' : (currentView === 'admin' ? 'admin' : 'profile')) : currentView)} 
        onNavigateFeed={navigateToFeed}
        onNavigateProfile={() => navigateToProfile(currentUser.id)}
        onNavigateCreate={() => setCurrentView('create')}
        onNavigateExplore={() => setCurrentView('explore')}
        onNavigateNotifications={() => setCurrentView('notifications')}
        onNavigateReels={() => setCurrentView('reels')}
        onNavigateMessages={() => navigateToMessages()}
        onNavigateAdmin={() => setCurrentView('admin')}
      >
        <div className="relative h-full w-full overflow-hidden">
          {isMobile ? (
            <div 
              ref={scrollContainerRef}
              className={`h-full w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar transition-opacity duration-300 ${!isSwipeView ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="h-full w-full flex-shrink-0 snap-start">
                <Messages initialChatId={activeChatId} onUserClick={navigateToProfile} />
              </div>
              <div className="h-full w-full flex-shrink-0 snap-start overflow-y-auto no-scrollbar bg-slate-950">
                <Feed onUserClick={navigateToProfile} />
              </div>
              <div className="h-full w-full flex-shrink-0 snap-start overflow-y-auto no-scrollbar bg-slate-950">
                <Explore onPostClick={navigateToPost} />
              </div>
              <div className="h-full w-full flex-shrink-0 snap-start">
                <Reels onUserClick={navigateToProfile} />
              </div>
              <div className="h-full w-full flex-shrink-0 snap-start overflow-y-auto no-scrollbar bg-slate-950">
                <Profile 
                  userId={viewProfileId || currentUser.id} 
                  onPostClick={navigateToPost}
                  onEditProfile={() => setCurrentView('edit-profile')}
                  onSettingsClick={() => setCurrentView('settings')}
                  onMessageClick={(userId) => navigateToMessages(userId)}
                />
              </div>
            </div>
          ) : (
            <div className="h-full w-full overflow-y-auto pc-view-transition">
              {renderCurrentView()}
            </div>
          )}

          {/* Sub-views for Mobile (Overlays) */}
          {isMobile && !isSwipeView && (
            <div className="h-full w-full overflow-y-auto no-scrollbar absolute inset-0 z-40 bg-background animate-in fade-in slide-in-from-bottom-2 duration-300">
               {renderCurrentView()}
            </div>
          )}
        </div>
      </Layout>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
