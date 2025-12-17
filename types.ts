export enum View {
  LOGIN = 'LOGIN',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  DASHBOARD = 'DASHBOARD',
  ASSESSMENT = 'ASSESSMENT',
  FULL_ASSESSMENT = 'FULL_ASSESSMENT',
  ASSESSMENT_RESULT = 'ASSESSMENT_RESULT',
  ROADMAP = 'ROADMAP',
  TIMETABLE = 'TIMETABLE',
}

export interface User {
  username: string;
  token?: string;
  role: 'student' | 'admin';
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  category?: string; // Added to track which subject the question belongs to
}

export interface AssessmentResult {
  score: number;
  total: number;
  weakAreas: string[];
  strongAreas: string[];
}

export interface TestCase {
  input: string;
  output: string;
}

export interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
}

export interface RunCodeResult {
  passed: boolean;
  results: TestCaseResult[];
  error?: string;
}

export interface CodingChallenge {
  problemName: string;
  problemDescription: string;
  constraints: string;
  testCases: TestCase[];
  starterCode: string;
  solutionLanguage: string;
}

export interface CodeEvaluationResult {
  success: boolean;
  feedback: string;
  score?: number; // 0-100
  weakAreas?: string[];
  strongAreas?: string[];
}

export interface Task {
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'coding' | 'practice';
  platform?: string;
  link?: string;
  codingChallenge?: CodingChallenge;
}

export interface DayPlan {
  day: number;
  topic: string;
  summary: string;
  tasks: Task[];
}

export interface Roadmap {
  title: string;
  generatedDate: string;
  days: DayPlan[];
}

export interface AppState {
  view: View;
  user: User | null;
  selectedTopic: string | null;
  userLevel: string;
  roadmap: Roadmap | null;
  assessmentResult: AssessmentResult | null;
  completedTasks: Set<string>; // Set of generic task IDs (e.g., "Day1-Task0")
  streak: number;
  lastActiveDate: string;
}