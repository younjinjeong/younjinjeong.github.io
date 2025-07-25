// Terminal cursor and command system
let searchEngine = null;

// Initialize search engine
async function initSearchEngine() {
    if (!window.SearchEngine) {
        // SearchEngine not loaded yet, use fallback
        return null;
    }
    
    searchEngine = new window.SearchEngine();
    await searchEngine.init();
    return searchEngine;
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search engine in background
    initSearchEngine().catch(console.error);
    
    // Initialize terminals that exist on page load
    initializeAllTerminals();
    
    // Watch for dynamically added terminals
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList && node.classList.contains('terminal-prompt')) {
                    initializeTerminal(node);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

function initializeAllTerminals() {
    const terminalPrompts = document.querySelectorAll('.terminal-prompt');
    terminalPrompts.forEach(function(prompt) {
        if (!prompt.querySelector('.terminal-input')) {
            initializeTerminal(prompt);
        }
    });
}

function initializeTerminal(terminalPrompt) {
    // Check if already initialized
    if (terminalPrompt.querySelector('.terminal-input')) {
        return;
    }
    
    // Create input element for commands
    const commandInput = document.createElement('input');
    commandInput.type = 'text';
    commandInput.className = 'terminal-input';
    commandInput.style.cssText = `
        background: transparent;
        border: none;
        color: var(--pipboy-green);
        font-family: var(--pipboy-terminal-font);
        font-size: inherit;
        outline: none;
        width: auto;
        min-width: 300px;
        margin-left: 10px;
        padding: 0;
        vertical-align: middle;
    `;
    
    // Create output area for command results
    const outputArea = document.createElement('div');
    outputArea.className = 'terminal-output';
    outputArea.style.cssText = `
        color: var(--pipboy-green);
        font-family: var(--pipboy-terminal-font);
        font-size: 14px;
        margin-top: 20px;
        max-height: 300px;
        overflow-y: auto;
        white-space: pre-wrap;
    `;
    
    // Insert elements
    terminalPrompt.appendChild(commandInput);
    terminalPrompt.parentNode.insertBefore(outputArea, terminalPrompt.nextSibling);
    
    // Focus on click
    terminalPrompt.addEventListener('click', () => {
        commandInput.focus();
    });
    
    // Command history
    const commandHistory = [];
    let historyIndex = -1;
    
    // Get all posts data from the page
    function getAllPosts() {
        const posts = [];
        // Try to get posts from various sources on the page
        document.querySelectorAll('article, .post-item, .post').forEach(article => {
            const titleElem = article.querySelector('h1, h2, .post-title');
            const linkElem = article.querySelector('a[href]');
            const dateElem = article.querySelector('time, .post-meta');
            const tagsElems = article.querySelectorAll('.post-tags a, [href*="/tags/"]');
            
            if (titleElem && linkElem) {
                const tags = Array.from(tagsElems).map(tag => tag.textContent.replace('#', '').trim());
                posts.push({
                    title: titleElem.textContent.trim(),
                    url: linkElem.href,
                    date: dateElem ? dateElem.textContent.trim() : '',
                    tags: tags
                });
            }
        });
        
        // Also check for posts in list pages
        document.querySelectorAll('.preview-item, .posts-list a').forEach(item => {
            const text = item.textContent.trim();
            const link = item.closest('a') || item.querySelector('a');
            if (text && link) {
                posts.push({
                    title: text.replace('› ', ''),
                    url: link.href,
                    date: '',
                    tags: []
                });
            }
        });
        
        // For homepage, get the main article
        const mainArticle = document.querySelector('main article.post');
        if (mainArticle && posts.length === 0) {
            const titleElem = mainArticle.querySelector('.post-title');
            const tagsElems = mainArticle.querySelectorAll('.post-tags a');
            const dateElem = mainArticle.querySelector('.post-meta');
            
            if (titleElem) {
                const tags = Array.from(tagsElems).map(tag => tag.textContent.replace('#', '').trim());
                posts.push({
                    title: titleElem.textContent.trim(),
                    url: window.location.href,
                    date: dateElem ? dateElem.textContent.trim() : '',
                    tags: tags
                });
            }
        }
        
        return posts;
    }
    
    // Command handlers
    const commands = {
        help: () => {
            return `Available commands:
  help, ?     - Show this help message
  ls          - List all posts (Date | Title | Category)
  find <term> - Search for posts containing <term>
  grep <pattern> - Full-text search in all posts (supports regex)
  egrep <pattern> - Extended grep with line numbers and context
  go <url>    - Navigate to post by URL (e.g., go /2025/03/hugo-blog/)
  go <number> - Navigate to post by number (current page only)
  clear       - Clear terminal output
  about       - Show blog information`;
        },
        
        '?': () => commands.help(),
        
        ls: () => {
            // Fetch all posts from the site's JSON feed
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/index.json', false); // Synchronous request for simplicity
            try {
                xhr.send();
                if (xhr.status === 200) {
                    const allPosts = JSON.parse(xhr.responseText);
                    if (allPosts.length === 0) {
                        return 'No posts found.';
                    }
                    
                    let output = 'total ' + allPosts.length + '\n';
                    output += '-rw-r--r--  1 user user 4096\n\n';
                    
                    // Sort posts by date (newest first)
                    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    allPosts.forEach((post) => {
                        const date = post.date || '0000-00-00';
                        // Truncate title if too long, but keep full width padding
                        let title = post.title;
                        if (title.length > 50) {
                            title = title.substring(0, 47) + '...';
                        }
                        title = title.padEnd(50);
                        
                        let category = 'uncategorized';
                        
                        // Get category from post
                        if (post.categories && post.categories.length > 0) {
                            category = post.categories[0];
                        }
                        
                        // Ensure category is padded for alignment
                        category = category.padEnd(15);
                        
                        // Format: Date | Title | Category
                        output += `${date}  ${title}  ${category}\n`;
                    });
                    
                    return output;
                }
            } catch (e) {
                // Fallback to current page posts if JSON feed fails
                const posts = getAllPosts();
                if (posts.length === 0) {
                    return 'No posts found on this page.';
                }
                
                let output = 'total ' + posts.length + ' (current page only)\n';
                output += '-rw-r--r--  1 user user 4096\n\n';
                
                posts.forEach((post) => {
                    const date = post.date || '0000-00-00';
                    // Truncate title if too long, but keep full width padding
                    let title = post.title;
                    if (title.length > 50) {
                        title = title.substring(0, 47) + '...';
                    }
                    title = title.padEnd(50);
                    
                    const category = 'uncategorized'.padEnd(15);
                    
                    output += `${date}  ${title}  ${category}\n`;
                });
                
                return output;
            }
            
            return 'Error loading posts.';
        },
        
        find: (args) => {
            if (!args) {
                return 'Usage: find <search term>';
            }
            
            const searchTerm = args.toLowerCase();
            const posts = getAllPosts();
            const matches = posts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
            
            if (matches.length === 0) {
                return `No posts found matching "${args}"`;
            }
            
            let output = `Found ${matches.length} post(s) matching "${args}":\n\n`;
            matches.forEach((post) => {
                const globalIndex = posts.indexOf(post) + 1;
                output += `[${globalIndex}] ${post.title}\n`;
                if (post.tags.length > 0) output += `    Tags: ${post.tags.join(', ')}\n`;
                output += '\n';
            });
            
            return output;
        },
        
        go: (args) => {
            if (!args) {
                return 'Usage: go <url>\nExample: go /2025/03/hugo-blog/';
            }
            
            // If it's a number, check grep results first, then current page
            const num = parseInt(args);
            if (!isNaN(num)) {
                // Check if we have grep results
                if (terminalPrompt._grepResults && terminalPrompt._grepResults.length > 0) {
                    if (num < 1 || num > terminalPrompt._grepResults.length) {
                        return `Invalid result number. Grep found ${terminalPrompt._grepResults.length} results.`;
                    }
                    const result = terminalPrompt._grepResults[num - 1];
                    outputArea.innerHTML += `Navigating to: ${result.title}...\n`;
                    setTimeout(() => {
                        window.location.href = result.url;
                    }, 500);
                    return '';
                }
                
                // Otherwise check posts on current page
                const posts = getAllPosts();
                if (num < 1 || num > posts.length) {
                    return `Invalid post number. Use 'ls' to see available posts.`;
                }
                const post = posts[num - 1];
                outputArea.innerHTML += `Navigating to: ${post.title}...\n`;
                setTimeout(() => {
                    window.location.href = post.url;
                }, 500);
                return '';
            }
            
            // Otherwise treat as URL
            let url = args.trim();
            if (!url.startsWith('/')) {
                url = '/' + url;
            }
            
            outputArea.innerHTML += `Navigating to: ${url}...\n`;
            setTimeout(() => {
                window.location.href = url;
            }, 500);
            
            return '';
        },
        
        clear: () => {
            outputArea.innerHTML = '';
            return '';
        },
        
        about: () => {
            return `RYONGJIN'S BLOG
Terminal OS v4.1.0
Powered by Hugo Static Site Generator

Type 'help' for available commands.`;
        },
        
        grep: (args) => {
            if (!args) {
                return 'Usage: grep <pattern>\nExample: grep "hugo.*blog"';
            }
            
            // Show loading message
            outputArea.innerHTML += 'Searching...\n';
            
            // Fetch search index
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/searchindex.json', false);
            try {
                xhr.send();
                if (xhr.status === 200) {
                    const searchIndex = JSON.parse(xhr.responseText);
                    let pattern;
                    
                    // Try to create regex pattern
                    try {
                        // Check if it's already a regex pattern (starts and ends with /)
                        if (args.startsWith('/') && args.endsWith('/')) {
                            pattern = new RegExp(args.slice(1, -1), 'gi');
                        } else {
                            // Treat as literal string but make it case-insensitive
                            pattern = new RegExp(args, 'gi');
                        }
                    } catch (e) {
                        return `Invalid regex pattern: ${args}\n${e.message}`;
                    }
                    
                    // Search through posts
                    const results = [];
                    searchIndex.forEach(post => {
                        const fullText = `${post.title} ${post.content} ${post.summary || ''}`;
                        const matches = fullText.match(pattern);
                        
                        if (matches) {
                            // Find line contexts
                            const lines = post.content.split('\n');
                            const matchingLines = [];
                            
                            lines.forEach((line, lineNum) => {
                                if (pattern.test(line)) {
                                    matchingLines.push({
                                        lineNum: lineNum + 1,
                                        line: line.trim().substring(0, 80) + (line.length > 80 ? '...' : '')
                                    });
                                }
                            });
                            
                            results.push({
                                title: post.title,
                                url: post.url,
                                date: post.date,
                                matchCount: matches.length,
                                matchingLines: matchingLines.slice(0, 3) // Show max 3 lines per post
                            });
                        }
                    });
                    
                    // Clear the "Searching..." message
                    const lines = outputArea.innerHTML.split('\n');
                    lines.pop(); // Remove "Searching..."
                    lines.pop(); // Remove empty line
                    outputArea.innerHTML = lines.join('\n');
                    
                    if (results.length === 0) {
                        return `No matches found for pattern: ${args}`;
                    }
                    
                    // Format output like grep
                    let output = `Found ${results.length} post(s) matching /${args}/\n\n`;
                    
                    results.forEach((result, index) => {
                        output += `[${index + 1}] ${result.title}\n`;
                        output += `    Date: ${result.date} | Matches: ${result.matchCount}\n`;
                        output += `    URL: ${result.url}\n`;
                        
                        if (result.matchingLines.length > 0) {
                            output += '    Sample matches:\n';
                            result.matchingLines.forEach(match => {
                                output += `      L${match.lineNum}: ${match.line}\n`;
                            });
                        }
                        output += '\n';
                    });
                    
                    output += `\nUse 'go <number>' to navigate to a result`;
                    
                    // Store grep results for navigation
                    terminalPrompt._grepResults = results;
                    
                    return output;
                }
            } catch (e) {
                // Clear the "Searching..." message
                const lines = outputArea.innerHTML.split('\n');
                lines.pop();
                lines.pop();
                outputArea.innerHTML = lines.join('\n');
                
                return `Error loading search index: ${e.message}\nMake sure the site has been built with searchindex support.`;
            }
            
            return 'Search index not available.';
        },
        
        egrep: (args) => {
            if (!args) {
                return 'Usage: egrep <pattern>\nExample: egrep "hugo.*blog"\n       egrep -i "cursor|ide"\n       egrep -n "pattern"';
            }
            
            // Parse egrep flags
            let flags = [];
            let pattern = args;
            const argParts = args.split(' ');
            
            // Check for flags
            if (argParts[0].startsWith('-')) {
                flags = argParts[0].substring(1).split('');
                pattern = argParts.slice(1).join(' ');
            }
            
            // Show loading message
            outputArea.innerHTML += 'Searching...\n';
            
            // Try to use search engine if available
            if (searchEngine && searchEngine.ready) {
                try {
                    const results = searchEngine.egrep(pattern, flags.join(''));
                    
                    // Clear loading message
                    const lines = outputArea.innerHTML.split('\n');
                    lines.pop();
                    lines.pop();
                    outputArea.innerHTML = lines.join('\n');
                    
                    if (results.length === 0) {
                        return `egrep: No matches found for pattern: ${pattern}`;
                    }
                    
                    return searchEngine.formatEgrepOutput(results);
                } catch (e) {
                    // Clear loading message
                    const lines = outputArea.innerHTML.split('\n');
                    lines.pop();
                    lines.pop();
                    outputArea.innerHTML = lines.join('\n');
                    
                    return `egrep: ${e.message}`;
                }
            }
            
            // Fetch search index
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/searchindex.json', false);
            try {
                xhr.send();
                if (xhr.status === 200) {
                    const searchIndex = JSON.parse(xhr.responseText);
                    let regexPattern;
                    
                    // Create regex pattern with proper flags
                    const regexFlags = flags.includes('i') ? 'gi' : 'g';
                    
                    try {
                        // Check if it's already a regex pattern
                        if (pattern.startsWith('/') && pattern.endsWith('/')) {
                            regexPattern = new RegExp(pattern.slice(1, -1), regexFlags);
                        } else {
                            // Treat as literal string
                            regexPattern = new RegExp(pattern, regexFlags);
                        }
                    } catch (e) {
                        // Clear loading message
                        const lines = outputArea.innerHTML.split('\n');
                        lines.pop();
                        lines.pop();
                        outputArea.innerHTML = lines.join('\n');
                        return `egrep: Invalid regex pattern: ${pattern}\n${e.message}`;
                    }
                    
                    // Perform search with egrep-style output
                    let totalMatches = 0;
                    let output = '';
                    
                    searchIndex.forEach(post => {
                        const postPath = post.url.replace(/^\//, '').replace(/\/$/, '') + '.md';
                        const lines = post.content.split('\n');
                        let fileHasMatch = false;
                        let fileOutput = '';
                        
                        lines.forEach((line, lineNum) => {
                            if (regexPattern.test(line)) {
                                if (!fileHasMatch) {
                                    fileHasMatch = true;
                                    if (output) output += '\n';
                                }
                                
                                // Format: filename:linenum:content
                                const lineNumber = lineNum + 1;
                                let displayLine = line.trim();
                                
                                // Highlight matches in the line
                                displayLine = displayLine.replace(regexPattern, (match) => {
                                    return `[${match}]`;
                                });
                                
                                // Truncate long lines
                                if (displayLine.length > 80) {
                                    displayLine = displayLine.substring(0, 77) + '...';
                                }
                                
                                fileOutput += `${postPath}:${lineNumber}:${displayLine}\n`;
                                totalMatches++;
                            }
                        });
                        
                        if (fileHasMatch) {
                            output += fileOutput;
                        }
                    });
                    
                    // Clear the "Searching..." message
                    const lines = outputArea.innerHTML.split('\n');
                    lines.pop();
                    lines.pop();
                    outputArea.innerHTML = lines.join('\n');
                    
                    if (totalMatches === 0) {
                        return `egrep: No matches found for pattern: ${pattern}`;
                    }
                    
                    // Add summary at the end
                    output += `\n-- ${totalMatches} matching lines in ${searchIndex.length} files`;
                    
                    return output;
                }
            } catch (e) {
                // Clear the "Searching..." message
                const lines = outputArea.innerHTML.split('\n');
                lines.pop();
                lines.pop();
                outputArea.innerHTML = lines.join('\n');
                
                return `egrep: Error loading search index: ${e.message}\nMake sure the site has been built with searchindex support.`;
            }
            
            return 'egrep: Search index not available.';
        }
    };
    
    // Process command
    function processCommand(input) {
        const parts = input.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');
        
        if (command in commands) {
            return commands[command](args);
        } else if (command === '') {
            return '';
        } else {
            return `Command not found: ${command}\nType 'help' for available commands.`;
        }
    }
    
    // Handle input
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const input = commandInput.value;
            
            // Add to history
            if (input.trim()) {
                commandHistory.push(input);
                historyIndex = commandHistory.length;
            }
            
            // Display command
            outputArea.innerHTML += `> ${input}\n`;
            
            // Process command
            const result = processCommand(input);
            if (result) {
                outputArea.innerHTML += result + '\n\n';
            }
            
            // Clear input
            commandInput.value = '';
            
            // Scroll to bottom
            outputArea.scrollTop = outputArea.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                commandInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                commandInput.value = commandHistory[historyIndex];
            } else if (historyIndex === commandHistory.length - 1) {
                historyIndex = commandHistory.length;
                commandInput.value = '';
            }
        }
    });
    
    // Initial message
    outputArea.innerHTML = `RYONGJIN TERMINAL v4.1.0
Type 'help' for available commands.
Press Shift+T to focus terminal.

`;
    
    // Keyboard shortcut handler for Shift+T (desktop only)
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.key === 'T') {
            e.preventDefault();
            commandInput.focus();
            // Flash the terminal to indicate focus
            terminalPrompt.style.animation = 'terminal-flash 0.3s';
            setTimeout(() => {
                terminalPrompt.style.animation = '';
            }, 300);
        }
    });
    
    // Mobile terminal improvements
    if ('ontouchstart' in window) {
        // Make terminal more touch-friendly
        terminalPrompt.style.padding = '15px 10px';
        terminalPrompt.style.cursor = 'pointer';
        
        // Add touch feedback
        terminalPrompt.addEventListener('touchstart', () => {
            terminalPrompt.style.backgroundColor = 'rgba(65, 255, 0, 0.1)';
        });
        
        terminalPrompt.addEventListener('touchend', () => {
            setTimeout(() => {
                terminalPrompt.style.backgroundColor = '';
            }, 100);
        });
        
        // Adjust input for mobile
        commandInput.style.fontSize = '16px'; // Prevent zoom on iOS
        commandInput.setAttribute('autocapitalize', 'off');
        commandInput.setAttribute('autocorrect', 'off');
        commandInput.setAttribute('spellcheck', 'false');
    }
    
    // Visual hint when terminal is focused
    commandInput.addEventListener('focus', function() {
        terminalPrompt.classList.add('terminal-focused');
    });
    
    commandInput.addEventListener('blur', function() {
        terminalPrompt.classList.remove('terminal-focused');
    });
}