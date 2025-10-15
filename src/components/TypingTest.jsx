import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../supabase-client';
import { 
  calculateXP, 
  calculateLevel, 
  getLevelTitle, 
  getMotivationalMessage,
  calculateStreak,
  calculateStreakSupabase,
  checkAchievements,
  checkAchievementsSupabase,
  incrementTodayTestCount,
  getUserStats
} from '../utils/xpSystem';

// Small words (2-3 letters) - will be selected more frequently
const SMALL_WORDS = [
  // 2-letter words
  'am', 'an', 'as', 'at', 'be', 'by', 'do', 'go', 'he', 'hi', 'if', 'in', 'is', 'it', 'me', 'my',
  'no', 'of', 'on', 'or', 'so', 'to', 'up', 'us', 'we', 'ox', 'ad', 'ah', 'aw', 'ax', 'ay', 'eh',
  'ex', 'id', 'oh', 'ow', 'uh', 'um', 'yo', 'ma', 'pa', 'la', 'fa', 're', 'mi', 'ti', 'si', 'do',
  // 3-letter words
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out',
  'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who',
  'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'may', 'any', 'had', 'her', 'him',
  'add', 'age', 'ago', 'air', 'arm', 'art', 'ask', 'bad', 'bag', 'bar', 'bat', 'bed', 'bet', 'big',
  'bit', 'box', 'bug', 'bus', 'buy', 'car', 'cat', 'cup', 'cut', 'dad', 'dog', 'dot', 'dry', 'due',
  'ear', 'eat', 'egg', 'end', 'eye', 'far', 'fat', 'few', 'fit', 'fix', 'fly', 'fun', 'gap', 'gas',
  'god', 'got', 'gun', 'guy', 'hat', 'hit', 'hot', 'ice', 'ill', 'job', 'joy', 'key', 'kid', 'kit',
  'law', 'lay', 'leg', 'lie', 'lip', 'log', 'lot', 'low', 'mad', 'map', 'mat', 'mix', 'mom', 'mud',
  'net', 'nor', 'nut', 'odd', 'off', 'oil', 'own', 'pan', 'pay', 'pen', 'pet', 'pie', 'pig', 'pin',
  'pit', 'pop', 'pot', 'pub', 'ran', 'rat', 'raw', 'red', 'rid', 'row', 'rub', 'run', 'sad', 'sat',
  'sea', 'set', 'sex', 'she', 'shy', 'sin', 'sir', 'sit', 'six', 'sky', 'son', 'sun', 'tax', 'tea',
  'ten', 'the', 'tie', 'tip', 'top', 'toy', 'try', 'tub', 'van', 'war', 'was', 'wax', 'web', 'wet',
  'win', 'wit', 'yes', 'yet', 'you', 'zip', 'zoo', 'act', 'aim', 'ban', 'bin', 'bow', 'cry', 'den',
  'dim', 'dip', 'era', 'fed', 'fee', 'fin', 'fog', 'fox', 'fur', 'gym', 'hen', 'hug', 'ink', 'jam',
  'jet', 'lab', 'lap', 'led', 'lid', 'lit', 'max', 'nod', 'oak', 'oar', 'opt', 'orb', 'ore', 'owe',
  'pad', 'pal', 'paw', 'pea', 'peg', 'per', 'pod', 'pro', 'pry', 'pub', 'rag', 'ram', 'rap', 'ray',
  'rib', 'rim', 'rip', 'rob', 'rod', 'rot', 'sag', 'saw', 'sew', 'sip', 'ski', 'sly', 'sob', 'soy',
  'spy', 'sum', 'tab', 'tag', 'tan', 'tap', 'tar', 'tow', 'tug', 'urn', 'vet', 'via', 'vow', 'wed',
  'wig', 'won', 'wow', 'yak', 'yam', 'yen', 'zap', 'zen', 'cod', 'cog', 'cop', 'cow', 'cub', 'cue',
];

const WORD_LIST = [
  
  // Easy-to-type longer words (smooth flow)
  'success', 'process', 'access', 'address', 'assess', 'possess', 'express', 'impress', 'suppress',
  'message', 'passage', 'village', 'package', 'manage', 'damage', 'image', 'storage', 'average',
  'people', 'simple', 'example', 'sample', 'temple', 'purple', 'apple', 'ripple', 'couple',
  'follow', 'yellow', 'hollow', 'borrow', 'sorrow', 'narrow', 'arrow', 'tomorrow', 'window',
  'letter', 'better', 'matter', 'pattern', 'scatter', 'shatter', 'flutter', 'butter', 'utter',
  'little', 'middle', 'fiddle', 'riddle', 'paddle', 'saddle', 'battle', 'cattle', 'settle',
  'coffee', 'toffee', 'office', 'offer', 'suffer', 'buffer', 'differ', 'effect', 'affect',
  'summer', 'hammer', 'manner', 'banner', 'dinner', 'winner', 'runner', 'inner', 'spinner',
  'common', 'lemon', 'demon', 'melon', 'wagon', 'dragon', 'season', 'reason', 'person', 'lesson',
  'happen', 'open', 'broken', 'spoken', 'token', 'frozen', 'chosen', 'golden', 'sudden', 'hidden',
  'pepper', 'copper', 'proper', 'paper', 'super', 'upper', 'supper', 'zipper', 'slipper', 'flipper',
  'asses', 'passes', 'classes', 'glasses', 'masses', 'grasses', 'resses', 'presses', 'stresses',
  
  // Common action words
  'tell', 'make', 'know', 'take', 'come', 'give', 'look', 'want', 'find', 'call', 'feel', 'try',
  'ask', 'need', 'seem', 'help', 'talk', 'turn', 'show', 'hear', 'play', 'run', 'move', 'like',
  'live', 'think', 'work', 'keep', 'start', 'grow', 'open', 'walk', 'begin', 'might', 'next',
  'write', 'read', 'learn', 'teach', 'build', 'create', 'design', 'develop', 'test', 'debug',
  'code', 'program', 'compile', 'execute', 'deploy', 'maintain', 'update', 'refactor', 'optimize',
  
  // Simple descriptive words
  'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other', 'old', 'right', 'big',
  'high', 'small', 'large', 'next', 'early', 'young', 'few', 'public', 'bad', 'same', 'able',
  'fast', 'slow', 'quick', 'easy', 'hard', 'simple', 'complex', 'modern', 'ancient', 'bright',
  'dark', 'light', 'heavy', 'clean', 'dirty', 'fresh', 'stale', 'warm', 'cold', 'hot',
  
  // Common nouns
  'time', 'person', 'year', 'thing', 'man', 'world', 'life', 'hand', 'part', 'child', 'eye', 'woman',
  'place', 'work', 'week', 'case', 'point', 'group', 'room', 'fact', 'money', 'water', 'day', 'area',
  'book', 'story', 'idea', 'number', 'letter', 'word', 'sentence', 'page', 'chapter', 'title',
  'system', 'process', 'method', 'function', 'variable', 'constant', 'array', 'object', 'class',
  
  // Tech and programming words
  'algorithm', 'database', 'server', 'client', 'framework', 'library', 'module', 'package',
  'interface', 'implementation', 'abstraction', 'encapsulation', 'inheritance', 'polymorphism',
  'async', 'await', 'promise', 'callback', 'event', 'listener', 'handler', 'component',
  'state', 'props', 'render', 'mount', 'update', 'lifecycle', 'hook', 'context',
  
  // Original words for variety
  'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'runs', 'through', 'forest',
  'beautiful', 'morning', 'sunshine', 'brings', 'happiness', 'everyone', 'around', 'today',
  'technology', 'advances', 'rapidly', 'changing', 'lives', 'people', 'everywhere', 'making', 'easier',
  'learning', 'programming', 'requires', 'practice', 'patience', 'dedication', 'achieve', 'mastery',
  'typing', 'speed', 'accuracy', 'important', 'skills', 'develop', 'improve', 'productivity',
  'computer', 'keyboard', 'monitor', 'mouse', 'software', 'hardware', 'internet', 'network',
  'creative', 'thinking', 'problem', 'solving', 'critical', 'analysis', 'effective', 'communication',
  'success', 'comes', 'hard', 'perseverance', 'never', 'giving', 'dreams', 'goals',
  'challenge', 'opportunity', 'growth', 'journey', 'adventure', 'experience', 'knowledge', 'wisdom',
  'innovation', 'revolution', 'evolution', 'transformation', 'progress', 'achievement', 'excellence',
];

// Most satisfying typing patterns based on ergonomics and flow
// Research shows these patterns create the best typing experience:
// 1. Alternating hands (left-right-left-right)
// 2. Home row keys (asdf jkl;)
// 3. Rolling fingers (inward/outward rolls)
// 4. Double letters (smooth repetition)
// 5. Common digraphs (th, er, in, on, an)

const SATISFYING_WORDS = [
  // Perfect alternating hands (most satisfying)
  'when', 'then', 'than', 'them', 'their', 'theory', 'turkey', 'visual', 'formal', 'social',
  'island', 'problem', 'element', 'ancient', 'penalty', 'ritual', 'authentic', 'chairman',
  
  // Home row dominant (comfortable, fast)
  'sad', 'lad', 'had', 'fad', 'dad', 'gal', 'lass', 'glass', 'flask', 'salad', 'falls',
  'shall', 'flash', 'slash', 'dash', 'hash', 'sash', 'lash', 'gash', 'ash',
  
  // Rolling fingers outward (satisfying flow)
  'was', 'saw', 'were', 'where', 'water', 'waste', 'wasted', 'answer', 'tower', 'power',
  'lower', 'flower', 'shower', 'browser', 'drawer',
  
  // Rolling fingers inward (smooth motion)
  'pop', 'top', 'mop', 'cop', 'hop', 'stop', 'drop', 'prop', 'shop', 'chop',
  'ion', 'lion', 'onion', 'opinion', 'union', 'million', 'billion',
  
  // Double letters (rhythmic satisfaction)
  'book', 'look', 'took', 'cook', 'hook', 'good', 'food', 'mood', 'wood', 'pool',
  'cool', 'tool', 'fool', 'loop', 'door', 'poor', 'floor', 'proof', 'room', 'boom',
  'zoom', 'moon', 'soon', 'noon', 'spoon', 'balloon', 'cartoon',
  'bell', 'tell', 'sell', 'well', 'spell', 'shell', 'smell', 'dwell', 'swell',
  'ball', 'call', 'fall', 'hall', 'mall', 'tall', 'wall', 'small', 'install',
  'will', 'fill', 'kill', 'mill', 'pill', 'still', 'skill', 'drill', 'thrill',
  'pass', 'mass', 'class', 'grass', 'glass', 'brass',
  'less', 'mess', 'dress', 'press', 'stress', 'bless', 'chess', 'guess', 'access',
  'miss', 'kiss', 'bliss', 'dismiss',
  'boss', 'loss', 'moss', 'cross', 'gross', 'across',
  'buff', 'puff', 'stuff', 'bluff', 'fluff', 'muffin', 'buffer', 'suffer',
  'buzz', 'fuzz', 'fuzzy', 'puzzle',
  
  // Common digraphs (natural flow)
  'the', 'this', 'that', 'they', 'them', 'then', 'there', 'these', 'those', 'think',
  'thing', 'thank', 'three', 'through', 'throw', 'thread', 'threat', 'throne',
  'her', 'here', 'hero', 'herd', 'term', 'fern', 'stern', 'modern', 'pattern',
  'in', 'into', 'inner', 'input', 'inside', 'instant', 'install', 'inspire',
  'on', 'one', 'once', 'only', 'onto', 'online', 'ongoing',
  'an', 'and', 'any', 'many', 'can', 'man', 'pan', 'plan', 'than', 'scan',
];

// Sentence patterns for natural flow
const SENTENCE_PATTERNS = [
  // Alternating hand patterns (most satisfying)
  ['when', 'they', 'go', 'to', 'the', 'island'],
  ['the', 'theory', 'is', 'formal', 'and', 'visual'],
  ['their', 'problem', 'is', 'authentic'],
  ['the', 'chairman', 'got', 'the', 'penalty'],
  
  // Home row dominant (fast and comfortable)
  ['sad', 'lad', 'had', 'a', 'glass', 'flask'],
  ['the', 'flash', 'and', 'dash', 'falls'],
  ['shall', 'we', 'slash', 'the', 'hash'],
  
  // Rolling patterns (smooth flow)
  ['where', 'was', 'the', 'water', 'tower'],
  ['the', 'flower', 'has', 'power'],
  ['answer', 'the', 'lower', 'drawer'],
  ['pop', 'to', 'the', 'top', 'shop'],
  
  // Double letter satisfaction
  ['look', 'at', 'the', 'good', 'book'],
  ['the', 'cool', 'pool', 'and', 'tool'],
  ['soon', 'the', 'moon', 'will', 'bloom'],
  ['tell', 'me', 'the', 'spell', 'well'],
  ['the', 'small', 'ball', 'will', 'fall'],
  ['pass', 'the', 'class', 'with', 'skill'],
  ['less', 'stress', 'and', 'more', 'success'],
  ['the', 'boss', 'will', 'cross', 'the', 'hall'],
  
  // Common digraph flow
  ['they', 'think', 'this', 'is', 'good'],
  ['thank', 'them', 'for', 'the', 'help'],
  ['here', 'is', 'the', 'modern', 'pattern'],
  ['into', 'the', 'inner', 'room'],
  ['once', 'and', 'only', 'once'],
  ['many', 'can', 'plan', 'and', 'scan'],
  
  // Mixed satisfaction patterns
  ['the', 'book', 'was', 'cool'],
  ['look', 'where', 'they', 'go'],
  ['when', 'will', 'the', 'moon', 'rise'],
  ['pass', 'them', 'the', 'tool'],
  ['think', 'less', 'and', 'do', 'more'],
];

const generateWordSentence = (wordCount = 50) => {
  const words = [];
  
  while (words.length < wordCount) {
    const rand = Math.random();
    
    // 50% chance to use satisfying sentence patterns
    if (rand < 0.5 && words.length + 6 <= wordCount) {
      const pattern = SENTENCE_PATTERNS[Math.floor(Math.random() * SENTENCE_PATTERNS.length)];
      words.push(...pattern);
    }
    // 30% chance to use highly satisfying words
    else if (rand < 0.8) {
      words.push(SATISFYING_WORDS[Math.floor(Math.random() * SATISFYING_WORDS.length)]);
    }
    // 15% chance for small words (quick and easy)
    else if (rand < 0.95) {
      words.push(SMALL_WORDS[Math.floor(Math.random() * SMALL_WORDS.length)]);
    }
    // 5% chance for variety from main list
    else {
      words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    }
  }
  
  // Trim to exact word count
  return words.slice(0, wordCount).join(' ');
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
    'const fetchUsers = async () => {\n  try {\n    const res = await fetch("/api/users");\n    return await res.json();\n  } catch (err) {\n    console.error(err);\n  }\n}',
    'const sortArray = arr => arr.sort((a, b) => a - b);',
    'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}',
    'const throttle = (fn, wait) => {\n  let time = Date.now();\n  return function() {\n    if (time + wait - Date.now() < 0) {\n      fn();\n      time = Date.now();\n    }\n  }\n}',
    'const memoize = fn => {\n  const cache = {};\n  return (...args) => {\n    const key = JSON.stringify(args);\n    return cache[key] || (cache[key] = fn(...args));\n  };\n}',
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
  
  // XP System states
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpBreakdown, setXpBreakdown] = useState(null);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  
  // Gamification states (streaks, combos)
  const [currentStreak, setCurrentStreak] = useState(0);
  const [sessionCombo, setSessionCombo] = useState(0);
  
  const inputRef = useRef(null);
  const userInputRef = useRef('');
  const textDisplayRef = useRef(null);
  const nextTestButtonRef = useRef(null);

  // Check premium status and load user XP
  useEffect(() => {
    const checkPremium = async () => {
      if (!user) {
        setIsPremium(false);
        setUserXP(0);
        setUserLevel(1);
        return;
      }

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('tier, premium_until, xp')
        .eq('id', user.id)
        .single();

      const now = new Date();
      const isExpired = profileData?.premium_until && new Date(profileData.premium_until) < now;
      setIsPremium(profileData?.tier === 'premium' && !isExpired);
      
      // Load user XP and calculate level
      const currentXP = profileData?.xp || 0;
      setUserXP(currentXP);
      const levelInfo = calculateLevel(currentXP);
      setUserLevel(levelInfo.level);
      
      // Load streak data from Supabase
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();
      
      const streak = streakData?.current_streak || 0;
      setCurrentStreak(streak);
    };

    checkPremium();
  }, [user]);
  
  const testFinishedRef = useRef(false);

  // Generate text function
  const generateText = () => {
    const snippets = CODE_SNIPPETS[language];
    setText(snippets[Math.floor(Math.random() * snippets.length)]);
  };

  // Reset test function (defined early so it can be used in useEffect)
  const resetTest = useCallback(() => {
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
    setXpEarned(0);
    setXpBreakdown(null);
    setShowXpAnimation(false);
    
    // Generate new text based on current language
    const snippets = CODE_SNIPPETS[language];
    setText(snippets[Math.floor(Math.random() * snippets.length)]);
    
    inputRef.current?.focus();
  }, [duration, language]);

  // Keyboard shortcuts for results page
  useEffect(() => {
    if (isFinished) {
      const handleKeyPress = (e) => {
        // Tab key to focus the next test button
        if (e.key === 'Tab') {
          e.preventDefault();
          nextTestButtonRef.current?.focus();
        }
        // Enter key to start new test (works anywhere on results page)
        if (e.key === 'Enter') {
          e.preventDefault();
          resetTest();
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isFinished, resetTest]);

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

  // Auto-scroll text display as user types
  useEffect(() => {
    if (textDisplayRef.current && isActive) {
      const charsPerLine = 50;
      const lineHeight = 36; // Approximate line height in pixels
      const currentLine = Math.floor(currentIndex / charsPerLine);
      const scrollPosition = Math.max(0, (currentLine - 1) * lineHeight);
      
      textDisplayRef.current.scrollTop = scrollPosition;
    }
  }, [currentIndex, isActive]);

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

    // Save result to localStorage
    try {
      // Calculate consistency
      const consistency = wpmHistory.length > 0 
        ? Math.round((1 - (Math.max(...wpmHistory) - Math.min(...wpmHistory)) / Math.max(...wpmHistory)) * 100)
        : 0;

      const resultData = {
        id: Date.now(), // Use timestamp as unique ID
        timestamp: new Date().toISOString(),
        duration_seconds: duration,
        time_remaining: timeLeft,
        language: language,
        snippet_language: language,
        wpm: wpm,
        raw_wpm: rawWpm,
        accuracy: accuracy,
        consistency: consistency,
        errors: errors,
        correct_chars: correctChars,
        incorrect_chars: incorrectChars,
        wpm_history: wpmHistory,
        device_meta: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      };

      // Update streak (use Supabase if logged in, localStorage otherwise)
      let streakInfo;
      let testsToday = 1;
      let totalTests = 1;
      
      if (user) {
        // Fetch current streak data from Supabase
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // Calculate and update streak in Supabase
        streakInfo = await calculateStreakSupabase(supabase, user.id, streakData);
        testsToday = streakInfo.testsToday;
        totalTests = streakInfo.totalTests;
      } else {
        // Fallback to localStorage for non-logged users
        const lastTestDate = localStorage.getItem('lastTestDate');
        streakInfo = calculateStreak(lastTestDate);
        testsToday = incrementTodayTestCount();
        const stats = getUserStats();
        totalTests = stats.totalTests;
      }
      
      setCurrentStreak(streakInfo.streak);
      
      // Increment session combo
      const newCombo = sessionCombo + 1;
      setSessionCombo(newCombo);
      
      // Calculate XP earned with streak and combo bonuses
      const xpData = calculateXP({
        wpm: wpm,
        accuracy: accuracy,
        duration_seconds: duration,
        consistency: consistency,
        errors: errors,
        streak: streakInfo.streak,
        combo: newCombo - 1 // Use previous combo for calculation
      });
      
      setXpEarned(xpData.total);
      setXpBreakdown(xpData);
      
      // Check for achievements
      let unlockedAchievements = [];
      
      if (user) {
        // Fetch existing achievements from Supabase
        const { data: existingAch } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);
        
        const existingAchIds = existingAch ? existingAch.map(a => a.achievement_id) : [];
        
        // Get perfect accuracy count from test history
        const allTests = JSON.parse(localStorage.getItem('typingResults') || '[]');
        const perfectAccuracyCount = allTests.filter(t => t.accuracy >= 100).length;
        
        // Check achievements with Supabase
        unlockedAchievements = await checkAchievementsSupabase(supabase, user.id, {
          wpm: wpm,
          accuracy: accuracy,
          consistency: consistency,
          streak: streakInfo.streak,
          totalTests: totalTests,
          perfectAccuracyCount: perfectAccuracyCount,
          testsToday: testsToday
        }, existingAchIds);
      } else {
        // Fallback to localStorage
        const stats = getUserStats();
        unlockedAchievements = checkAchievements({
          wpm: wpm,
          accuracy: accuracy,
          consistency: consistency,
          streak: streakInfo.streak,
          totalTests: stats.totalTests,
          perfectAccuracyCount: stats.perfectAccuracyCount
        });
      }
      
      if (unlockedAchievements.length > 0) {
        // Don't show popup - achievements only visible in Settings
        // But still add XP bonus
        const achievementXP = unlockedAchievements.reduce((sum, ach) => sum + ach.xp, 0);
        xpData.total += achievementXP;
        xpData.achievements = achievementXP;
        setXpEarned(xpData.total);
      }
      
      // Save XP to Supabase if user is logged in
      if (user) {
        try {
          const newTotalXP = userXP + xpData.total;
          
          const { error: xpError } = await supabase
            .from('user_profiles')
            .update({ xp: newTotalXP })
            .eq('id', user.id);
          
          if (xpError) {
            console.error('Error saving XP to database:', xpError);
          } else {
            console.log('XP saved successfully! Earned:', xpData.total, 'Total:', newTotalXP);
            setUserXP(newTotalXP);
            const newLevelInfo = calculateLevel(newTotalXP);
            
            // Check if user leveled up
            if (newLevelInfo.level > userLevel) {
              console.log('🎉 Level up!', userLevel, '->', newLevelInfo.level);
            }
            setUserLevel(newLevelInfo.level);
            
            // Show XP animation
            setShowXpAnimation(true);
            setTimeout(() => setShowXpAnimation(false), 3000);
          }
        } catch (xpErr) {
          console.error('Error updating XP:', xpErr);
        }

        // Save test result to Supabase for leaderboard
        try {
          const { error: resultError } = await supabase
            .from('typing_results')
            .insert({
              user_id: user.id,
              wpm: wpm,
              raw_wpm: rawWpm,
              accuracy: accuracy,
              consistency: consistency,
              errors: errors,
              correct_chars: correctChars,
              incorrect_chars: incorrectChars,
              duration_seconds: duration,
              time_remaining: timeLeft,
              language: language,
              wpm_history: wpmHistory,
              created_at: new Date().toISOString()
            });

          if (resultError) {
            console.error('Error saving test result to database:', resultError);
          } else {
            console.log('Test result saved to database for leaderboard');
          }
        } catch (resultErr) {
          console.error('Error saving test result:', resultErr);
        }
      }

      // Get existing results from localStorage
      const existingResults = JSON.parse(localStorage.getItem('typingResults') || '[]');
      
      // Add new result to the beginning of the array
      existingResults.unshift(resultData);
      
      // Keep only the last 100 results to avoid localStorage size limits
      const limitedResults = existingResults.slice(0, 100);
      
      // Save back to localStorage
      localStorage.setItem('typingResults', JSON.stringify(limitedResults));
      
      console.log('Result saved to localStorage:', resultData);
      setResultSaved(true);
    } catch (err) {
      console.error('Error saving result to localStorage:', err);
      setResultSaved(false);
    }
  };

  const getCharStyle = (index) => {
    if (index < userInput.length) {
      return { color: userInput[index] === text[index] ? theme.correct : theme.incorrect };
    }
    if (index === currentIndex) {
      return { 
        borderLeft: `3px solid ${theme.accent}`,
        paddingLeft: '2px',
        marginLeft: '-2px',
        transition: 'all 0.05s ease-out'
      };
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
      {!isActive && (
      <div 
        className="px-4 py-2 flex items-center justify-between transition-all duration-300"
        style={{ 
          backgroundColor: theme.bgSecondary,
          borderBottom: `1px solid ${theme.border}`
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }}></div>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27c93f' }}></div>
          </div>
          <span className="text-xs font-mono" style={{ color: theme.accent }}>
            spidertype@terminal
          </span>
          <span className="text-xs" style={{ color: theme.textMuted }}>:</span>
          <span className="text-xs font-mono" style={{ color: theme.correct }}>~</span>
          <span className="text-xs" style={{ color: theme.textMuted }}>$</span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: theme.textMuted }}>
          <span className="font-mono">bash</span>
          <span>•</span>
          <span className="font-mono">{new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
        </div>
      </div>
      )}

      {/* Top Navigation */}
      {!isActive && (
      <nav 
        className="px-8 py-4 transition-all duration-300"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Navigation Buttons - Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leaderboard')}
              className="px-4 py-2 rounded text-sm transition font-mono"
              style={{
                backgroundColor: theme.bgSecondary,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.buttonHover;
                e.target.style.borderColor = theme.accent;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.bgSecondary;
                e.target.style.borderColor = theme.border;
              }}
            >
              🏆 leaderboard
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 rounded text-sm transition font-mono"
              style={{
                backgroundColor: theme.bgSecondary,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.buttonHover;
                e.target.style.borderColor = theme.accent;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.bgSecondary;
                e.target.style.borderColor = theme.border;
              }}
            >
              $ settings
            </button>
            {isPremium && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded text-sm transition font-mono"
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.buttonHover;
                  e.target.style.borderColor = theme.accent;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.bgSecondary;
                  e.target.style.borderColor = theme.border;
                }}
              >
                $ dashboard
              </button>
            )}
          </div>

          {/* Duration Selection - Center */}
          <div className="flex items-center gap-3 text-sm">
            <span className="mr-2 font-mono" style={{ color: theme.textMuted }}>--time</span>
            {[15, 30, 60, 120].map(time => (
              <button
                key={time}
                onClick={() => {
                  setDuration(time);
                  setTimeLeft(time);
                }}
                className="transition font-mono px-2 py-1 rounded"
                style={{ 
                  color: duration === time ? theme.accent : theme.textMuted,
                  backgroundColor: duration === time ? theme.accent + '20' : 'transparent',
                  border: duration === time ? `1px solid ${theme.accent}` : '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = theme.text;
                  if (duration !== time) e.target.style.borderColor = theme.border;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = duration === time ? theme.accent : theme.textMuted;
                  if (duration !== time) e.target.style.borderColor = 'transparent';
                }}
              >
                {time}s
              </button>
            ))}
          </div>

          {/* Auth Buttons - Right */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* XP and Level Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: theme.bgSecondary, border: `1px solid ${theme.accent}` }}>
                  <span className="text-xs font-mono font-bold" style={{ color: theme.accent }}>
                    Lv.{userLevel}
                  </span>
                  <div style={{ width: '1px', height: '16px', backgroundColor: theme.border }}></div>
                  <div className="flex flex-col" style={{ minWidth: '80px' }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-mono" style={{ color: theme.textMuted }}>XP</span>
                      <span className="text-xs font-mono" style={{ color: theme.accent }}>{userXP}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: theme.border }}>
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${calculateLevel(userXP).progressPercent}%`,
                          backgroundColor: theme.accent
                        }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-mono" style={{ color: theme.textMuted }}>
                    {getLevelTitle(userLevel)}
                  </span>
                </div>
                
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
              </>
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
      )}

      {/* Main Typing Area */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-4xl w-full">
          {/* Stats - Show minimal stats in focus mode */}
          {isActive && !isFinished ? (
            <div className="flex items-center justify-center gap-8 mb-8 text-sm animate-fadeIn">
              <div style={{ color: theme.textSecondary }}>
                <span className="text-3xl font-bold">{timeLeft}s</span>
                <span className="ml-2" style={{ color: theme.textMuted }}>remaining</span>
              </div>
            </div>
          ) : (
          <div className="flex items-center justify-center gap-8 mb-8 text-sm transition-all duration-300">
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
          )}

          {/* Text Display */}
          <div 
            className="rounded-lg p-8 mb-6 min-h-[280px] relative"
            style={{ 
              backgroundColor: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
              boxShadow: `0 0 20px ${theme.accent}10`
            }}
          >
            {/* Terminal Prompt */}
            <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <span className="font-mono" style={{ color: theme.accent }}>user@spidertype</span>
              <span style={{ color: theme.textMuted }}>:</span>
              <span className="font-mono" style={{ color: theme.correct }}>~</span>
              <span style={{ color: theme.textMuted }}>$</span>
              <span className="text-sm font-mono ml-2" style={{ color: theme.text }}>
                {language === 'words' ? 'cat typing_practice.txt' : `cat ${language}_snippet.${language === 'python' ? 'py' : language === 'javascript' || language === 'react' ? 'js' : language === 'typescript' ? 'ts' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : language === 'go' ? 'go' : language === 'rust' ? 'rs' : 'txt'}`}
              </span>
            </div>

            {!isFinished ? (
              <div 
                ref={textDisplayRef}
                className="text-2xl leading-relaxed font-mono overflow-y-auto relative scrollbar-thin"
                style={{ 
                  maxHeight: '260px',
                  transition: 'all 0.3s ease',
                  scrollBehavior: 'smooth',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word'
                }}
              >
                {text.split('').map((char, index) => {
                  // Calculate visible lines based on actual character position
                  // For word mode, use character count; for code mode, count actual newlines
                  const isWordMode = language === 'words';
                  let currentLine, charLine;
                  
                  if (isWordMode) {
                    // For words, estimate based on characters (will wrap naturally)
                    const charsPerLine = 50;
                    currentLine = Math.floor(currentIndex / charsPerLine);
                    charLine = Math.floor(index / charsPerLine);
                  } else {
                    // For code, count actual newlines
                    currentLine = text.substring(0, currentIndex).split('\n').length - 1;
                    charLine = text.substring(0, index).split('\n').length - 1;
                  }
                  
                  const visibleLines = 3;
                  const lineDiff = charLine - currentLine;
                  
                  // Determine opacity based on line position
                  let opacity = 1;
                  if (lineDiff > visibleLines) {
                    opacity = 0; // Future lines hidden
                  } else if (lineDiff === visibleLines) {
                    opacity = 0.3; // Next line fading in
                  } else if (lineDiff < 0) {
                    opacity = 0.2; // Past lines faded
                  }
                  
                  return (
                    <span 
                      key={index} 
                      style={{
                        ...getCharStyle(index),
                        opacity: opacity,
                        transition: 'opacity 0.5s ease'
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
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

                {/* XP Earned Display */}
                {user && xpEarned > 0 && (
                  <div className="mb-8 p-6 rounded-lg" style={{ 
                    backgroundColor: theme.accent + '15',
                    border: `2px solid ${theme.accent}`,
                    animation: showXpAnimation ? 'pulse 1s ease-in-out' : 'none'
                  }}>
                    <div className="text-center mb-4">
                      <div className="text-sm mb-2" style={{ color: theme.textMuted }}>XP EARNED</div>
                      <div className="text-5xl font-bold mb-2" style={{ color: theme.accent }}>
                        +{xpEarned} XP
                      </div>
                      <div className="text-sm" style={{ color: theme.accent }}>
                        {getMotivationalMessage(xpEarned)}
                      </div>
                    </div>
                    
                    {xpBreakdown && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-5 gap-4 text-center text-xs">
                          <div>
                            <div style={{ color: theme.textMuted }}>Base</div>
                            <div className="font-bold" style={{ color: theme.text }}>+{xpBreakdown.base}</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>WPM</div>
                            <div className="font-bold" style={{ color: theme.text }}>+{xpBreakdown.wpm}</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Accuracy</div>
                            <div className="font-bold" style={{ color: theme.text }}>+{xpBreakdown.accuracy}</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Duration</div>
                            <div className="font-bold" style={{ color: theme.text }}>+{xpBreakdown.duration}</div>
                          </div>
                          <div>
                            <div style={{ color: theme.textMuted }}>Consistency</div>
                            <div className="font-bold" style={{ color: theme.text }}>+{xpBreakdown.consistency}</div>
                          </div>
                        </div>
                        
                        {/* Streak and Combo Bonuses */}
                        {(xpBreakdown.streak > 0 || xpBreakdown.combo > 0 || xpBreakdown.achievements > 0) && (
                          <div className="pt-4 border-t" style={{ borderColor: theme.border }}>
                            <div className="text-xs font-semibold mb-2" style={{ color: theme.accent }}>
                              🎉 BONUS XP!
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center text-xs">
                              {xpBreakdown.streak > 0 && (
                                <div>
                                  <div style={{ color: theme.textMuted }}>🔥 {currentStreak} Day Streak</div>
                                  <div className="font-bold text-lg" style={{ color: theme.accent }}>+{xpBreakdown.streak}</div>
                                </div>
                              )}
                              {xpBreakdown.combo > 0 && (
                                <div>
                                  <div style={{ color: theme.textMuted }}>⚡ {sessionCombo}x Combo</div>
                                  <div className="font-bold text-lg" style={{ color: theme.accent }}>+{xpBreakdown.combo}</div>
                                </div>
                              )}
                              {xpBreakdown.achievements > 0 && (
                                <div>
                                  <div style={{ color: theme.textMuted }}>⭐ Achievements</div>
                                  <div className="font-bold text-lg" style={{ color: theme.correct }}>+{xpBreakdown.achievements}</div>
                                </div>
                              )}
                            </div>
                            {xpBreakdown.multiplier > 1 && (
                              <div className="mt-2 text-center text-sm font-bold" style={{ color: theme.accent }}>
                                Total Multiplier: {xpBreakdown.multiplier.toFixed(2)}x
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 text-center">
                      <div className="text-sm mb-2" style={{ color: theme.textMuted }}>
                        Level {userLevel} • {getLevelTitle(userLevel)}
                      </div>
                      <div className="w-full h-3 rounded-full" style={{ backgroundColor: theme.border }}>
                        <div 
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${calculateLevel(userXP).progressPercent}%`,
                            backgroundColor: theme.accent
                          }}
                        ></div>
                      </div>
                      <div className="text-xs mt-1" style={{ color: theme.textMuted }}>
                        {calculateLevel(userXP).xpInCurrentLevel} / {calculateLevel(userXP).xpNeededForNextLevel} XP to next level
                      </div>
                    </div>
                  </div>
                )}

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
                <div className="flex items-center justify-center gap-4 mb-6">
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

                {/* Large Next Test Button */}
                <div className="flex justify-center">
                  <button
                    ref={nextTestButtonRef}
                    onClick={resetTest}
                    className="px-8 py-4 rounded-lg font-mono text-lg font-medium transition-all duration-200"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.bg,
                      border: `2px solid ${theme.accent}`,
                      boxShadow: `0 4px 12px ${theme.accent}40`
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = `0 6px 16px ${theme.accent}60`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = `0 4px 12px ${theme.accent}40`;
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = `2px solid ${theme.accent}`;
                      e.target.style.outlineOffset = '4px';
                    }}
                    onBlur={(e) => {
                      e.target.style.outline = 'none';
                    }}
                  >
                    Press Tab + Enter or Click to Start New Test →
                  </button>
                </div>

                {/* Save status message */}
                <div className="text-center mt-4">
                  {resultSaved && (
                    <div 
                      className="inline-block px-4 py-2 rounded-lg"
                      style={{ 
                        backgroundColor: theme.correct + '20',
                        border: `1px solid ${theme.correct}`
                      }}
                    >
                      <p className="text-sm font-medium" style={{ color: theme.correct }}>
                        ✓ Result saved to local storage
                      </p>
                    </div>
                  )}
                  {!resultSaved && isFinished && (
                    <div 
                      className="inline-block px-6 py-3 rounded-lg"
                      style={{ 
                        backgroundColor: theme.incorrect + '15',
                        border: `1px solid ${theme.incorrect}`
                      }}
                    >
                      <p className="text-sm font-medium" style={{ color: theme.incorrect }}>
                        ⚠️ Failed to save result
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
              className="w-full px-4 py-3 rounded-lg font-mono focus:outline-none resize-none text-lg"
              style={{
                backgroundColor: theme.bg,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                minHeight: '120px',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
              placeholder="Start typing to begin..."
              autoFocus
              onKeyDown={(e) => {
                // Handle Enter key - auto-indent like in IDEs
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const currentChar = text[currentIndex];
                  
                  if (currentChar === '\n') {
                    // Find the indentation of the current line in the original text
                    let indentToAdd = '';
                    
                    // Look ahead in the text to find the indentation after this newline
                    let nextIndex = currentIndex + 1;
                    while (nextIndex < text.length && (text[nextIndex] === ' ' || text[nextIndex] === '\t')) {
                      indentToAdd += text[nextIndex];
                      nextIndex++;
                    }
                    
                    // Add newline + auto-indentation
                    const newValue = userInput + '\n' + indentToAdd;
                    setUserInput(newValue);
                    userInputRef.current = newValue;
                    setCurrentIndex(newValue.length);
                  }
                  // If not a newline in the text, ignore the Enter key
                }
              }}
            />
          )}

          {/* Reset Button - Always visible at bottom */}
          {!isFinished && (
          <div className="text-center mt-6 transition-all duration-300">
            <button
              onClick={resetTest}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                backgroundColor: theme.buttonBg,
                color: theme.textSecondary,
                border: `2px solid ${theme.border}`
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = theme.buttonHover;
                e.target.style.borderColor = theme.accent;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = `0 4px 12px ${theme.accent}30`;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = theme.buttonBg;
                e.target.style.borderColor = theme.border;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🔄 Reset Test
            </button>
          </div>
          )}
        </div>
      </div>

      {/* Streak Indicator - Only visible when test is active */}
      {isActive && !isFinished && startTime && currentStreak > 0 && (
        <div 
          className="fixed bottom-8 left-8 p-4 rounded-lg"
          style={{
            backgroundColor: theme.bgSecondary,
            border: `2px solid ${currentStreak >= 7 ? theme.accent : theme.border}`,
            boxShadow: currentStreak >= 7 ? `0 4px 16px ${theme.accent}40` : 'none'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="text-xs" style={{ color: theme.textMuted }}>
                Current Streak
              </div>
              <div className="text-xl font-bold" style={{ color: theme.accent }}>
                {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
              </div>
              {currentStreak >= 7 && (
                <div className="text-xs font-bold" style={{ color: theme.accent }}>
                  +{currentStreak >= 30 ? '100' : currentStreak >= 14 ? '50' : '25'}% XP Bonus!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Session Combo Indicator - Only visible when test is active */}
      {isActive && !isFinished && startTime && sessionCombo > 0 && (
        <div 
          className="fixed bottom-8 left-64 p-3 rounded-lg"
          style={{
            backgroundColor: theme.bgSecondary,
            border: `2px solid ${theme.correct}`,
            boxShadow: `0 4px 16px ${theme.correct}40`
          }}
        >
          <div className="flex items-center gap-2">
            <div className="text-xl">⚡</div>
            <div>
              <div className="text-xs" style={{ color: theme.textMuted }}>
                Session Combo
              </div>
              <div className="text-lg font-bold" style={{ color: theme.correct }}>
                {sessionCombo}x
              </div>
              <div className="text-xs" style={{ color: theme.textMuted }}>
                +{(sessionCombo * 5)}% XP
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
