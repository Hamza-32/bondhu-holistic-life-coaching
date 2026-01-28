import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBondhuStore } from '../store/useBondhuStore';
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
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 bg-bondhu-red text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50 pointer-events-none"
        >
          <div className="bg-white/20 p-2 rounded-full">
            <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          </div>
          <span className="font-bold text-lg">{notification.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
