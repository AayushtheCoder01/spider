import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabase-client';

const WORD_LIST = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'and', 'runs', 'through', 'forest',
  'beautiful', 'morning', 'sunshine', 'brings', 'happiness', 'everyone', 'around', 'world', 'today',
  'technology', 'advances', 'rapidly', 'changing', 'lives', 'people', 'everywhere', 'making', 'easier',
  'learning', 'programming', 'requires', 'practice', 'patience', 'dedication', 'achieve', 'mastery',
  'typing', 'speed', 'accuracy', 'important', 'skills', 'develop', 'improve', 'productivity',
  'computer', 'keyboard', 'monitor', 'mouse', 'software', 'hardware', 'internet', 'network',
  'creative', 'thinking', 'problem', 'solving', 'critical', 'analysis', 'effective', 'communication',
  'success', 'comes', 'hard', 'work', 'perseverance', 'never', 'giving', 'dreams', 'goals',
];

const generateWordSentence = (wordCount = 50) => {
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  }
  return words.join(' ');
};

const CODE_SNIPPETS = {
  words: [
    generateWordSentence(50),
    generateWordSentence(50),
    generateWordSentence(50),
    generateWordSentence(50),
    generateWordSentence(50),
  ],
  javascript: [
    'function calculateSum(a, b) {\n  return a + b;\n}',
    'const array = [1, 2, 3, 4, 5];\nconst doubled = array.map(x => x * 2);',
    'class Person {\n  constructor(name) {\n    this.name = name;\n  }\n}',
    'async function fetchData() {\n  const response = await fetch(url);\n  return response.json();\n}',
    'const isEven = num => num % 2 === 0;',
    'const users = data.filter(user => user.active);\nconst names = users.map(u => u.name);',
    'try {\n  const result = await api.call();\n} catch (error) {\n  console.error(error);\n}',
    'export default function Component() {\n  const [state, setState] = useState(0);\n  return <div>{state}</div>;\n}',
    'const debounce = (func, delay) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => func(...args), delay);\n  };\n}',
    'const deepClone = obj => JSON.parse(JSON.stringify(obj));',
    'const promise = new Promise((resolve, reject) => {\n  setTimeout(() => resolve("Done"), 1000);\n});',
    'const obj = { a: 1, b: 2, c: 3 };\nconst { a, ...rest } = obj;',
  ],
  react: [
    'import React, { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}',
    'useEffect(() => {\n  const timer = setInterval(() => {\n    setTime(Date.now());\n  }, 1000);\n  return () => clearInterval(timer);\n}, []);',
    'const [data, setData] = useState(null);\nconst [loading, setLoading] = useState(true);\n\nuseEffect(() => {\n  fetch("/api/data")\n    .then(res => res.json())\n    .then(setData)\n    .finally(() => setLoading(false));\n}, []);',
    'const MyComponent = ({ title, children }) => {\n  return (\n    <div className="container">\n      <h1>{title}</h1>\n      {children}\n    </div>\n  );\n};',
    'const [form, setForm] = useState({ name: "", email: "" });\n\nconst handleChange = (e) => {\n  setForm({ ...form, [e.target.name]: e.target.value });\n};',
    'import { useContext } from "react";\nimport { ThemeContext } from "./ThemeContext";\n\nconst { theme, setTheme } = useContext(ThemeContext);',
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
    'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
    'import pandas as pd\ndf = pd.read_csv("data.csv")\nprint(df.head())',
    'try:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    print(f"Error: {e}")',
    'data = {"name": "John", "age": 30}\njson_str = json.dumps(data, indent=2)',
  ],
  java: [
    'public int calculateSum(int a, int b) {\n    return a + b;\n}',
    'List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);',
    'public class Person {\n    private String name;\n    public Person(String name) {\n        this.name = name;\n    }\n}',
    'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}',
    'try {\n    // code\n} catch (Exception e) {\n    e.printStackTrace();\n}',
    'public interface Drawable {\n    void draw();\n}',
    'List<String> list = new ArrayList<>();\nlist.stream().filter(s -> s.length() > 3).collect(Collectors.toList());',
    'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
  ],
  typescript: [
    'interface User {\n  name: string;\n  age: number;\n}',
    'const greet = (name: string): string => {\n  return `Hello, ${name}`;\n}',
    'type Status = "active" | "inactive";\nconst status: Status = "active";',
    'function fetchData<T>(url: string): Promise<T> {\n  return fetch(url).then(r => r.json());\n}',
    'enum Color {\n  Red = "RED",\n  Green = "GREEN",\n  Blue = "BLUE"\n}',
    'type Partial<T> = {\n  [P in keyof T]?: T[P];\n};',
    'const user: User = {\n  id: 1,\n  name: "John",\n  email: "john@example.com"\n};',
  ],
  cpp: [
    '#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello" << endl;\n  return 0;\n}',
    'vector<int> nums = {1, 2, 3, 4, 5};\nfor (int n : nums) {\n  cout << n << endl;\n}',
    'class Person {\nprivate:\n  string name;\npublic:\n  Person(string n) : name(n) {}\n};',
    'int factorial(int n) {\n  return (n <= 1) ? 1 : n * factorial(n - 1);\n}',
    'auto lambda = [](int x, int y) { return x + y; };\nint result = lambda(5, 3);',
    '#include <algorithm>\nvector<int> v = {3, 1, 4, 1, 5};\nsort(v.begin(), v.end());',
  ],
  go: [
    'func calculateSum(a, b int) int {\n  return a + b\n}',
    'for i := 0; i < 10; i++ {\n  fmt.Println(i)\n}',
    'type Person struct {\n  Name string\n  Age  int\n}',
    'if err != nil {\n  return err\n}',
    'func main() {\n  ch := make(chan int)\n  go func() {\n    ch <- 42\n  }()\n  value := <-ch\n}',
    'defer file.Close()\ndata, err := ioutil.ReadAll(file)',
    'slice := []int{1, 2, 3, 4, 5}\nslice = append(slice, 6, 7, 8)',
  ],
  rust: [
    'fn calculate_sum(a: i32, b: i32) -> i32 {\n    a + b\n}',
    'let numbers = vec![1, 2, 3, 4, 5];\nlet doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();',
    'struct Person {\n    name: String,\n    age: u32,\n}',
    'match result {\n    Ok(value) => println!("{}", value),\n    Err(e) => eprintln!("Error: {}", e),\n}',
    'let mut v = vec![1, 2, 3];\nv.push(4);\nv.pop();',
    'fn fibonacci(n: u32) -> u32 {\n    match n {\n        0 => 0,\n        1 => 1,\n        _ => fibonacci(n - 1) + fibonacci(n - 2),\n    }\n}',
    'impl Person {\n    fn new(name: String, age: u32) -> Self {\n        Person { name, age }\n    }\n}',
  ],
};

export default function TypingTest({ user, onLogout, onShowLogin, onShowSignup }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [duration, setDuration] = useState(() => {
    const saved = localStorage.getItem('typingDuration');
    return saved ? parseInt(saved) : 30;
  });
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('typingLanguage');
    return saved || 'javascript';
  });
  
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('typingDuration');
    return saved ? parseInt(saved) : 30;
  });
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [rawWpm, setRawWpm] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [resultSaved, setResultSaved] = useState(false);
  
  const inputRef = useRef(null);
  const userInputRef = useRef('');

  // Check premium status
  useEffect(() => {
    const checkPremium = async () => {
      if (!user) {
        setIsPremium(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('tier, premium_until')
        .eq('id', user.id)
        .single();

      const now = new Date();
      const isExpired = profileData?.premium_until && new Date(profileData.premium_until) < now;
      setIsPremium(profileData?.tier === 'premium' && !isExpired);
    };

    checkPremium();
  }, [user]);
  const testFinishedRef = useRef(false);

  // Save duration to localStorage
  useEffect(() => {
    localStorage.setItem('typingDuration', duration.toString());
  }, [duration]);

  // Save language to localStorage
  useEffect(() => {
    localStorage.setItem('typingLanguage', language);
  }, [language]);

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

  // Track WPM history every second
  useEffect(() => {
    let interval = null;
    if (isActive && !isFinished && startTime) {
      interval = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const currentInput = userInputRef.current;
        const wordsTyped = currentInput.trim().split(/\s+/).filter(w => w.length > 0).length;
        const charsTyped = currentInput.length;
        // Calculate WPM based on characters (standard: 5 chars = 1 word)
        const currentWpm = Math.round((charsTyped / 5) / timeElapsed);
        setWpmHistory(prev => [...prev, currentWpm]);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isFinished, startTime]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!isActive && value.length === 1) {
      setIsActive(true);
      setStartTime(Date.now());
      setTimeLeft(duration);
    }

    setUserInput(value);
    userInputRef.current = value; // Update ref for WPM tracking
    setCurrentIndex(value.length);

    // Calculate errors and correct/incorrect chars
    let errorCount = 0;
    let correct = 0;
    let incorrect = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== text[i]) {
        errorCount++;
        incorrect++;
      } else {
        correct++;
      }
    }
    setErrors(errorCount);
    setCorrectChars(correct);
    setIncorrectChars(incorrect);

    // Calculate accuracy
    const acc = value.length > 0 ? ((value.length - errorCount) / value.length) * 100 : 100;
    setAccuracy(Math.round(acc));

    // Calculate WPM (net WPM)
    if (startTime) {
      const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
      const charsTyped = value.length;
      // Standard WPM: 5 characters = 1 word
      const grossWpm = Math.round((charsTyped / 5) / timeElapsed);
      const netWpm = Math.max(0, Math.round(grossWpm - (errorCount / 5 / timeElapsed)));
      setWpm(netWpm);
      setRawWpm(grossWpm);
    }

    // Check if finished
    if (value.length >= text.length) {
      finishTest();
    }
  };

  const finishTest = async () => {
    // Prevent duplicate saves
    if (testFinishedRef.current) {
      return;
    }
    testFinishedRef.current = true;

    setIsFinished(true);
    setIsActive(false);

    // Only save result to database if user is logged in
    if (!user) {
      console.log('User not logged in, skipping save');
      setResultSaved(false);
      return;
    }

    // Save result to database
    try {
      // Calculate consistency
      const consistency = wpmHistory.length > 0 
        ? Math.round((1 - (Math.max(...wpmHistory) - Math.min(...wpmHistory)) / Math.max(...wpmHistory)) * 100)
        : 0;

      const resultData = {
        user_id: user.id,
        duration_seconds: duration,
        time_remaining: timeLeft,
        language: language,
        snippet_language: language, // Same as language for now
        wpm: wpm,
        raw_wpm: rawWpm,
        accuracy: accuracy,
        consistency: consistency,
        errors: errors,
        correct_chars: correctChars,
        incorrect_chars: incorrectChars,
        // chars_total is auto-generated, don't include it
        wpm_history: wpmHistory,
        device_meta: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      };

      const { data, error } = await supabase
        .from('typing_results')
        .insert([resultData])
        .select();

      if (error) {
        console.error('Error saving result:', error);
        setResultSaved(false);
      } else {
        console.log('Result saved successfully:', data);
        setResultSaved(true);
      }
    } catch (err) {
      console.error('Unexpected error saving result:', err);
      setResultSaved(false);
    }
  };

  const resetTest = () => {
    setUserInput('');
    userInputRef.current = '';
    testFinishedRef.current = false; // Reset the finished flag
    setCurrentIndex(0);
    setStartTime(null);
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setWpmHistory([]);
    setRawWpm(0);
    setCorrectChars(0);
    setIncorrectChars(0);
    setResultSaved(false);
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
      style={{ 
        backgroundColor: theme.bg, 
        color: theme.text,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace"
      }}
    >
      {/* Terminal Header Bar */}
      <div 
        className="px-4 py-2 flex items-center gap-2"
        style={{ 
          backgroundColor: theme.bgSecondary,
          borderBottom: `1px solid ${theme.border}`
        }}
      >
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27c93f' }}></div>
        </div>
        <span className="text-xs ml-2" style={{ color: theme.textMuted }}>
          spidertype@terminal:~$
        </span>
      </div>

      {/* Top Navigation */}
      <nav 
        className="px-8 py-4"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Navigation Buttons - Left */}
          <div className="flex items-center gap-3">
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
            {isPremium && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg text-sm transition"
                style={{
                  backgroundColor: theme.buttonBg,
                  color: theme.textSecondary
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
              >
                📊 Dashboard
              </button>
            )}
          </div>

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

          {/* Auth Buttons - Right */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.border}` }}>
                <span className="text-xs" style={{ color: theme.textSecondary }}>
                  {user.email}
                </span>
                <div style={{ width: '1px', height: '16px', backgroundColor: theme.border }}></div>
                <button
                  onClick={onLogout}
                  className="px-3 py-1 rounded text-xs font-medium transition"
                  style={{
                    backgroundColor: theme.incorrect,
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onShowLogin}
                  className="px-3 py-1.5 rounded text-xs transition"
                  style={{
                    backgroundColor: theme.buttonBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
                >
                  Login
                </button>
                <button
                  onClick={onShowSignup}
                  className="px-3 py-1.5 rounded text-xs font-medium transition"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.bg
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = theme.accentHover}
                  onMouseLeave={(e) => e.target.style.backgroundColor = theme.accent}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
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
                <option value="words">Words</option>
                <option value="javascript">JavaScript</option>
                <option value="react">React</option>
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
            style={{ 
              backgroundColor: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
              boxShadow: `0 0 20px ${theme.accent}10`
            }}
          >
            {/* Terminal Prompt */}
            <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.accent }}>❯</span>
              <span className="text-sm" style={{ color: theme.textMuted }}>
                {language === 'words' ? 'typing practice' : `${language} snippet`}
              </span>
            </div>

            {!isFinished ? (
              <div className="text-xl leading-relaxed font-mono whitespace-pre-wrap">
                {text.split('').map((char, index) => (
                  <span key={index} style={getCharStyle(index)}>
                    {char}
                  </span>
                ))}
              </div>
            ) : (
              <div className="py-8">
                {/* Top Stats Row */}
                <div className="flex items-start justify-between mb-8">
                  {/* Left: WPM and Accuracy */}
                  <div>
                    <div className="mb-4">
                      <div className="text-sm mb-1" style={{ color: theme.textMuted }}>wpm</div>
                      <div className="text-6xl font-bold" style={{ color: theme.accent }}>{wpm}</div>
                    </div>
                    <div>
                      <div className="text-sm mb-1" style={{ color: theme.textMuted }}>acc</div>
                      <div className="text-6xl font-bold" style={{ color: theme.accent }}>{accuracy}%</div>
                    </div>
                  </div>

                  {/* Right: Additional Stats */}
                  <div className="text-right space-y-2">
                    <div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>test type</div>
                      <div className="text-sm" style={{ color: theme.accent }}>time {duration}</div>
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: theme.textMuted }}>language</div>
                      <div className="text-sm" style={{ color: theme.accent }}>{language}</div>
                    </div>
                  </div>
                </div>

                {/* WPM Graph */}
                <div className="mb-8 relative" style={{ height: '200px', padding: '20px 0' }}>
                  <svg width="100%" height="200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                      {/* Gradient for line */}
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: theme.accent, stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: theme.accent, stopOpacity: 0.6 }} />
                      </linearGradient>
                      
                      {/* Gradient for area fill */}
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: theme.accent, stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: theme.accent, stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <line
                        key={`grid-${i}`}
                        x1="0"
                        y1={i * 40}
                        x2="100%"
                        y2={i * 40}
                        stroke={theme.border}
                        strokeWidth="1"
                        opacity="0.2"
                      />
                    ))}
                    
                    {/* Vertical time markers */}
                    {wpmHistory.length > 1 && [0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                      const x = ratio * 100;
                      return (
                        <g key={`marker-${idx}`}>
                          <line
                            x1={`${x}%`}
                            y1="0"
                            x2={`${x}%`}
                            y2="200"
                            stroke={theme.border}
                            strokeWidth="1"
                            opacity="0.15"
                            strokeDasharray="4,4"
                          />
                          <text
                            x={`${x}%`}
                            y="195"
                            fill={theme.textMuted}
                            fontSize="10"
                            textAnchor="middle"
                            opacity="0.6"
                          >
                            {Math.round(ratio * duration)}s
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Area fill under the line */}
                    {wpmHistory.length > 1 && (
                      <polygon
                        points={
                          wpmHistory.map((w, i) => {
                            const x = (i / (wpmHistory.length - 1)) * 100;
                            const maxWpm = Math.max(...wpmHistory, 50);
                            const y = 180 - ((w / maxWpm) * 160);
                            return `${x}%,${y}`;
                          }).join(' ') + ` 100%,180 0,180`
                        }
                        fill="url(#areaGradient)"
                      />
                    )}
                    
                    {/* WPM Line */}
                    {wpmHistory.length > 1 && (
                      <>
                        <polyline
                          points={wpmHistory.map((w, i) => {
                            const x = (i / (wpmHistory.length - 1)) * 100;
                            const maxWpm = Math.max(...wpmHistory, 50);
                            const y = 180 - ((w / maxWpm) * 160);
                            return `${x}%,${y}`;
                          }).join(' ')}
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        
                        {/* Data points */}
                        {wpmHistory.map((w, i) => {
                          const x = (i / (wpmHistory.length - 1)) * 100;
                          const maxWpm = Math.max(...wpmHistory, 50);
                          const y = 180 - ((w / maxWpm) * 160);
                          return (
                            <circle
                              key={`point-${i}`}
                              cx={`${x}%`}
                              cy={y}
                              r="3"
                              fill={theme.accent}
                              opacity="0.8"
                            />
                          );
                        })}
                      </>
                    )}
                    
                    {/* No data message */}
                    {wpmHistory.length <= 1 && (
                      <text
                        x="50%"
                        y="100"
                        fill={theme.textMuted}
                        fontSize="14"
                        textAnchor="middle"
                        opacity="0.5"
                      >
                        Not enough data to display graph
                      </text>
                    )}
                  </svg>
                </div>

                {/* Bottom Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div>
                    <div className="text-xs mb-1" style={{ color: theme.textMuted }}>raw</div>
                    <div className="text-2xl font-bold" style={{ color: theme.accent }}>{rawWpm}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: theme.textMuted }}>characters</div>
                    <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                      {correctChars}/{incorrectChars}/{errors}/0
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: theme.textMuted }}>consistency</div>
                    <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                      {wpmHistory.length > 0 ? Math.round((1 - (Math.max(...wpmHistory) - Math.min(...wpmHistory)) / Math.max(...wpmHistory)) * 100) : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: theme.textMuted }}>time</div>
                    <div className="text-2xl font-bold" style={{ color: theme.accent }}>{duration}s</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={resetTest}
                    className="p-3 rounded-lg transition"
                    style={{
                      backgroundColor: theme.buttonBg,
                      color: theme.textSecondary
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonHover}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
                    title="Next test"
                  >
                    <span className="text-xl">→</span>
                  </button>
                  <button
                    onClick={resetTest}
                    className="p-3 rounded-lg transition"
                    style={{
                      backgroundColor: theme.buttonBg,
                      color: theme.textSecondary
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = theme.buttonHover}
                    onMouseLeave={(e) => e.target.style.backgroundColor = theme.buttonBg}
                    title="Repeat test"
                  >
                    <span className="text-xl">↻</span>
                  </button>
                </div>

                {/* Save status message */}
                <div className="text-center mt-6">
                  {user && resultSaved && (
                    <div 
                      className="inline-block px-4 py-2 rounded-lg"
                      style={{ 
                        backgroundColor: theme.correct + '20',
                        border: `1px solid ${theme.correct}`
                      }}
                    >
                      <p className="text-sm font-medium" style={{ color: theme.correct }}>
                        ✓ Result saved successfully
                      </p>
                    </div>
                  )}
                  {!user && (
                    <div 
                      className="inline-block px-6 py-3 rounded-lg"
                      style={{ 
                        backgroundColor: theme.incorrect + '15',
                        border: `1px solid ${theme.incorrect}`
                      }}
                    >
                      <p className="text-sm font-medium mb-1" style={{ color: theme.incorrect }}>
                        ⚠️ Data not saved
                      </p>
                      <p className="text-xs" style={{ color: theme.textMuted }}>
                        Please login to save your results and track your progress
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hidden Input */}
          {!isFinished && (
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg font-mono focus:outline-none resize-none"
              style={{
                backgroundColor: theme.bg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                minHeight: '100px'
              }}
              placeholder="Start typing to begin..."
              autoFocus
              onKeyDown={(e) => {
                // Prevent form submission on Enter
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
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
