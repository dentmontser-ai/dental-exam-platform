# Comprehensive Test for Bachelor of Dentist

## Overview

A modern, interactive web-based examination platform for dental licensing exams. This platform provides a comprehensive testing experience with 50 randomly selected questions from various dental disciplines.

**Prepared by:** Dr. Montser AL_jodaei

## Features

- **Random Question Selection**: Each exam session randomly selects 50 questions from a pool of 900+ questions across multiple dental disciplines
- **Multiple Disciplines**: Questions covering:
  - Operative Dentistry
  - Periodontics
  - Pedodontics
  - Endodontics
  - Community Dentistry
  - Radiology
  - Oral Surgery
  - Oral Medicine
  - Pharmacology
  - Prosthodontics (Fixed & Removable)

- **User-Friendly Interface**: 
  - Clean, modern, and responsive design
  - Smooth navigation between questions
  - Real-time progress tracking
  - Timer to track exam duration

- **Comprehensive Results**:
  - Detailed score calculation
  - Review of incorrect answers
  - Display of correct answers for comparison
  - CSV export functionality for record-keeping

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Project Structure

```
dental-exam-platform/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── app.js                  # JavaScript logic
├── questions_data.json     # Question database
└── README.md              # This file
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dentmontser-ai/dental-exam-platform.git
cd dental-exam-platform
```

2. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Windows
start index.html

# On Linux
xdg-open index.html
```

Or simply double-click the `index.html` file.

## Usage

1. **Start the Exam**: The exam automatically loads with 50 randomly selected questions
2. **Answer Questions**: Select your answer from the four options (A, B, C, D)
3. **Navigate**: Use "Previous" and "Next" buttons to move between questions
4. **Submit**: Click "Submit" on the last question to finish the exam
5. **Review Results**: 
   - View your overall score and statistics
   - Review all incorrect answers with corrections
   - Compare your answers with the correct ones
6. **Download Results**: Export your results as a CSV file for record-keeping
7. **Retake Exam**: Start a new exam with a fresh set of random questions

## Features in Detail

### Progress Tracking
- Visual progress bar showing your position in the exam
- Question counter (e.g., "Question 28 of 50")
- Elapsed time timer

### Results Dashboard
- Total number of questions
- Number of correct answers
- Number of wrong answers
- Percentage score

### Mistake Review
- Detailed list of all incorrect answers
- Your answer vs. the correct answer for each mistake
- Question category/section information

### Data Export
- Download results as CSV file
- Includes all wrong answers with details
- Can be imported into spreadsheet applications

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Interactive functionality
- **JSON**: Question database format

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Lightweight: ~50KB total size
- Fast loading: No external dependencies
- Smooth animations: 60fps performance

## Question Database

The platform includes 922 questions across 11 dental disciplines:
- Operative: 199 questions
- Periodontics: 70 questions
- Pedodontics: 86 questions
- Endodontics: 195 questions
- Community: 17 questions
- Radiology: 15 questions
- Surgery: 98 questions
- Oral Medicine: 2 questions
- Pharmacology: 143 questions
- Prosthodontics Removable: 97 questions

## Customization

### Adding More Questions
Edit `questions_data.json` to add new questions. Each question should follow this format:

```json
{
  "question": "Question text here?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "C",
  "section": "Operative"
}
```

### Changing Number of Questions
Edit `app.js` line in `initializeExam()`:
```javascript
currentQuiz = shuffleArray(allQuestionsArray).slice(0, 50); // Change 50 to desired number
```

### Styling Customization
Modify CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... other colors ... */
}
```

## Troubleshooting

### Questions not loading?
- Ensure `questions_data.json` is in the same directory as `index.html`
- Check browser console for errors (F12 → Console tab)
- Try refreshing the page

### Styling looks broken?
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Try a different browser
- Ensure all CSS file is properly linked

### Timer not working?
- Check if JavaScript is enabled in your browser
- Try refreshing the page

## License

This project is provided for educational purposes. All rights reserved.

## Support

For issues, questions, or suggestions, please contact:
- **Dr. Montser AL_jodaei**

## Version History

### v1.0 (Initial Release)
- Complete exam platform with 50-question tests
- Comprehensive results dashboard
- Mistake review functionality
- CSV export feature
- Responsive design

---

**Last Updated**: March 2026
**Platform**: Web-based (HTML5/CSS3/JavaScript)
