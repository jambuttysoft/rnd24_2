class AddressVerificationExperiment {
    constructor() {
        this.consensusData = [];
        this.verificationResults = [];
        this.currentIndex = 0;
        this.totalAddresses = 0;
        this.successCount = 0;
        this.failureCount = 0;
        this.init();
    }

    init() {
        this.loadConsensusData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-verification-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startVerification());
        }
    }

    loadConsensusData() {
        try {
            const storedData = localStorage.getItem('consensusResults');
            if (storedData && storedData !== '[]' && storedData !== '{}') {
                this.consensusData = JSON.parse(storedData);
                console.log('Loaded consensus data:', this.consensusData);
                
                if (this.consensusData.length === 0) {
                    this.showNoDataWarning();
                }
            } else {
                this.showNoDataWarning();
            }
        } catch (error) {
            console.error('Error loading consensus data:', error);
            this.showNoDataWarning();
        }
    }

    showNoDataWarning() {
        const startBtn = document.getElementById('start-verification-btn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> No data for verification';
            startBtn.className = 'btn btn-warning';
        }

        const container = document.querySelector('.experiment-container');
        if (container) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'alert alert-warning';
            warningDiv.innerHTML = `
                <h4><i class="fas fa-exclamation-triangle"></i> Data not found</h4>
                <p>To perform address verification, you must first complete the previous experiments:</p>
                <ul>
                    <li><a href="/experiment1">Experiment 1</a> - Data loading and analysis</li>
                    <li><a href="/experiment2">Experiment 2</a> - Duplicate search</li>
                    <li><a href="/experiment3">Experiment 3</a> - Data consensus</li>
                </ul>
            `;
            container.insertBefore(warningDiv, container.querySelector('.experiment-controls'));
        }
    }

    async startVerification() {
        if (this.consensusData.length === 0) {
            alert('No data for verification. Please complete Experiments 1-3 first.');
            return;
        }

        this.totalAddresses = this.consensusData.length;
        this.currentIndex = 0;
        this.successCount = 0;
        this.failureCount = 0;
        this.verificationResults = [];

        // Show progress
        this.showProgress();
        
        // Hide start button
        const startBtn = document.getElementById('start-verification-btn');
        if (startBtn) {
            startBtn.style.display = 'none';
        }

        // Start verification
        for (let i = 0; i < this.consensusData.length; i++) {
            this.currentIndex = i;
            await this.verifyAddress(this.consensusData[i]);
            this.updateProgress();
            
            // Small delay between requests to comply with API limits
            await this.delay(1000);
        }

        this.showResults();
    }

    async verifyAddress(consensusItem) {
        const address = consensusItem.consensusAddress;
        const companyName = consensusItem.consensusName;
        
        this.updateProgressText(`Verifying address: ${address.substring(0, 50)}...`);

        try {
            const normalizedData = await this.callGeocodingAPI(address);
            
            const result = {
                originalCompany: companyName,
                originalAddress: address,
                normalizedAddress: normalizedData.display_name || 'Not found',
                postalCode: normalizedData.address?.postcode || 'Not specified',
                city: normalizedData.address?.city || normalizedData.address?.town || normalizedData.address?.village || 'Not specified',
                region: normalizedData.address?.state || normalizedData.address?.region || 'Not specified',
                country: normalizedData.address?.country || 'Not specified',
                status: normalizedData.display_name ? 'Success' : 'Not found',
                confidence: normalizedData.importance || 0,
                coordinates: normalizedData.lat && normalizedData.lon ? 
                    `${normalizedData.lat}, ${normalizedData.lon}` : 'Not determined'
            };

            this.verificationResults.push(result);
            
            if (normalizedData.display_name) {
                this.successCount++;
            } else {
                this.failureCount++;
            }

        } catch (error) {
            console.error('Address verification error:', error);
            
            const result = {
                originalCompany: companyName,
                originalAddress: address,
                normalizedAddress: 'API Error',
                postalCode: 'Not available',
                city: 'Not available',
                region: 'Not available',
                country: 'Not available',
                status: 'Error',
                confidence: 0,
                coordinates: 'Not determined'
            };

            this.verificationResults.push(result);
            this.failureCount++;
        }
    }

    async callGeocodingAPI(address) {
        // Using geocoding API
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodedAddress}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'AddressVerificationExperiment/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.length > 0 ? data[0] : {};
    }

    showProgress() {
        const progressContainer = document.getElementById('verification-progress');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }

    updateProgress() {
        const progressFill = document.getElementById('verification-progress-fill');
        const progressText = document.getElementById('verification-progress-text');
        const progressStats = document.getElementById('verification-stats');

        if (progressFill && progressText && progressStats) {
            const percentage = ((this.currentIndex + 1) / this.totalAddresses) * 100;
            progressFill.style.width = `${percentage}%`;
            
            progressText.textContent = `Processed ${this.currentIndex + 1} of ${this.totalAddresses} addresses`;
            
            progressStats.innerHTML = `
                <div class="stats-item success">Success: ${this.successCount}</div>
                <div class="stats-item failure">Errors: ${this.failureCount}</div>
            `;
        }
    }

    updateProgressText(text) {
        const progressText = document.getElementById('verification-progress-text');
        if (progressText) {
            progressText.textContent = text;
        }
    }

    showResults() {
        // Hide progress
        const progressContainer = document.getElementById('verification-progress');
        if (progressContainer) {
            progressContainer.style.display = 'none';
        }

        // Show results
        const resultsContainer = document.getElementById('verification-results');
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
        }

        this.displaySummary();
        this.displayResultsTable();
        this.displayDiscrepancyAnalysis();
        
        // Save results to localStorage
        localStorage.setItem('verificationResults', JSON.stringify(this.verificationResults));
    }

    displaySummary() {
        const summaryContainer = document.getElementById('verification-summary');
        if (!summaryContainer) return;

        const successRate = ((this.successCount / this.totalAddresses) * 100).toFixed(1);
        
        summaryContainer.innerHTML = `
            <div class="summary-stats">
                <div class="stat-card success">
                    <div class="stat-number">${this.successCount}</div>
                    <div class="stat-label">Successfully verified</div>
                </div>
                <div class="stat-card failure">
                    <div class="stat-number">${this.failureCount}</div>
                    <div class="stat-label">Failed to verify</div>
                </div>
                <div class="stat-card rate">
                    <div class="stat-number">${successRate}%</div>
                    <div class="stat-label">Verification success rate</div>
                </div>
            </div>
        `;
    }

    displayResultsTable() {
        const tableBody = document.getElementById('addresses-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        this.verificationResults.forEach((result, index) => {
            const row = document.createElement('tr');
            row.className = result.status === 'Success' ? 'success-row' : 
                           result.status === 'Error' ? 'error-row' : 'warning-row';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td class="company-name">${result.originalCompany}</td>
                <td class="address-cell original">${result.originalAddress}</td>
                <td class="address-cell normalized">${result.normalizedAddress}</td>
                <td>${result.postalCode}</td>
                <td>${result.city}</td>
                <td>${result.region}</td>
                <td>${result.country}</td>
                <td><span class="status-badge ${result.status.toLowerCase()}">${result.status}</span></td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    displayDiscrepancyAnalysis() {
        const analysisContainer = document.getElementById('discrepancy-analysis');
        if (!analysisContainer) return;

        // Discrepancy analysis
        let significantDiscrepancies = 0;
        let minorDiscrepancies = 0;
        let exactMatches = 0;

        this.verificationResults.forEach(result => {
            if (result.status === 'Success') {
                const similarity = this.calculateAddressSimilarity(result.originalAddress, result.normalizedAddress);
                if (similarity > 0.8) {
                    exactMatches++;
                } else if (similarity > 0.5) {
                    minorDiscrepancies++;
                } else {
                    significantDiscrepancies++;
                }
            }
        });

        analysisContainer.innerHTML = `
            <h4>Discrepancy Analysis</h4>
            <div class="discrepancy-stats">
                <div class="discrepancy-item exact">
                    <span class="count">${exactMatches}</span>
                    <span class="label">Exact matches (>80%)</span>
                </div>
                <div class="discrepancy-item minor">
                    <span class="count">${minorDiscrepancies}</span>
                    <span class="label">Minor discrepancies (50-80%)</span>
                </div>
                <div class="discrepancy-item significant">
                    <span class="count">${significantDiscrepancies}</span>
                    <span class="label">Significant discrepancies (<50%)</span>
                </div>
            </div>
            <div class="analysis-notes">
                <h5>Conclusions:</h5>
                <ul>
                    <li>Overall verification efficiency: ${((this.successCount / this.totalAddresses) * 100).toFixed(1)}%</li>
                    <li>Normalization accuracy: ${((exactMatches / this.successCount) * 100).toFixed(1)}% of successful requests</li>
                    <li>Manual verification recommended for addresses with significant discrepancies</li>
                </ul>
            </div>
        `;
    }

    calculateAddressSimilarity(addr1, addr2) {
        // Simple string comparison algorithm (Jaccard similarity)
        const set1 = new Set(addr1.toLowerCase().split(/\s+/));
        const set2 = new Set(addr2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new AddressVerificationExperiment();
});