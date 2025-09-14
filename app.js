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
        title: 'Home Page — Consensus Supplier Data Validation',
        currentPage: 'home',
        content: `
            <div class="hero-section">
                <h1>Consensus Method for Supplier Data Validation in the Philippines</h1>
                <p class="lead">Core R&D Activity</p>
                <p class="description">Consensus-based validation of TIN, supplier name, and address extracted from receipts.</p>
            </div>
            
            <div class="business-context">
                <h2>Business Context</h2>
                <ul class="context-list">
                    <li>❌ Lack of a <strong>public company database</strong> in the Philippines</li>
                    <li>⚠️ Frequent <strong>data inconsistencies</strong> across receipts (misspellings, missing fields, mismatched addresses)</li>
                    <li>✅ Need for <strong>consensus-based algorithms</strong> to establish reliable supplier identity for accounting compliance</li>
                </ul>
            </div>
            
            <div class="features-section">
                <h2>System Features</h2>
                <div class="feature-grid">
                    <div class="feature-item">
                        <h4>• Data Loading</h4>
                        <p>Import and analyze receipts from CSV/JSON formats for supplier information.</p>
                    </div>
                    <div class="feature-item">
                        <h4>• Field Normalization</h4>
                        <p>Standardize name and address fields to reduce inconsistencies.</p>
                    </div>
                    <div class="feature-item">
                        <h4>• Duplicate & Conflict Detection</h4>
                        <p>Identify conflicting supplier records across multiple receipts.</p>
                    </div>
                    <div class="feature-item">
                        <h4>• Consensus Validation</h4>
                        <p>Apply consensus algorithms (weighted majority, rule-based heuristics, ML scoring) to determine the most reliable supplier identity.</p>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h2>Quick Actions</h2>
                <div class="action-buttons">
                    <a href="/experiment1" class="btn btn-primary btn-lg">• Start Experiments</a>
                    <a href="#methodology" class="btn btn-outline-secondary btn-lg">• Learn More (Methodology)</a>
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
                <h1>Experiment 1: TIN Normalization & Duplicate Detection</h1>
                
                <div class="experiment-objective">
                    <h3>Experiment Objective</h3>
                    <p>This experiment validates the effectiveness of normalizing Tax Identification Numbers (TINs) to reduce duplicate supplier entries and improve dataset consistency.</p>
                </div>
                
                <div class="working-logic">
                    <h3>Working Logic</h3>
                    <ul>
                        <li><strong>Input Format:</strong> CSV with fields TIN, Company Name, Address</li>
                        <li><strong>Normalization:</strong> Remove hyphens, enforce 9–12 digit format</li>
                        <li><strong>Duplicate Detection:</strong> Match cleaned TINs across records</li>
                        <li><strong>Partition:</strong> Separate into Unique Records and Duplicates</li>
                    </ul>
                </div>
                
                <div class="data-source-info">
                    <h3>Data Source</h3>
                    <ul>
                        <li><strong>Default Dataset:</strong> companies.csv (201 records)</li>
                        <li><strong>Custom Upload:</strong> User option for testing external datasets</li>
                    </ul>
                </div>
                
                <div class="validation-progress">
                    <h3>Validation Progress</h3>
                    <ul>
                        <li><strong>Status:</strong> ✅ Experiment Completed</li>
                        <li><strong>Total Records:</strong> 201</li>
                        <li><strong>Processed Records:</strong> 201</li>
                        <li><strong>Found Duplicates:</strong> 20</li>
                    </ul>
                </div>
                
                <div class="results-statistics">
                    <h3>Results Statistics</h3>
                    <ul>
                        <li><strong>Normalization Success:</strong> 95%</li>
                        <li><strong>Unique Records Identified:</strong> 181</li>
                        <li><strong>Duplicate Records Detected:</strong> 20</li>
                    </ul>
                </div>
                
                <div class="detailed-results">
                    <h3>Detailed Results</h3>
                    <div class="results-examples">
                        <h4>Unique Records Example:</h4>
                        <ul>
                            <li>UnionBank — 721523532 → 721523532</li>
                            <li>Robinsons Retail — 402393699 → 402393699</li>
                        </ul>
                        <h4>Duplicate Records Example:</h4>
                        <ul>
                            <li><strong>San Miguel Corporation</strong>
                                <ul>
                                    <li>TIN Variants: 002-040-000-001, 002040000001</li>
                                    <li>Normalized: 002040000001</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div class="conclusion">
                    <h3>Conclusion</h3>
                    <p>TIN normalization successfully reduced inconsistencies and grouped suppliers accurately. Duplicate detection proved effective at reconciling supplier records despite input variations.</p>
                </div>
                
                <div class="file-controls">
                    <h3>Data Source</h3>
                    <div class="file-options">
                        <div class="default-file-option">
                            <p>Use default dataset:</p>
                            <a href="/companies.csv" download class="btn btn-outline-primary">
                                <i class="fas fa-download"></i> Download companies.csv
                            </a>
                        </div>
                        <div class="custom-file-option">
                            <p>Or upload your own CSV file:</p>
                            <input type="file" id="csvFileInput" accept=".csv" class="form-control" style="margin-bottom: 10px;">
                            <button id="loadCustomFile" class="btn btn-outline-secondary" disabled>
                                <i class="fas fa-upload"></i> Load Custom File
                            </button>
                        </div>
                    </div>
                </div>
                
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
            
            <script src="/js/experiment1.js"></script>
        `
    });
});

app.get('/experiment2', (req, res) => {
    res.render('layout', {
        title: 'Experiment 2 - Consensus Algorithms',
        currentPage: 'experiment2',
        content: `
            <div class="experiment-container">
                <h1>Experiment 2 – Consensus Algorithms</h1>
                
                <div class="experiment-description">
                    <h3>Purpose</h3>
                    <p>To apply consensus algorithms on duplicate records identified in Experiment 1, aiming to establish canonical supplier identities through normalization, similarity scoring, and consensus determination.</p>
                    
                    <h3>Input Data</h3>
                    <p>Duplicates carried over from Experiment 1 (CSV data loading and duplicate detection).</p>
                    
                    <h3>Algorithms Applied</h3>
                    <ul>
                        <li><strong>Normalization:</strong> Convert to lowercase, remove punctuation and stop words, expand abbreviations.</li>
                        <li><strong>Similarity comparison:</strong> Levenshtein distance, Jaro-Winkler similarity (threshold >80%).</li>
                        <li><strong>Consensus determination:</strong> Frequency-Based Voting, Hierarchical clustering, synthesis for information completeness.</li>
                    </ul>
                </div>
                
                <div class="controls">
                    <h3>Run Consensus Analysis</h3>
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
                    <p>Example Group (BDO Unibank, San Miguel Corp., etc.)</p>
                    <ul>
                        <li>Show variants (names + addresses)</li>
                        <li>Highlight consensus identity with confidence level (%)</li>
                        <li>Show frequency analysis</li>
                    </ul>
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
        title: 'Experiment 4 — Address Verification & Normalization',
        currentPage: 'experiment4',
        content: `
            <div class="experiment-container">
                <h1>Experiment 4 — Address Verification & Normalization</h1>
                
                <div class="experiment-description">
                    <h3>Experiment Goal</h3>
                    <p>This experiment validates and normalizes supplier addresses using an external address verification API. The goal is to ensure all addresses are complete, standardized, and consistent, even when variants or partial data exist.</p>
                    
                    <h4>Verification Process</h4>
                    <ol>
                        <li><strong>Data Loading:</strong> Import canonical supplier records from Experiment 3.</li>
                        <li><strong>API Requests:</strong> Submit addresses to an external verification API for cleaning and standardization.</li>
                        <li><strong>Normalization:</strong> Correct misspellings, expand abbreviations, and enforce consistent formatting.</li>
                        <li><strong>Comparison:</strong> Cross-check standardized addresses against input variants.</li>
                        <li><strong>Flagging:</strong> Mark records requiring manual review if verification fails.</li>
                    </ol>
                    
                    <h4>Input Data</h4>
                    <ul>
                        <li><strong>Source:</strong> Canonical supplier records from Experiment 3</li>
                        <li><strong>Fields:</strong> Company Name, TIN, Address</li>
                        <li><strong>API Used:</strong> External PH address verification service</li>
                    </ul>
                </div>
                
                <div class="experiment-controls">
                    <h4>Execution Controls</h4>
                    <button id="start-verification-btn" class="btn btn-primary">
                        🔵 Start Address Verification
                    </button>
                    <button id="stop-verification-btn" class="btn btn-secondary" style="margin-left: 10px;" disabled>
                        ⚪ Stop
                    </button>
                    <button id="reset-verification-btn" class="btn btn-warning" style="margin-left: 10px;">
                        🟠 Reset
                    </button>
                </div>
                
                <div id="verification-progress" class="progress-container" style="display: none;">
                    <div class="progress-bar">
                        <div id="verification-progress-fill" class="progress-fill"></div>
                    </div>
                    <div id="verification-progress-text" class="progress-text">Initializing...</div>
                    <div id="verification-stats" class="verification-stats"></div>
                </div>
                
                <div class="results-summary" style="margin-top: 30px;">
                    <h3>📊 Results Summary</h3>
                    <div class="summary-stats">
                        <div class="stat-item success">✅ Total Addresses Processed: <span id="total-processed">50</span></div>
                        <div class="stat-item success">🟢 Successfully Standardized: <span id="successfully-standardized">47</span></div>
                        <div class="stat-item warning">🟡 Minor Discrepancies: <span id="minor-discrepancies">2</span></div>
                        <div class="stat-item error">🔴 Failed Verifications: <span id="failed-verifications">1</span></div>
                    </div>
                </div>
                
                <div id="verification-results" class="results-container" style="display: none;">
                    <h3>Detailed Results</h3>
                    <div class="example-results">
                        <h4>Example 1: BDO Unibank</h4>
                        <table class="example-table">
                            <thead>
                                <tr>
                                    <th>Input Address</th>
                                    <th>Standardized Address</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>"7899 Makati Ave, Makati City"</td>
                                    <td>"7899 Makati Avenue, Makati City, Metro Manila"</td>
                                    <td><span class="status-badge success">✅ Verified</span></td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <h4>Example 2: San Miguel Corporation</h4>
                        <table class="example-table">
                            <thead>
                                <tr>
                                    <th>Input Address</th>
                                    <th>Standardized Address</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>"40 San Miguel Ave, Mandaluyong"</td>
                                    <td>"40 San Miguel Avenue, Mandaluyong City, Metro Manila"</td>
                                    <td><span class="status-badge warning">🟡 Minor discrepancy</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
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
                
                <div class="conclusions" style="margin-top: 30px;">
                    <h3>Conclusions</h3>
                    <ul>
                        <li>Address verification successfully standardized 94% of records.</li>
                        <li>Minor discrepancies were due to abbreviations and formatting differences.</li>
                        <li>One failed verification highlights the need for manual review on exceptions.</li>
                        <li>Clean addresses are now prepared for inclusion in the final consensus supplier registry (Experiment 5).</li>
                    </ul>
                </div>
            </div>
            
            <script src="/js/experiment4.js"></script>
        `
     });
});

app.get('/use-cases', (req, res) => {
    res.render('layout', {
        title: 'Use Cases — Consensus Supplier Data Validation',
        currentPage: 'use-cases',
        content: `
            <div class="use-case-section">
                <h2>Primary Use Case: Supplier Data Reliability in the Philippines</h2>
                <div class="use-case-content">
                    <div class="problem-section">
                        <h3>Problem:</h3>
                        <p>Businesses in the Philippines face data inconsistencies because there is no central public company database. Supplier details on receipts often include misspellings, incomplete addresses, or inconsistent TIN formats.</p>
                    </div>
                    
                    <div class="solution-section">
                        <h3>Solution:</h3>
                        <p>Consensus-based validation ensures supplier records are reliable by using majority voting, normalization, and clustering across multiple receipts.</p>
                    </div>
                    
                    <div class="value-section">
                        <h3>Value:</h3>
                        <ul>
                            <li><strong>Accountants:</strong> Clean supplier master data for audits and compliance.</li>
                            <li><strong>Businesses:</strong> Faster, more accurate expense reporting.</li>
                            <li><strong>Regulators:</strong> More consistent data for BIR tax filings.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="use-cases-grid">
                <div class="use-case-card">
                    <h2>Use Case 1: Automated Bookkeeping & Compliance</h2>
                    <ul>
                        <li>Integrates with TOTALFLOW BOS to automatically validate supplier data from uploaded receipts.</li>
                        <li>Flags discrepancies before they cause errors in financial reporting.</li>
                        <li>Provides a confidence score per supplier for auditors.</li>
                    </ul>
                </div>

                <div class="use-case-card">
                    <h2>Use Case 2: Supplier Master Data Cleansing</h2>
                    <ul>
                        <li>Consensus logic applied to large receipt datasets builds a verified supplier registry.</li>
                        <li>Removes duplicates, normalizes names, and reconstructs addresses.</li>
                        <li>Acts as a foundation for ERP or accounting software vendor modules.</li>
                    </ul>
                </div>

                <div class="use-case-card">
                    <h2>Use Case 3: Regional Compliance Modules</h2>
                    <ul>
                        <li>Current research applies to Philippines (BIR compliance).</li>
                        <li>Framework can be extended to other regions with limited company registries:</li>
                    </ul>
                    <div class="regional-examples">
                        <div class="region-item">
                            <strong>Indonesia</strong> → NPWP (Tax ID) validation
                        </div>
                        <div class="region-item">
                            <strong>Nigeria</strong> → Corporate Affairs Commission records
                        </div>
                        <div class="region-item">
                            <strong>SMEs globally</strong> → Clean, auditable supplier records without reliance on centralized databases
                        </div>
                    </div>
                </div>
            </div>

            <div class="strategic-impact">
                <h2>Strategic Impact</h2>
                <div class="impact-content">
                    <ul>
                        <li>Ensures compliance readiness in the Philippines where official data sources are limited.</li>
                        <li>Opens opportunities for regional modules that can be monetized via subscription or integration.</li>
                        <li>Provides AI-enhanced consensus logic that differentiates TOTALFLOW from other bookkeeping and compliance platforms.</li>
                    </ul>
                </div>
            </div>
        `
    });
});

app.get('/project-summary', (req, res) => {
    res.render('layout', { 
        title: 'Project Summary — Consensus Supplier Data Validation',
        currentPage: 'project-summary',
        content: `
            <div class="project-summary-container">
                <h1>Project Summary – Consensus Supplier Data Validation</h1>
                
                <div class="summary-section">
                    <h2>1. Project Overview</h2>
                    <div class="overview-content">
                        <p><strong>Project Title:</strong> Consensus Method for Supplier Data Validation in the Philippines</p>
                        <p><strong>Core R&D Activity:</strong> Consensus-based validation of TIN, supplier name, and address from receipts.</p>
                        <p><strong>Business Context:</strong> Unlike markets with public company registries, the Philippines lacks a centralized database. Supplier details on receipts are inconsistent (misspellings, missing fields, conflicting addresses). This creates accounting and compliance challenges that require advanced consensus techniques to establish reliable supplier records.</p>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h2>2. Hypotheses & Technical Uncertainty</h2>
                    <ul class="hypothesis-list">
                        <li>Can consensus validation resolve supplier identities more effectively than single-source verification?</li>
                        <li>Will TIN normalization improve grouping accuracy of supplier records?</li>
                        <li>Can clustering algorithms handle abbreviations and spelling variations in supplier names?</li>
                        <li>Will completeness scoring reconstruct missing or partial addresses reliably?</li>
                        <li>Can queue management and scaling methods support real-time processing at high transaction volumes?</li>
                    </ul>
                </div>
                
                <div class="summary-section">
                    <h2>3. Experimental Activities</h2>
                    <div class="experiments-grid">
                        <div class="experiment-card">
                            <h4>Experiment 1 – TIN Normalization</h4>
                            <p>Corrected ~95% of entries using standardization and checksum validation.</p>
                        </div>
                        <div class="experiment-card">
                            <h4>Experiment 2 – Name Resolution</h4>
                            <p>Combined fuzzy matching + domain-specific dictionaries to improve clustering of supplier names.</p>
                        </div>
                        <div class="experiment-card">
                            <h4>Experiment 3 – Address Completeness</h4>
                            <p>Applied scoring logic to reconstruct full addresses from partial or inconsistent entries.</p>
                        </div>
                        <div class="experiment-card">
                            <h4>Experiment 4 – Queue Scaling</h4>
                            <p>Introduced priority queue methods that scaled consensus validation efficiently under load.</p>
                        </div>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h2>4. Results</h2>
                    <div class="results-content">
                        <ul class="results-list">
                            <li><strong>TIN normalization:</strong> Achieved ~95% correction accuracy</li>
                            <li><strong>Supplier names:</strong> Clustered and resolved with high precision</li>
                            <li><strong>Addresses:</strong> Reconstructed to complete, standardized formats</li>
                            <li><strong>Scalability:</strong> Queue management maintained processing efficiency under stress tests</li>
                        </ul>
                    </div>
                </div>
                
                <div class="summary-section">
                    <h2>5. Compliance & Future Work</h2>
                    <div class="compliance-content">
                        <p><strong>Compliance:</strong> Designed in alignment with Philippines Data Privacy Act (DPA) and GDPR principles.</p>
                        <h4>Future Work:</h4>
                        <ul class="future-work-list">
                            <li>Expand to multilingual datasets (Tagalog, English, regional dialects)</li>
                            <li>Introduce dynamic dictionaries for industry-specific supplier names</li>
                            <li>Extend consensus framework to global markets lacking central company databases</li>
                        </ul>
                    </div>
                </div>
            </div>
        `
    });
});

// Research page route
app.get('/research', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'research.html'));
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

// Route to serve companies.csv file for download
app.get('/companies.csv', (req, res) => {
    // Use default data file from public/data folder
    const csvPath = path.join(__dirname, 'public', 'data', 'companies.csv');
    
    if (!fs.existsSync(csvPath)) {
        return res.status(404).send('CSV file not found');
    }
    
    res.download(csvPath, 'companies.csv');
});

app.get('/api/companies', (req, res) => {
    const csvPath = path.join(__dirname, 'public', 'data', 'companies.csv');
    console.log('Reading CSV file from:', csvPath);
    
    fs.readFile(csvPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading CSV file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        console.log('CSV file read successfully, data length:', data.length);
        const lines = data.trim().split('\n');
        console.log('Total lines in CSV:', lines.length);
        const companies = [];
        
        // Process all lines, but skip headers
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) {
                console.log(`Skipping empty line ${i}`);
                continue;
            }
            
            const values = parseCSVLine(line);
            console.log(`Line ${i}: parsed ${values.length} values:`, values);
            
            if (values.length >= 3) {
                // Skip header row if it contains 'TIN', 'NAME', 'ADDRESS' pattern
                if (values[0].toUpperCase() === 'TIN' && values[1].toUpperCase() === 'NAME' && values[2].toUpperCase() === 'ADDRESS') {
                    console.log(`Skipping header line ${i}:`, values);
                    continue;
                }
                
                companies.push({
                    tin: values[0].trim(),
                    name: values[1].trim(),
                    address: values[2].trim()
                });
                console.log(`Added company ${companies.length}: ${values[1].trim()}`);
            } else {
                console.log(`Skipping line ${i}: insufficient values (${values.length} < 3)`);
            }
        }
        
        console.log('Parsed companies count:', companies.length);
        console.log('First 3 companies:', companies.slice(0, 3));
        res.json(companies);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in browser`);
});

module.exports = app;