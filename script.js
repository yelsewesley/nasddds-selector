// --- APPLICATION LOGIC ---

// A Set to keep track of selected question IDs for efficiency
let selectedQuestions = new Set();
let allPromptsData = []; // To cache the data after the first fetch

/**
 * Main function to fetch data (if needed) and render the accordion UI.
 * @param {string} [filterTerm=''] - An optional term to filter the questions.
 */
async function loadAndRenderPrompts(filterTerm = '') {
  // Fetch data only once and cache it
  if (allPromptsData.length === 0) {
    try {
      const response = await fetch('prompts.json');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      allPromptsData = await response.json();
    } catch (error) {
      console.error('Error fetching prompts data:', error);
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML += '<p style="color: red;">Error: Could not load questions. Please check the console for details.</p>';
      return;
    }
  }
  renderUI(filterTerm);
}

/**
 * Renders the UI based on the current data and filter term.
 * @param {string} filterTerm - The term to filter questions by.
 */
function renderUI(filterTerm = '') {
  const mainContent = document.getElementById('main-content');
  // Clear previous accordions but keep the instructions
  mainContent.querySelectorAll('.accordion, .no-results').forEach(el => el.remove());

  const filteredData = getFilteredData(allPromptsData, filterTerm.toLowerCase());

  if (filteredData.length === 0 && filterTerm) {
    const noResults = document.createElement('p');
    noResults.textContent = 'No questions match your filter.';
    noResults.className = 'no-results';
    mainContent.appendChild(noResults);
  }

  filteredData.forEach(sheet => {
    const details = document.createElement('details');
    details.className = 'accordion';
    if (filterTerm) details.open = true;

    const summary = document.createElement('summary');
    summary.className = 'accordion-header';
    summary.textContent = sheet.sheet;
    details.appendChild(summary);

    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.innerHTML = `<button class="select-all">Select All</button><button class="clear-all">Clear All</button>`;
    
    sheet.prompts.forEach(prompt => {
      const subgroup = document.createElement('div');
      subgroup.className = 'subgroup';
      subgroup.innerHTML = `<strong>${prompt.prompt}</strong>`;

      prompt.questions.forEach((question, index) => {
        // Create a unique and stable ID for each question
        const id = `${sheet.sheet.replace(/\s|&/g, '_')}_${prompt.prompt.replace(/\s|&/g, '_')}_${index}`;
        const div = document.createElement('div');
        const isChecked = selectedQuestions.has(id);
        
        div.innerHTML = `
          <input type="checkbox" id="${id}" data-id="${id}" ${isChecked ? 'checked' : ''}>
          <label for="${id}">${highlightText(question, filterTerm)}</label>
        `;
        subgroup.appendChild(div);
      });
      content.appendChild(subgroup);
    });
    details.appendChild(content);
    mainContent.appendChild(details);
  });

  updateSummary();
}

/**
 * Filters the data based on a search term.
 * @param {Array} data - The full dataset.
 * @param {string} term - The search term.
 * @returns {Array} The filtered data.
 */
function getFilteredData(data, term) {
  if (!term) return data;

  return data.map(sheet => {
    const filteredPrompts = sheet.prompts.map(prompt => {
      const filteredQuestions = prompt.questions.filter(q => q.toLowerCase().includes(term));
      if (filteredQuestions.length > 0) {
        return { ...prompt, questions: filteredQuestions };
      }
      return null;
    }).filter(Boolean);

    if (filteredPrompts.length > 0) {
      return { ...sheet, prompts: filteredPrompts };
    }
    return null;
  }).filter(Boolean);
}

/**
 * Clears all selections globally.
 */
function clearAllSelections() {
  selectedQuestions.clear();
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  updateSummary();
}

/**
 * Updates the summary sidebar with selected questions.
 */
function updateSummary() {
    const summaryTextArea = document.getElementById('summary');
    const groupedSelections = {};

    selectedQuestions.forEach(id => {
        const parts = id.split('_');
        const sheetName = parts[0].replace(/_/g, ' ');
        // Reconstruct prompt name which might contain underscores from being replaced
        const promptName = parts.slice(1, -1).join('_').replace(/_/g, ' ');
        const questionIndex = parseInt(parts[parts.length - 1], 10);

        const sheetData = allPromptsData.find(s => s.sheet === sheetName);
        const promptData = sheetData?.prompts.find(p => p.prompt === promptName);
        const questionText = promptData?.questions[questionIndex];

        if (questionText) {
            if (!groupedSelections[sheetData.sheet]) groupedSelections[sheetData.sheet] = {};
            if (!groupedSelections[sheetData.sheet][promptData.prompt]) groupedSelections[sheetData.sheet][promptData.prompt] = [];
            groupedSelections[sheetData.sheet][promptData.prompt].push(questionText);
        }
    });
    
    let summaryText = '';
    for (const sheet in groupedSelections) {
        summaryText += `--- ${sheet} ---\n`;
        for (const prompt in groupedSelections[sheet]) {
            summaryText += `  • ${prompt}\n`;
            groupedSelections[sheet][prompt].forEach(q => {
                summaryText += `     – ${q}\n`;
            });
            summaryText += '\n';
        }
    }

    summaryTextArea.value = summaryText.trim();
    // Auto-resize textarea
    summaryTextArea.style.height = 'auto';
    summaryTextArea.style.height = `${summaryTextArea.scrollHeight}px`;
    document.getElementById('counter').textContent = `${selectedQuestions.size} question${selectedQuestions.size === 1 ? '' : 's'} selected`;
}

/**
 * Wraps matching text in a span for highlighting.
 * @param {string} text - The text to search within.
 * @param {string} term - The term to highlight.
 * @returns {string} HTML string with highlighted term.
 */
function highlightText(text, term) {
    if (!term) return text;
    // Escape special characters in the term for the RegExp
    const escapedTerm = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * Exports the summary as a .txt file.
 */
function exportText() {
  const text = document.getElementById('summary').value;
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'selected_questions.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

/**
 * Exports the summary as a .doc file.
 */
function exportDoc() {
  const content = document.getElementById('summary').value.replace(/\n/g, '<br>');
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${content}</body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'selected_questions.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// --- INITIALIZATION AND EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
  loadAndRenderPrompts(); // Initial render

  // Attach listeners to static elements
  const filterInput = document.getElementById('filterInput');
  filterInput.addEventListener('input', () => renderUI(filterInput.value));
  document.getElementById('exportTextBtn').addEventListener('click', exportText);
  document.getElementById('exportDocBtn').addEventListener('click', exportDoc);
  document.getElementById('clearAllGlobal').addEventListener('click', clearAllSelections);

  // Use event delegation for dynamically created elements
  const mainContent = document.getElementById('main-content');
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
});
