import React, { useState } from 'react';
import { useBondhuStore } from '../store/useBondhuStore';
import { MessageSquare, Heart, Share2, Send, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Community = () => {
  const { posts, addPost, addComment, toggleLike, user } = useBondhuStore();
  const [content, setContent] = useState('');

  // State for comment inputs per post
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    addPost(content);
    setContent('');
  };

  const handleCommentSubmit = (postId: string) => {
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
    // Optionally close after submitting, but keeping it open is better UX usually
  };

  const toggleComments = (postId: string) => {
    if (activeCommentId === postId) {
      setActiveCommentId(null);
    } else {
      setActiveCommentId(postId);
      setCommentText('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-3">
          The Adda <span className="text-2xl">☕</span>
        </h1>
        <p className="text-slate-600 mt-2">A safe space for students and professionals to share real stories.</p>
      </div>

      {/* Post Creator */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8 sticky top-20 z-10">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bondhu-red/20 resize-none bg-slate-50 focus:bg-white transition-colors"
            rows={3}
            placeholder={`What's on your mind, ${user.name}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-slate-400 hidden sm:block">Keep it respectful and supportive.</span>
            <button
              type="submit"
              className="bg-bondhu-red text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              disabled={!content.trim()}
            >
              Post <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 border border-slate-300">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{post.author}</h4>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-800 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-2 text-sm font-medium transition-all p-2 rounded-lg ${post.hasLiked
                      ? 'text-red-500 bg-red-50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  <Heart size={18} className={`transition-transform ${post.hasLiked ? 'fill-red-500 scale-110' : ''}`} />
                  {post.likes}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-2 text-sm font-medium p-2 rounded-lg transition-colors ${activeCommentId === post.id
                      ? 'text-bondhu-red bg-red-50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  <MessageSquare size={18} />
                  {post.comments?.length || 0} Comments
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 ml-auto hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <Share2 size={18} />
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {activeCommentId === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-50 overflow-hidden"
                  >
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bondhu-red/20"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentText.trim()}
                        className="bg-slate-900 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>

                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {post.comments?.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-2">No comments yet. Be the first!</p>
                      )}
                      {post.comments?.map((comment) => (
                        <div key={comment.id} className="flex gap-3 bg-slate-50/50 p-3 rounded-lg">
                          <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-slate-800">{comment.author}</span>
                              <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-snug">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};