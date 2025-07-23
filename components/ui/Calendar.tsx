'use client';

import { motion } from 'framer-motion';
import { format, addDays, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Check, X } from 'lucide-react';

interface CalendarProps {
  startDate: Date;
  successDates: string[];
  currentDay: number;
  totalDays?: number;
}

const Calendar: React.FC<CalendarProps> = ({ 
  startDate, 
  successDates, 
  currentDay, 
  totalDays = 30 
}) => {
  const days = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(startDate, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const isSuccess = successDates.includes(dateString);
    const isPast = i < currentDay - 1;
    const isToday = i === currentDay - 1;
    const isFuture = i > currentDay - 1;
    
    return {
      date,
      dateString,
      dayNumber: i + 1,
      isSuccess,
      isPast,
      isToday,
      isFuture,
      isFailed: isPast && !isSuccess,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        30日間チャレンジカレンダー
      </h3>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <motion.div
            key={day.dateString}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            className={`
              relative aspect-square rounded-lg flex items-center justify-center text-sm font-medium
              ${day.isSuccess ? 'bg-success-100 border-2 border-success-500' : ''}
              ${day.isFailed ? 'bg-danger-100 border-2 border-danger-500' : ''}
              ${day.isToday ? 'bg-primary-100 border-2 border-primary-500 ring-2 ring-primary-200' : ''}
              ${day.isFuture ? 'bg-gray-50 border border-gray-200' : ''}
              transition-all duration-200
            `}
          >
            <span className={`
              ${day.isSuccess ? 'text-success-700' : ''}
              ${day.isFailed ? 'text-danger-700' : ''}
              ${day.isToday ? 'text-primary-700 font-bold' : ''}
              ${day.isFuture ? 'text-gray-400' : ''}
            `}>
              {day.dayNumber}
            </span>
            
            {day.isSuccess && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-success-600" />
              </motion.div>
            )}
            
            {day.isFailed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-danger-600" />
              </motion.div>
            )}
            
            {day.isToday && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full"
              />
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-center space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-success-500 rounded mr-1"></div>
          <span>成功</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-danger-500 rounded mr-1"></div>
          <span>失敗</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-500 rounded mr-1"></div>
          <span>今日</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
          <span>未来</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;