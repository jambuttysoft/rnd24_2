class CSVExperiment {
    constructor() {
        this.companies = [];
        this.processedData = [];
        this.currentIndex = 0;
        this.intervalId = null;
        this.isRunning = false;
        this.duplicateCount = 0;
        this.tinMap = new Map(); // For tracking TIN and their positions in table
        this.duplicateGroups = new Map(); // For storing duplicate groups
        this.currentRowData = null; // Current row being processed
        
        this.initializeElements();
        this.bindEvents();
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
        this.uniqueTable = document.getElementById('unique-table');
        this.duplicatesTable = document.getElementById('duplicates-table');
        
        // File upload elements
        this.csvFileInput = document.getElementById('csvFileInput');
        this.loadCustomFileBtn = document.getElementById('loadCustomFile');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startExperiment());
        this.stopBtn.addEventListener('click', () => this.stopExperiment());
        this.resetBtn.addEventListener('click', () => this.resetExperiment());
        
        // File upload events
        this.csvFileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.loadCustomFileBtn.addEventListener('click', () => this.loadCustomFile());
    }
    
    async loadCSVData() {
        try {
            console.log('Starting to fetch CSV data from API...');
            // Add cache-busting parameter to prevent browser caching
            const response = await fetch(`/api/companies?t=${Date.now()}`);
            console.log('API response status:', response.status);
            if (!response.ok) {
                throw new Error('Failed to fetch CSV data');
            }
            const responseText = await response.text();
            console.log('Raw response length:', responseText.length);
            console.log('Raw response preview:', responseText.substring(0, 500));
            
            this.companies = JSON.parse(responseText);
            console.log('Loaded companies:', this.companies.length);
            console.log('First 3 companies from API:', this.companies.slice(0, 3));
            console.log('Last 3 companies from API:', this.companies.slice(-3));
            this.updateStatus(`Loaded ${this.companies.length} companies from default CSV`);
        } catch (error) {
            console.error('Error loading CSV data:', error);
            this.updateStatus('Data loading error');
        }
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
            this.loadCustomFileBtn.disabled = false;
            this.selectedFile = file;
        } else {
            this.loadCustomFileBtn.disabled = true;
            this.selectedFile = null;
            if (file) {
                alert('Please select a valid CSV file.');
            }
        }
    }
    
    loadCustomFile() {
        if (!this.selectedFile) {
            alert('Please select a CSV file first.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvContent = e.target.result;
                this.parseCustomCSV(csvContent);
                this.updateStatus('Custom file loaded successfully');
            } catch (error) {
                console.error('Error reading file:', error);
                this.updateStatus('Error reading custom file');
                alert('Error reading the CSV file. Please check the file format.');
            }
        };
        reader.readAsText(this.selectedFile);
    }
    
    parseCustomCSV(csvContent) {
        const lines = csvContent.split('\n').filter(line => line.trim());
        this.companies = [];
        
        for (let line of lines) {
            const [tin, name, address] = this.parseCSVLine(line);
            if (tin && name) {
                this.companies.push({ tin, name, address: address || '' });
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
        // Remove all characters except digits and take first 9 digits
        const cleaned = tin.replace(/\D/g, '');
        return cleaned.substring(0, 9);
    }
    
    async startExperiment() {
        if (this.isRunning) return;
        
        this.updateStatus('Loading data...');
        await this.loadCSVData();
        
        if (this.companies.length === 0) {
            this.updateStatus('No data to process');
            return;
        }
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.updateStatus('Experiment started');
        
        // Start processing every second
        this.intervalId = setInterval(() => {
            this.processNextRow();
        }, 100);
    }
    
    stopExperiment() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.updateStatus('Experiment stopped');
    }
    


    resetExperiment() {
        this.stopExperiment();
        
        this.currentIndex = 0;
        this.processedCount = 0;
        this.duplicateCount = 0;
        this.tinMap.clear();
        this.duplicateGroups = new Map(); // For storing duplicate groups
        this.currentRowData = null;
        this.processedData = []; // Clear old data
        
        this.uniqueTableBody.innerHTML = '';
        this.duplicatesTableBody.innerHTML = '';
        this.updateStatus('Ready to start');
        this.updateProcessedCount(0);
        this.updateDuplicateCount(0);
        if (this.currentRowElement) {
            this.currentRowElement.textContent = 'Waiting to start...';
        }
        
        // Reset buttons to initial state
        if (this.startBtn) {
            this.startBtn.disabled = false;
        }
        if (this.stopBtn) {
            this.stopBtn.disabled = true;
        }
    }
    
    processNextRow() {
        console.log(`Processing row ${this.currentIndex + 1} of ${this.companies.length}`);
        
        if (this.currentIndex >= this.companies.length) {
            console.log('All data processed, stopping experiment');
            this.stopExperiment();
            this.updateStatus('Experiment completed');
            if (this.currentRowElement) {
                this.currentRowElement.textContent = 'All data processed';
            }
            return;
        }
        
        const company = this.companies[this.currentIndex];
        console.log(`Processing company:`, company);
        this.currentRowData = company;
        const cleanedTIN = this.cleanTIN(company.tin || '');
        console.log(`Cleaned TIN: ${company.tin} → ${cleanedTIN}`);
        
        // Increment index immediately to avoid infinite loop
        this.currentIndex++;
        this.updateProcessedCount(this.currentIndex);
        
        // Update current row display
        if (this.currentRowElement) {
            this.currentRowElement.innerHTML = `
                <strong>Current row:</strong> TIN: ${company.tin || ''} → ${cleanedTIN}, 
                Company: ${company.name || ''}, Address: ${company.address || ''}
            `;
        }
        
        // Check if this TIN already exists
        if (this.tinMap.has(cleanedTIN)) {
            console.log(`Duplicate found for TIN: ${cleanedTIN}`);
            // This is a duplicate
            this.handleDuplicate(company, cleanedTIN);
        } else {
            console.log(`New unique TIN: ${cleanedTIN}`);
            // This is a unique record
            this.addUniqueRecord(company, cleanedTIN);
        }
        
        console.log(`Row ${this.currentIndex} processed successfully`);
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
        try {
            console.log(`Adding unique record for TIN: ${cleanedTIN}`);
            // Add record to unique records table (insert at top)
            const row = this.createUniqueTableRow(company, cleanedTIN);
            this.uniqueTableBody.prepend(row);
            
            // Save row reference in map
            this.tinMap.set(cleanedTIN, {
                uniqueRow: row,
                company: company,
                count: 1
            });
            console.log(`Unique record added successfully for TIN: ${cleanedTIN}`);
        } catch (error) {
            console.error(`Error adding unique record for TIN ${cleanedTIN}:`, error);
            throw error;
        }
    }
    
    handleDuplicate(company, cleanedTIN) {
        try {
            console.log(`Handling duplicate for TIN: ${cleanedTIN}`);
            const existingData = this.tinMap.get(cleanedTIN);
            console.log(`Existing data:`, existingData);
            
            if (existingData.count === 1) {
                console.log(`First duplicate found for TIN: ${cleanedTIN}`);
                // First duplicate - move original record from unique to duplicates
                this.moveToduplicatesTable(existingData, cleanedTIN);
                
                // Add new record (second row) to duplicates table
                this.addToDuplicatesTable(company, cleanedTIN, 2);
                
                // Increment counter by 1 (now we have 2 records)
                existingData.count = 2;
            } else {
                console.log(`Additional duplicate found for TIN: ${cleanedTIN}`);
                // Subsequent duplicates - add only new record
                existingData.count++;
                this.addToDuplicatesTable(company, cleanedTIN, existingData.count);
            }
            
            // Update duplicates counter
            this.duplicateCount++;
            this.updateDuplicateCount(this.duplicateCount);
            console.log(`Duplicate handled successfully for TIN: ${cleanedTIN}`);
        } catch (error) {
            console.error(`Error handling duplicate for TIN ${cleanedTIN}:`, error);
            throw error;
        }
    }
    
    moveToduplicatesTable(existingData, cleanedTIN) {
        // Remove from unique records table
        existingData.uniqueRow.remove();
        
        // Add original record to duplicates table with counter 1
        this.addToDuplicatesTable(existingData.company, cleanedTIN, 1);
        
        // Create duplicates group
        if (!this.duplicateGroups.has(cleanedTIN)) {
            this.duplicateGroups.set(cleanedTIN, []);
        }
    }
    
    addToDuplicatesTable(company, cleanedTIN, count) {
        const row = this.createDuplicateTableRow(company, cleanedTIN, count);
        this.duplicatesTableBody.prepend(row);
        
        // Highlight new row
        this.flashRow(row);
        
        // Add to duplicates group
        if (!this.duplicateGroups.has(cleanedTIN)) {
            this.duplicateGroups.set(cleanedTIN, []);
        }
        this.duplicateGroups.get(cleanedTIN).push(row);
        
        // Sort duplicates table by Cleaned TIN
        this.sortDuplicatesTable();
    }
    
    createUniqueTableRow(company, cleanedTIN) {
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
        
        // Sort rows by Cleaned TIN (second column)
        rows.sort((a, b) => {
            const tinA = a.cells[1].textContent.trim();
            const tinB = b.cells[1].textContent.trim();
            return tinA.localeCompare(tinB);
        });
        
        // Clear table and add sorted rows with grouping
        this.duplicatesTableBody.innerHTML = '';
        let currentGroup = null;
        let groupIndex = 0;
        
        rows.forEach((row, index) => {
            const cleanedTIN = row.cells[1].textContent.trim();
            
            // Check if new group started
            if (currentGroup !== cleanedTIN) {
                currentGroup = cleanedTIN;
                groupIndex++;
            }
            
            // Add class for grouping
            row.classList.remove('group-even', 'group-odd');
            row.classList.add(groupIndex % 2 === 0 ? 'group-even' : 'group-odd');
            
            this.duplicatesTableBody.appendChild(row);
        });
        
        // Save duplicates data for Experiment 2
        this.saveDuplicatesData();
    }
    
    // Save duplicates data to localStorage
    saveDuplicatesData() {
        const duplicatesData = {};
        
        this.duplicateGroups.forEach((rows, cleanedTin) => {
            if (rows.length > 0) {
                duplicatesData[cleanedTin] = rows.map(row => ({
                    TIN: row.cells[0].textContent,
                    cleanedTIN: row.cells[1].textContent,
                    NAME: row.cells[2].textContent,
                    ADDRESS: row.cells[3].textContent
                }));
            }
        });
        
        localStorage.setItem('duplicatesData', JSON.stringify(duplicatesData));
        console.log('Duplicates data saved for Experiment 2:', duplicatesData);
    }
}

// Initialize experiment on page load
document.addEventListener('DOMContentLoaded', () => {
    new CSVExperiment();
});