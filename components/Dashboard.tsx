import React from 'react';
import { Roadmap, AssessmentResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Trophy, Target, BookOpen, Calculator, Code2, Users, MessageCircle, Play, Database, ArrowRight, CheckCircle2, CalendarDays, Flame, Sparkles, Layers } from 'lucide-react';

interface DashboardProps {
  roadmap: Roadmap | null;
  assessmentResult: AssessmentResult | null;
  completedTasksCount: number;
  totalTasksCount: number;
  streak: number;
  onSelectCategory: (category: string) => void;
  onViewRoadmap: () => void;
  onViewTimetable: () => void;
  onStartFullAssessment: () => void;
}

const COLORS = ['#10b981', '#e2e8f0']; // Emerald, Slate-200

export const Dashboard: React.FC<DashboardProps> = ({ 
  roadmap, 
  assessmentResult, 
  completedTasksCount, 
  totalTasksCount,
  streak,
  onSelectCategory,
  onViewRoadmap,
  onViewTimetable,
  onStartFullAssessment
}) => {
  
  // Calculate readiness score
  let readinessScore = 0;
  if (assessmentResult) {
    readinessScore = Math.round((assessmentResult.score / assessmentResult.total) * 40); // 40% weight on quiz
  }
  if (totalTasksCount > 0) {
    readinessScore += Math.round((completedTasksCount / totalTasksCount) * 60); // 60% weight on roadmap completion
  }

  const pieData = [
    { name: 'Completed', value: readinessScore },
    { name: 'Remaining', value: 100 - readinessScore },
  ];

  const categories = [
    {
      id: 'Aptitude',
      title: '1. Aptitude & Logic',
      description: 'First Round: Quantitative aptitude and logical reasoning tests.',
      icon: <Calculator className="w-8 h-8 text-orange-500" />,
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    },
    {
      id: 'Coding',
      title: '2. Technical Coding',
      description: 'Second Round: DSA in Java, Python, C++, SQL, etc.',
      icon: <Code2 className="w-8 h-8 text-indigo-500" />,
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    },
    {
      id: 'Core Subjects',
      title: '3. Core CS Subjects',
      description: 'Technical Interview: OS, DBMS, CN, and OOPS concepts.',
      icon: <Database className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    },
    {
      id: 'Communication',
      title: '4. HR & Communication',
      description: 'Final Round: "Tell me about yourself" and soft skills.',
      icon: <MessageCircle className="w-8 h-8 text-emerald-500" />,
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    },
    {
      id: 'Group Discussion',
      title: 'Group Discussion (GD)',
      description: 'For mass recruiters: How to speak in a team setting.',
      icon: <Users className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Student Dashboard</h2>
          <p className="text-slate-500 mt-1">Welcome! We'll guide you through every step of the interview process.</p>
        </div>
        
        <div className="flex gap-3">
            {/* Streak Badge */}
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2.5 rounded-full font-bold shadow-sm border border-orange-100">
                <Flame className="w-5 h-5 fill-current animate-pulse" />
                <span>{streak} Day Streak</span>
            </div>

            {roadmap && (
            <button 
                onClick={onViewRoadmap}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:bg-indigo-700 transition-all hover:scale-105"
            >
                <Play className="w-4 h-4 fill-current" /> Resume Plan
            </button>
            )}
        </div>
      </header>

      {/* COMPREHENSIVE PLAN PROMO */}
      {!roadmap && (
          <section className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]" onClick={onStartFullAssessment}>
              <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Layers className="w-64 h-64 text-white" />
              </div>
              
              <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-4 text-indigo-100 border border-white/10">
                      <Sparkles className="w-4 h-4 text-yellow-300" /> Recommended for Placements
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Start Comprehensive Preparation Program</h3>
                  <p className="text-indigo-100 mb-8 text-lg leading-relaxed">
                      Don't prepare in silos. Take our master assessment covering <strong>Aptitude, Coding, Core CS, and HR</strong> to generate a unified 14-day study timetable that targets all rounds perfectly.
                  </p>
                  
                  <button onClick={(e) => { e.stopPropagation(); onStartFullAssessment(); }} className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2">
                      Take Full Assessment & Get Timetable <ArrowRight className="w-5 h-5" />
                  </button>
              </div>
          </section>
      )}

      {/* Beginner Guide Visualization */}
      {!roadmap && (
        <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" /> Interview Process Roadmap
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-0"></div>
            
            {[
              { title: 'Aptitude Test', desc: 'Logic & Math', step: 1 },
              { title: 'Technical Round', desc: 'Coding & CS Core', step: 2 },
              { title: 'HR Interview', desc: 'Behavior & Fit', step: 3 },
              { title: 'Offer Letter', desc: 'You made it!', step: 4 }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center bg-white px-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mb-2 ${idx === 3 ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
                  {idx === 3 ? <Trophy className="w-5 h-5" /> : step.step}
                </div>
                <h4 className="font-bold text-slate-800">{step.title}</h4>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Progress Section (Only visible if roadmap exists) */}
      {roadmap && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-bold text-slate-700">Current Progress: {roadmap.title}</h3>
                <span className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                  {readinessScore}% Ready
                </span>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tasks Completed</p>
                    <p className="text-xl font-bold text-slate-800">{completedTasksCount} / {totalTasksCount}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <CalendarDays className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-slate-500">Study Schedule</p>
                        <button 
                            onClick={onViewTimetable}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                            View Timetable <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Overall Readiness</h3>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <text x="50%" y="50%" dy={8} textAnchor="middle" fill="#333" className="text-2xl font-bold">
                    {readinessScore}%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Learning Modules */}
      <section>
        <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" /> Topic-Wise Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden ${cat.color}`}
            >
              <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform relative z-10">
                {cat.icon}
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2 relative z-10">{cat.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed relative z-10">{cat.description}</p>
              
              {/* Hover Arrow */}
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-5 h-5 text-indigo-400" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};