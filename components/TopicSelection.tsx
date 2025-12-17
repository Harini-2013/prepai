import React, { useState } from 'react';
import { Code2, Globe, Database, Terminal, Cpu, Layers } from 'lucide-react';

interface TopicSelectionProps {
  onSelect: (topic: string) => void;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ onSelect }) => {
  const [customTopic, setCustomTopic] = useState('');

  const languages = [
    { name: 'Java', icon: <Code2 className="w-8 h-8 text-orange-500" /> },
    { name: 'Python', icon: <Terminal className="w-8 h-8 text-blue-500" /> },
    { name: 'JavaScript', icon: <Globe className="w-8 h-8 text-yellow-500" /> },
    { name: 'C++', icon: <Cpu className="w-8 h-8 text-indigo-500" /> },
    { name: 'SQL', icon: <Database className="w-8 h-8 text-emerald-500" /> },
    { name: 'Spring Boot', icon: <Layers className="w-8 h-8 text-green-600" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      onSelect(customTopic.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in py-10">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Choose Your Focus</h2>
        <p className="text-slate-500 mt-2">Select a programming language or topic to start your assessment.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <button
            key={lang.name}
            onClick={() => onSelect(lang.name)}
            className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group"
          >
            <div className="mb-3 group-hover:scale-110 transition-transform">
              {lang.icon}
            </div>
            <span className="font-medium text-slate-700 group-hover:text-indigo-700">{lang.name}</span>
          </button>
        ))}
      </div>

      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">OR TYPE YOUR OWN</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
        <input
          type="text"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.target.value)}
          placeholder="e.g., React, Go, Machine Learning..."
          className="w-full pl-4 pr-12 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button 
          type="submit"
          disabled={!customTopic.trim()}
          className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Go
        </button>
      </form>
    </div>
  );
};