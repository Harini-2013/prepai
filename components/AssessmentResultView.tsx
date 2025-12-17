import React from 'react';
import { AssessmentResult } from '../types';
import { Trophy, ArrowRight, Target, AlertCircle, BarChart } from 'lucide-react';

interface AssessmentResultViewProps {
  result: AssessmentResult;
  topic: string;
  level: string;
  onContinue: () => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({ 
  result, 
  topic, 
  level, 
  onContinue 
}) => {
  const percentage = Math.round((result.score / result.total) * 100);
  
  const getLevelColor = (lvl: string) => {
    switch(lvl.toLowerCase()) {
      case 'beginner': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'intermediate': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'advanced': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 rounded-full bg-indigo-50 mb-4">
          <Trophy className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Assessment Complete!</h1>
        <p className="text-slate-500">Here is your skill analysis for <span className="font-semibold text-slate-700">{topic}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <p className="text-slate-400 font-medium uppercase tracking-wider text-sm mb-4">Your Score</p>
          <div className="relative w-32 h-32 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
               <circle
                 cx="64"
                 cy="64"
                 r="56"
                 stroke="currentColor"
                 strokeWidth="12"
                 fill="transparent"
                 className="text-slate-100"
               />
               <circle
                 cx="64"
                 cy="64"
                 r="56"
                 stroke="currentColor"
                 strokeWidth="12"
                 fill="transparent"
                 strokeDasharray={351.86} // 2 * pi * 56
                 strokeDashoffset={351.86 - (percentage / 100) * 351.86}
                 className="text-indigo-600 transition-all duration-1000 ease-out"
               />
             </svg>
             <span className="absolute text-3xl font-bold text-slate-800">{result.score}/{result.total}</span>
          </div>
          <p className="mt-4 text-slate-500 font-medium">{percentage}% Correct</p>
        </div>

        {/* Level Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <p className="text-slate-400 font-medium uppercase tracking-wider text-sm mb-4">Assessed Level</p>
          <div className={`px-6 py-3 rounded-xl border-2 font-bold text-2xl mb-4 ${getLevelColor(level)}`}>
            {level}
          </div>
          <p className="text-slate-500 text-sm px-4">
            Based on your answers, we'll design a roadmap tailored for a <span className="font-semibold text-slate-700">{level}</span> developer.
          </p>
        </div>
      </div>

      {/* Weak Areas */}
      {result.weakAreas.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-slate-800">Areas for Improvement</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.weakAreas.map((area, idx) => (
              <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100">
                {area}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-3">Your roadmap will prioritize these topics.</p>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-4">
        <button
          onClick={onContinue}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
        >
          <Target className="w-6 h-6" />
          Generate My Personalized Roadmap
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-center text-slate-400 text-sm mt-4">
          Uses AI to create a custom study plan based on your level.
        </p>
      </div>
    </div>
  );
};