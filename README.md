# 📚 Flashcards - Spaced Repetition Learning

A modern, aesthetically pleasing web-app for learning with flashcards using spaced repetition.

## Features

✨ **Beautiful Modern UI** - Clean, gradient-based design with smooth animations
🔄 **Flip Animation** - Click on any card to flip between question and answer
📊 **Progress Tracking** - See your progress with real-time counters
✅ **Smart Marking** - Mark cards as "Got It Right" or "Didn't Know"
🎯 **Spaced Repetition** - Automatically removes mastered cards and focuses on ones you need to practice
🎉 **Completion Celebration** - Get congratulated when you master all cards!

## How to Use

1. **Open the app**: Open `index.html` in your web browser
2. **Upload a CSV file**: Click "Choose CSV File" and select your flashcards file
3. **Start Learning**: Click the "Start Learning" button
4. **Study**: 
   - Click the flashcard to flip between question and answer
   - Mark each card as "Got It Right" ✓ or "Didn't Know" ❌
   - Cards marked as correct are removed from rotation
   - Cards marked as wrong stay in rotation for more practice
5. **Master All Cards**: Keep studying until you've mastered all flashcards!

## CSV File Format

Your CSV file should have two columns:
1. **Question** - The front of the flashcard
2. **Answer** - The back of the flashcard

### Example CSV:

```csv
Question,Answer
What is the capital of France?,Paris
What is 2 + 2?,4
Who wrote Romeo and Juliet?,William Shakespeare
```

A sample CSV file (`sample.csv`) is included for testing.

## Running Locally

Simply open `index.html` in any modern web browser. No installation or build process required!

Alternatively, you can run a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Then open http://localhost:8000 in your browser
```

## Technologies

- Pure HTML5, CSS3, and JavaScript (no dependencies!)
- Responsive design for mobile and desktop
- CSS animations and transitions
- Modern gradient-based UI design

## Browser Support

Works in all modern browsers that support:
- CSS Grid and Flexbox
- CSS Transforms and Transitions
- FileReader API
