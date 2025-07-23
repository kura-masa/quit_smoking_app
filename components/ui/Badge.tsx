'use client';

import { motion } from 'framer-motion';
import { Badge as BadgeType } from '@/lib/types';

interface BadgeProps {
  badge: BadgeType;
  isEarned: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Badge: React.FC<BadgeProps> = ({ badge, isEarned, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`
        ${sizeClasses[size]} 
        ${isEarned ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gray-200'} 
        rounded-full flex items-center justify-center shadow-lg relative
        ${isEarned ? 'animate-pulse-slow' : ''}
      `}
    >
      <span className={isEarned ? '' : 'grayscale opacity-50'}>
        {badge.icon}
      </span>
      
      {isEarned && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-xs">✓</span>
        </motion.div>
      )}
      
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className={`text-xs font-medium ${badge.color} ${isEarned ? '' : 'text-gray-400'}`}>
          {badge.name}
        </p>
      </div>
    </motion.div>
  );
};

export default Badge;