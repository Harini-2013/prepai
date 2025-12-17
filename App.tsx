import React, { useState, useEffect } from 'react';
import { AppState, View, User, AssessmentResult, Roadmap } from './types';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Assessment } from './components/Assessment';
import { FullAssessment } from './components/FullAssessment';
import { AssessmentResultView } from './components/AssessmentResultView';
import { RoadmapView } from './components/Roadmap';
import { Timetable } from './components/Timetable';
import { TopicSelection } from './components/TopicSelection';
import { BrainCircuit, LogOut, LayoutDashboard, Map as MapIcon, Calendar as CalendarIcon, Flame } from 'lucide-react';

const App: React.FC = () => {
  // Initialize state with Streak logic
  const [state, setState] = useState<AppState>(() => {
    // Check localStorage for streak data
    const savedStreak = localStorage.getItem('smartprep_streak');
    const savedLastActive = localStorage.getItem('smartprep_last_active');
    
    let streak = savedStreak ? parseInt(savedStreak, 10) : 0;
    const lastActive = savedLastActive || '';
    
    // Update Streak Logic
    const today = new Date().toDateString();
    
    if (lastActive !== today) {
      if (lastActive) {
        const lastDate = new Date(lastActive);
        const diffTime = Math.abs(new Date(today).getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          // Consecutive day
          streak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          streak = 1;
        }
      } else {
        // First time
        streak = 1;
      }
      // Save new state
      localStorage.setItem('smartprep_streak', streak.toString());
      localStorage.setItem('smartprep_last_active', today);
    }

    return {
      view: View.LOGIN,
      user: null,
      selectedTopic: null,
      userLevel: 'Beginner',
      roadmap: null,
      assessmentResult: null,
      completedTasks: new Set(),
      streak: streak,
      lastActiveDate: today
    };
  });

  const handleLogin = (user: User) => {
    setState((prev) => ({ ...prev, user, view: View.DASHBOARD }));
  };

  const handleLogout = () => {
    setState((prev) => ({
      ...prev,
      view: View.LOGIN,
      user: null,
      selectedTopic: null,
      userLevel: 'Beginner',
      roadmap: null,
      assessmentResult: null,
      completedTasks: new Set(),
    }));
  };

  const handleDashboardCategorySelect = (category: string) => {
    if (category === 'Coding') {
      setState((prev) => ({ ...prev, view: View.TOPIC_SELECTION }));
    } else {
      setState((prev) => ({ 
        ...prev, 
        selectedTopic: category,
        view: View.ASSESSMENT 
      }));
    }
  };

  const handleTopicSelect = (topic: string) => {
    setState((prev) => ({ 
      ...prev, 
      selectedTopic: topic,
      view: View.ASSESSMENT 
    }));
  };

  const handleStartFullAssessment = () => {
    setState((prev) => ({
      ...prev,
      selectedTopic: 'Comprehensive Interview Prep',
      view: View.FULL_ASSESSMENT
    }));
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    // Calculate level based on score
    const percentage = (result.score / result.total) * 100;
    let level = 'Beginner';
    if (percentage > 75) level = 'Advanced';
    else if (percentage >= 40) level = 'Intermediate';

    setState((prev) => ({
      ...prev,
      assessmentResult: result,
      userLevel: level,
      view: View.ASSESSMENT_RESULT 
    }));
  };

  const handleProceedToRoadmap = () => {
    setState((prev) => ({ ...prev, view: View.ROADMAP }));
  };

  const handleSaveRoadmap = (roadmap: Roadmap) => {
    setState((prev) => ({ ...prev, roadmap }));
  };

  const handleToggleTask = (taskId: string) => {
    setState((prev) => {
      const newSet = new Set(prev.completedTasks);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return { ...prev, completedTasks: newSet };
    });
  };

  const navigateTo = (view: View) => {
    if ((view === View.ROADMAP || view === View.TIMETABLE) && !state.roadmap) return;
    setState((prev) => ({ ...prev, view }));
  };

  if (state.view === View.LOGIN) {
    return <Login onLogin={handleLogin} />;
  }

  let totalTasks = 0;
  if (state.roadmap) {
    state.roadmap.days.forEach(d => totalTasks += d.tasks.length);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo(View.DASHBOARD)}>
              <BrainCircuit className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="text-xl font-bold text-slate-800 tracking-tight">SmartPrep AI</span>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center gap-1 text-orange-500 font-bold text-sm bg-orange-50 px-3 py-1.5 rounded-full mr-2">
                 <Flame className="w-4 h-4 fill-current" />
                 <span>{state.streak}</span>
              </div>

              <button 
                onClick={() => navigateTo(View.DASHBOARD)} 
                className={`p-2 rounded-lg transition-colors ${state.view === View.DASHBOARD ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                title="Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
              
              {state.roadmap && (
                <>
                  <button 
                    onClick={() => navigateTo(View.ROADMAP)}
                    className={`p-2 rounded-lg transition-colors ${state.view === View.ROADMAP ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    title="Roadmap"
                  >
                    <MapIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigateTo(View.TIMETABLE)}
                    className={`p-2 rounded-lg transition-colors ${state.view === View.TIMETABLE ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                    title="Timetable"
                  >
                    <CalendarIcon className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium">
                <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state.view === View.TOPIC_SELECTION && (
          <TopicSelection onSelect={handleTopicSelect} />
        )}

        {state.view === View.DASHBOARD && (
          <Dashboard 
            roadmap={state.roadmap}
            assessmentResult={state.assessmentResult}
            completedTasksCount={state.completedTasks.size}
            totalTasksCount={totalTasks}
            streak={state.streak}
            onSelectCategory={handleDashboardCategorySelect}
            onViewRoadmap={() => navigateTo(View.ROADMAP)}
            onViewTimetable={() => navigateTo(View.TIMETABLE)}
            onStartFullAssessment={handleStartFullAssessment}
          />
        )}

        {state.view === View.ASSESSMENT && state.selectedTopic && (
          <Assessment 
            topic={state.selectedTopic}
            onComplete={handleAssessmentComplete} 
          />
        )}

        {state.view === View.FULL_ASSESSMENT && (
          <FullAssessment 
            onComplete={handleAssessmentComplete}
          />
        )}

        {state.view === View.ASSESSMENT_RESULT && state.assessmentResult && state.selectedTopic && (
          <AssessmentResultView 
            result={state.assessmentResult}
            topic={state.selectedTopic}
            level={state.userLevel}
            onContinue={handleProceedToRoadmap}
          />
        )}

        {state.view === View.ROADMAP && state.assessmentResult && state.selectedTopic && (
          <RoadmapView 
            topic={state.selectedTopic}
            level={state.userLevel}
            assessmentResult={state.assessmentResult}
            existingRoadmap={state.roadmap}
            completedTasks={state.completedTasks}
            onSaveRoadmap={handleSaveRoadmap}
            onToggleTask={handleToggleTask}
            onBack={() => navigateTo(View.DASHBOARD)}
          />
        )}

        {state.view === View.TIMETABLE && state.roadmap && (
            <Timetable 
                roadmap={state.roadmap}
                completedTasks={state.completedTasks}
                onToggleTask={handleToggleTask}
                onBack={() => navigateTo(View.DASHBOARD)}
            />
        )}
      </main>
    </div>
  );
};

export default App;