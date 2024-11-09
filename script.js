let currentPage = 1;
let allLines = [];
let fileName = '';
const rowsPerPage = 200;

document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('prevPageBtn').addEventListener('click', () => changePage(-1));
document.getElementById('nextPageBtn').addEventListener('click', () => changePage(1));

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        fileName = file.name;
        const formData = new FormData();
        formData.append('file', file);

        fetch('upload.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadFile(data.content);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function loadFile(content) {
    allLines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(line => {
            const parts = line.split(/\s+/);
            const word = parts[0];
            const annotation = parts.length > 1 ? parts[parts.length - 1] : 'O';
            return { word, annotation };
        });

    currentPage = 1;
    displayEntries();
    updatePagination();
    updateTotalCount();
}

function displayEntries() {
    const form = document.getElementById('annotationForm');
    form.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    for (let i = startIndex; i < endIndex && i < allLines.length; i++) {
        const { word, annotation } = allLines[i];
        const row = document.createElement('div');
        row.className = 'form-row';
        row.innerHTML = `
            <input type="text" class="text-box" value="${word}" readonly disabled>
            <select class="dropdown">
                <option value="O" ${annotation === 'O' ? 'selected' : ''}>O</option>
                <option value="B-PER" ${annotation === 'B-PER' ? 'selected' : ''}>B-PER</option>
                <option value="I-PER" ${annotation === 'I-PER' ? 'selected' : ''}>I-PER</option>
                <option value="B-LOC" ${annotation === 'B-LOC' ? 'selected' : ''}>B-LOC</option>
                <option value="I-LOC" ${annotation === 'I-LOC' ? 'selected' : ''}>I-LOC</option>
                <option value="B-ORG" ${annotation === 'B-ORG' ? 'selected' : ''}>B-ORG</option>
                <option value="I-ORG" ${annotation === 'I-ORG' ? 'selected' : ''}>I-ORG</option>
                <option value="B-DATE" ${annotation === 'B-DATE' ? 'selected' : ''}>B-DATE</option>
                <option value="I-DATE" ${annotation === 'I-DATE' ? 'selected' : ''}>I-DATE</option>
                <option value="B-MISC" ${annotation === 'B-MISC' ? 'selected' : ''}>B-MISC</option>
                <option value="I-MISC" ${annotation === 'I-MISC' ? 'selected' : ''}>I-MISC</option>
            </select>
        `;

        const dropdown = row.querySelector('.dropdown');
        dropdown.addEventListener('change', saveCurrentAnnotations);
        form.appendChild(row);
    }

    // Bind keydown event at the form level to listen for key presses
    form.addEventListener('keydown', (event) => {
        const keyMap = {
            '1': 1, // B-PER
            '2': 2, // I-PER
            '3': 3, // B-LOC
            '4': 4, // I-LOC
            '5': 5, // B-ORG
            '6': 6, // I-ORG
            '7': 7, // B-DATE
            '8': 8, // I-DATE
            '9': 9, // B-MISC
            '0': 10 // I-MISC
        };

        // Only update if a dropdown is currently focused
        const activeDropdown = document.activeElement;
        if (activeDropdown && activeDropdown.classList.contains('dropdown')) {
            const optionIndex = keyMap[event.key];
            if (optionIndex !== undefined) {
                activeDropdown.selectedIndex = optionIndex;
                activeDropdown.dispatchEvent(new Event('change')); // Trigger the change event
                event.preventDefault();
            }
        }
    });
}



function changePage(delta) {
    saveCurrentAnnotations();
    currentPage += delta;
    const totalPages = Math.ceil(allLines.length / rowsPerPage);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    displayEntries();
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(allLines.length / rowsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
}

function updateTotalCount() {
    document.getElementById('totalCount').textContent = `Total rows: ${allLines.length}`;
}

function saveCurrentAnnotations() {
    const rows = document.querySelectorAll('.form-row');
    const startIndex = (currentPage - 1) * rowsPerPage;

    rows.forEach((row, index) => {
        const word = row.querySelector('.text-box').value;
        const annotation = row.querySelector('.dropdown').value;
        allLines[startIndex + index] = { word, annotation };
    });

    const content = allLines.map(line => `${line.word} ${line.annotation}`).join('\n');
    
    fetch('save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: fileName, content: content })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Error saving: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

function saveAnnotations() {
    saveCurrentAnnotations();
}
