// Debug version with enhanced error handling and console logging

// A Set to keep track of selected question IDs for efficiency
let selectedQuestions = new Set();
let allPromptsData = []; // To cache the data after the first fetch

/**

- Main function to fetch data (if needed) and render the accordion UI.
- @param {string} [filterTerm=’’] - An optional term to filter the questions.
  */
  async function loadAndRenderPrompts(filterTerm = ‘’) {
  console.log(‘Starting loadAndRenderPrompts…’);
  
  // Fetch data only once and cache it
  if (allPromptsData.length === 0) {
  try {
  console.log(‘Fetching prompts.json…’);
  const response = await fetch(‘prompts.json’);
  console.log(‘Response status:’, response.status);
  console.log(‘Response headers:’, response.headers.get(‘content-type’));
  
  ```
       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
       
       const text = await response.text();
       console.log('Raw response (first 200 chars):', text.substring(0, 200));
       
       // Parse the JSON
       allPromptsData = JSON.parse(text);
       console.log('Successfully parsed JSON. Number of sheets:', allPromptsData.length);
       console.log('First sheet:', allPromptsData[0]);
       
   } catch (error) {
       console.error('Error fetching prompts data:', error);
       console.error('Error details:', error.message);
       
       const mainContent = document.getElementById('main-content');
       if (mainContent) {
           // Add visible error message
           const errorDiv = document.createElement('div');
           errorDiv.style.cssText = 'background: #fee; border: 1px solid #c00; padding: 20px; margin: 20px 0; border-radius: 4px;';
           errorDiv.innerHTML = `
               <h3 style="color: #c00; margin-top: 0;">Error Loading Data</h3>
               <p>Could not load prompts.json: ${error.message}</p>
               <p>Check the browser console for more details.</p>
               <p>Loading sample data instead...</p>
           `;
           mainContent.appendChild(errorDiv);
       }
       
       // Load sample data
       allPromptsData = getSampleData();
       console.log('Loaded sample data instead');
   }
  ```
  
  }
  
  renderUI(filterTerm);
  }

/**

- Sample data for testing when prompts.json is not available
  */
  function getSampleData() {
  return [
  {
  “sheet”: “Employment First Policies”,
  “prompts”: [
  {
  “prompt”: “Policy Development”,
  “questions”: [
  “What are the key components of an Employment First policy?”,
  “How can states align policies with CMS HCBS Final Rule?”,
  “What role do state agencies play in implementation?”
  ]
  },
  {
  “prompt”: “Implementation Strategies”,
  “questions”: [
  “What are effective strategies for provider transformation?”,
  “How can we measure Employment First outcomes?”,
  “What technical assistance is available through SELN?”
  ]
  }
  ]
  },
  {
  “sheet”: “Data & Outcomes”,
  “prompts”: [
  {
  “prompt”: “Data Collection”,
  “questions”: [
  “What data should states collect on employment outcomes?”,
  “How can we improve data quality and consistency?”,
  “What are best practices for data sharing across systems?”
  ]
  }
  ]
  }
  ];
  }

/**

- Renders the UI based on the current data and filter term.
- @param {string} filterTerm - The term to filter questions by.
  */
  function renderUI(filterTerm = ‘’) {
  console.log(‘Starting renderUI with filter term:’, filterTerm);
  
  const mainContent = document.getElementById(‘main-content’);
  if (!mainContent) {
  console.error(‘Could not find main-content element!’);
  return;
  }
  
  // Clear previous accordions but keep other content
  const toRemove = mainContent.querySelectorAll(’.accordion, .no-results’);
  console.log(‘Removing’, toRemove.length, ‘existing elements’);
  toRemove.forEach(el => el.remove());
  
  const filteredData = getFilteredData(allPromptsData, filterTerm.toLowerCase());
  console.log(‘Filtered data contains’, filteredData.length, ‘sheets’);
  
  if (filteredData.length === 0 && filterTerm) {
  const noResults = document.createElement(‘p’);
  noResults.textContent = ‘No questions match your filter.’;
  noResults.className = ‘no-results’;
  mainContent.appendChild(noResults);
  }
  
  filteredData.forEach((sheet, sheetIndex) => {
  console.log(`Creating accordion for sheet ${sheetIndex}: ${sheet.sheet}`);
  
  ```
   const details = document.createElement('details');
   details.className = 'accordion';
   if (filterTerm) details.open = true;
  
   const summary = document.createElement('summary');
   summary.className = 'accordion-header';
   summary.textContent = sheet.sheet;
   details.appendChild(summary);
  
   const content = document.createElement('div');
   content.className = 'accordion-content';
   
   // Add control buttons
   const buttonHtml = '<button class="select-all">Select All</button><button class="clear-all">Clear All</button>';
   content.insertAdjacentHTML('afterbegin', buttonHtml);
  
   sheet.prompts.forEach((prompt, promptIndex) => {
       console.log(`  Creating subgroup ${promptIndex}: ${prompt.prompt}`);
       
       const subgroup = document.createElement('div');
       subgroup.className = 'subgroup';
       
       const strong = document.createElement('strong');
       strong.textContent = prompt.prompt;
       subgroup.appendChild(strong);
  
       prompt.questions.forEach((question, index) => {
           const id = `${sheet.sheet.replace(/\s|&/g, '_')}_${prompt.prompt.replace(/\s|&/g, '_')}_${index}`;
           const div = document.createElement('div');
           const isChecked = selectedQuestions.has(id);
           
           const checkbox = document.createElement('input');
           checkbox.type = 'checkbox';
           checkbox.id = id;
           checkbox.dataset.id = id;
           checkbox.dataset.sheet = sheet.sheet;
           checkbox.dataset.prompt = prompt.prompt;
           checkbox.dataset.index = index;
           checkbox.checked = isChecked;
           
           const label = document.createElement('label');
           label.htmlFor = id;
           label.innerHTML = highlightText(question, filterTerm);
           
           div.appendChild(checkbox);
           div.appendChild(label);
           subgroup.appendChild(div);
       });
       
       content.appendChild(subgroup);
   });
   
   details.appendChild(content);
   mainContent.appendChild(details);
  ```
  
  });
  
  console.log(‘Finished rendering accordions’);
  updateSummary();
  }

/**

- Filters the data based on a search term.
  */
  function getFilteredData(data, term) {
  if (!term) return data;
  
  return data.map(sheet => {
  const filteredPrompts = sheet.prompts.map(prompt => {
  const filteredQuestions = prompt.questions.filter(q =>
  q.toLowerCase().includes(term)
  );
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

- Other functions remain the same…
  */
  function clearAllSelections() {
  selectedQuestions.clear();
  document.querySelectorAll(‘input[type=“checkbox”]’).forEach(cb => cb.checked = false);
  updateSummary();
  }

function updateSummary() {
const summaryTextArea = document.getElementById(‘summary’);
if (!summaryTextArea) {
console.error(‘Summary textarea not found!’);
return;
}

```
const groupedSelections = {};

selectedQuestions.forEach(id => {
    const checkbox = document.querySelector(`input[data-id="${id}"]`);
    if (!checkbox) return;
    
    const sheetName = checkbox.dataset.sheet;
    const promptName = checkbox.dataset.prompt;
    const questionIndex = parseInt(checkbox.dataset.index, 10);
    
    const sheetData = allPromptsData.find(s => s.sheet === sheetName);
    const promptData = sheetData?.prompts.find(p => p.prompt === promptName);
    const questionText = promptData?.questions[questionIndex];
    
    if (questionText) {
        if (!groupedSelections[sheetName]) groupedSelections[sheetName] = {};
        if (!groupedSelections[sheetName][promptName]) groupedSelections[sheetName][promptName] = [];
        groupedSelections[sheetName][promptName].push(questionText);
    }
});

let summaryText = '';
for (const sheet in groupedSelections) {
    summaryText += `--- ${sheet} ---\n`;
    for (const prompt in groupedSelections[sheet]) {
        summaryText += `  * ${prompt}\n`;
        groupedSelections[sheet][prompt].forEach(q => {
            const cleanQuestion = q
                .replace(/•/g, '*')
                .replace(/–/g, '-')
                .replace(/—/g, '-')
                .replace(/'/g, "'")
                .replace(/"/g, '"')
                .replace(/"/g, '"');
            summaryText += `     - ${cleanQuestion}\n`;
        });
        summaryText += '\n';
    }
}

summaryTextArea.value = summaryText.trim();
summaryTextArea.style.height = 'auto';
summaryTextArea.style.height = `${summaryTextArea.scrollHeight}px`;

const counter = document.getElementById('counter');
if (counter) {
    counter.textContent = `${selectedQuestions.size} question${selectedQuestions.size === 1 ? '' : 's'} selected`;
}
```

}

function highlightText(text, term) {
if (!term) return text;
const regex = new RegExp(`(${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, ‘gi’);
return text.replace(regex, ‘<span class="highlight">$1</span>’);
}

function exportText() {
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

function exportDoc() {
const text = document.getElementById(‘summary’).value;

```
const htmlLines = text.split('\n').map(line => {
    if (line.startsWith('---') && line.endsWith('---')) {
        return `<h2>${line}</h2>`;
    } else if (line.trim().startsWith('*')) {
        return `<p style="margin-left: 20px;"><strong>${line.trim()}</strong></p>`;
    } else if (line.trim().startsWith('-')) {
        return `<p style="margin-left: 40px;">${line.trim()}</p>`;
    } else if (line.trim() === '') {
        return '<br>';
    } else {
        return `<p>${line}</p>`;
    }
}).join('\n');

const htmlContent = `<!DOCTYPE html>
```

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

```
const element = document.createElement('a');
const file = new Blob([htmlContent], {type: 'text/html'});
element.href = URL.createObjectURL(file);
element.download = 'selected_questions.html';
element.style.display = 'none';
document.body.appendChild(element);
element.click();
document.body.removeChild(element);
```

}

// — INITIALIZATION AND EVENT LISTENERS —
document.addEventListener(‘DOMContentLoaded’, () => {
console.log(‘DOM loaded, initializing…’);

```
// Check if required elements exist
const requiredElements = ['main-content', 'filterInput', 'exportTextBtn', 'exportDocBtn', 'clearAllGlobal', 'summary'];
const missingElements = requiredElements.filter(id => !document.getElementById(id));

if (missingElements.length > 0) {
    console.error('Missing required elements:', missingElements);
}

loadAndRenderPrompts(); // Initial render

// Attach listeners to static elements
const filterInput = document.getElementById('filterInput');
if (filterInput) {
    filterInput.addEventListener('input', () => renderUI(filterInput.value));
}

const exportTextBtn = document.getElementById('exportTextBtn');
if (exportTextBtn) {
    exportTextBtn.addEventListener('click', exportText);
}

const exportDocBtn = document.getElementById('exportDocBtn');
if (exportDocBtn) {
    exportDocBtn.addEventListener('click', exportDoc);
}

const clearAllGlobal = document.getElementById('clearAllGlobal');
if (clearAllGlobal) {
    clearAllGlobal.addEventListener('click', clearAllSelections);
}

// Use event delegation for dynamically created elements
const mainContent = document.getElementById('main-content');
if (mainContent) {
    mainContent.addEventListener('click', e => {
        const target = e.target;
        const accordion = target.closest('.accordion');
        if (!accordion) return;

        const checkboxes = accordion.querySelectorAll('input[type="checkbox"]');
        if (target.classList.contains('select-all')) {
            checkboxes.forEach(cb => {
                if (!cb.checked) {
                    cb.checked = true;
                    selectedQuestions.add(cb.dataset.id);
                }
            });
            updateSummary();
        }
        if (target.classList.contains('clear-all')) {
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
            if (e.target.checked) {
                selectedQuestions.add(id);
            } else {
                selectedQuestions.delete(id);
            }
            updateSummary();
        }
    });
}

console.log('Initialization complete');
```

});