class PracticalConsensusExample {
    constructor() {
        this.duplicatesData = [];
        this.consensusResults = [];
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupEventListeners();
            this.checkDataAvailability();
        });
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-example-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startPracticalExample());
        }
    }

    checkDataAvailability() {
        const storedData = localStorage.getItem('duplicatesData');
        const startBtn = document.getElementById('start-example-btn');
        
        if (!storedData || storedData === '{}' || storedData === '[]') {
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No data from Experiment 2';
                startBtn.classList.add('btn-warning');
                startBtn.classList.remove('btn-primary');
            }
            
            // Show warning
            this.showWarning('To run Experiment 3, you must first complete Experiment 1 and Experiment 2.');
        } else {
            const parsedData = JSON.parse(storedData);
            // Convert object to array of records
            this.duplicatesData = [];
            Object.keys(parsedData).forEach(tin => {
                if (parsedData[tin] && Array.isArray(parsedData[tin])) {
                    this.duplicatesData.push(...parsedData[tin]);
                }
            });
            console.log('Loaded duplicate records:', this.duplicatesData.length);
        }
    }

    showWarning(message) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'alert alert-warning';
        warningDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Warning:</strong> ${message}
            <br><br>
            <a href="/experiment1" class="btn btn-sm btn-outline-primary">Go to Experiment 1</a>
            <a href="/experiment2" class="btn btn-sm btn-outline-secondary ml-2">Go to Experiment 2</a>
        `;
        
        const container = document.querySelector('.experiment-container');
        const description = container.querySelector('.experiment-description');
        container.insertBefore(warningDiv, description.nextSibling);
    }

    async startPracticalExample() {
        if (this.duplicatesData.length === 0) {
            alert('No data for analysis. Please complete Experiments 1 and 2 first.');
            return;
        }

        this.showProgress('Initializing practical example...', 0);
        
        // Simulate data processing
        await this.sleep(500);
        this.showProgress('Analyzing duplicate data...', 20);
        
        await this.sleep(800);
        this.showProgress('Grouping companies by TIN...', 40);
        
        // Group data by TIN
        const groupedData = this.groupCompaniesByTIN();
        
        await this.sleep(600);
        this.showProgress('Applying consensus algorithms...', 60);
        
        // Apply consensus
        const consensusResults = this.applyConsensusAlgorithms(groupedData);
        
        await this.sleep(700);
        this.showProgress('Preparing results...', 80);
        
        await this.sleep(500);
        this.showProgress('Completing analysis...', 100);
        
        await this.sleep(300);
        this.hideProgress();
        
        // Save consensus results to localStorage for Experiment 4
        localStorage.setItem('consensusResults', JSON.stringify(consensusResults));
        
        // Display results
        this.displayPracticalResults(consensusResults);
    }

    groupCompaniesByTIN() {
        const groups = {};
        
        this.duplicatesData.forEach(record => {
            const cleanTIN = record.cleanedTIN || record.TIN;
            if (!groups[cleanTIN]) {
                groups[cleanTIN] = [];
            }
            groups[cleanTIN].push(record);
        });
        
        // Return all groups (data is already duplicates from Experiment 2)
        return groups;
    }

    applyConsensusAlgorithms(groupedData) {
        const results = [];
        
        Object.keys(groupedData).forEach(tin => {
            const group = groupedData[tin];
            const nameVariants = group.map(record => record.NAME).filter(name => name && name.trim());
            const addressVariants = group.map(record => record.ADDRESS).filter(addr => addr && addr.trim());
            
            // Frequency analysis of names
            const nameFrequency = this.calculateFrequency(nameVariants);
            const addressFrequency = this.calculateFrequency(addressVariants);
            
            // Determine consensus by name
            const consensusName = this.determineConsensusName(nameFrequency);
            const consensusAddress = this.determineConsensusAddress(addressFrequency);
            
            results.push({
                tin: tin,
                recordCount: group.length,
                nameVariants: nameVariants,
                addressVariants: addressVariants,
                nameFrequency: nameFrequency,
                addressFrequency: addressFrequency,
                consensusName: consensusName,
                consensusAddress: consensusAddress,
                confidence: this.calculateConfidence(nameFrequency, consensusName)
            });
        });
        
        // Sort by record count (descending)
        return results.sort((a, b) => b.recordCount - a.recordCount);
    }

    calculateFrequency(variants) {
        const frequency = {};
        variants.forEach(variant => {
            const normalized = variant.trim();
            frequency[normalized] = (frequency[normalized] || 0) + 1;
        });
        return frequency;
    }

    determineConsensusName(nameFrequency) {
        const entries = Object.entries(nameFrequency);
        if (entries.length === 0) return 'Unknown';
        
        // Sort by frequency, then by length (preference for more complete names)
        entries.sort((a, b) => {
            if (b[1] !== a[1]) return b[1] - a[1]; // По частоте
            return b[0].length - a[0].length; // By length
        });
        
        return entries[0][0];
    }

    determineConsensusAddress(addressFrequency) {
        const entries = Object.entries(addressFrequency);
        if (entries.length === 0) return 'Unknown';
        
        // Sort by frequency
        entries.sort((a, b) => b[1] - a[1]);
        
        return entries[0][0];
    }

    calculateConfidence(nameFrequency, consensusName) {
        const total = Object.values(nameFrequency).reduce((sum, count) => sum + count, 0);
        const consensusCount = nameFrequency[consensusName] || 0;
        return total > 0 ? Math.round((consensusCount / total) * 100) : 0;
    }

    displayPracticalResults(results) {
        const resultsContainer = document.getElementById('example-results');
        const groupsContainer = document.getElementById('example-groups');
        
        if (!resultsContainer || !groupsContainer) return;
        
        let html = '';
        
        if (results.length === 0) {
            html = '<div class="alert alert-info">No duplicates found in Experiment 2 data.</div>';
        } else {
            html += `<div class="summary-stats">`;
            html += `<h4>Analysis Statistics</h4>`;
            html += `<p><strong>Total duplicate groups:</strong> ${results.length}</p>`;
            html += `<p><strong>Total number of records:</strong> ${results.reduce((sum, r) => sum + r.recordCount, 0)}</p>`;
            html += `</div>`;
            
            results.forEach((result, index) => {
                html += this.createGroupHTML(result, index + 1);
            });
        }
        
        groupsContainer.innerHTML = html;
        resultsContainer.style.display = 'block';
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    createGroupHTML(result, groupNumber) {
        const isSanMiguelExample = result.consensusName.toLowerCase().includes('san miguel');
        const exampleClass = isSanMiguelExample ? 'example-highlight' : '';
        
        let html = `<div class="consensus-group ${exampleClass}">`;
        
        if (isSanMiguelExample) {
            html += `<div class="example-badge"><i class="fas fa-star"></i> Example from description</div>`;
        }
        
        html += `
            <div class="group-header">
                <h4>Group ${groupNumber} (TIN: ${result.tin})</h4>
                <div class="confidence-badge confidence-${this.getConfidenceLevel(result.confidence)}">
                    Confidence: ${result.confidence}%
                </div>
            </div>
            
            <div class="consensus-result">
                <h5><i class="fas fa-check-circle"></i> Consensus Result</h5>
                <div class="consensus-name">${result.consensusName}</div>
                <div class="consensus-address">${result.consensusAddress}</div>
            </div>
            
            <div class="analysis-details">
                <div class="variants-section">
                    <h6>Name Variants (${result.nameVariants.length})</h6>
                    <div class="variants">
        `;
        
        Object.entries(result.nameFrequency).forEach(([name, count]) => {
            const isConsensus = name === result.consensusName;
            html += `<span class="variant ${isConsensus ? 'consensus-variant' : ''}">${name} (${count})</span>`;
        });
        
        html += `
                    </div>
                </div>
                
                <div class="addresses-section">
                    <h6>Address Variants (${result.addressVariants.length})</h6>
                    <div class="addresses">
        `;
        
        Object.entries(result.addressFrequency).forEach(([address, count]) => {
            const isConsensus = address === result.consensusAddress;
            html += `<span class="address ${isConsensus ? 'consensus-address' : ''}">${address} (${count})</span>`;
        });
        
        html += `
                    </div>
                </div>
            </div>
        </div>`;
        
        return html;
    }

    getConfidenceLevel(confidence) {
        if (confidence >= 80) return 'high';
        if (confidence >= 60) return 'medium';
        return 'low';
    }

    showProgress(text, percentage) {
        const progressContainer = document.getElementById('progress-info');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressContainer && progressFill && progressText) {
            progressContainer.style.display = 'block';
            progressFill.style.width = percentage + '%';
            progressText.textContent = text;
        }
    }

    hideProgress() {
        const progressContainer = document.getElementById('progress-info');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize on page load
const practicalExample = new PracticalConsensusExample();