// Global state
let flashcards = [];
let currentIndex = 0;
let correctCards = new Set();
let wrongCards = new Set();
let spacedRepetitionMode = false;
let activeCards = [];

// DOM elements
const uploadSection = document.getElementById('uploadSection');
const studySection = document.getElementById('studySection');
const csvFile = document.getElementById('csvFile');
const fileInfo = document.getElementById('fileInfo');
const startButton = document.getElementById('startButton');
const flashcard = document.getElementById('flashcard');
const question = document.getElementById('question');
const answer = document.getElementById('answer');
const cardCounter = document.getElementById('cardCounter');
const correctCounter = document.getElementById('correctCounter');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const correctButton = document.getElementById('correctButton');
const wrongButton = document.getElementById('wrongButton');
const resetButton = document.getElementById('resetButton');
const completionMessage = document.getElementById('completionMessage');
const restartButton = document.getElementById('restartButton');

// Event listeners
csvFile.addEventListener('change', handleFileSelect);
startButton.addEventListener('click', startStudy);
flashcard.addEventListener('click', flipCard);
prevButton.addEventListener('click', previousCard);
nextButton.addEventListener('click', nextCard);
correctButton.addEventListener('click', markCorrect);
wrongButton.addEventListener('click', markWrong);
resetButton.addEventListener('click', resetApp);
restartButton.addEventListener('click', restartStudy);

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
        fileInfo.textContent = '❌ Please select a CSV file';
        fileInfo.style.color = 'var(--error-color)';
        startButton.style.display = 'none';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

// Parse CSV file
function parseCSV(text) {
    const lines = text.trim().split('\n');
    flashcards = [];
    
    // Skip header row if it exists (check if first row is likely a header)
    let startIndex = 0;
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        const firstParts = parseCSVLine(firstLine);
        // Check if first row looks like a header
        if (firstParts.length >= 2 && 
            (firstParts[0].toLowerCase() === 'question' || 
             firstParts[0].toLowerCase() === 'questions')) {
            startIndex = 1;
        }
    }

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parsing (handles basic cases)
        const parts = parseCSVLine(line);
        
        if (parts.length >= 2) {
            flashcards.push({
                question: parts[0].trim(),
                answer: parts[1].trim(),
                id: flashcards.length
            });
        }
    }

    if (flashcards.length === 0) {
        fileInfo.textContent = '❌ No valid flashcards found in the file';
        fileInfo.style.color = 'var(--error-color)';
        startButton.style.display = 'none';
        return;
    }

    fileInfo.textContent = `✓ Successfully loaded ${flashcards.length} flashcard${flashcards.length > 1 ? 's' : ''}`;
    fileInfo.style.color = 'var(--success-color)';
    startButton.style.display = 'inline-block';
}

// Parse a single CSV line (handles quotes and commas)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);

    return result;
}

// Start study session
function startStudy() {
    uploadSection.style.display = 'none';
    studySection.style.display = 'block';
    
    // Initialize active cards with all flashcards
    activeCards = [...flashcards];
    currentIndex = 0;
    correctCards.clear();
    wrongCards.clear();
    spacedRepetitionMode = false;
    
    displayCard();
    updateCounters();
}

// Render text with LaTeX support
function renderTextWithLatex(element, text) {
    // Wrap content in a span so inline text and math flow as natural inline content,
    // avoiding the flex-item fragmentation that occurs when KaTeX nodes are
    // direct children of the display:flex .card-content element.
    const wrapper = document.createElement('span');
    wrapper.textContent = text;
    element.textContent = '';
    element.appendChild(wrapper);

    if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(wrapper, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        });
    }
}

// Display current card
function displayCard() {
    if (activeCards.length === 0) {
        showCompletion();
        return;
    }

    // Ensure we're within bounds
    if (currentIndex >= activeCards.length) {
        currentIndex = 0;
    }
    if (currentIndex < 0) {
        currentIndex = activeCards.length - 1;
    }

    const card = activeCards[currentIndex];
    renderTextWithLatex(question, card.question);
    renderTextWithLatex(answer, card.answer);
    
    // Reset flip state
    flashcard.classList.remove('flipped');
    
    updateCounters();
    updateNavigationButtons();
}

// Flip card
function flipCard() {
    flashcard.classList.toggle('flipped');
}

// Navigate to previous card
function previousCard() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = activeCards.length - 1;
    }
    displayCard();
}

// Navigate to next card
function nextCard() {
    currentIndex++;
    if (currentIndex >= activeCards.length) {
        currentIndex = 0;
    }
    displayCard();
}

// Mark card as correct
function markCorrect() {
    const card = activeCards[currentIndex];
    correctCards.add(card.id);
    wrongCards.delete(card.id);
    
    // Enable spaced repetition mode
    if (!spacedRepetitionMode) {
        spacedRepetitionMode = true;
    }
    
    // Remove card from active cards in spaced repetition mode
    activeCards.splice(currentIndex, 1);
    
    // Check if all cards are mastered
    if (activeCards.length === 0) {
        showCompletion();
        return;
    }
    
    // Adjust index after removal
    if (currentIndex >= activeCards.length) {
        currentIndex = 0;
    }
    
    displayCard();
}

// Mark card as wrong
function markWrong() {
    const card = activeCards[currentIndex];
    wrongCards.add(card.id);
    correctCards.delete(card.id);
    
    // Enable spaced repetition mode
    if (!spacedRepetitionMode) {
        spacedRepetitionMode = true;
    }
    
    // Move to next card (keep this one in rotation)
    nextCard();
}

// Update counters
function updateCounters() {
    const total = flashcards.length;
    const currentNum = activeCards.length > 0 ? (currentIndex + 1) : 0;
    const remaining = activeCards.length;
    
    if (spacedRepetitionMode) {
        cardCounter.textContent = `${remaining} card${remaining !== 1 ? 's' : ''} remaining`;
    } else {
        cardCounter.textContent = `Card ${currentNum} of ${total}`;
    }
    
    correctCounter.textContent = `✓ ${correctCards.size} Correct`;
}

// Update navigation buttons
function updateNavigationButtons() {
    prevButton.disabled = activeCards.length <= 1;
    nextButton.disabled = activeCards.length <= 1;
}

// Show completion message
function showCompletion() {
    completionMessage.style.display = 'flex';
}

// Restart study with same cards
function restartStudy() {
    completionMessage.style.display = 'none';
    activeCards = [...flashcards];
    currentIndex = 0;
    correctCards.clear();
    wrongCards.clear();
    spacedRepetitionMode = false;
    displayCard();
}

// Reset app and go back to upload
function resetApp() {
    studySection.style.display = 'none';
    uploadSection.style.display = 'block';
    flashcards = [];
    activeCards = [];
    currentIndex = 0;
    correctCards.clear();
    wrongCards.clear();
    spacedRepetitionMode = false;
    fileInfo.textContent = '';
    csvFile.value = '';
    startButton.style.display = 'none';
    completionMessage.style.display = 'none';
}
