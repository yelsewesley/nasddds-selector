<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SELN Prompt Selector</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 20px;
        }
        .main-content {
            flex: 2;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .sidebar {
            flex: 1;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            position: sticky;
            top: 20px;
            height: fit-content;
        }
        .accordion {
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
        }
        .accordion-header {
            background: #f0f0f0;
            padding: 15px;
            cursor: pointer;
            font-weight: bold;
            list-style: none;
        }
        .accordion-header:hover {
            background: #e0e0e0;
        }
        .accordion-content {
            padding: 15px;
            background: white;
        }
        .subgroup {
            margin-bottom: 20px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .subgroup strong {
            display: block;
            margin-bottom: 10px;
            color: #333;
        }
        .subgroup div {
            margin: 5px 0;
            padding-left: 20px;
        }
        input[type="checkbox"] {
            margin-right: 8px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        button:hover {
            background: #0056b3;
        }
        .select-all, .clear-all {
            background: #6c757d;
            font-size: 14px;
            padding: 6px 12px;
        }
        .select-all:hover, .clear-all:hover {
            background: #5a6268;
        }
        #filterInput {
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        #summary {
            width: 100%;
            min-height: 200px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            resize: vertical;
        }
        .highlight {
            background-color: yellow;
            font-weight: bold;
        }
        .no-results {
            color: #666;
            font-style: italic;
            padding: 20px;
            text-align: center;
        }
        #counter {
            font-weight: bold;
            color: #007bff;
            margin: 10px 0;
        }
        .instructions {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .instructions h2 {
            margin-top: 0;
            color: #1976d2;
        }
        .instructions p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="main-content" id="main-content">
            <div class="instructions">
                <h2>SELN Prompt Selector</h2>
                <p>1. Browse questions by category below</p>
                <p>2. Check the boxes next to questions you want to include</p>
                <p>3. Use the filter to search for specific topics</p>
                <p>4. Your selections appear in the sidebar</p>
                <p>5. Export your selections as text or HTML when ready</p>
            </div>
            <input type="text" id="filterInput" placeholder="Filter questions...">
            <!-- Accordions will be dynamically inserted here -->
        </div>
        <div class="sidebar">
            <h3>Selected Questions</h3>
            <div id="counter">0 questions selected</div>
            <button id="exportTextBtn">Export as Text</button>
            <button id="exportDocBtn">Export as HTML</button>
            <button id="clearAllGlobal">Clear All</button>
            <textarea id="summary" readonly placeholder="Selected questions will appear here..."></textarea>
        </div>
    </div>

```
<script>
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
                console.log('Data loaded successfully:', allPromptsData.length, 'sheets');
            } catch (error) {
                console.error('Error fetching prompts data:', error);
                // Try with a sample data structure for testing
                allPromptsData = getSampleData();
                console.log('Using sample data for testing');
            }
        }
        renderUI(filterTerm);
    }

    /**
     * Sample data for testing when prompts.json is not available
     */
    function getSampleData() {
        return [
            {
                sheet: "Employment First",
                prompts: [
                    {
                        prompt: "Policy Development",
                        questions: [
                            "What are the key components of an Employment First policy?",
                            "How can states align their policies with CMS guidance?",
                            "What role do state agencies play in implementation?"
                        ]
                    },
                    {
                        prompt: "Implementation Strategies",
                        questions: [
                            "What are effective strategies for provider transformation?",
                            "How can we measure Employment First outcomes?",
                            "What technical assistance is available?"
                        ]
                    }
                ]
            },
            {
                sheet: "Data & Outcomes",
                prompts: [
                    {
                        prompt: "Data Collection",
                        questions: [
                            "What data should states collect on employment outcomes?",
                            "How can we improve data quality and consistency?",
                            "What are best practices for data sharing?"
                        ]
                    }
                ]
            }
        ];
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
            
            // Add control buttons
            const controlsDiv = document.createElement('div');
            controlsDiv.innerHTML = `<button class="select-all">Select All</button><button class="clear-all">Clear All</button>`;
            content.appendChild(controlsDiv);

            sheet.prompts.forEach(prompt => {
                const subgroup = document.createElement('div');
                subgroup.className = 'subgroup';
                subgroup.innerHTML = `<strong>${prompt.prompt}</strong>`;

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
            // Find the checkbox element to get the data attributes
            const checkbox = document.querySelector(`input[data-id="${id}"]`);
            if (!checkbox) return;
            
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
        });
        
        let summaryText = '';
        for (const sheet in groupedSelections) {
            summaryText += `--- ${sheet} ---\n`;
            for (const prompt in groupedSelections[sheet]) {
                summaryText += `  * ${prompt}\n`;
                groupedSelections[sheet][prompt].forEach(q => {
                    // Clean the question text to replace Unicode characters
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
        const regex = new RegExp(`(${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    /**
     * Exports the summary as a .txt file.
     */
    function exportText() {
        const text = document.getElementById('summary').value;
        const element = document.createElement('a');
        const file = new Blob([text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = 'selected_questions.txt';
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * Exports the summary as an HTML file that can be opened in Word.
     */
    function exportDoc() {
        const text = document.getElementById('summary').value;

        // Create simple HTML that Word can handle
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
</script>
```

</body>
</html>