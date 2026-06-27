import { motion } from 'motion/react';

export default function SkeletonCard({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded-full animate-pulse w-24" />
              <div className="h-5 bg-slate-200 rounded-full animate-pulse w-32" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="h-5 bg-slate-200 rounded-full animate-pulse w-48" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-50">
          <div className="h-4 bg-slate-100 rounded-full animate-pulse flex-1" />
          <div className="h-4 bg-slate-100 rounded-full animate-pulse w-24" />
          <div className="h-4 bg-slate-100 rounded-full animate-pulse w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`bg-slate-200 rounded-full animate-pulse ${className}`} />;
}
