import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DayPlan, Roadmap, Question, CodingChallenge, CodeEvaluationResult, RunCodeResult, TestCase } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

export const generateInterviewRoadmap = async (
  topic: string,
  level: string,
  weaknesses: string[],
  days: number = 5
): Promise<Roadmap> => {
  
  const weaknessStr = weaknesses.length > 0 ? `The student needs extra help with: ${weaknesses.join(', ')}.` : "";
  const levelInstruction = level.toLowerCase() === 'beginner' 
    ? "Assume the student has ZERO prior knowledge. Explain things simply. Start from the absolute basics." 
    : `Target level: ${level}`;

  let prompt = '';

  if (topic === 'Comprehensive Interview Prep') {
    // Special Prompt for the Master Plan
    prompt = `
      Create a comprehensive 14-day interview preparation roadmap for a ${level} level student.
      This roadmap MUST systematically cover ALL interview rounds in a logical flow:
      
      1. Aptitude & Logical Reasoning
      2. Core Computer Science Subjects (OS, DBMS, Computer Networks)
      3. Technical Coding (Data Structures & Algorithms)
      4. HR & Behavioral (Soft Skills)

      ${levelInstruction}
      ${weaknessStr}

      Structure the days to mix these topics or focus on specific rounds sequentially (e.g., Week 1: Coding & Aptitude, Week 2: Core CS & HR).
      
      For each day, provide a clear main topic, a simple summary, and 3 actionable learning tasks.
      For each task, you MUST recommend a specific, high-quality "platform" or resource name.
      
      CRITICAL INSTRUCTION FOR CODING TASKS:
      If the task type is 'coding', you MUST provide a 'codingChallenge' object.
      The coding challenge should be a specific algorithm or problem related to the day's topic.
      Include valid starter code in JavaScript or Python.
    `;
  } else {
    // Original Prompt for single topic
    prompt = `
      Create a step-by-step ${days}-day interview preparation roadmap for a ${level} level student focusing on ${topic}.
      ${levelInstruction}
      ${weaknessStr}
      For each day, provide a clear main topic, a simple summary, and 3 actionable learning tasks.
      
      For each task, you MUST recommend a specific, high-quality "platform" or resource name.
      
      CRITICAL INSTRUCTION FOR CODING TASKS:
      If the task type is 'coding', you MUST provide a 'codingChallenge' object.
      The coding challenge should be a specific algorithm or problem related to the day's topic.
      Include valid starter code in the requested language (default to JavaScript/Python if unspecified).
      
      Tasks can be: 
      - 'video' (Search for 'Topic Name' on YouTube),
      - 'reading' (Read intro articles),
      - 'coding' (Write simple code - MUST include codingChallenge data),
      - 'practice' (Mock test or speech practice).
    `;
  }

  const testCaseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      input: { type: Type.STRING },
      output: { type: Type.STRING }
    }
  };

  const codingChallengeSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      problemName: { type: Type.STRING },
      problemDescription: { type: Type.STRING },
      constraints: { type: Type.STRING },
      testCases: { type: Type.ARRAY, items: testCaseSchema },
      starterCode: { type: Type.STRING },
      solutionLanguage: { type: Type.STRING }
    },
    required: ['problemName', 'problemDescription', 'testCases', 'starterCode']
  };

  const taskSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      duration: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['video', 'reading', 'coding', 'practice'] },
      platform: { type: Type.STRING },
      link: { type: Type.STRING },
      codingChallenge: codingChallengeSchema
    },
    required: ['title', 'duration', 'type', 'platform']
  };

  const dayPlanSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.INTEGER },
      topic: { type: Type.STRING },
      summary: { type: Type.STRING },
      tasks: { type: Type.ARRAY, items: taskSchema }
    },
    required: ['day', 'topic', 'summary', 'tasks']
  };

  const roadmapSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      generatedDate: { type: Type.STRING },
      days: { type: Type.ARRAY, items: dayPlanSchema }
    },
    required: ['title', 'generatedDate', 'days']
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as Roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
};

export const generateAssessmentQuestions = async (topic: string): Promise<Question[]> => {
  // Refine the topic to ensure the AI generates relevant questions
  let promptTopic = topic;
  if (topic === 'Core Subjects') {
    promptTopic = "Core Computer Science subjects: Operating Systems, DBMS, Computer Networks, and Object Oriented Programming (OOPS)";
  } else if (topic === 'Aptitude') {
    promptTopic = "Quantitative Aptitude and Logical Reasoning";
  }

  const prompt = `
    Generate 20 beginner-friendly multiple-choice interview questions for ${promptTopic}. 
    Ensure the questions are strictly related to ${promptTopic}.
    Include 4 options and the correct answer index (0-3).
  `;

  const questionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      text: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctIndex: { type: Type.INTEGER },
      category: { type: Type.STRING }
    },
    required: ['id', 'text', 'options', 'correctIndex']
  };

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: questionSchema
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Assessment generation failed", error);
    return [];
  }
};

export const generateMixedAssessment = async (): Promise<Question[]> => {
  const prompt = `
    Generate a 10-question mixed screening assessment.
    - 5 Questions on Quantitative Aptitude & Logic.
    - 5 Questions on Core Computer Science (OS, DBMS, Networks).
    
    Assign a 'category' field to each question: 'Aptitude' or 'Core CS'.
    Include 4 options and correct answer index.
  `;

  const questionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      text: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      correctIndex: { type: Type.INTEGER },
      category: { type: Type.STRING }
    },
    required: ['id', 'text', 'options', 'correctIndex', 'category']
  };

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: questionSchema
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Mixed Assessment generation failed", error);
    return [];
  }
};

export const generateCodingAssessmentChallenge = async (topic: string): Promise<CodingChallenge> => {
  const prompt = `
    Generate a beginner/intermediate level coding interview problem for ${topic}.
    The problem should be suitable for a screening assessment.
    Include problem name, description, constraints, 3 test cases, and starter code in ${topic}.
  `;

  const testCaseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      input: { type: Type.STRING },
      output: { type: Type.STRING }
    }
  };

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      problemName: { type: Type.STRING },
      problemDescription: { type: Type.STRING },
      constraints: { type: Type.STRING },
      testCases: { type: Type.ARRAY, items: testCaseSchema },
      starterCode: { type: Type.STRING },
      solutionLanguage: { type: Type.STRING }
    },
    required: ['problemName', 'problemDescription', 'testCases', 'starterCode', 'solutionLanguage']
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Failed to generate challenge");
    return JSON.parse(text) as CodingChallenge;
  } catch (e) {
    console.error("Coding assessment generation failed", e);
    // Fallback
    return {
      problemName: "Sum of Array",
      problemDescription: "Write a function to return the sum of all elements in an array.",
      constraints: "Array length <= 1000",
      testCases: [{ input: "[1,2,3]", output: "6" }],
      starterCode: "// Write your code here",
      solutionLanguage: topic
    };
  }
};

export const runCodeWithTestCases = async (
  problemDescription: string,
  userCode: string,
  language: string,
  testCases: TestCase[]
): Promise<RunCodeResult> => {
  const prompt = `
    Act as a code runner and compiler.
    Problem: ${problemDescription}
    Language: ${language}
    Code: ${userCode}
    Test Cases: ${JSON.stringify(testCases)}

    Simulate the execution of the code for EACH test case strictly.
    Return a JSON object containing:
    - passed: boolean (true if ALL test cases passed)
    - results: array of objects, one for each test case:
      - input: string (from test case)
      - expected: string (from test case)
      - actual: string (the simulated output of the code)
      - passed: boolean (true if expected == actual)
      - error: string (if compile/runtime error, else null)
  `;

  const resultSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      input: { type: Type.STRING },
      expected: { type: Type.STRING },
      actual: { type: Type.STRING },
      passed: { type: Type.BOOLEAN },
      error: { type: Type.STRING, nullable: true }
    }
  };

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      passed: { type: Type.BOOLEAN },
      results: { type: Type.ARRAY, items: resultSchema }
    },
    required: ['passed', 'results']
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const text = response.text;
    if (!text) return { passed: false, results: [], error: "No response from execution engine" };
    return JSON.parse(text) as RunCodeResult;
  } catch (e) {
    console.error("Run code error", e);
    return { passed: false, results: [], error: "Runtime Error: " + (e as Error).message };
  }
};

export const evaluateCodeSubmission = async (
  problemDescription: string,
  userCode: string,
  language: string
): Promise<CodeEvaluationResult> => {
  const prompt = `
    Act as a technical interviewer evaluating a coding assessment.
    Problem: ${problemDescription}
    Language: ${language}
    User Code:
    ${userCode}

    Evaluate the code logic, syntax, and efficiency.
    
    Return JSON:
    - success: true if it passes all hidden test cases and logic is correct.
    - feedback: Detailed feedback on performance and code style.
    - score: A number between 0 and 100 representing the quality/correctness.
    - weakAreas: List of coding concepts the user struggled with (e.g. "Loops", "Edge Cases").
    - strongAreas: List of coding concepts the user did well (e.g. "Syntax", "Logic").
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      success: { type: Type.BOOLEAN },
      feedback: { type: Type.STRING },
      score: { type: Type.INTEGER },
      weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
      strongAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['success', 'feedback', 'score']
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });
    
    const text = response.text;
    if (!text) return { success: false, feedback: "AI evaluation failed.", score: 0 };
    return JSON.parse(text) as CodeEvaluationResult;
  } catch (e) {
    console.error(e);
    return { success: false, feedback: "System error during evaluation.", score: 0 };
  }
};