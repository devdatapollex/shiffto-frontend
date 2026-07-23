'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- DATE PICKER ---
interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthsList = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    onChange(selectedDate);
    setIsOpen(false);
  };

  const formattedValue = value
    ? value.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between h-11 px-3.5 bg-white border border-slate-200 text-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B3A8E] focus:border-[#0B3A8E] hover:border-slate-300 transition-colors w-full text-left cursor-pointer shadow-xs text-sm',
          className
        )}
      >
        <span className={cn('text-sm font-normal truncate', !value && 'text-slate-400')}>
          {formattedValue || placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400 shrink-0 ml-2 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white border border-[#e2e8f0] rounded-lg shadow-xl w-[290px] animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-[#0B3A8E] text-sm">
              {monthsList[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-8 w-8" />;
              }

              const isSelected =
                value &&
                value.getDate() === day &&
                value.getMonth() === month &&
                value.getFullYear() === year;

              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-[#0B3A8E] text-white font-bold'
                      : isToday
                        ? 'bg-orange-50 text-[#F16522] border border-orange-200 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- TIME PICKER ---
interface TimePickerProps {
  value?: string; // "HH:MM" 24h format
  onChange: (time: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  let initialHour = 12;
  let initialMinute = 0;
  let initialAmpm = 'AM';

  if (value) {
    const [h24, mStr] = value.split(':');
    const h = parseInt(h24, 10);
    initialMinute = parseInt(mStr, 10) || 0;
    if (h >= 12) {
      initialAmpm = 'PM';
      initialHour = h === 12 ? 12 : h - 12;
    } else {
      initialAmpm = 'AM';
      initialHour = h === 0 ? 12 : h;
    }
  }

  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const [selectedAmpm, setSelectedAmpm] = useState(initialAmpm);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (hour: number, minute: number, ampm: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedAmpm(ampm);

    let h24 = hour;
    if (ampm === 'PM' && hour !== 12) {
      h24 = hour + 12;
    } else if (ampm === 'AM' && hour === 12) {
      h24 = 0;
    }
    const hStr = h24.toString().padStart(2, '0');
    const mStr = minute.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const formattedValue = value
    ? (() => {
        const ampm = selectedAmpm;
        const minStr = selectedMinute.toString().padStart(2, '0');
        return `${selectedHour}:${minStr} ${ampm}`;
      })()
    : '';

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 h-11 px-4 bg-white border border-[#e2e8f0] text-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B3A8E] focus:border-[#0B3A8E] hover:border-slate-300 transition-colors w-full text-left cursor-pointer shadow-xs',
          className
        )}
      >
        <Clock className="h-4.5 w-4.5 text-[#0B3A8E] shrink-0" />
        <span className={cn('text-sm font-medium', !value && 'text-slate-400')}>
          {formattedValue || placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-2 p-4 bg-white border border-[#e2e8f0] rounded-lg shadow-xl w-[260px] animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="grid grid-cols-3 gap-2">
            {/* Hours Column */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
                Hour
              </span>
              <div className="h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {hours.map((h) => (
                  <button
                    key={`h-${h}`}
                    type="button"
                    onClick={() => handleSelect(h, selectedMinute, selectedAmpm)}
                    className={cn(
                      'block w-full py-1 text-xs font-semibold rounded-lg text-center cursor-pointer transition-colors',
                      selectedHour === h
                        ? 'bg-[#0B3A8E] text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {h.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
                Min
              </span>
              <div className="h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                {minutes.map((m) => (
                  <button
                    key={`m-${m}`}
                    type="button"
                    onClick={() => handleSelect(selectedHour, m, selectedAmpm)}
                    className={cn(
                      'block w-full py-1 text-xs font-semibold rounded-lg text-center cursor-pointer transition-colors',
                      selectedMinute === m
                        ? 'bg-[#0B3A8E] text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {m.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM Column */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
                Period
              </span>
              <div className="flex flex-col gap-2 pt-1">
                {['AM', 'PM'].map((period) => (
                  <button
                    key={`p-${period}`}
                    type="button"
                    onClick={() => handleSelect(selectedHour, selectedMinute, period)}
                    className={cn(
                      'py-1.5 text-xs font-bold rounded-lg text-center cursor-pointer transition-colors',
                      selectedAmpm === period
                        ? 'bg-[#0B3A8E] text-white'
                        : 'text-slate-700 hover:bg-slate-50 border border-slate-100'
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
