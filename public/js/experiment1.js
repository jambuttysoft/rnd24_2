class CSVExperiment {
    constructor() {
        this.companies = [];
        this.processedCount = 0;
        this.duplicateCount = 0;
        this.currentIndex = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.seenTINs = new Map();
        this.duplicatesData = [];
        
        this.initializeElements();
        this.bindEvents();
        this.loadCSVData();
    }
    
    initializeElements() {
        this.startBtn = document.getElementById('startExperiment');
        this.stopBtn = document.getElementById('stopExperiment');
        this.resetBtn = document.getElementById('resetExperiment');
        this.statusElement = document.getElementById('experimentStatus');
        this.processedCountElement = document.getElementById('processed-count');
        this.duplicateCountElement = document.getElementById('duplicates-count');
        this.currentRowElement = document.getElementById('current-row');
        this.uniqueTableBody = document.getElementById('unique-table-body');
        this.duplicatesTableBody = document.getElementById('duplicates-table-body');
        this.csvFileInput = document.getElementById('csvFileInput');
        this.loadCustomFileBtn = document.getElementById('loadCustomFile');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startExperiment());
        this.stopBtn.addEventListener('click', () => this.stopExperiment());
        this.resetBtn.addEventListener('click', () => this.resetExperiment());
        this.csvFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.loadCustomFileBtn.addEventListener('click', () => this.loadCustomFile());
    }
    
    async loadCSVData() {
        try {
            const response = await fetch('/api/companies?t=' + Date.now());
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let companies = await response.json();
            
            // Filter out header rows that might have been included
            companies = companies.filter(company => {
                // Skip if this looks like a header row
                if (company.tin === 'TIN' || company.name === 'NAME' || company.address === 'ADDRESS') {
                    console.log('Filtering out header row:', company);
                    return false;
                }
                return true;
            });
            
            this.companies = companies;
            console.log('Loaded companies from API:', this.companies.length);
            console.log('First 3 companies:', this.companies.slice(0, 3));
        } catch (error) {
            console.error('Error loading CSV data:', error);
            this.updateStatus('Error loading data');
        }
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            this.loadCustomFileBtn.disabled = false;
        } else {
            this.loadCustomFileBtn.disabled = true;
            if (file) {
                alert('Please select a CSV file.');
            }
        }
    }
    
    loadCustomFile() {
        const file = this.csvFileInput.files[0];
        if (!file) {
            alert('Please select a file first.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCustomCSV(e.target.result);
                this.resetExperiment();
                alert(`Loaded ${this.companies.length} companies from custom file.`);
            } catch (error) {
                console.error('Error parsing custom CSV:', error);
                alert('Error parsing CSV file. Please check the format.');
            }
        };
        reader.readAsText(file);
    }
    
    parseCustomCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        this.companies = [];
        
        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = this.parseCSVLine(line);
            
            // Handle different CSV formats
            if (values.length >= 4) {
                // Format: ID,TIN,NAME,ADDRESS - we want TIN (index 1)
                const [id, tin, name, address] = values;
                if (tin && name) {
                    this.companies.push({ 
                        tin: tin.trim(), 
                        name: name.trim(), 
                        address: address.trim() || '' 
                    });
                }
            } else if (values.length >= 3) {
                // Fallback for files without ID column: TIN,NAME,ADDRESS
                const [tin, name, address] = values;
                if (tin && name) {
                    this.companies.push({ 
                        tin: tin.trim(), 
                        name: name.trim(), 
                        address: address.trim() || '' 
                    });
                }
            }
        }
        
        console.log('Loaded custom companies:', this.companies.length);
    }
    
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }
    
    cleanTIN(tin) {
        // Remove all non-alphanumeric characters for comparison
        return tin.replace(/[^a-zA-Z0-9]/g, '');
    }
    
    async startExperiment() {
        if (this.companies.length === 0) {
            alert('No data loaded. Please wait for data to load or upload a CSV file.');
            return;
        }
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.updateStatus('Running...');
        
        this.intervalId = setInterval(() => {
            this.processNextRow();
        }, 100); // Process one row every 100ms
    }
    
    stopExperiment() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.updateStatus('Stopped');
        this.currentRowElement.textContent = 'Experiment stopped';
    }
    
    resetExperiment() {
        this.stopExperiment();
        
        this.processedCount = 0;
        this.duplicateCount = 0;
        this.currentIndex = 0;
        this.seenTINs.clear();
        this.duplicatesData = [];
        
        this.updateProcessedCount(0);
        this.updateDuplicateCount(0);
        this.updateStatus('Ready to start');
        this.currentRowElement.textContent = 'Waiting for start...';
        
        // Clear tables
        this.uniqueTableBody.innerHTML = '';
        this.duplicatesTableBody.innerHTML = '';
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
    }
    
    processNextRow() {
        if (this.currentIndex >= this.companies.length) {
            this.stopExperiment();
            this.updateStatus('Completed');
            this.currentRowElement.textContent = 'All records processed';
            this.sortDuplicatesTable();
            return;
        }
        
        const company = this.companies[this.currentIndex];
        const cleanedTIN = this.cleanTIN(company.tin);
        
        // Display current row being processed
        this.currentRowElement.innerHTML = `
            <strong>Processing:</strong> ${company.name} | 
            <strong>TIN:</strong> ${company.tin} | 
            <strong>Cleaned:</strong> ${cleanedTIN}
        `;
        
        console.log('Processing company:', company);
        console.log('Original TIN:', company.tin, 'Cleaned TIN:', cleanedTIN);
        
        if (this.seenTINs.has(cleanedTIN)) {
            // Duplicate found
            this.handleDuplicate(company, cleanedTIN);
        } else {
            // New unique record
            this.addUniqueRecord(company, cleanedTIN);
        }
        
        this.processedCount++;
        this.currentIndex++;
        this.updateProcessedCount(this.processedCount);
    }
    
    updateStatus(status) {
        this.statusElement.textContent = status;
    }
    
    updateProcessedCount(count) {
        this.processedCountElement.textContent = count;
    }
    
    updateDuplicateCount(count) {
        this.duplicateCountElement.textContent = count;
    }
    
    addUniqueRecord(company, cleanedTIN) {
        this.seenTINs.set(cleanedTIN, {
            company: company,
            cleanedTIN: cleanedTIN,
            count: 1,
            row: null
        });
        
        const row = this.createUniqueTableRow(company, cleanedTIN);
        this.seenTINs.get(cleanedTIN).row = row;
        
        this.uniqueTableBody.appendChild(row);
        this.flashRow(row);
        
        // Scroll to show the new row
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    handleDuplicate(company, duplicateKey) {
        const existingData = this.seenTINs.get(duplicateKey);
        existingData.count++;
        
        // Move the original record to duplicates table if this is the first duplicate
        if (existingData.count === 2) {
            this.moveToduplicatesTable(existingData, duplicateKey);
        }
        
        // Add the new duplicate to the duplicates table
        this.addToDuplicatesTable(company, duplicateKey, existingData.count);
        
        this.duplicateCount++;
        this.updateDuplicateCount(this.duplicateCount);
    }
    
    moveToduplicatesTable(existingData, cleanedTIN) {
        // Remove from unique table
        if (existingData.row && existingData.row.parentNode) {
            existingData.row.parentNode.removeChild(existingData.row);
        }
        
        // Add to duplicates table with count 1 (original)
        const duplicateRow = this.createDuplicateTableRow(existingData.company, cleanedTIN, 1);
        this.duplicatesTableBody.appendChild(duplicateRow);
        this.flashRow(duplicateRow);
    }
    
    addToDuplicatesTable(company, cleanedTIN, count) {
        const row = this.createDuplicateTableRow(company, cleanedTIN, count);
        this.duplicatesTableBody.appendChild(row);
        this.flashRow(row);
        
        // Scroll to show the new row
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    createUniqueTableRow(company, cleanedTIN) {
        console.log('Creating unique row - Company:', company);
        console.log('TIN from company object:', company.tin);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${company.tin || ''}</td>
            <td class="tin-cell">${cleanedTIN}</td>
            <td>${company.name || ''}</td>
            <td>${company.address || ''}</td>
        `;
        return row;
    }
    
    createDuplicateTableRow(company, cleanedTIN, count) {
        console.log('Creating duplicate row - Company:', company);
        console.log('TIN from company object:', company.tin);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${company.tin || ''}</td>
            <td class="tin-cell">${cleanedTIN}</td>
            <td>${company.name || ''}</td>
            <td>${company.address || ''}</td>
        `;
        return row;
    }
    
    flashRow(row) {
        row.classList.add('flash');
        setTimeout(() => row.classList.remove('flash'), 1000);
    }
    
    sortDuplicatesTable() {
        const rows = Array.from(this.duplicatesTableBody.querySelectorAll('tr'));
        
        // Group rows by cleaned TIN
        const groups = new Map();
        rows.forEach(row => {
            const cleanedTIN = row.querySelector('.tin-cell').textContent;
            if (!groups.has(cleanedTIN)) {
                groups.set(cleanedTIN, []);
            }
            groups.get(cleanedTIN).push(row);
        });
        
        // Clear table and re-add grouped rows
        this.duplicatesTableBody.innerHTML = '';
        
        // Sort groups by cleaned TIN and add rows
        const sortedGroups = Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        sortedGroups.forEach(([cleanedTIN, groupRows]) => {
            groupRows.forEach(row => {
                this.duplicatesTableBody.appendChild(row);
            });
        });
    }
    
    saveDuplicatesData() {
        const duplicatesData = [];
        const rows = this.duplicatesTableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            duplicatesData.push({
                tin: cells[0].textContent,
                cleanedTIN: cells[1].textContent,
                name: cells[2].textContent,
                address: cells[3].textContent
            });
        });
        
        console.log('Duplicates data:', duplicatesData);
        return duplicatesData;
    }
}

// Initialize the experiment when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CSVExperiment();
});