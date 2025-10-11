import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const CODE_SNIPPETS = {
  javascript: [
    'function calculateSum(a, b) {\n  return a + b;\n}',
    'const array = [1, 2, 3, 4, 5];\nconst doubled = array.map(x => x * 2);',
    'class Person {\n  constructor(name) {\n    this.name = name;\n  }\n}',
    'async function fetchData() {\n  const response = await fetch(url);\n  return response.json();\n}',
    'const isEven = num => num % 2 === 0;',
    'const users = data.filter(user => user.active);\nconst names = users.map(u => u.name);',
    'try {\n  const result = await api.call();\n} catch (error) {\n  console.error(error);\n}',
    'export default function Component() {\n  const [state, setState] = useState(0);\n  return <div>{state}</div>;\n}',
  ],
  python: [
    'def calculate_sum(a, b):\n    return a + b',
    'numbers = [1, 2, 3, 4, 5]\ndoubled = [x * 2 for x in numbers]',
    'class Person:\n    def __init__(self, name):\n        self.name = name',
    'import requests\nresponse = requests.get(url)\ndata = response.json()',
    'is_even = lambda x: x % 2 == 0',
    'with open("file.txt", "r") as f:\n    content = f.read()',
    'for i in range(10):\n    if i % 2 == 0:\n        print(i)',
    '@decorator\ndef my_function():\n    pass',
  ],
  java: [
    'public int calculateSum(int a, int b) {\n    return a + b;\n}',
    'List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);',
    'public class Person {\n    private String name;\n    public Person(String name) {\n        this.name = name;\n    }\n}',
    'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}',
    'try {\n    // code\n} catch (Exception e) {\n    e.printStackTrace();\n}',
  ],
  typescript: [
    'interface User {\n  name: string;\n  age: number;\n}',
    'const greet = (name: string): string => {\n  return `Hello, ${name}`;\n}',
    'type Status = "active" | "inactive";\nconst status: Status = "active";',
    'function fetchData<T>(url: string): Promise<T> {\n  return fetch(url).then(r => r.json());\n}',
  ],
  cpp: [
    '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello" << endl;\n  return 0;\n}',
    'vector<int> nums = {1, 2, 3, 4, 5};\nfor (int n : nums) {\n  cout << n << endl;\n}',
    'class Person {\nprivate:\n  string name;\npublic:\n  Person(string n) : name(n) {}\n};',
  ],
  go: [
    'func calculateSum(a, b int) int {\n  return a + b\n}',
    'for i := 0; i < 10; i++ {\n  fmt.Println(i)\n}',
    'type Person struct {\n  Name string\n  Age  int\n}',
    'if err != nil {\n  return err\n}',
  ],
  rust: [
    'fn calculate_sum(a: i32, b: i32) -> i32 {\n    a + b\n}',
    'let numbers = vec![1, 2, 3, 4, 5];\nlet doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();',
    'struct Person {\n    name: String,\n    age: u32,\n}',
    'match result {\n    Ok(value) => println!("{}", value),\n    Err(e) => eprintln!("Error: {}", e),\n}',
  ],
};

export default function TypingTest({ user }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [duration, setDuration] = useState(30);
  const [language, setLanguage] = useState('javascript');
  
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  
  const inputRef = useRef(null);

  // Generate text based on language
  useEffect(() => {
    generateText();
  }, [language]);

  const generateText = () => {
    const snippets = CODE_SNIPPETS[language];
    setText(snippets[Math.floor(Math.random() * snippets.length)]);
  };

  // Timer
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0 && !isFinished) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            finishTest();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isFinished]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!isActive && value.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
      setTimeLeft(duration);
    }

    setUserInput(value);
    setCurrentIndex(value.length);

    // Calculate errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);

    // Calculate accuracy
    const acc = value.length > 0 ? ((value.length - errorCount) / value.length) * 100 : 100;
    setAccuracy(Math.round(acc));

    // Calculate WPM
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const wordsTyped = value.trim().split(/\s+/).length;
      const currentWpm = Math.round(wordsTyped / timeElapsed);
      setWpm(currentWpm);
    }

    // Check if finished
    if (value.length >= text.length) {
      finishTest();
    }
  };

  const finishTest = () => {
    setIsFinished(true);
    setIsActive(false);
  };

  const resetTest = () => {
    setUserInput('');
    setCurrentIndex(0);
    setStartTime(null);
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    generateText();
    inputRef.current?.focus();
  };

  const getCharStyle = (index) => {
    if (index < userInput.length) {
      return { color: userInput[index] === text[index] ? theme.correct : theme.incorrect };
    }
    if (index === currentIndex) {
      return { borderLeft: `2px solid ${theme.accent}` };
    }
    return { color: theme.textMuted };
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Top Navigation */}
      <nav 
        className="px-8 py-4"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Settings Button - Left */}
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 rounded-lg text-sm transition"
            style={{
              backgroundColor: theme.buttonBg,
              color: theme.textSecondary
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonHover}
            onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
          >
            ⚙️ Settings
          </button>

          {/* Duration Selection - Center */}
          <div className="flex items-center gap-3 text-sm">
            <span className="mr-2" style={{ color: theme.textMuted }}>⏱</span>
            {[15, 30, 60, 120].map(time => (
              <button
                key={time}
                onClick={() => {
                  setDuration(time);
                  setTimeLeft(time);
                }}
                className="transition"
                style={{ 
                  color: duration === time ? theme.accent : theme.textMuted 
                }}
                onMouseEnter={(e) => e.target.style.color = theme.text}
                onMouseLeave={(e) => e.target.style.color = duration === time ? theme.accent : theme.textMuted}
              >
                {time}
              </button>
            ))}
          </div>

          {/* Empty space for balance - Right (auth buttons are absolutely positioned) */}
          <div className="w-32"></div>
        </div>
      </nav>

      {/* Main Typing Area */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-4xl w-full">
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8 text-sm">
            <div style={{ color: theme.accent }}>
              <span className="text-2xl font-bold">{wpm}</span>
              <span className="ml-2" style={{ color: theme.textMuted }}>wpm</span>
            </div>
            <div style={{ color: theme.correct }}>
              <span className="text-2xl font-bold">{accuracy}%</span>
              <span className="ml-2" style={{ color: theme.textMuted }}>accuracy</span>
            </div>
            <div style={{ color: theme.textSecondary }}>
              <span className="text-2xl font-bold">{timeLeft}s</span>
              <span className="ml-2" style={{ color: theme.textMuted }}>remaining</span>
            </div>
            
            {/* Language Selector */}
            <div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-2 rounded text-sm cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  border: `1px solid ${theme.border}`
                }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
            </div>
          </div>

          {/* Text Display */}
          <div 
            className="rounded-lg p-8 mb-6 min-h-[200px] relative"
            style={{ backgroundColor: theme.bgSecondary }}
          >
            {!isFinished ? (
              <div className="text-xl leading-relaxed font-mono whitespace-pre-wrap">
                {text.split('').map((char, index) => (
                  <span key={index} style={getCharStyle(index)}>
                    {char}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 
                  className="text-3xl font-bold mb-4"
                  style={{ color: theme.accent }}
                >
                  Test Complete!
                </h2>
                <div className="flex justify-center gap-12 mb-8">
                  <div>
                    <div 
                      className="text-4xl font-bold"
                      style={{ color: theme.accent }}
                    >
                      {wpm}
                    </div>
                    <div className="text-sm" style={{ color: theme.textMuted }}>WPM</div>
                  </div>
                  <div>
                    <div 
                      className="text-4xl font-bold"
                      style={{ color: theme.correct }}
                    >
                      {accuracy}%
                    </div>
                    <div className="text-sm" style={{ color: theme.textMuted }}>Accuracy</div>
                  </div>
                  <div>
                    <div 
                      className="text-4xl font-bold"
                      style={{ color: theme.incorrect }}
                    >
                      {errors}
                    </div>
                    <div className="text-sm" style={{ color: theme.textMuted }}>Errors</div>
                  </div>
                </div>
                <button
                  onClick={resetTest}
                  className="px-6 py-2 rounded-lg transition font-medium"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.bg
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.accentHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.accent}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Hidden Input */}
          {!isFinished && (
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg font-mono focus:outline-none"
              style={{
                backgroundColor: theme.bg,
                color: theme.text,
                border: `1px solid ${theme.border}`
              }}
              placeholder="Start typing to begin..."
              autoFocus
            />
          )}

          {/* Reset Button */}
          <div className="text-center mt-6">
            <button
              onClick={resetTest}
              className="text-sm transition"
              style={{ color: theme.textMuted }}
              onMouseEnter={(e) => e.target.style.color = theme.textSecondary}
              onMouseLeave={(e) => e.target.style.color = theme.textMuted}
            >
              Press Tab + Enter to restart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
