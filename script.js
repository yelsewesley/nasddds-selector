// — DIAGNOSTIC VERSION —
console.log(‘Script loading…’);

// A Set to keep track of selected question IDs for efficiency
let selectedQuestions = new Set();
let allPromptsData = []; // To cache the data after the first fetch

/**

- Main function to fetch data (if needed) and render the accordion UI.
- @param {string} [filterTerm=’’] - An optional term to filter the questions.
  */
  async function loadAndRenderPrompts(filterTerm = ‘’) {
  console.log(‘loadAndRenderPrompts called with filterTerm:’, filterTerm);

// Fetch data only once and cache it
if (allPromptsData.length === 0) {
console.log(‘Fetching prompts.json…’);
try {
const response = await fetch(‘prompts.json’);
console.log(‘Fetch response:’, response);
if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
allPromptsData = await response.json();
console.log(‘Data loaded successfully:’, allPromptsData);
} catch (error) {
console.error(‘Error fetching prompts data:’, error);
const mainContent = document.getElementById(‘main-content’);
if (mainContent) {
mainContent.innerHTML += ‘<p style="color: red;">Error: Could not load questions. Please check the console for details.</p>’;
} else {
console.error(‘main-content element not found!’);
}
return;
}
}
renderUI(filterTerm);
}

/**

- Renders the UI based on the current data and filter term.
- @param {string} filterTerm - The term to filter questions by.
  */
  function renderUI(filterTerm = ‘’) {
  console.log(‘renderUI called with filterTerm:’, filterTerm);
  const mainContent = document.getElementById(‘main-content’);

if (!mainContent) {
console.error(‘main-content element not found!’);
return;
}

// Clear previous accordions but keep the instructions
mainContent.querySelectorAll(’.accordion, .no-results’).forEach(el => el.remove());

const filteredData = getFilteredData(allPromptsData, filterTerm.toLowerCase());
console.log(‘Filtered data:’, filteredData);

if (filteredData.length === 0 && filterTerm) {
const noResults = document.createElement(‘p’);
noResults.textContent = ‘No questions match your filter.’;
noResults.className = ‘no-results’;
mainContent.appendChild(noResults);
return;
}

if (filteredData.length === 0) {
console.log(‘No data to render’);
return;
}

filteredData.forEach((sheet, sheetIndex) => {
console.log(`Rendering sheet ${sheetIndex}:`, sheet.sheet);
const details = document.createElement(‘details’);
details.className = ‘accordion’;
if (filterTerm) details.open = true;

```
const summary = document.createElement('summary');
summary.className = 'accordion-header';
summary.textContent = sheet.sheet;
details.appendChild(summary);

const content = document.createElement('div');
content.className = 'accordion-content';
content.innerHTML = `<button class="select-all">Select All</button><button class="clear-all">Clear All</button>`;

sheet.prompts.forEach((prompt, promptIndex) => {
  console.log(`  Rendering prompt ${promptIndex}:`, prompt.prompt);
  const subgroup = document.createElement('div');
  subgroup.className = 'subgroup';
  subgroup.innerHTML = `<strong>${prompt.prompt}</strong>`;

  prompt.questions.forEach((question, index) => {
    const id = `${sheet.sheet.replace(/\s|&/g, '_')}_${prompt.prompt.replace(/\s|&/g, '_')}_${index}`;
    const div = document.createElement('div');
    const isChecked = selectedQuestions.has(id);
    
    div.innerHTML = `
      <input type="checkbox" id="${id}" data-id="${id}" data-sheet="${sheet.sheet}" data-prompt="${prompt.prompt}" data-index="${index}" ${isChecked ? 'checked' : ''}>
      <label for="${id}">${highlightText(question, filterTerm)}</label>
    `;
    subgroup.appendChild(div);
  });
  content.appendChild(subgroup);
});
details.appendChild(content);
mainContent.appendChild(details);
```

});

console.log(‘Rendering complete, calling updateSummary’);
updateSummary();
}

/**

- Filters the data based on a search term.
- @param {Array} data - The full dataset.
- @param {string} term - The search term.
- @returns {Array} The filtered data.
  */
  function getFilteredData(data, term) {
  if (!term) return data;

return data.map(sheet => {
const filteredPrompts = sheet.prompts.map(prompt => {
const filteredQuestions = prompt.questions.filter(q => q.toLowerCase().includes(term));
if (filteredQuestions.length > 0) {
return { …prompt, questions: filteredQuestions };
}
return null;
}).filter(Boolean);

```
if (filteredPrompts.length > 0) {
  return { ...sheet, prompts: filteredPrompts };
}
return null;
```

}).filter(Boolean);
}

/**

- Clears all selections globally.
  */
  function clearAllSelections() {
  console.log(‘Clearing all selections’);
  selectedQuestions.clear();
  document.querySelectorAll(‘input[type=“checkbox”]’).forEach(cb => cb.checked = false);
  updateSummary();
  }

/**

- Updates the summary sidebar with selected questions.
  */
  function updateSummary() {
  console.log(‘updateSummary called’);
  const summaryTextArea = document.getElementById(‘summary’);
  if (!summaryTextArea) {
  console.error(‘summary element not found!’);
  return;
  }
  
  const groupedSelections = {};
  
  selectedQuestions.forEach(id => {
  // Find the checkbox element to get the data attributes
  const checkbox = document.querySelector(`input[data-id="${id}"]`);
  if (!checkbox) return;
  
  ```
   const sheetName = checkbox.dataset.sheet;
   const promptName = checkbox.dataset.prompt;
   const questionIndex = parseInt(checkbox.dataset.index, 10);
  
   // Find the actual question text from the data
   const sheetData = allPromptsData.find(s => s.sheet === sheetName);
   const promptData = sheetData?.prompts.find(p => p.prompt === promptName);
   const questionText = promptData?.questions[questionIndex];
  
   if (questionText) {
       if (!groupedSelections[sheetName]) groupedSelections[sheetName] = {};
       if (!groupedSelections[sheetName][promptName]) groupedSelections[sheetName][promptName] = [];
       groupedSelections[sheetName][promptName].push(questionText);
   }
  ```
  
  });
  
  let summaryText = ‘’;
  for (const sheet in groupedSelections) {
  summaryText += `--- ${sheet} ---\n`;
  for (const prompt in groupedSelections[sheet]) {
  summaryText += `  * ${prompt}\n`;
  groupedSelections[sheet][prompt].forEach(q => {
  // Clean the question text to replace Unicode characters
  const cleanQuestion = q
  .replace(/•/g, ‘*’)
  .replace(/–/g, ‘-’)
  .replace(/—/g, ‘-’)
  .replace(/’/g, “’”)
  .replace(/”/g, ‘”’)
  .replace(/”/g, ‘”’);
  summaryText += `     - ${cleanQuestion}\n`;
  });
  summaryText += ‘\n’;
  }
  }
  
  summaryTextArea.value = summaryText.trim();
  summaryTextArea.style.height = ‘auto’;
  summaryTextArea.style.height = `${summaryTextArea.scrollHeight}px`;
  
  const counter = document.getElementById(‘counter’);
  if (counter) {
  counter.textContent = `${selectedQuestions.size} question${selectedQuestions.size === 1 ? '' : 's'} selected`;
  }
  }

/**

- Wraps matching text in a span for highlighting.
- @param {string} text - The text to search within.
- @param {string} term - The term to highlight.
- @returns {string} HTML string with highlighted term.
  */
  function highlightText(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, ‘gi’);
  return text.replace(regex, ‘<span class="highlight">$1</span>’);
  }

/**

- Exports the summary as a .txt file.
  */
  function exportText() {
  console.log(‘exportText called’);
  const text = document.getElementById(‘summary’).value;
  const element = document.createElement(‘a’);
  const file = new Blob([text], {type: ‘text/plain’});
  element.href = URL.createObjectURL(file);
  element.download = ‘selected_questions.txt’;
  element.style.display = ‘none’;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  }

/**

- Exports the summary as an HTML file that can be opened in Word.
  */
  function exportDoc() {
  console.log(‘exportDoc called’);
  const text = document.getElementById(‘summary’).value;

// Create simple HTML that Word can handle
const htmlLines = text.split(’\n’).map(line => {
if (line.startsWith(’— ‘) && line.endsWith(’ —’)) {
return `<h2>${line}</h2>`;
} else if (line.trim().startsWith(’*’)) {
return `<p style="margin-left: 20px;"><strong>${line.trim()}</strong></p>`;
} else if (line.trim().startsWith(’-’)) {
return `<p style="margin-left: 40px;">${line.trim()}</p>`;
} else if (line.trim() === ‘’) {
return ‘<br>’;
} else {
return `<p>${line}</p>`;
}
}).join(’\n’);

const htmlContent = `<!DOCTYPE html>

<html>
<head>
<meta charset="UTF-8">
<title>Selected Questions</title>
</head>
<body>
<h1>Selected Questions</h1>
${htmlLines}
</body>
</html>`;

const element = document.createElement(‘a’);
const file = new Blob([htmlContent], {type: ‘text/html’});
element.href = URL.createObjectURL(file);
element.download = ‘selected_questions.html’;
element.style.display = ‘none’;
document.body.appendChild(element);
element.click();
document.body.removeChild(element);
}

// — INITIALIZATION AND EVENT LISTENERS —
document.addEventListener(‘DOMContentLoaded’, () => {
console.log(‘DOM loaded, initializing…’);

// Check if required elements exist
const requiredElements = [‘main-content’, ‘filterInput’, ‘summary’, ‘counter’];
requiredElements.forEach(id => {
const element = document.getElementById(id);
if (element) {
console.log(`✓ Found element: ${id}`);
} else {
console.error(`✗ Missing element: ${id}`);
}
});

loadAndRenderPrompts(); // Initial render

// Attach listeners to static elements
const filterInput = document.getElementById(‘filterInput’);
if (filterInput) {
filterInput.addEventListener(‘input’, () => {
console.log(‘Filter input changed:’, filterInput.value);
renderUI(filterInput.value);
});
}

const exportTextBtn = document.getElementById(‘exportTextBtn’);
if (exportTextBtn) {
exportTextBtn.addEventListener(‘click’, exportText);
}

const exportDocBtn = document.getElementById(‘exportDocBtn’);
if (exportDocBtn) {
exportDocBtn.addEventListener(‘click’, exportDoc);
}

const clearAllGlobal = document.getElementById(‘clearAllGlobal’);
if (clearAllGlobal) {
clearAllGlobal.addEventListener(‘click’, clearAllSelections);
}

// Use event delegation for dynamically created elements
const mainContent = document.getElementById(‘main-content’);
if (mainContent) {
mainContent.addEventListener(‘click’, e => {
const target = e.target;
const accordion = target.closest(’.accordion’);
if (!accordion) return;

```
  const checkboxes = accordion.querySelectorAll('input[type="checkbox"]');
  if (target.classList.contains('select-all')) {
    console.log('Select all clicked');
    checkboxes.forEach(cb => {
      if (!cb.checked) {
          cb.checked = true;
          selectedQuestions.add(cb.dataset.id);
      }
    });
    updateSummary();
  }
  if (target.classList.contains('clear-all')) {
    console.log('Clear all clicked');
    checkboxes.forEach(cb => {
      if (cb.checked) {
          cb.checked = false;
          selectedQuestions.delete(cb.dataset.id);
      }
    });
    updateSummary();
  }
});

mainContent.addEventListener('change', e => {
  if (e.target.matches('input[type="checkbox"]')) {
    const id = e.target.dataset.id;
    console.log('Checkbox changed:', id, 'checked:', e.target.checked);
    if (e.target.checked) {
      selectedQuestions.add(id);
    } else {
      selectedQuestions.delete(id);
    }
    updateSummary();
  }
});
```

}

console.log(‘Initialization complete’);
});