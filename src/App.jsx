import React, { useState, useCallback, useEffect } from 'react';
import * as Tabs from "@radix-ui/react-tabs";
import { Code, FileText, Terminal, Brain, BookOpen, Timer as TimerIcon, Menu } from "lucide-react";
import ProblemList from './components/ProblemList';
import ProblemView from './components/ProblemView';
import CodeEditor from './components/CodeEditor';
import OutputPane from './components/OutputPane';
import AiHintModal from './components/HintModal';
import AiExplanationModal from './components/ExplanationModal';
import AiCodeReviewModal from './components/CodeReviewModal';
import Timer from './components/Timer';
import Quiz from './components/Quiz';
// Define problem templates
const problemTemplates = {
  'two-sum': `def two_sum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass

# Do not modify the code below this line
if __name__ == "__main__":
    import sys
    import json
    
    input_data = json.loads(sys.argv[1])
    nums, target = input_data[0], input_data[1]
    result = two_sum(nums, target)
    print(json.dumps(result))
`,
  // Add more problem templates here
};

const CodingPracticeApp = () => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [testsPassed, setTestsPassed] = useState(null);
  const [showAiHint, setShowAiHint] = useState(false);
  const [showAiExplanation, setShowAiExplanation] = useState(false);
  const [showAiCodeReview, setShowAiCodeReview] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [difficulty, setDifficulty] = useState('all');
  const [showProblemList, setShowProblemList] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);



  const handleProblemSelect = useCallback((problem) => {
    setSelectedProblem(problem);
    setCode(problemTemplates[problem.id] || '');
    setOutput('');
    setTestsPassed(null);
    setTimerActive(false);
  }, []);

  const handleCodeChange = useCallback((newCode) => {
    setCode(newCode);
  }, []);

  const handleCompile = useCallback(async () => {
    if (!selectedProblem) {
      setOutput('Please select a problem first.');
      return;
    }

    setIsLoading(true);
    setOutput('Compiling and running your code...');
    try {
      const response = await fetch('http://localhost:3000/execute-python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedProblem.id, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setOutput(data.output);
        setTestsPassed(data.allTestsPassed);
        if (data.allTestsPassed) {
          setShowQuiz(true);
        }
      } else {
        setOutput(`Error: ${data.error}\n${data.details || ''}`);
        setTestsPassed(false);
      }
    } catch (error) {
      console.error('API request failed:', error);
      setOutput(`Error: ${error.message}`);
      setTestsPassed(false);
    } finally {
      setIsLoading(false);
    }
  }, [code, selectedProblem]);

  const handleClear = useCallback(() => {
    setCode(problemTemplates[selectedProblem.id] || '');
    setOutput('');
    setTestsPassed(null);
  }, [selectedProblem]);

  const toggleTimer = useCallback(() => {
    setTimerActive(prev => !prev);
  }, []);

  const toggleProblemList = useCallback(() => {
    setShowProblemList(prev => !prev);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  return (
    <div className={`min-h-screen w-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-500">LeetAI</h1>
          <div className="flex items-center space-x-4">
            <button onClick={toggleProblemList} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200">
              <Menu className="h-6 w-6" />
            </button>
            <button onClick={toggleTimer} className={`p-2 rounded-full ${timerActive ? 'bg-purple-600' : 'bg-gray-700'} text-white hover:opacity-80 transition-colors duration-200`}>
              <TimerIcon className="h-6 w-6" />
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>
        <div className="flex flex-col lg:flex-row gap-8">
          {showProblemList && (
            <div className="w-full lg:w-1/4">
              <ProblemList 
                onSelectProblem={handleProblemSelect} 
                difficulty={difficulty}
                setDifficulty={setDifficulty}
              />
            </div>
          )}
          <div className={`flex-1 ${showProblemList ? 'lg:w-3/4' : 'w-full'}`}>
            {selectedProblem ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-purple-500 mb-4">Problem Description</h2>
                  <ProblemView problem={selectedProblem} />
                  {/* <div className="mt-6 flex flex-wrap gap-4">
                    <Button onClick={() => setShowAiExplanation(true)} variant="accent">
                      AI Explanation
                    </Button>
                    <Button onClick={() => setShowAiHint(true)} variant="secondary">
                      Get Hint
                    </Button>
                  </div> */}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-500 mb-4">Code Editor</h2>
                  <CodeEditor
                    code={code}
                    onChange={handleCodeChange}
                    language="python"
                  />
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Button onClick={handleCompile} disabled={isLoading}>
                      {isLoading ? 'Running...' : 'Run Code'}
                    </Button>
                    {/* <Button onClick={handleClear} variant="secondary" disabled={isLoading}>Reset Code</Button> */}
                    <Button onClick={() => setShowAiCodeReview(true)} variant="accent" disabled={isLoading}>
                      AI Code Review
                    </Button>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-500 mb-4">Output</h2>
                  <OutputPane output={output} darkMode={darkMode} />
                  {testsPassed !== null && (
                    <div className={`mt-4 p-2 rounded ${testsPassed ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                      {testsPassed ? 'All tests passed!' : 'Some tests failed. Please check your code.'}
                    </div>
                  )}
                </div>
              </div>
              
            ) : (
              <div className={`text-center p-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg shadow-lg`}>
                <p className={`text-2xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Select a problem from the list to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {timerActive && <Timer />}
      {showAiHint && selectedProblem && (
        <AiHintModal
          isOpen={showAiHint}
          onClose={() => setShowAiHint(false)}
          problem={selectedProblem}
          userCode={code}
        />
      )}
      {showAiExplanation && selectedProblem && (
        <AiExplanationModal
          isOpen={showAiExplanation}
          onClose={() => setShowAiExplanation(false)}
          problem={selectedProblem}
        />
      )}
      {showAiCodeReview && selectedProblem && (
        <AiCodeReviewModal
          isOpen={showAiCodeReview}
          onClose={() => setShowAiCodeReview(false)}
          problem={selectedProblem}
          userCode={code}
        />
      )}
      {showQuiz && selectedProblem && (
        <div className="container px-24 py-10">
          <h1 className="text-3xl font-bold text-purple-500 mb-4">Test Your Knowledge</h1>

          <Quiz 
            problemId={selectedProblem.id}
            problemDescription={selectedProblem.description}
            userCode={code}
            onClose={() => setShowQuiz(false)} 
          />
        </div>
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} p-4 rounded-lg`}>
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Button = ({ onClick, children, variant = 'primary', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 flex items-center transition-colors duration-200";
  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white",
    accent: "bg-indigo-600 hover:bg-indigo-700 text-white",
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CodingPracticeApp;