import React, { useState, useEffect } from 'react';
import { generateMixedAssessment, generateCodingAssessmentChallenge } from '../services/geminiService';
import { Question, AssessmentResult, CodingChallenge } from '../types';
import { Loader2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { CodingWorkspace } from './CodingWorkspace';

interface FullAssessmentProps {
  onComplete: (result: AssessmentResult) => void;
}

type Stage = 'loading' | 'mcq' | 'transition' | 'coding' | 'calculating';

export const FullAssessment: React.FC<FullAssessmentProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>('loading');
  
  // MCQ Data
  const [mcqQuestions, setMcqQuestions] = useState<Question[]>([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<number[]>([]);

  // Coding Data
  const [codingChallenge, setCodingChallenge] = useState<CodingChallenge | null>(null);
  const [codingPassed, setCodingPassed] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  useEffect(() => {
    loadAssessment();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (stage === 'loading' || stage === 'transition' || stage === 'calculating') return;
    
    if (timeLeft <= 0) {
       // Timeout Handling
       if (stage === 'mcq') {
         setStage('transition'); // Move to next stage on timeout
       } else if (stage === 'coding') {
         finishAssessment(false); // Fail coding if time runs out
       }
       return;
    }

    const timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, stage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const loadAssessment = async () => {
    try {
      // 1. Load MCQs
      const questions = await generateMixedAssessment();
      setMcqQuestions(questions);
      
      // 2. Load Coding Challenge (Pre-fetch or fetch now)
      // We'll fetch a generic DSA problem
      const challenge = await generateCodingAssessmentChallenge('Python (Basic DSA)');
      setCodingChallenge(challenge);

      setStage('mcq');
      setTimeLeft(20 * 60); // Reset timer for MCQ start
    } catch (e) {
      console.error(e);
      // Fallback
      setStage('mcq'); 
      setMcqQuestions([{ id: 1, text: "Failed to load. Correct is A.", options: ["A", "B", "C", "D"], correctIndex: 0, category: 'Error' }]);
    }
  };

  const handleMcqAnswer = (idx: number) => {
    const newAnswers = [...mcqAnswers, idx];
    setMcqAnswers(newAnswers);
    if (currentMcqIndex < mcqQuestions.length - 1) {
      setCurrentMcqIndex(currentMcqIndex + 1);
    } else {
      setStage('transition');
    }
  };

  const startCodingStage = () => {
    setStage('coding');
    setTimeLeft(20 * 60); // Reset timer for Coding Phase (20 mins)
  };

  const handleCodingComplete = () => {
    setCodingPassed(true);
    finishAssessment(true);
  };

  const handleSkipCoding = () => {
    finishAssessment(false);
  };

  const finishAssessment = (codingSuccess: boolean) => {
    setStage('calculating');

    // 1. Calculate MCQ Score
    let correctCount = 0;
    const weakAreasSet = new Set<string>();

    // Safety check for answers length matching questions
    mcqAnswers.forEach((ans, idx) => {
      const q = mcqQuestions[idx];
      if (q && ans === q.correctIndex) {
        correctCount++;
      } else if (q) {
        if (q.category) weakAreasSet.add(q.category);
      }
    });

    // 2. Add Coding Result
    const totalPoints = mcqQuestions.length + 5; // 5 points weight for coding
    const obtainedPoints = correctCount + (codingSuccess ? 5 : 0);
    
    if (!codingSuccess) weakAreasSet.add("Technical Coding Implementation");

    // 3. Construct Result
    const result: AssessmentResult = {
      score: obtainedPoints,
      total: totalPoints,
      weakAreas: Array.from(weakAreasSet).length > 0 ? Array.from(weakAreasSet) : ["Advanced System Design"],
      strongAreas: ["Perseverance"]
    };

    onComplete(result);
  };

  if (stage === 'loading' || stage === 'calculating') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
        <h2 className="text-xl font-bold text-slate-800">
          {stage === 'loading' ? 'Preparing Comprehensive Test...' : 'Analyzing Performance...'}
        </h2>
        <p className="text-slate-500 mt-2">Curating Aptitude, CS Core, and Coding challenges.</p>
      </div>
    );
  }

  // --- MCQ STAGE ---
  if (stage === 'mcq') {
    const currentQ = mcqQuestions[currentMcqIndex];
    if (!currentQ) return <div>Error</div>;

    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">Phase 1: Knowledge Check</h2>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-1 font-mono text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm ${timeLeft < 120 ? 'text-red-200 animate-pulse' : 'text-white'}`}>
                        <Clock className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    Question {currentMcqIndex + 1} / {mcqQuestions.length}
                    </span>
                </div>
             </div>
             <p className="text-indigo-100 text-sm">Category: {currentQ.category || 'General'}</p>
             
             <div className="w-full bg-black/20 rounded-full h-1.5 mt-4">
                <div 
                    className="bg-white h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentMcqIndex) / mcqQuestions.length) * 100}%` }}
                />
             </div>
          </div>

          <div className="p-8">
             <h3 className="text-xl font-medium text-slate-800 mb-8 leading-relaxed">{currentQ.text}</h3>
             <div className="space-y-3">
                {currentQ.options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleMcqAnswer(idx)}
                        className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-sm transition-all flex items-center group"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-sm font-bold">
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-slate-700 group-hover:text-indigo-900 font-medium">{opt}</span>
                    </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TRANSITION STAGE ---
  if (stage === 'transition') {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center bg-white p-10 rounded-2xl shadow-xl border border-slate-100 animate-fade-in-up">
         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
         </div>
         <h2 className="text-3xl font-bold text-slate-800 mb-2">Phase 1 Complete!</h2>
         <p className="text-slate-500 mb-8 text-lg">
           Great job on the knowledge check. Now, let's test your practical skills with a coding challenge.
         </p>
         
         <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 text-left">
            <h4 className="font-bold text-slate-700 mb-2">Next: Coding Challenge</h4>
            <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Write clean, efficient code</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Pass hidden test cases</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Time Limit: 20 Minutes</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Language: Python (Recommended)</li>
            </ul>
         </div>

         <button 
           onClick={startCodingStage}
           className="w-full bg-indigo-600 text-white text-lg font-bold py-4 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all flex items-center justify-center gap-2"
         >
            Start Coding Challenge <ArrowRight className="w-5 h-5" />
         </button>
      </div>
    );
  }

  // --- CODING STAGE ---
  if (stage === 'coding' && codingChallenge) {
    return (
      <div className="h-full">
         <CodingWorkspace 
            challenge={codingChallenge} 
            onClose={handleSkipCoding} // Treat close as skip/fail for now to proceed
            onComplete={handleCodingComplete}
            timeLeft={timeLeft} // Pass timer
         />
      </div>
    );
  }

  return <div>Unknown Stage</div>;
};