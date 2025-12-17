import React, { useState, useEffect } from 'react';
import { generateAssessmentQuestions, generateCodingAssessmentChallenge, evaluateCodeSubmission, runCodeWithTestCases } from '../services/geminiService';
import { Question, AssessmentResult, CodingChallenge, RunCodeResult } from '../types';
import { Loader2, Play, Terminal, ChevronUp, ChevronDown, Check, X, Code2, Layout, RotateCcw, MonitorPlay, CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

interface AssessmentProps {
  topic: string;
  onComplete: (result: AssessmentResult) => void;
}

const CODING_TOPICS = ['Java', 'Python', 'JavaScript', 'C++', 'SQL', 'Spring Boot', 'Go', 'Rust', 'TypeScript', 'Technical Coding', 'Coding', 'DSA'];

export const Assessment: React.FC<AssessmentProps> = ({ topic, onComplete }) => {
  const isCodingAssessment = CODING_TOPICS.some(t => topic.toLowerCase().includes(t.toLowerCase())) || topic.includes('Coding');
  
  const [loading, setLoading] = useState(true);
  
  // MCQ State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  // Coding State
  const [codingChallenge, setCodingChallenge] = useState<CodingChallenge | null>(null);
  const [userCode, setUserCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [runResult, setRunResult] = useState<RunCodeResult | null>(null);
  const [consoleTab, setConsoleTab] = useState(0); // 0, 1, 2 for test cases

  // Timer State
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  useEffect(() => {
    if (isCodingAssessment) {
      loadCodingAssessment();
    } else {
      loadQuestions();
    }
  }, [topic]);

  // Timer Logic
  useEffect(() => {
    if (loading) return;

    if (timeLeft <= 0) {
      // Time is up, auto-submit
      if (isCodingAssessment) {
        handleSubmitCode();
      } else {
        finishMCQAssessment(answers);
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, loading, isCodingAssessment, answers]); // Include answers to ensure latest state is captured if passed directly

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const qs = await generateAssessmentQuestions(topic);
      setQuestions(qs);
    } catch (e) {
      console.error(e);
      setQuestions([
        { id: 1, text: `What is a core concept of ${topic}?`, options: ["Concept A", "Concept B", "Concept C", "Concept D"], correctIndex: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCodingAssessment = async () => {
    setLoading(true);
    try {
      const challenge = await generateCodingAssessmentChallenge(topic);
      setCodingChallenge(challenge);
      setUserCode(challenge.starterCode);
    } catch (e) {
      console.error(e);
      setCodingChallenge({
        problemName: "Error loading challenge",
        problemDescription: "Please try again.",
        constraints: "",
        testCases: [],
        starterCode: "// Error loading",
        solutionLanguage: topic
      });
    } finally {
      setLoading(false);
    }
  };

  // MCQ Handlers
  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishMCQAssessment(newAnswers);
    }
  };

  const finishMCQAssessment = (finalAnswers: number[]) => {
    let score = 0;
    // Safety check if questions failed to load or mismatched
    if (questions.length > 0) {
      finalAnswers.forEach((ans, idx) => {
        if (questions[idx] && ans === questions[idx].correctIndex) score++;
      });
    }

    const weakAreas = score < questions.length / 2 ? [`${topic} Basics`, "Problem Solving"] : ["Advanced Concepts"];
    const strongAreas = score >= questions.length / 2 ? ["Syntax", "Core Logic"] : [];

    const result: AssessmentResult = {
      score,
      total: questions.length,
      weakAreas,
      strongAreas
    };
    onComplete(result);
  };

  // Coding Handlers
  const handleRunCode = async () => {
    if (!codingChallenge) return;
    setIsRunning(true);
    setShowConsole(true);
    setRunResult(null);
    
    try {
        const result = await runCodeWithTestCases(
            codingChallenge.problemDescription,
            userCode,
            codingChallenge.solutionLanguage,
            codingChallenge.testCases
        );
        setRunResult(result);
    } catch (e) {
        setRunResult({ passed: false, results: [], error: "Execution failed" });
    } finally {
        setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!codingChallenge) return;
    setIsSubmitting(true);
    
    try {
      const evalResult = await evaluateCodeSubmission(
        codingChallenge.problemDescription,
        userCode,
        codingChallenge.solutionLanguage
      );

      // Determine score and areas
      const result: AssessmentResult = {
          score: evalResult.score || (evalResult.success ? 100 : 40),
          total: 100,
          weakAreas: evalResult.weakAreas || ["Optimization", "Edge Cases"],
          strongAreas: evalResult.strongAreas || ["Basic Logic"]
      };
      
      onComplete(result);
    } catch (e) {
      console.error("Submission error", e);
      // Fallback
      onComplete({
          score: 50,
          total: 100,
          weakAreas: ["Error Handling"],
          strongAreas: []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600">Generating {isCodingAssessment ? 'coding challenge' : 'assessment questions'} for <span className="font-semibold text-indigo-600">{topic}</span>...</p>
      </div>
    );
  }

  // --- CODING UI (LeetCode Style) ---
  if (isCodingAssessment && codingChallenge) {
    return (
      <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
         {/* Left Panel: Description */}
         <div className="w-5/12 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white px-3 py-1 rounded-t-lg border-t border-l border-r border-slate-200 translate-y-[1px]">
                      <Layout className="w-4 h-4 text-indigo-500" /> Description
                  </div>
                </div>
                {/* Timer Display */}
                <div className={`flex items-center gap-2 font-mono text-sm font-bold ${timeLeft < 120 ? 'text-red-600 animate-pulse' : 'text-slate-600'}`}>
                    <Clock className="w-4 h-4" />
                    {formatTime(timeLeft)}
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{codingChallenge.problemName}</h3>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Medium</span>
                </div>
                
                <div className="prose prose-sm max-w-none text-slate-600 mb-8">
                    <p className="whitespace-pre-wrap leading-relaxed">{codingChallenge.problemDescription}</p>
                </div>

                <div className="space-y-6">
                    {codingChallenge.testCases?.map((tc, idx) => (
                        <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Example {idx + 1}</h4>
                            <div className="space-y-2 font-mono text-sm">
                                <div className="flex gap-2">
                                    <span className="text-slate-400 select-none">Input:</span>
                                    <span className="text-slate-800">{tc.input}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-slate-400 select-none">Output:</span>
                                    <span className="text-slate-800">{tc.output}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {codingChallenge.constraints && (
                    <div className="mt-8">
                        <h4 className="text-sm font-bold text-slate-700 mb-2">Constraints:</h4>
                        <ul className="list-disc list-inside text-sm text-slate-500 space-y-1 font-mono bg-slate-100 p-4 rounded-lg">
                           <li>{codingChallenge.constraints}</li>
                        </ul>
                    </div>
                )}
            </div>
         </div>

         {/* Right Panel: Editor & Console */}
         <div className="w-7/12 flex flex-col bg-slate-900 relative">
            {/* Editor Toolbar */}
            <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Code2 className="w-4 h-4" /> 
                    <span className="text-slate-200 font-medium">{codingChallenge.solutionLanguage}</span>
                </div>
                <div className="flex items-center gap-2">
                     <button onClick={() => setUserCode(codingChallenge.starterCode)} className="text-slate-400 hover:text-white p-1" title="Reset Code">
                        <RotateCcw className="w-3.5 h-3.5" />
                     </button>
                </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 relative group">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-full bg-[#1e1e1e] text-slate-300 font-mono p-4 text-sm resize-none focus:outline-none leading-6"
                  spellCheck={false}
                  placeholder="// Write your solution here..."
                />
            </div>

            {/* Console Drawer */}
            {showConsole && (
                <div className="absolute bottom-14 left-0 right-0 h-64 bg-slate-800 border-t border-slate-700 shadow-2xl flex flex-col transition-transform animate-in slide-in-from-bottom-10 z-10">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 text-sm font-medium text-slate-200 border-b-2 border-indigo-500 pb-2 px-1">
                                <MonitorPlay className="w-4 h-4" /> Test Cases
                            </button>
                        </div>
                        <button onClick={() => setShowConsole(false)} className="text-slate-400 hover:text-white">
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        {isRunning ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                <span>Running Code...</span>
                            </div>
                        ) : runResult ? (
                            <div className="space-y-4">
                                <div className={`flex items-center gap-2 text-lg font-bold ${runResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {runResult.error ? (
                                        <>
                                            <AlertCircle className="w-5 h-5" /> <span>Runtime Error</span>
                                        </>
                                    ) : runResult.passed ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" /> <span>Accepted</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5" /> <span>Wrong Answer</span>
                                        </>
                                    )}
                                </div>

                                {runResult.error ? (
                                    <div className="bg-red-950/30 text-red-200 p-3 rounded-md font-mono text-xs border border-red-900/50">
                                        {runResult.error}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-2 border-b border-slate-700 pb-2">
                                            {runResult.results.map((res, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => setConsoleTab(idx)}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${consoleTab === idx ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                                                >
                                                    Case {idx + 1}
                                                    {res.passed ? <Check className="w-3 h-3 text-emerald-500" /> : <X className="w-3 h-3 text-red-500" />}
                                                </button>
                                            ))}
                                        </div>
                                        
                                        {runResult.results[consoleTab] && (
                                            <div className="space-y-3 font-mono text-sm">
                                                <div>
                                                    <span className="text-slate-500 text-xs uppercase block mb-1">Input</span>
                                                    <div className="bg-slate-700/50 p-2 rounded text-slate-200">
                                                        {runResult.results[consoleTab].input}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 text-xs uppercase block mb-1">Output</span>
                                                    <div className={`p-2 rounded ${runResult.results[consoleTab].passed ? 'bg-slate-700/50 text-slate-200' : 'bg-red-900/20 text-red-200 border border-red-900/30'}`}>
                                                        {runResult.results[consoleTab].actual}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 text-xs uppercase block mb-1">Expected</span>
                                                    <div className="bg-slate-700/50 p-2 rounded text-slate-200">
                                                        {runResult.results[consoleTab].expected}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-slate-500 text-sm flex items-center justify-center h-full">
                                Run your code to see results here.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer Actions */}
            <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4">
                <button 
                    onClick={() => setShowConsole(!showConsole)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
                >
                    <Terminal className="w-4 h-4" /> Console
                    {showConsole ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRunCode}
                        disabled={isRunning || isSubmitting}
                        className="px-5 py-1.5 rounded-lg bg-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-600 transition-all border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                         {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run
                    </button>
                    <button 
                        onClick={handleSubmitCode}
                        disabled={isRunning || isSubmitting}
                        className="px-6 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                    </button>
                </div>
            </div>
         </div>
      </div>
    );
  }

  // --- MCQ UI (Existing) ---
  if (questions.length === 0) {
    return <div className="text-center p-8">Failed to load questions. Please try again later.</div>;
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden mt-10">
      <div className="bg-indigo-600 p-6 text-white">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Skill Assessment: {topic}</h2>
          <div className="flex items-center gap-3">
             <div className={`flex items-center gap-1 font-mono text-sm font-bold bg-indigo-700/50 px-3 py-1 rounded-full ${timeLeft < 120 ? 'text-red-300 animate-pulse' : 'text-indigo-100'}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
             </div>
             <span className="text-indigo-200 text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
        </div>
        <div className="w-full bg-indigo-800 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-xl font-medium text-slate-800 mb-6">{currentQ.text}</h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="text-slate-700 group-hover:text-indigo-900">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};