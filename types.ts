
export interface UserPreferences {
  privateAccount: boolean;
  showGameTags: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  badges: string[]; // e.g., "Pro", "Streamer", "Sherpa"
  mainGame?: string;
  email?: string; 
  savedPostIds?: string[];
  blockedUserIds?: string[];
  reportedPostIds?: string[];
  preferences?: UserPreferences;
  createdAt: number; 
  onboarded?: boolean; // Track if user completed initial setup
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  participantIds: string[];
  messages: ChatMessage[];
  lastMessageTimestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  imageUrl: string; 
  mediaType: 'image' | 'video';
  caption: string;
  likes: number;
  likedByCurrentUser: boolean;
  comments: Comment[];
  timestamp: number;
  gameTag?: string;
  location?: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'save' | 'report' | 'system';
  userId: string;
  username: string;
  userAvatar: string;
  text?: string;
  postId?: string;
  postImage?: string;
  timestamp: number;
  read: boolean;
}

export interface PostReport {
  id: string;
  postId: string;
  reporterId: string;
  reason: string;
  timestamp: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface AppState {
  currentUser: User | null;
  posts: Post[];
  users: Record<string, User>;
  notifications: Notification[];
  chats: ChatSession[];
  isAuthenticated: boolean;
  globalReports: PostReport[];
}

export interface AppContextType extends AppState {
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  addPost: (mediaUrl: string, mediaType: 'image' | 'video', caption: string, gameTag?: string) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;
  toggleFollow: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  toggleBlockUser: (userId: string) => void;
  isUserBlocked: (userId: string) => boolean;
  toggleSavePost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;
  getUser: (userId: string) => User | undefined;
  updateProfile: (updates: Partial<User>) => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  markNotificationsRead: () => void;
  login: (email: string) => boolean;
  checkEmailExists: (email: string) => boolean;
  signup: (username: string, email: string) => Promise<string>;
  resetPassword: (email: string) => Promise<string | null>;
  logout: () => void;
  clearAppData: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  getOrCreateChat: (targetUserId: string) => string;
  // Admin specific methods
  adminDeleteUser: (userId: string) => void;
  adminDeletePost: (postId: string) => void;
  adminToggleBadge: (userId: string, badge: string) => void;
  adminDismissReport: (reportId: string) => void;
  adminBroadcast: (message: string) => void;
}
