// Consensus algorithms for company names

class ConsensusAnalyzer {
    constructor() {
        this.stopWords = new Set([
            'llc', 'ltd', 'inc', 'corp', 'co', 'company', 'corporation', 'limited', 'group',
            'and', 'in', 'on', 'with', 'for', 'from', 'to', 'at', 'under', 'over', 'between'
        ]);
        
        this.abbreviations = {
            'ооо': 'limited liability company',
            'оао': 'open joint stock company',
            'зао': 'closed joint stock company',
            'пао': 'public joint stock company',
            'ип': 'individual entrepreneur',
            'чп': 'private enterprise',
            'тов': 'partnership',
            'ltd': 'limited',
            'llc': 'limited liability company',
            'inc': 'incorporated',
            'corp': 'corporation'
        };
    }

    // Text normalization
    normalize(text) {
        if (!text) return '';
        
        // Convert to lowercase
        let normalized = text.toLowerCase().trim();
        
        // Remove punctuation
        normalized = normalized.replace(/[^\w\s\u0400-\u04FF]/g, ' ');
        
        // Split into words
        let words = normalized.split(/\s+/).filter(word => word.length > 0);
        
        // Expand abbreviations
        words = words.map(word => this.abbreviations[word] || word);
        
        // Remove stop words
        words = words.filter(word => !this.stopWords.has(word));
        
        return words.join(' ').trim();
    }

    // Levenshtein distance
    levenshteinDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[len2][len1];
    }

    // Jaro-Winkler similarity
    jaroWinklerSimilarity(str1, str2) {
        if (str1 === str2) return 1.0;
        
        const len1 = str1.length;
        const len2 = str2.length;
        
        if (len1 === 0 || len2 === 0) return 0.0;
        
        const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
        if (matchWindow < 0) return 0.0;
        
        const str1Matches = new Array(len1).fill(false);
        const str2Matches = new Array(len2).fill(false);
        
        let matches = 0;
        let transpositions = 0;
        
        // Identify matches
        for (let i = 0; i < len1; i++) {
            const start = Math.max(0, i - matchWindow);
            const end = Math.min(i + matchWindow + 1, len2);
            
            for (let j = start; j < end; j++) {
                if (str2Matches[j] || str1[i] !== str2[j]) continue;
                str1Matches[i] = str2Matches[j] = true;
                matches++;
                break;
            }
        }
        
        if (matches === 0) return 0.0;
        
        // Count transpositions
        let k = 0;
        for (let i = 0; i < len1; i++) {
            if (!str1Matches[i]) continue;
            while (!str2Matches[k]) k++;
            if (str1[i] !== str2[k]) transpositions++;
            k++;
        }
        
        const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
        
        // Jaro-Winkler
        let prefix = 0;
        for (let i = 0; i < Math.min(len1, len2, 4); i++) {
            if (str1[i] === str2[i]) prefix++;
            else break;
        }
        
        return jaro + (0.1 * prefix * (1 - jaro));
    }

    // Вычисление сходства между двумя строками
    calculateSimilarity(str1, str2) {
        const norm1 = this.normalize(str1);
        const norm2 = this.normalize(str2);
        
        if (norm1 === norm2) return 1.0;
        
        const maxLen = Math.max(norm1.length, norm2.length);
        if (maxLen === 0) return 1.0;
        
        const levenshtein = this.levenshteinDistance(norm1, norm2);
        const levenshteinSimilarity = 1 - (levenshtein / maxLen);
        
        const jaroWinkler = this.jaroWinklerSimilarity(norm1, norm2);
        
        // Комбинированная метрика
        return (levenshteinSimilarity + jaroWinkler) / 2;
    }

    // Frequency-Based Voting
    frequencyBasedVoting(names) {
        const frequency = {};
        const normalized = {};
        
        names.forEach(name => {
            const norm = this.normalize(name);
            if (!frequency[norm]) {
                frequency[norm] = 0;
                normalized[norm] = name; // Save original name
            }
            frequency[norm]++;
        });
        
        let maxFreq = 0;
        let consensus = '';
        
        for (const [norm, freq] of Object.entries(frequency)) {
            if (freq > maxFreq) {
                maxFreq = freq;
                consensus = normalized[norm];
            }
        }
        
        return {
            consensus,
            frequency: maxFreq,
            total: names.length,
            confidence: maxFreq / names.length
        };
    }

    // Hierarchical clustering
    hierarchicalClustering(names, threshold = 0.8) {
        const clusters = names.map((name, index) => ({
            id: index,
            names: [name],
            representative: name
        }));
        
        while (clusters.length > 1) {
            let maxSimilarity = 0;
            let mergeIndices = [-1, -1];
            
            // Find most similar clusters
            for (let i = 0; i < clusters.length; i++) {
                for (let j = i + 1; j < clusters.length; j++) {
                    const similarity = this.calculateSimilarity(
                        clusters[i].representative,
                        clusters[j].representative
                    );
                    
                    if (similarity > maxSimilarity) {
                        maxSimilarity = similarity;
                        mergeIndices = [i, j];
                    }
                }
            }
            
            // If similarity below threshold, stop clustering
            if (maxSimilarity < threshold) break;
            
            // Merge clusters
            const [i, j] = mergeIndices;
            const merged = {
                id: clusters[i].id,
                names: [...clusters[i].names, ...clusters[j].names],
                representative: clusters[i].names.length >= clusters[j].names.length 
                    ? clusters[i].representative 
                    : clusters[j].representative
            };
            
            clusters.splice(j, 1);
            clusters.splice(i, 1);
            clusters.push(merged);
        }
        
        return clusters;
    }

    // Synthesis for information completeness
    synthesizeConsensus(names) {
        const frequencyResult = this.frequencyBasedVoting(names);
        const clusters = this.hierarchicalClustering(names);
        
        // Find largest cluster
        const largestCluster = clusters.reduce((max, cluster) => 
            cluster.names.length > max.names.length ? cluster : max
        );
        
        // Combined result
        return {
            frequencyBased: frequencyResult,
            hierarchicalClusters: clusters,
            largestCluster,
            synthesizedConsensus: largestCluster.representative,
            confidence: Math.max(
                frequencyResult.confidence,
                largestCluster.names.length / names.length
            ),
            totalVariants: names.length,
            uniqueVariants: new Set(names.map(name => this.normalize(name))).size
        };
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    const analyzer = new ConsensusAnalyzer();
    const startBtn = document.getElementById('start-consensus-btn');
    const progressInfo = document.getElementById('progress-info');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const resultsContainer = document.getElementById('consensus-results');
    const groupsContainer = document.getElementById('consensus-groups');

    startBtn.addEventListener('click', async function() {
        try {
            startBtn.disabled = true;
            progressInfo.style.display = 'block';
            resultsContainer.style.display = 'none';
            
            // Get duplicates data from localStorage (saved from Experiment 1)
            const duplicatesData = JSON.parse(localStorage.getItem('duplicatesData') || '{}');
            
            if (Object.keys(duplicatesData).length === 0) {
                alert('No duplicates data found. Please run Experiment 1 first.');
                return;
            }
            
            progressText.textContent = 'Analyzing duplicate groups...';
            progressFill.style.width = '20%';
            
            const results = [];
            const groups = Object.entries(duplicatesData);
            
            for (let i = 0; i < groups.length; i++) {
                const [cleanedTin, records] = groups[i];
                
                if (records.length < 2) continue; // Skip groups with single record
                
                progressText.textContent = `Processing group ${i + 1} of ${groups.length}...`;
                progressFill.style.width = `${20 + (i / groups.length) * 60}%`;
                
                const companyNames = records.map(record => record.NAME);
                const consensus = analyzer.synthesizeConsensus(companyNames);
                
                results.push({
                    cleanedTin,
                    records,
                    consensus,
                    companyNames
                });
                
                // Small delay for progress visualization
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            progressText.textContent = 'Generating results...';
            progressFill.style.width = '90%';
            
            // Display results
            displayResults(results);
            
            progressFill.style.width = '100%';
            progressText.textContent = 'Analysis completed!';
            
            setTimeout(() => {
                progressInfo.style.display = 'none';
                resultsContainer.style.display = 'block';
            }, 1000);
            
        } catch (error) {
            console.error('Error during consensus analysis:', error);
            alert('An error occurred during analysis. Check console for details.');
        } finally {
            startBtn.disabled = false;
        }
    });

    function displayResults(results) {
        groupsContainer.innerHTML = '';
        
        results.forEach((result, index) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'consensus-group';
            
            const confidence = Math.round(result.consensus.confidence * 100);
            const confidenceClass = confidence >= 80 ? 'high' : confidence >= 60 ? 'medium' : 'low';
            
            groupDiv.innerHTML = `
                <div class="group-header">
                    <h4>Group ${index + 1}: TIN ${result.cleanedTin}</h4>
                    <span class="confidence ${confidenceClass}">${confidence}% confidence</span>
                </div>
                
                <div class="consensus-result">
                    <div class="consensus-name">
                        <strong>Consensus:</strong> ${result.consensus.synthesizedConsensus}
                    </div>
                    
                    <div class="statistics">
                        <span>Total variants: ${result.consensus.totalVariants}</span>
                        <span>Unique: ${result.consensus.uniqueVariants}</span>
                        <span>Clusters: ${result.consensus.hierarchicalClusters.length}</span>
                    </div>
                </div>
                
                <div class="variants">
                    <h5>All name variants:</h5>
                    <ul>
                        ${result.companyNames.map(name => `<li>${name || 'Not specified'}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="addresses">
                    <h5>All address variants:</h5>
                    <ul>
                        ${result.records.map(record => `<li>${record.ADDRESS || 'Not specified'}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="frequency-analysis">
                    <h5>Frequency analysis:</h5>
                    <p><strong>Most frequent:</strong> ${result.consensus.frequencyBased.consensus} 
                       (${result.consensus.frequencyBased.frequency}/${result.consensus.frequencyBased.total})</p>
                </div>
            `;
            
            groupsContainer.appendChild(groupDiv);
        });
    }
});