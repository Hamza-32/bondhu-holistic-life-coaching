import { motion, AnimatePresence } from 'motion/react';
import { useBondhuStore } from '@/stores/useBondhuStore';
import { Zap } from 'lucide-react';

export const XpNotification = () => {
  const notification = useBondhuStore((state) => state.notification);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="pointer-events-none fixed right-4 bottom-24 z-50 flex items-center gap-3 rounded-xl bg-primary px-6 py-4 text-primary-foreground shadow-lg md:right-8 md:bottom-8"
        >
          <div className="rounded-full bg-white/20 p-2">
            <Zap aria-hidden className="h-5 w-5 fill-yellow-300 text-yellow-300" />
          </div>
          <span className="text-lg font-bold">{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
