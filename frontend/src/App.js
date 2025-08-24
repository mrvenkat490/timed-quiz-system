import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timer, setTimer] = useState(30);
  const [result, setResult] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');

  // Fetch questions from backend
  useEffect(() => {
    axios.get('http://localhost:5000/quiz')
      .then(res => setQuestions(res.data))
      .catch(err => console.log(err));
  }, []);

  // Timer logic with auto-next
  useEffect(() => {
    if (!questions.length || result) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          handleAutoNext(); // auto-next when timer reaches 0
          return 30; // reset timer for next question
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [questions, current, result]);

  const handleOption = (option) => {
    setAnswers({ ...answers, [questions[current]._id]: option });
    setSelectedOption(option);
  };

  const handleAutoNext = () => {
    // If no option selected, save empty answer
    if (!selectedOption) {
      setAnswers({ ...answers, [questions[current]._id]: '' });
    }
    setSelectedOption('');
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      submitQuiz();
    }
  };

  const nextQuestion = () => {
    if (!selectedOption) return alert('Please select an option!');
    setSelectedOption('');
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setTimer(30);
    } else submitQuiz();
  };

  const submitQuiz = () => {
    const answerArray = Object.entries(answers).map(([id, answer]) => ({ id, answer }));
    axios.post('http://localhost:5000/quiz/submit', { answers: answerArray })
      .then(res => setResult(res.data))
      .catch(err => console.log(err));
  };

  if (!questions.length) return <p>Loading quiz...</p>;

  if (result) return (
    <div className="container">
      <h2>Score: {result.score} / {questions.length}</h2>
      <h3>Review:</h3>
      {result.review.map((q, i) => (
        <div key={i} className="review-card">
          <p><b>Q:</b> {q.question}</p>
          {q.correct ? (
            <p className="correct">Your Answer: {q.userAnswer} ✅</p>
          ) : (
            <>
              <p className="wrong">Your Answer: {q.userAnswer || 'No Answer'} ❌</p>
              <p className="correct">Correct Answer: {q.correctAnswer}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container">
      <h2>Question {current + 1} / {questions.length}</h2>
      <p>{questions[current].question}</p>
      <div className="options">
        {questions[current].options.map(opt => (
          <button
            key={opt}
            onClick={() => handleOption(opt)}
            className={selectedOption === opt ? 'selected' : ''}
          >
            {opt}
          </button>
        ))}
      </div>
      <p>Time left: {timer}s</p>
      <button onClick={nextQuestion}>Next</button>
    </div>
  );
}

export default App;
