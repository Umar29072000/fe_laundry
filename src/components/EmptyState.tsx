import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = '🧺', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 px-4"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl mb-5 opacity-40"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold text-slate-400 mb-2">{title}</h3>
      {description && <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">{description}</p>}
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Sparkles size={16} />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
