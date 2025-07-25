// Search Engine Module - Prepared for WASM integration
// This module provides a high-performance search interface that can be
// enhanced with WebAssembly for even faster regex matching

class SearchEngine {
    constructor() {
        this.searchIndex = null;
        this.ready = false;
        this.wasmModule = null;
    }

    // Initialize the search engine
    async init() {
        try {
            // Load search index
            const response = await fetch('/searchindex.json');
            if (!response.ok) {
                throw new Error('Failed to load search index');
            }
            
            this.searchIndex = await response.json();
            
            // Future: Load WASM module here
            // this.wasmModule = await this.loadWasmModule();
            
            this.ready = true;
            return true;
        } catch (error) {
            console.error('Search engine initialization failed:', error);
            return false;
        }
    }

    // Future WASM module loader
    async loadWasmModule() {
        // This will load a WASM module for high-performance regex matching
        // For now, we use native JavaScript regex
        return null;
    }

    // Perform egrep-style search
    egrep(pattern, flags = '') {
        if (!this.ready || !this.searchIndex) {
            throw new Error('Search engine not initialized');
        }

        const results = [];
        const regexFlags = flags.includes('i') ? 'gi' : 'g';
        
        let regex;
        try {
            // Parse pattern
            if (pattern.startsWith('/') && pattern.endsWith('/')) {
                regex = new RegExp(pattern.slice(1, -1), regexFlags);
            } else {
                regex = new RegExp(pattern, regexFlags);
            }
        } catch (e) {
            throw new Error(`Invalid regex pattern: ${e.message}`);
        }

        // Search through all posts
        this.searchIndex.forEach(post => {
            const matches = this.searchInPost(post, regex);
            if (matches.length > 0) {
                results.push({
                    post: post,
                    matches: matches
                });
            }
        });

        return results;
    }

    // Search within a single post
    searchInPost(post, regex) {
        const matches = [];
        const lines = post.content.split('\n');
        
        lines.forEach((line, index) => {
            const lineMatches = [];
            let match;
            
            // Reset regex lastIndex for global searches
            regex.lastIndex = 0;
            
            while ((match = regex.exec(line)) !== null) {
                lineMatches.push({
                    text: match[0],
                    index: match.index,
                    line: line,
                    lineNumber: index + 1
                });
                
                // Prevent infinite loop on zero-width matches
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
            }
            
            if (lineMatches.length > 0) {
                matches.push({
                    lineNumber: index + 1,
                    line: line,
                    matches: lineMatches
                });
            }
        });
        
        return matches;
    }

    // Format results in egrep style
    formatEgrepOutput(results) {
        let output = '';
        let totalMatches = 0;
        
        results.forEach(result => {
            const postPath = result.post.url.replace(/^\//, '').replace(/\/$/, '') + '.md';
            
            result.matches.forEach(match => {
                let displayLine = match.line.trim();
                
                // Highlight matches
                match.matches.forEach(m => {
                    displayLine = displayLine.replace(m.text, `[${m.text}]`);
                });
                
                // Truncate long lines
                if (displayLine.length > 80) {
                    displayLine = displayLine.substring(0, 77) + '...';
                }
                
                output += `${postPath}:${match.lineNumber}:${displayLine}\n`;
                totalMatches++;
            });
        });
        
        if (totalMatches > 0) {
            output += `\n-- ${totalMatches} matching lines in ${results.length} files`;
        }
        
        return output;
    }
}

// Export for use in terminal
window.SearchEngine = SearchEngine;