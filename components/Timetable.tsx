import React from 'react';
import { Roadmap, DayPlan } from '../types';
import { Calendar, Clock, CheckSquare, Square, ChevronLeft } from 'lucide-react';

interface TimetableProps {
  roadmap: Roadmap;
  completedTasks: Set<string>;
  onToggleTask: (taskId: string) => void;
  onBack: () => void;
}

export const Timetable: React.FC<TimetableProps> = ({ roadmap, completedTasks, onToggleTask, onBack }) => {
  
  // Helper to get dates for the current week or starting from today
  const getDates = () => {
    const dates = [];
    const today = new Date();
    // Start from today for the next 5-7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map roadmap days to calendar dates
  // Assuming Roadmap Day 1 = Today
  const getDayPlanForDate = (index: number): DayPlan | undefined => {
    // If roadmap days are 1-based index
    return roadmap.days.find(d => d.day === index + 1);
  };

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" /> Study Timetable
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-indigo-50/50">
            <p className="text-slate-600">
                Here is your schedule for the week based on your <strong>{roadmap.title}</strong> plan.
                Consistency is key to maintaining your streak!
            </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-7 divide-x divide-slate-100">
            {dates.map((date, index) => {
                const dayPlan = getDayPlanForDate(index);
                const isToday = index === 0;

                return (
                    <div key={index} className={`min-h-[400px] flex flex-col ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
                        {/* Header */}
                        <div className={`p-3 text-center border-b border-slate-100 ${isToday ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-50 text-slate-600'}`}>
                            <span className="block text-xs uppercase font-bold tracking-wider">{weekDays[date.getDay()]}</span>
                            <span className="block text-xl font-bold">{date.getDate()}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-3 space-y-3">
                            {dayPlan ? (
                                <>
                                    <div className="bg-white border border-slate-200 rounded-lg p-2 text-center shadow-sm">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Topic</p>
                                        <p className="text-sm font-semibold text-indigo-700 leading-tight">{dayPlan.topic}</p>
                                    </div>
                                    
                                    <div className="space-y-2 mt-4">
                                        {dayPlan.tasks.map((task, tIdx) => {
                                            const taskId = `day-${dayPlan.day}-task-${tIdx}`;
                                            const isDone = completedTasks.has(taskId);
                                            
                                            return (
                                                <div 
                                                    key={taskId}
                                                    onClick={() => onToggleTask(taskId)}
                                                    className={`p-2 rounded border text-xs cursor-pointer transition-all hover:shadow-md ${isDone ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div className={`mt-0.5 ${isDone ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                            {isDone ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <span className={`${isDone ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                                                            {task.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1.5 ml-5 text-[10px] text-slate-400">
                                                        <Clock className="w-3 h-3" /> {task.duration}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                                    Rest Day / Review
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Mobile View (Stack) */}
        <div className="md:hidden divide-y divide-slate-100">
             {dates.map((date, index) => {
                const dayPlan = getDayPlanForDate(index);
                const isToday = index === 0;
                
                return (
                    <div key={index} className={`p-4 ${isToday ? 'bg-indigo-50/30' : ''}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center border ${isToday ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                <span className="text-[10px] uppercase font-bold">{weekDays[date.getDay()]}</span>
                                <span className="text-lg font-bold">{date.getDate()}</span>
                            </div>
                            <div>
                                {dayPlan ? (
                                    <>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Focus Topic</p>
                                        <p className="font-semibold text-slate-800">{dayPlan.topic}</p>
                                    </>
                                ) : (
                                    <p className="text-slate-400 italic">Rest Day</p>
                                )}
                            </div>
                        </div>

                        {dayPlan && (
                            <div className="pl-14 space-y-2">
                                {dayPlan.tasks.map((task, tIdx) => {
                                    const taskId = `day-${dayPlan.day}-task-${tIdx}`;
                                    const isDone = completedTasks.has(taskId);
                                    
                                    return (
                                        <div 
                                            key={taskId}
                                            onClick={() => onToggleTask(taskId)}
                                            className={`flex items-center gap-3 p-3 rounded-lg border ${isDone ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}
                                        >
                                             <div className={`${isDone ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                {isDone ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${isDone ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{task.title}</p>
                                                <p className="text-xs text-slate-400 mt-1">{task.duration}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
             })}
        </div>
      </div>
    </div>
  );
};