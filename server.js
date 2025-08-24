const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://janapatigandhi99:64x2Q11jrClLfDvY@cluster0.guycaxy.mongodb.net/quizDB')
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log(err));

// Quiz Schema
const quizSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
});

const Quiz = mongoose.model('Quiz', quizSchema);

// Get all quiz questions
app.get('/quiz', async (req, res) => {
  try {
    const questions = await Quiz.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit quiz answers
app.post('/quiz/submit', async (req, res) => {
  try {
    const userAnswers = req.body.answers; // [{id, answer}]
    const questions = await Quiz.find();
    let score = 0;
    const review = [];

    questions.forEach(q => {
      const userAns = userAnswers.find(a => a.id === q._id.toString());
      const correct = userAns?.answer === q.answer;
      if (correct) score += 1;
      review.push({
        question: q.question,
        correctAnswer: q.answer,
        userAnswer: userAns?.answer,
        correct,
      });
    });

    res.json({ score, review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
