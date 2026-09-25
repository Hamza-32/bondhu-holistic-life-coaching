import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useBondhuStore } from '@/stores/useBondhuStore';
import { MessageSquare, Heart, Share2, Send, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Community = () => {
  const { t } = useTranslation();
  const { posts, addPost, addComment, toggleLike, user } = useBondhuStore();
  const [content, setContent] = useState('');

  // State for comment inputs per post
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
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
    <div className="mx-auto max-w-2xl pb-10">
      <div className="mb-8 text-center md:text-left">
        <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-foreground md:justify-start">
          {t('pages.community.title')}{' '}
          <span className="text-2xl" aria-hidden>
            ☕
          </span>
        </h1>
        <p className="mt-2 text-muted-foreground">{t('pages.community.subtitle')}</p>
      </div>

      {/* Post Creator */}
      <div className="sticky top-20 z-10 mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full resize-none rounded-xl border border-border bg-muted p-4 transition-colors focus:bg-card focus:ring-2 focus:ring-ring/30 focus:outline-none"
            rows={3}
            aria-label="New post"
            placeholder={`What's on your mind, ${user.name}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="hidden text-xs text-muted-foreground sm:block">
              Keep it respectful and supportive.
            </span>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!content.trim()}
            >
              Post <Send size={16} aria-hidden />
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
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-linear-to-br from-muted to-secondary font-bold text-muted-foreground">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{post.author}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={12} aria-hidden />
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>

              <p className="mb-4 leading-relaxed whitespace-pre-wrap text-foreground">
                {post.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-6 border-t border-border pt-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  aria-pressed={post.hasLiked}
                  aria-label={`Like (${post.likes})`}
                  className={`flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-all ${
                    post.hasLiked
                      ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Heart
                    size={18}
                    className={`transition-transform ${post.hasLiked ? 'scale-110 fill-current' : ''}`}
                    aria-hidden
                  />
                  {post.likes}
                </button>
                <button
                  onClick={() => toggleComments(post.id)}
                  aria-expanded={activeCommentId === post.id}
                  className={`flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors ${
                    activeCommentId === post.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <MessageSquare size={18} aria-hidden />
                  {post.comments.length} Comments
                </button>
                <button
                  type="button"
                  aria-label="Share"
                  className="ml-auto flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Share2 size={18} aria-hidden />
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {activeCommentId === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden border-t border-border pt-4"
                  >
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        aria-label="Write a comment"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-sm focus:ring-2 focus:ring-ring/30 focus:outline-none"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentText.trim()}
                        aria-label="Send comment"
                        className="rounded-lg bg-foreground p-2 text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                      >
                        <Send size={16} aria-hidden />
                      </button>
                    </div>

                    <div className="max-h-60 space-y-4 overflow-y-auto pr-2">
                      {post.comments.length === 0 && (
                        <p className="py-2 text-center text-xs text-muted-foreground">
                          No comments yet. Be the first!
                        </p>
                      )}
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 rounded-lg bg-muted/50 p-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card text-xs font-bold text-muted-foreground">
                            {comment.author.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm font-semibold text-foreground">
                                {comment.author}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {comment.timestamp}
                              </span>
                            </div>
                            <p className="text-sm leading-snug text-muted-foreground">
                              {comment.content}
                            </p>
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
