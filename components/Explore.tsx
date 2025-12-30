import React, { useState, useMemo } from 'react';
import { Search, Play, Gamepad2, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExploreProps {
  onPostClick: (postId: string) => void;
}

const Explore: React.FC<ExploreProps> = ({ onPostClick }) => {
  const { posts, isUserBlocked, currentUser, getUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach(post => {
      if (post.gameTag) tags.add(post.gameTag);
    });
    return Array.from(tags).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Filter out blocked users
      if (isUserBlocked(post.userId)) return false;

      // Filter out reported posts
      if (currentUser?.reportedPostIds?.includes(post.id)) return false;

      const author = getUser(post.userId);
      const searchLower = searchTerm.toLowerCase();
      
      const matchesSearch = 
        post.caption.toLowerCase().includes(searchLower) || 
        (post.gameTag?.toLowerCase().includes(searchLower)) ||
        (author?.username.toLowerCase().includes(searchLower)) ||
        (author?.displayName.toLowerCase().includes(searchLower));
      
      const matchesTag = selectedTag ? post.gameTag === selectedTag : true;
      
      return matchesSearch && matchesTag;
    });
  }, [posts, searchTerm, selectedTag, isUserBlocked, currentUser, getUser]);

  return (
    <div className="pb-24 md:pb-8">
      <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-30 border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto p-4 space-y-4">
          <div className="relative group max-w-2xl mx-auto w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search drops, games, or gamer tags..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800/50 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-slate-600 text-sm font-medium"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 justify-start md:justify-center">
            <button onClick={() => setSelectedTag(null)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all text-[10px] font-black uppercase tracking-widest border shrink-0 ${selectedTag === null ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}>
              <Layers size={14} /> All Drops
            </button>
            {uniqueTags.map(tag => (
              <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all text-[10px] font-black uppercase tracking-widest border shrink-0 ${selectedTag === tag ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'}`}>
                <Gamepad2 size={14} /> {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 md:gap-4 p-0.5 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
        {filteredPosts.map(post => (
          <div key={post.id} className="relative aspect-square group cursor-pointer bg-slate-900 overflow-hidden md:rounded-2xl border border-transparent hover:border-primary/30 transition-all shadow-xl" onClick={() => onPostClick(post.id)}>
            {post.mediaType === 'video' ? (
                <>
                    <video src={post.imageUrl} className="w-full h-full object-cover" muted playsInline />
                    <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10 p-1 md:p-1.5 bg-black/40 backdrop-blur-md rounded-lg">
                        <Play size={12} className="text-white fill-white md:w-3.5 md:h-3.5" />
                    </div>
                </>
            ) : (
                <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white z-20">
              {post.gameTag && <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] bg-primary px-2 py-1 md:px-3 md:py-1 rounded-full mb-2 md:mb-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{post.gameTag}</span>}
              <div className="flex items-center gap-1 font-black text-xs md:text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                <span className="text-red-500">❤️</span> {post.likes.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500 px-6">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-700">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-widest">No Drops Found</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">We couldn't find any results matching your search terms.</p>
        </div>
      )}
    </div>
  );
};

export default Explore;