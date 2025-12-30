
import React from 'react';
import { useApp } from '../context/AppContext';
import PostCard from './PostCard';
import { Loader2, Lock } from 'lucide-react';

interface FeedProps {
  onUserClick: (userId: string) => void;
}

const Feed: React.FC<FeedProps> = ({ onUserClick }) => {
  const { posts, getUser, currentUser, isFollowing, isUserBlocked } = useApp();

  const visiblePosts = posts.filter(post => {
      // 1. Filter out blocked users
      if (isUserBlocked(post.userId)) return false;

      // 2. Filter out reported posts
      if (currentUser?.reportedPostIds?.includes(post.id)) return false;

      const author = getUser(post.userId);
      if (!author) return false;
      
      // 3. Always show own posts
      if (post.userId === currentUser?.id) return true;
      
      // 4. Respect private account preference
      if (author.preferences?.privateAccount) {
          return isFollowing(author.id);
      }
      
      return true;
  });

  if (!posts) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-6 px-0 md:px-4 pb-24">
      {visiblePosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} className="text-slate-700" />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-wider">No Drops Found</h3>
          <p className="text-slate-500 mt-2 text-sm">Follow more gamers or adjust your privacy filters to see new content.</p>
        </div>
      ) : (
        visiblePosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            author={getUser(post.userId)} 
            onUserClick={onUserClick}
          />
        ))
      )}
    </div>
  );
};

export default Feed;
