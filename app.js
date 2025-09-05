const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка EJS как шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Маршруты
app.get('/', (req, res) => {
    res.render('layout', { 
        title: 'Home Page',
        currentPage: 'home',
        content: `
            <div class="hero-section">
                <h1>Company Data Analysis System</h1>
                <p class="lead">Research and development of consensus algorithms for processing duplicate records</p>
                <div class="hero-buttons">
                    <a href="/experiment1" class="btn btn-primary btn-lg">Start Experiments</a>
                    <a href="#about" class="btn btn-outline-secondary btn-lg">Learn More</a>
                </div>
            </div>
            
            <div class="features-section" id="about">
                <div class="container">
                    <h2>System Features</h2>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="feature-card">
                                <i class="fas fa-upload feature-icon"></i>
                                <h4>Data Loading</h4>
                                <p>Import and analyze CSV files with company data</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="feature-card">
                                <i class="fas fa-search feature-icon"></i>
                                <h4>Duplicate Detection</h4>
                                <p>Intelligent search for duplicate records using various criteria</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="feature-card">
                                <i class="fas fa-chart-line feature-icon"></i>
                                <h4>Consensus Analysis</h4>
                                <p>Apply consensus algorithms to determine the most reliable data</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    });
});


app.get('/experiment1', (req, res) => {
    res.render('layout', { 
        title: 'Experiment 1: Data Loading and Analysis',
        currentPage: 'experiment1',
        content: `
            <div class="experiment-container">
                <h1>Experiment 1: CSV Data Processing</h1>
                <p>This experiment demonstrates real-time CSV data processing with TIN validation and duplicate detection.</p>
                
                <div class="experiment-controls">
                    <button id="startExperiment" class="btn btn-primary">Start Experiment</button>
                    <button id="stopExperiment" class="btn btn-secondary" disabled>Stop Experiment</button>
                    <button id="resetExperiment" class="btn btn-warning">Reset</button>
                </div>
                
                <div class="experiment-status">
                    <div class="status-item">
                        <span class="label">Status:</span>
                        <span id="experimentStatus" class="status">Ready to start</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Processed records:</span>
                        <span id="processed-count" class="count">0</span>
                    </div>
                    <div class="status-item">
                        <span class="label">Found duplicates:</span>
                        <span id="duplicates-count" class="count">0</span>
                    </div>
                </div>
                
                <div class="current-row-display">
                    <div id="current-row">Waiting for start...</div>
                </div>
                
                <div class="tables-container">
                    <div class="table-section">
                        <h3>Unique Records</h3>
                        <div class="table-container">
                            <table id="unique-table">
                                <thead>
                                    <tr>
                                        <th>TIN</th>
                                        <th>Cleaned TIN</th>
                                        <th>Company Name</th>
                                        <th>Address</th>
                                    </tr>
                                </thead>
                                <tbody id="unique-table-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="table-section">
                        <h3>Duplicates</h3>
                        <div class="table-container">
                            <table id="duplicates-table">
                                <thead>
                                    <tr>
                                        <th>TIN</th>
                                        <th>Cleaned TIN</th>
                                        <th>Company Name</th>
                                        <th>Address</th>
                                    </tr>
                                </thead>
                                <tbody id="duplicates-table-body">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <script src="/js/experiment2.js"></script>
        `
    });
});

app.get('/experiment2', (req, res) => {
    res.render('layout', {
        title: 'Experiment 2 - Consensus Algorithms',
        currentPage: 'experiment2',
        content: `
            <div class="experiment-container">
                <h2>Experiment 2: Consensus Algorithms for Company Names</h2>
                <div class="experiment-description">
                    <p>This experiment analyzes duplicates from Experiment 1 and applies consensus algorithms to determine canonical company names.</p>
                    
                    <h3>Algorithms:</h3>
                    <ul>
                        <li><strong>Normalization:</strong> convert to lowercase, remove punctuation and stop words, expand abbreviations</li>
                        <li><strong>Similarity comparison:</strong> Levenshtein distance, Jaro-Winkler similarity (threshold >80%)</li>
                        <li><strong>Consensus determination:</strong> Frequency-Based Voting, Hierarchical clustering, synthesis for information completeness</li>
                    </ul>
                </div>
                
                <div class="controls">
                    <button id="start-consensus-btn" class="btn btn-primary">Start Consensus Analysis</button>
                    <div id="progress-info" class="progress-info" style="display: none;">
                        <div class="progress-bar">
                            <div id="progress-fill" class="progress-fill"></div>
                        </div>
                        <span id="progress-text">Processing...</span>
                    </div>
                </div>
                
                <div id="consensus-results" class="consensus-results" style="display: none;">
                    <h3>Consensus Analysis Results</h3>
                    <div id="consensus-groups" class="consensus-groups"></div>
                </div>
            </div>
            
            <script src="/js/consensus.js"></script>
        `
    });
});

app.get('/experiment3', (req, res) => {
    res.render('layout', { 
        title: 'Experiment 3 - Practical Consensus Example',
        currentPage: 'experiment3',
        content: `
            <div class="experiment-container">
                <h1>Experiment 3 - Practical Consensus Example</h1>
                
                <div class="experiment-description">
                    <h3>Practical Consensus Example</h3>
                    <p>This experiment demonstrates practical application of consensus algorithms on real data from Experiment 2.</p>
                    
                    <h4>Example: San Miguel Corporation</h4>
                    <ul>
                        <li><strong>Variants:</strong> "San Miguel Corporation" (2 times), "SMC" (1), "San Miguel Corp." (1), "San Miguel" (1)</li>
                        <li><strong>Consensus Result:</strong> "San Miguel Corporation" (most frequent and complete)</li>
                    </ul>
                    
                    <p>The experiment analyzes duplicate data from previous experiments and demonstrates how consensus algorithms determine the most suitable canonical name for each group of companies.</p>
                </div>
                
                <div class="experiment-controls">
                    <button id="start-example-btn" class="btn btn-primary">
                        <i class="fas fa-play"></i> Start Practical Example
                    </button>
                </div>
                
                <div id="progress-info" class="progress-container" style="display: none;">
                    <div class="progress-bar">
                        <div id="progress-fill" class="progress-fill"></div>
                    </div>
                    <div id="progress-text" class="progress-text">Initializing...</div>
                </div>
                
                <div id="example-results" class="results-container" style="display: none;">
                    <h3>Practical Example Results</h3>
                    <div id="example-groups" class="example-groups"></div>
                </div>
            </div>
            
            <script src="/js/experiment3.js"></script>
        `
    });
});

app.get('/experiment4', (req, res) => {
    res.render('layout', { 
        title: 'Experiment 4 - Address Verification and Normalization via API',
        currentPage: 'experiment4',
        content: `
            <div class="experiment-container">
                <h1>Experiment 4 - Address Verification and Normalization via API</h1>
                
                <div class="experiment-description">
                    <h3>Experiment Goal</h3>
                    <p>Obtain standardized full addresses based on consensus data from Experiment 3, using geocoding API for address verification and normalization.</p>
                    
                    <h4>Verification Process:</h4>
                    <ol>
                        <li><strong>Data Loading:</strong> Retrieve consensus addresses from Experiment 3</li>
                        <li><strong>API Requests:</strong> Send addresses to geocoding service for normalization</li>
                        <li><strong>Standardization:</strong> Extract full addresses with postal code, city, region</li>
                        <li><strong>Comparison:</strong> Analyze discrepancies between original and normalized addresses</li>
                    </ol>
                    
                    <div class="api-info">
                        <h5><i class="fas fa-info-circle"></i> Used API</h5>
                        <p>Geocoding API service for address standardization and verification.</p>
                    </div>
                </div>
                
                <div class="experiment-controls">
                    <button id="start-verification-btn" class="btn btn-primary">
                        <i class="fas fa-search-location"></i> Start Address Verification
                    </button>
                </div>
                
                <div id="verification-progress" class="progress-container" style="display: none;">
                    <div class="progress-bar">
                        <div id="verification-progress-fill" class="progress-fill"></div>
                    </div>
                    <div id="verification-progress-text" class="progress-text">Initializing...</div>
                    <div id="verification-stats" class="verification-stats"></div>
                </div>
                
                <div id="verification-results" class="results-container" style="display: none;">
                    <h3>Address Verification Results</h3>
                    <div id="verification-summary" class="verification-summary"></div>
                    <div id="addresses-table-container" class="table-container">
                        <table id="addresses-table" class="addresses-table">
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Company</th>
                                    <th>Original Address</th>
                                    <th>Normalized Address</th>
                                    <th>Postal Code</th>
                                    <th>City</th>
                                    <th>Region/State</th>
                                    <th>Country</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="addresses-table-body">
                            </tbody>
                        </table>
                    </div>
                    <div id="discrepancy-analysis" class="discrepancy-analysis"></div>
                </div>
            </div>
            
            <script src="/js/experiment4.js"></script>
        `
     });
});

// API endpoint for getting CSV data
// Функция для правильного парсинга CSV с учетом кавычек
function parseCSVLine(line) {
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

app.get('/api/companies', (req, res) => {
    try {
        const csvPath = path.join(__dirname, 'companies.csv');
        const csvData = fs.readFileSync(csvPath, 'utf8');
        const lines = csvData.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
            return res.json([]);
        }
        
        const headers = parseCSVLine(lines[0]);
        const companies = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length >= headers.length) {
                const company = {};
                headers.forEach((header, index) => {
                    // Сохраняем оригинальное форматирование, только убираем внешние кавычки если они есть
                    let value = values[index] || '';
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    company[header.trim()] = value;
                });
                companies.push(company);
            }
        }
        
        res.json(companies);
    } catch (error) {
        console.error('Error reading CSV file:', error);
        res.status(500).json({ error: 'Failed to read CSV file' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in browser`);
});

module.exports = app;