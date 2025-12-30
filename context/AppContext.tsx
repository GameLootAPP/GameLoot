
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Post, User, Comment, AppContextType, Notification, Toast, UserPreferences, ChatSession, ChatMessage, PostReport } from '../types';
import { generateWelcomeEmail, generateResetPasswordEmail } from '../services/geminiService';

const DEFAULT_PREFERENCES: UserPreferences = {
    privateAccount: false,
    showGameTags: true,
    emailNotifications: true,
    pushNotifications: true
};

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const ADMIN_EMAILS = ["chmielp41@gmail.com"];

const MOCK_USER: User = {
  id: 'current-user',
  username: 'neon_drifter',
  displayName: 'Neon Drifter',
  avatarUrl: 'https://picsum.photos/seed/user1/150/150',
  bio: 'FPS God | Part-time Speedrunner | 🌙 Night Owl',
  followers: 12500,
  following: 42,
  badges: ['Streamer', 'Pro'],
  mainGame: 'Apex Legends',
  email: 'demo@lootdrop.gg',
  savedPostIds: [],
  blockedUserIds: [],
  reportedPostIds: [],
  preferences: DEFAULT_PREFERENCES,
  createdAt: Date.now() - (ONE_MONTH_MS + 100000),
  onboarded: true
};

const MOCK_USERS: Record<string, User> = {
  'current-user': MOCK_USER,
  'user-2': {
    id: 'user-2',
    username: 'pixel_queen',
    displayName: 'Pixel Queen',
    avatarUrl: 'https://picsum.photos/seed/user2/150/150',
    bio: 'Cosplayer & RPG enthusiast',
    followers: 8900,
    following: 120,
    badges: ['Cosplayer'],
    mainGame: 'Final Fantasy XIV',
    email: 'pixel@lootdrop.gg',
    savedPostIds: [],
    blockedUserIds: [],
    reportedPostIds: [],
    preferences: DEFAULT_PREFERENCES,
    createdAt: Date.now() - 500000,
    onboarded: true
  },
  'user-3': {
    id: 'user-3',
    username: 'retro_king',
    displayName: 'Retro King',
    avatarUrl: 'https://picsum.photos/seed/user3/150/150',
    bio: 'Collecting everything from Atari to PS5',
    followers: 50000,
    following: 10,
    badges: ['Collector'],
    mainGame: 'Retro',
    email: 'retro@lootdrop.gg',
    savedPostIds: [],
    blockedUserIds: [],
    reportedPostIds: [],
    preferences: DEFAULT_PREFERENCES,
    createdAt: Date.now() - (ONE_MONTH_MS * 2),
    onboarded: true
  }
};

const INITIAL_POSTS: Post[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('lootdrop_auth_user') !== null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lootdrop_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('lootdrop_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [users, setUsers] = useState<Record<string, User>>(() => {
    const saved = localStorage.getItem('lootdrop_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('lootdrop_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [followedUserIds, setFollowedUserIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('lootdrop_follows');
    return saved ? JSON.parse(saved) : [];
  });

  const [chats, setChats] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('lootdrop_chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalReports, setGlobalReports] = useState<PostReport[]>(() => {
    const saved = localStorage.getItem('lootdrop_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (currentUser && currentUser.badges.includes('Newbie')) {
      const accountAge = Date.now() - currentUser.createdAt;
      if (accountAge >= ONE_MONTH_MS) {
        const updatedBadges = currentUser.badges.filter(b => b !== 'Newbie');
        const updatedUser = { ...currentUser, badges: updatedBadges };
        setCurrentUser(updatedUser);
        setUsers(prev => ({ ...prev, [currentUser.id]: updatedUser }));
        showToast("Level Up! You've been promoted from 'Newbie' status. GG!", "success");
      }
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('lootdrop_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('lootdrop_follows', JSON.stringify(followedUserIds));
  }, [followedUserIds]);
  
  useEffect(() => {
    localStorage.setItem('lootdrop_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('lootdrop_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('lootdrop_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('lootdrop_reports', JSON.stringify(globalReports));
  }, [globalReports]);

  useEffect(() => {
    if (currentUser && isAuthenticated) {
        localStorage.setItem('lootdrop_auth_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('lootdrop_auth_user');
    }
  }, [currentUser, isAuthenticated]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  const createNotification = (type: Notification['type'], targetUserId: string, post?: Post, text?: string) => {
      if (!currentUser || (targetUserId === currentUser.id && type !== 'system')) return;
      const newNotif: Notification = {
          id: Date.now().toString(),
          type,
          userId: currentUser.id,
          username: currentUser.username,
          userAvatar: currentUser.avatarUrl,
          timestamp: Date.now(),
          read: false,
          postId: post?.id,
          postImage: post?.imageUrl,
          text
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const toggleLike = (postId: string) => {
    if (!currentUser) return;
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likedByCurrentUser;
          if (!isLiked) createNotification('like', post.userId, post);
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedByCurrentUser: !isLiked
          };
        }
        return post;
      })
    );
  };

  const addComment = (postId: string, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      text,
      timestamp: Date.now()
    };
    setPosts(currentPosts => {
      const post = currentPosts.find(p => p.id === postId);
      if (post) createNotification('comment', post.userId, post, text);
      return currentPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] } 
          : post
      )
    });
  };

  const deleteComment = (postId: string, commentId: string) => {
      setPosts(currentPosts => 
          currentPosts.map(post => {
              if (post.id === postId) {
                  return {
                      ...post,
                      comments: post.comments.filter(c => c.id !== commentId)
                  };
              }
              return post;
          })
      );
      showToast("Comment deleted", "info");
  };

  const addPost = (mediaUrl: string, mediaType: 'image' | 'video', caption: string, gameTag?: string) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      imageUrl: mediaUrl,
      mediaType,
      caption,
      likes: 0,
      likedByCurrentUser: false,
      comments: [],
      timestamp: Date.now(),
      gameTag
    };
    setPosts(prev => [newPost, ...prev]);
    showToast("Drop deployed!", "success");
  };

  const updatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast("Post removed", "info");
  };

  const reportPost = (postId: string, reason: string) => {
    if (!currentUser) return;
    const newReport: PostReport = {
      id: `report-${Date.now()}`,
      postId,
      reporterId: currentUser.id,
      reason,
      timestamp: Date.now()
    };
    setGlobalReports(prev => [...prev, newReport]);
    setCurrentUser(prev => prev ? { ...prev, reportedPostIds: [...(prev.reportedPostIds || []), postId] } : null);
    showToast("Report submitted. Thanks for keeping LootDrop safe!", "info");
  };

  const toggleFollow = (userId: string) => {
    setFollowedUserIds(prev => {
      const following = prev.includes(userId);
      if (following) return prev.filter(id => id !== userId);
      createNotification('follow', userId);
      return [...prev, userId];
    });
  };

  const isFollowing = (userId: string) => followedUserIds.includes(userId);

  const toggleBlockUser = (userId: string) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const blocked = prev.blockedUserIds || [];
      const isBlocked = blocked.includes(userId);
      const updatedBlocked = isBlocked ? blocked.filter(id => id !== userId) : [...blocked, userId];
      const updated = { ...prev, blockedUserIds: updatedBlocked };
      setUsers(u => ({ ...u, [prev.id]: updated }));
      return updated;
    });
  };

  const isUserBlocked = (userId: string) => currentUser?.blockedUserIds?.includes(userId) || false;

  const toggleSavePost = (postId: string) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const saved = prev.savedPostIds || [];
      const isSaved = saved.includes(postId);
      const updatedSaved = isSaved ? saved.filter(id => id !== postId) : [...saved, postId];
      const updated = { ...prev, savedPostIds: updatedSaved };
      setUsers(u => ({ ...u, [prev.id]: updated }));
      if (!isSaved) {
          const post = posts.find(p => p.id === postId);
          if (post) createNotification('save', post.userId, post);
      }
      return updated;
    });
  };

  const isPostSaved = (postId: string) => currentUser?.savedPostIds?.includes(postId) || false;

  const getUser = (userId: string) => users[userId];

  const updateProfile = (updates: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setUsers(u => ({ ...u, [prev.id]: updated }));
      return updated;
    });
    if (!updates.onboarded) showToast("Profile updated", "success");
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, preferences: { ...prev.preferences!, ...updates } };
      setUsers(u => ({ ...u, [prev.id]: updated }));
      return updated;
    });
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const checkEmailExists = (email: string): boolean => {
    return (Object.values(users) as User[]).some((u: User) => u.email?.toLowerCase() === email.toLowerCase());
  };

  const login = (email: string) => {
    const user = (Object.values(users) as User[]).find((u: User) => u.email?.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (user.onboarded) {
        showToast(`Welcome back, ${user.username}!`, "success");
      }
      return true;
    }
    return false;
  };

  const signup = async (username: string, email: string) => {
    const id = `user-${Date.now()}`;
    const newUser: User = {
      id,
      username,
      displayName: username,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: "New recruit in LootDrop!",
      followers: 0,
      following: 0,
      badges: ADMIN_EMAILS.includes(email) ? ['Admin', 'Elite'] : ['Newbie'],
      email,
      savedPostIds: [],
      blockedUserIds: [],
      reportedPostIds: [],
      preferences: DEFAULT_PREFERENCES,
      createdAt: Date.now(),
      onboarded: false 
    };
    setUsers(prev => ({ ...prev, [id]: newUser }));
    const emailContent = await generateWelcomeEmail(username);
    return emailContent;
  };

  const resetPassword = async (email: string) => {
    const user = (Object.values(users) as User[]).find((u: User) => u.email?.toLowerCase() === email.toLowerCase());
    if (user) {
        const content = await generateResetPasswordEmail(user.username);
        return content;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const clearAppData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const sendMessage = (chatId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: Date.now()
    };
    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessageTimestamp: Date.now()
        };
      }
      return chat;
    }));
  };

  const getOrCreateChat = (targetUserId: string) => {
    if (!currentUser) return "";
    const existing = chats.find(c => c.participantIds.includes(targetUserId));
    if (existing) return existing.id;

    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      participantIds: [currentUser.id, targetUserId],
      messages: [],
      lastMessageTimestamp: Date.now()
    };
    setChats(prev => [newChat, ...prev]);
    return newChat.id;
  };

  const adminDeleteUser = (userId: string) => {
    if (currentUser?.email !== "chmielp41@gmail.com") return;
    setUsers(prev => {
      const { [userId]: _, ...rest } = prev;
      return rest;
    });
    setPosts(prev => prev.filter(p => p.userId !== userId));
    showToast("User and their data purged", "error");
  };

  const adminDeletePost = (postId: string) => {
    if (currentUser?.email !== "chmielp41@gmail.com") return;
    setPosts(prev => prev.filter(p => p.id !== postId));
    setGlobalReports(prev => prev.filter(r => r.postId !== postId));
    showToast("Post purged by admin", "error");
  };

  const adminToggleBadge = (userId: string, badge: string) => {
    if (currentUser?.email !== "chmielp41@gmail.com") return;
    setUsers(prev => {
      const user = prev[userId];
      if (!user) return prev;
      const hasBadge = user.badges.includes(badge);
      const updatedBadges = hasBadge ? user.badges.filter(b => b !== badge) : [...user.badges, badge];
      const updatedUser = { ...user, badges: updatedBadges };
      if (currentUser?.id === userId) setCurrentUser(updatedUser);
      return { ...prev, [userId]: updatedUser };
    });
  };

  const adminDismissReport = (reportId: string) => {
    if (currentUser?.email !== "chmielp41@gmail.com") return;
    setGlobalReports(prev => prev.filter(r => r.id !== reportId));
    showToast("Report dismissed", "info");
  };

  const adminBroadcast = (message: string) => {
    if (currentUser?.email !== "chmielp41@gmail.com") return;
    createNotification('system', 'all', undefined, message);
  };

  return (
    <AppContext.Provider value={{
      currentUser, posts, users, notifications, chats, isAuthenticated, globalReports,
      toggleLike, addComment, deleteComment, addPost, updatePost, deletePost, reportPost,
      toggleFollow, isFollowing, toggleBlockUser, isUserBlocked, toggleSavePost, isPostSaved,
      getUser, updateProfile, updatePreferences, markNotificationsRead, login, checkEmailExists, signup,
      resetPassword, logout, clearAppData, showToast, toasts, removeToast, sendMessage, getOrCreateChat,
      adminDeleteUser, adminDeletePost, adminToggleBadge, adminDismissReport, adminBroadcast
    }}>
      {children}
    </AppContext.Provider>
  );
};
