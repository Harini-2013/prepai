import React, { useState } from 'react';
import { CodingChallenge } from '../types';
import { evaluateCodeSubmission } from '../services/geminiService';
import { Play, CheckCircle, XCircle, Loader2, Maximize2, X, Clock } from 'lucide-react';

interface CodingWorkspaceProps {
  challenge: CodingChallenge;
  onClose: () => void;
  onComplete: () => void;
  timeLeft?: number; // Optional remaining time in seconds
}

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({ challenge, onClose, onComplete, timeLeft }) => {
  const [code, setCode] = useState(challenge.starterCode || '// Write your code here');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; feedback: string } | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const evaluation = await evaluateCodeSubmission(
        challenge.problemDescription,
        code,
        challenge.solutionLanguage || 'javascript'
      );
      setResult(evaluation);
      if (evaluation.success) {
        // Automatically mark as complete after a delay if successful
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (e) {
      setResult({ success: false, feedback: 'Error connecting to evaluation service.' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{challenge.problemName}</h2>
              <p className="text-slate-400 text-xs">Integrated Coding Environment</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
              {timeLeft !== undefined && (
                <div className={`flex items-center gap-2 font-mono font-bold text-lg ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-slate-300'}`}>
                    <Clock className="w-5 h-5" />
                    {formatTime(timeLeft)}
                </div>
              )}
              
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Problem Description Pane */}
          <div className="w-full md:w-1/3 p-6 bg-slate-50 border-r border-slate-200 overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Problem Description</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">{challenge.problemDescription}</p>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Test Cases</h4>
              <div className="space-y-3">
                {challenge.testCases?.map((tc, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                    <div className="mb-1">
                      <span className="font-mono text-slate-500">Input:</span> <span className="font-mono text-slate-800 bg-slate-100 px-1 rounded">{tc.input}</span>
                    </div>
                    <div>
                      <span className="font-mono text-slate-500">Output:</span> <span className="font-mono text-indigo-700 bg-indigo-50 px-1 rounded">{tc.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {challenge.constraints && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Constraints</h4>
                <ul className="list-disc list-inside text-sm text-slate-500">
                   <li>{challenge.constraints}</li>
                </ul>
              </div>
            )}
          </div>

          {/* Code Editor Pane */}
          <div className="w-full md:w-2/3 flex flex-col bg-slate-900">
            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-slate-900 text-slate-200 font-mono p-6 text-sm resize-none focus:outline-none leading-loose"
                spellCheck={false}
              />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20"></div>
            </div>

            {/* Output / Console Area */}
            <div className="h-48 bg-slate-950 border-t border-slate-800 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-semibold text-slate-500 uppercase">Console / Result</span>
                 {result && (
                   <span className={`text-xs px-2 py-0.5 rounded font-bold ${result.success ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>
                     {result.success ? 'PASSED' : 'FAILED'}
                   </span>
                 )}
              </div>
              
              {isRunning ? (
                <div className="flex items-center gap-2 text-indigo-400 text-sm animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" /> Running tests against generic cases...
                </div>
              ) : result ? (
                <div className={`text-sm ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  <p className="font-mono mb-2">{result.feedback}</p>
                  {result.success && <p className="text-slate-500 text-xs mt-2">Task marked as completed automatically.</p>}
                </div>
              ) : (
                <p className="text-slate-600 text-sm italic">Click "Run Code" to test your solution.</p>
              )}
            </div>

            {/* Actions Footer */}
            <div className="bg-slate-900 p-4 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
              >
                {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Run & Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};