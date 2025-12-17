import React, { useState, useEffect } from 'react';
import { Roadmap, DayPlan, AssessmentResult, Task, CodingChallenge } from '../types';
import { generateInterviewRoadmap } from '../services/geminiService';
import { CodingWorkspace } from './CodingWorkspace';
import { CheckSquare, Square, PlayCircle, Book, Code, Loader2, Calendar, Mic, ChevronDown, ChevronUp, ExternalLink, Terminal } from 'lucide-react';

interface RoadmapViewProps {
  topic: string;
  level: string;
  assessmentResult: AssessmentResult;
  existingRoadmap: Roadmap | null;
  completedTasks: Set<string>;
  onSaveRoadmap: (roadmap: Roadmap) => void;
  onToggleTask: (taskId: string) => void;
  onBack: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ 
  topic,
  level,
  assessmentResult, 
  existingRoadmap, 
  completedTasks,
  onSaveRoadmap, 
  onToggleTask,
  onBack
}) => {
  const [loading, setLoading] = useState(!existingRoadmap);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(existingRoadmap);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [activeChallenge, setActiveChallenge] = useState<{ challenge: CodingChallenge, taskId: string } | null>(null);

  useEffect(() => {
    if (!existingRoadmap) {
      createRoadmap();
    }
  }, []);

  const createRoadmap = async () => {
    setLoading(true);
    try {
      const result = await generateInterviewRoadmap(topic, level, assessmentResult.weakAreas);
      setRoadmap(result);
      onSaveRoadmap(result);
    } catch (e) {
      console.error(e);
      // Fallback/Mock
      setLoading(false); 
      // In a real app, you might set an error state here
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'coding': return <Code className="w-5 h-5 text-purple-500" />;
      case 'reading': return <Book className="w-5 h-5 text-emerald-500" />;
      case 'practice': return <Mic className="w-5 h-5 text-orange-500" />;
      default: return <Book className="w-5 h-5 text-slate-500" />;
    }
  };

  const getPlatformLink = (task: Task) => {
    if (task.link && typeof task.link === 'string' && task.link.toLowerCase() !== 'null' && task.link.trim().length > 0) {
       let url = task.link.trim();
       if (!url.startsWith('http://') && !url.startsWith('https://')) {
         url = `https://${url}`;
       }
       return url;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(`${task.platform} ${task.title} tutorial`)}`;
  };

  const handleOpenChallenge = (challenge: CodingChallenge, taskId: string) => {
    setActiveChallenge({ challenge, taskId });
  };

  const handleCompleteChallenge = () => {
    if (activeChallenge) {
      // Mark task as complete if not already
      if (!completedTasks.has(activeChallenge.taskId)) {
        onToggleTask(activeChallenge.taskId);
      }
      setActiveChallenge(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-slate-800">Generating Your Personalized Plan...</h2>
        <p className="text-slate-500 mt-2">Topic: {topic} | Level: {level}</p>
        <p className="text-slate-500 mt-1">Finding best resources and coding challenges...</p>
      </div>
    );
  }

  if (!roadmap) return <div>Error loading roadmap.</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
         <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors">
           &larr; Back to Dashboard
         </button>
         <div className="text-right">
            <h1 className="text-2xl font-bold text-indigo-900">{roadmap.title}</h1>
            <p className="text-xs text-slate-400">Generated for {level} Level</p>
         </div>
      </div>

      <div className="space-y-6 relative">
        <div className="absolute left-[35px] top-6 bottom-6 w-0.5 bg-indigo-100 hidden md:block"></div>

        {roadmap.days.map((day, idx) => {
          const isExpanded = expandedDay === day.day;
          const dayTasks = day.tasks.map((_, tIdx) => `day-${day.day}-task-${tIdx}`);
          const completedCount = dayTasks.filter(id => completedTasks.has(id)).length;
          const progress = Math.round((completedCount / day.tasks.length) * 100);
          const isDayComplete = progress === 100;

          return (
            <div key={day.day} className="relative pl-0 md:pl-20 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className={`hidden md:flex absolute left-0 w-[70px] h-[70px] rounded-full border-4 shadow-sm items-center justify-center z-10 font-bold text-xl transition-all duration-300 ${isDayComplete ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-indigo-50 text-indigo-600'}`}>
                {isDayComplete ? <CheckSquare className="w-8 h-8" /> : `Day ${day.day}`}
              </div>

              <div className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${isExpanded ? 'ring-2 ring-indigo-500/10 border-indigo-200 shadow-md' : 'border-slate-200 hover:border-indigo-300'}`}>
                
                <div 
                  onClick={() => toggleDay(day.day)}
                  className="p-5 cursor-pointer flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="md:hidden bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-sm">
                      Day {day.day}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{day.topic}</h3>
                      <p className="text-slate-500 text-sm hidden sm:block">{day.summary}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{progress}% Done</span>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-white">
                    <p className="text-slate-600 text-sm mb-4 sm:hidden">{day.summary}</p>
                    <div className="space-y-3">
                      {day.tasks.map((task, tIdx) => {
                        const taskId = `day-${day.day}-task-${tIdx}`;
                        const isCompleted = completedTasks.has(taskId);
                        const platformUrl = getPlatformLink(task);
                        const hasChallenge = !!task.codingChallenge;

                        return (
                          <div 
                            key={taskId} 
                            className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${isCompleted ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'}`}
                          >
                            <div className="flex items-start gap-4 mb-3 sm:mb-0">
                              <button 
                                onClick={() => onToggleTask(taskId)}
                                className={`mt-1 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                              >
                                {isCompleted ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                              </button>
                              
                              <div>
                                <h4 className={`font-medium text-base ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                  {task.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                                     {getTaskIcon(task.type)} {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                                   </span>
                                   <span className="text-xs text-slate-400 flex items-center gap-1">
                                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                     {task.duration}
                                   </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-end pl-10 sm:pl-0">
                              {hasChallenge && task.codingChallenge ? (
                                <button
                                  onClick={() => handleOpenChallenge(task.codingChallenge!, taskId)}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center shadow-md shadow-indigo-100"
                                >
                                  <Terminal className="w-3.5 h-3.5" />
                                  Solve Challenge
                                </button>
                              ) : (
                                <a 
                                  href={platformUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-sm font-medium w-full sm:w-auto justify-center"
                                >
                                  <span className="truncate max-w-[120px]">{task.platform || 'Start Learning'}</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeChallenge && (
        <CodingWorkspace 
          challenge={activeChallenge.challenge} 
          onClose={() => setActiveChallenge(null)}
          onComplete={handleCompleteChallenge}
        />
      )}
    </div>
  );
};