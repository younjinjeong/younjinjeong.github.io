// RYONGJIN BBS — Terminal Command System
// 1980s IBM BBS-style interactive terminal

document.addEventListener('DOMContentLoaded', function() {
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
    if (terminalPrompt.querySelector('.terminal-input')) return;

    // Create input element
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

    // Create output area
    const outputArea = document.createElement('div');
    outputArea.className = 'terminal-output';
    outputArea.style.cssText = `
        color: var(--pipboy-green);
        font-family: var(--pipboy-terminal-font);
        font-size: inherit;
        margin-top: 20px;
        max-height: 300px;
        overflow-y: auto;
        white-space: pre-wrap;
    `;

    terminalPrompt.appendChild(commandInput);
    terminalPrompt.parentNode.insertBefore(outputArea, terminalPrompt.nextSibling);

    terminalPrompt.addEventListener('click', () => commandInput.focus());

    // State
    const commandHistory = [];
    let historyIndex = -1;
    // Stores numbered results from list/search for go <number>
    terminalPrompt._navResults = null;

    // ─── Helpers ───────────────────────────────────────────────

    function getCurrentSection() {
        const path = window.location.pathname;
        if (path === '/') return 'home';
        if ((path === '/posts/' || path === '/posts') && !pathIsSingle('/posts/')) return 'posts';
        if (path === '/about/' || path === '/about') return 'about';
        if (path === '/categories/' || path === '/categories') return 'categories';
        if (path === '/tags/' || path === '/tags') return 'tags';
        if (path.startsWith('/categories/') && pathIsSingle('/categories/')) return 'category';
        if (path.startsWith('/tags/') && pathIsSingle('/tags/')) return 'tag';
        // Single post: anything under /posts/ or /YYYY/MM/...
        if (path.startsWith('/posts/') || /^\/\d{4}\/\d{2}\//.test(path)) return 'post';
        return 'unknown';
    }

    function pathIsSingle(prefix) {
        const rest = window.location.pathname.slice(prefix.length).replace(/\/$/, '');
        return rest.length > 0;
    }

    function truncTitle(title, max) {
        if (title.length > max) return title.substring(0, max - 3) + '...';
        return title;
    }

    function fetchJSON(url) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send();
        if (xhr.status === 200) return JSON.parse(xhr.responseText);
        return null;
    }

    function storeResults(results) {
        terminalPrompt._navResults = results;
    }

    function getPageTitle() {
        const h1 = document.querySelector('.post-title, article h1, main h1');
        return h1 ? h1.textContent.trim() : document.title;
    }

    // ─── Commands ──────────────────────────────────────────────

    const commands = {};

    // HELP / ?
    commands.help = function() {
        return [
            'RYONGJIN BBS  -  COMMAND REFERENCE',
            '',
            '  help, ?        Show this message',
            '  list           List items in section',
            '  search &lt;term&gt;  Search all posts',
            '  go             HOME, POSTS, ABOUT, back, forward, or Go to item by number',
            '  comment        Leave a comment (posts)',
            '  whoami         Show login & IP',
            '  about          Show blog information',
            '  clear          Clear terminal'
        ].join('\n');
    };
    commands['?'] = function() { return commands.help(); };

    // LIST
    commands.list = function() {
        const section = getCurrentSection();

        if (section === 'home') {
            return '*** LIST is not supported on HOME.\n    Use "go posts" to browse all posts.';
        }
        if (section === 'about') {
            return '*** LIST is not supported on ABOUT.';
        }
        if (section === 'post') {
            const title = getPageTitle();
            return '*** You are reading: ' + truncTitle(title, 60) + '\n    Use "go posts" to see all posts.';
        }

        if (section === 'posts') {
            return listPosts();
        }
        if (section === 'categories' || section === 'category') {
            return listCategories();
        }
        if (section === 'tags' || section === 'tag') {
            return listTags();
        }

        return '*** LIST is not supported on this page.';
    };

    function listPosts() {
        var allPosts = fetchJSON('/index.json');
        if (!allPosts || allPosts.length === 0) return 'No posts found.';

        allPosts.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

        var results = [];
        var output = 'POSTS (' + allPosts.length + ' entries)\n';
        output += '────────────────────────────────────────────────\n';

        allPosts.forEach(function(post, i) {
            var num = String(i + 1).padStart(3);
            var date = (post.date || '0000-00-00').substring(0, 10);
            var title = truncTitle(post.title.toUpperCase(), 55);
            output += num + '  ' + date + '  ' + title + '\n';
            results.push({ title: post.title, url: post.url });
        });

        output += '────────────────────────────────────────────────\n';
        output += 'Use "go [number]" to read a post.';
        storeResults(results);
        return output;
    }

    function listCategories() {
        // Scrape category items from the DOM
        var cards = document.querySelectorAll('.category-card, .taxonomy-item, [href*="/categories/"]');
        var results = [];
        var seen = {};

        cards.forEach(function(card) {
            var link = card.closest('a') || card.querySelector('a') || card;
            var href = link.getAttribute('href') || '';
            if (!href.startsWith('/categories/') || href === '/categories/') return;
            var name = link.textContent.trim().split('\n')[0].trim();
            if (!name || seen[href]) return;
            seen[href] = true;

            // Try to find post count
            var countEl = card.querySelector('.category-count, .count, .post-count');
            var countText = countEl ? countEl.textContent.trim() : '';
            var countMatch = countText.match(/\d+/);
            var count = countMatch ? countMatch[0] : '?';

            results.push({ title: name, url: href, count: count });
        });

        // Fallback: fetch from index.json and extract unique categories
        if (results.length === 0) {
            var allPosts = fetchJSON('/index.json');
            if (allPosts) {
                var catMap = {};
                allPosts.forEach(function(post) {
                    if (post.categories) {
                        post.categories.forEach(function(cat) {
                            if (!catMap[cat]) catMap[cat] = 0;
                            catMap[cat]++;
                        });
                    }
                });
                Object.keys(catMap).forEach(function(cat) {
                    results.push({
                        title: cat,
                        url: '/categories/' + cat.toLowerCase().replace(/\s+/g, '-') + '/',
                        count: catMap[cat]
                    });
                });
            }
        }

        if (results.length === 0) return 'No categories found.';

        var output = 'CATEGORIES (' + results.length + ' entries)\n';
        output += '────────────────────────────────────────────────\n';
        results.forEach(function(cat, i) {
            var num = String(i + 1).padStart(3);
            output += num + '  ' + cat.title.toUpperCase() + ' (' + cat.count + ' posts)\n';
        });
        output += '────────────────────────────────────────────────\n';
        output += 'Use "go [number]" to browse a category.';
        storeResults(results);
        return output;
    }

    function listTags() {
        // Scrape tag links from the DOM
        var tagLinks = document.querySelectorAll('[href*="/tags/"]');
        var results = [];
        var seen = {};

        tagLinks.forEach(function(link) {
            var href = link.getAttribute('href') || '';
            if (!href.startsWith('/tags/') || href === '/tags/') return;
            var name = link.textContent.trim().replace(/^#/, '');
            if (!name || seen[href]) return;
            seen[href] = true;
            results.push({ title: name, url: href });
        });

        // Fallback: extract from index.json
        if (results.length === 0) {
            var allPosts = fetchJSON('/index.json');
            if (allPosts) {
                var tagMap = {};
                allPosts.forEach(function(post) {
                    if (post.tags) {
                        post.tags.forEach(function(tag) {
                            if (!tagMap[tag]) tagMap[tag] = 0;
                            tagMap[tag]++;
                        });
                    }
                });
                Object.keys(tagMap).forEach(function(tag) {
                    results.push({
                        title: tag,
                        url: '/tags/' + tag.toLowerCase().replace(/\s+/g, '-') + '/',
                        count: tagMap[tag]
                    });
                });
            }
        }

        if (results.length === 0) return 'No tags found.';

        var output = 'TAGS (' + results.length + ' entries)\n';
        output += '────────────────────────────────────────────────\n';
        results.forEach(function(tag, i) {
            var num = String(i + 1).padStart(3);
            var countStr = tag.count ? ' (' + tag.count + ')' : '';
            output += num + '  ' + tag.title.toUpperCase() + countStr + '\n';
        });
        output += '────────────────────────────────────────────────\n';
        output += 'Use "go [number]" to browse a tag.';
        storeResults(results);
        return output;
    }

    // GO
    commands.go = function(args) {
        if (!args) {
            return '*** MISSING ARGUMENT\n    Usage: go [number] | go [section] | go back | go forward';
        }

        var target = args.trim().toLowerCase();

        // Named sections
        var sections = {
            'home': '/',
            'posts': '/posts/',
            'about': '/about/'
        };

        if (sections[target]) {
            outputArea.innerHTML += 'okay\n';
            sessionStorage.setItem('terminalFocus', '1');
            setTimeout(function() { window.location.href = sections[target]; }, 400);
            return '';
        }

        // Navigation
        if (target === 'back') {
            outputArea.innerHTML += 'okay\n';
            sessionStorage.setItem('terminalFocus', '1');
            setTimeout(function() { window.history.back(); }, 400);
            return '';
        }
        if (target === 'forward') {
            outputArea.innerHTML += 'okay\n';
            sessionStorage.setItem('terminalFocus', '1');
            setTimeout(function() { window.history.forward(); }, 400);
            return '';
        }

        // Numeric — navigate to result from list/search
        var num = parseInt(args, 10);
        if (!isNaN(num)) {
            var results = terminalPrompt._navResults;
            if (!results || results.length === 0) {
                return '*** No results to navigate.\n    Use "list" or "search" first.';
            }
            if (num < 1 || num > results.length) {
                return '*** Invalid selection: ' + num + '\n    Valid range: 1-' + results.length;
            }
            var item = results[num - 1];
            outputArea.innerHTML += 'okay\n';
            sessionStorage.setItem('terminalFocus', '1');
            setTimeout(function() { window.location.href = item.url; }, 400);
            return '';
        }

        // Unknown
        return '*** UNKNOWN TARGET: ' + args + '\n    Usage: go [number] | go home | go posts | go about | go back | go forward';
    };

    // SEARCH
    commands.search = function(args) {
        if (!args) {
            return '*** MISSING ARGUMENT\n    Usage: search [keyword]\n    Example: search microfoundry';
        }

        var searchTerm = args.toLowerCase();
        var searchIndex = fetchJSON('/searchindex.json');

        if (!searchIndex) {
            return '*** ERROR: Search index not available.\n    Site may need to be rebuilt.';
        }

        var results = [];
        searchIndex.forEach(function(post) {
            var fullText = (post.title + ' ' + (post.content || '') + ' ' + (post.summary || '')).toLowerCase();
            if (fullText.indexOf(searchTerm) !== -1) {
                results.push({ title: post.title, url: post.url, date: post.date });
            }
        });

        if (results.length === 0) {
            return '*** No matches found for "' + args + '".';
        }

        var output = 'SEARCH RESULTS FOR "' + args.toUpperCase() + '" (' + results.length + ' found)\n';
        output += '────────────────────────────────────────────────\n';
        results.forEach(function(result, i) {
            var num = String(i + 1).padStart(3);
            var date = (result.date || '').substring(0, 10);
            var title = truncTitle(result.title.toUpperCase(), 55);
            output += num + '  ' + date + '  ' + title + '\n';
        });
        output += '────────────────────────────────────────────────\n';
        output += 'Use "go [number]" to read a result.';

        storeResults(results);
        return output;
    };

    // COMMENT
    commands.comment = function() {
        var section = getCurrentSection();
        if (section !== 'post') {
            return '*** Comments are only available on post pages.\n    Use "go posts" to browse posts first.';
        }

        var giscus = document.querySelector('.giscus') ||
                     document.querySelector('.giscus-frame') ||
                     document.querySelector('iframe[src*="giscus"]');

        if (giscus) {
            giscus.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return 'Scrolling to comments section...\nGitHub login required to post a comment.';
        }

        // Giscus script may not have loaded yet
        var giscusScript = document.querySelector('script[src*="giscus.app"]');
        if (giscusScript) {
            // Scroll to script location
            giscusScript.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return 'Scrolling to comments section...\nGitHub login required to post a comment.\n(Comments widget may still be loading.)';
        }

        return '*** Comment system is not available on this page.';
    };

    // WHOAMI
    commands.whoami = function() {
        // This command is async — we write output manually
        outputArea.innerHTML += 'Querying...\n';

        // Fetch public IP
        fetch('https://api.ipify.org?format=json')
            .then(function(resp) { return resp.json(); })
            .then(function(data) {
                var ip = data.ip || 'unknown';

                // Try to get GitHub username from Giscus
                var username = 'anonymous';
                var giscusFrame = document.querySelector('iframe.giscus-frame');
                // Giscus doesn't expose username easily — default to anonymous
                // User sees their GitHub avatar in Giscus widget if logged in

                var result = username + '  ' + ip;
                outputArea.innerHTML += result + '\n\n';
                outputArea.scrollTop = outputArea.scrollHeight;
            })
            .catch(function() {
                outputArea.innerHTML += 'anonymous  (IP unavailable)\n\n';
                outputArea.scrollTop = outputArea.scrollHeight;
            });

        return ''; // async — output written directly
    };

    // CLEAR
    commands.clear = function() {
        outputArea.innerHTML = '';
        return '';
    };

    // ABOUT
    commands.about = function() {
        return "RYONGJIN's TECH Blog\nTerminal OS v5.0.0\nPowered by Hugo Static Site Generator\n\nType 'help' for available commands.";
    };

    // ─── Command Processor ─────────────────────────────────────

    function processCommand(input) {
        var parts = input.trim().split(/\s+/);
        var command = parts[0].toLowerCase();
        var args = parts.slice(1).join(' ');

        if (command in commands) {
            return commands[command](args);
        }
        if (command === '') return '';

        return '*** UNKNOWN COMMAND: ' + command + '\n    Usage: help | list | go | search | comment | whoami | about | clear\n    Type "help" for available commands.';
    }

    // ─── Input Handler ─────────────────────────────────────────

    commandInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            var input = commandInput.value;

            if (input.trim()) {
                commandHistory.push(input);
                historyIndex = commandHistory.length;
            }

            outputArea.innerHTML += '> ' + input + '\n';

            var result = processCommand(input);
            if (result) {
                outputArea.innerHTML += result + '\n\n';
            }

            commandInput.value = '';
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

    // ─── Boot Banner ───────────────────────────────────────────

    outputArea.innerHTML = 'RYONGJIN BBS v5.0.0\nCONNECTED AT 9600 BAUD\nType "help" for available commands.  Shift+T to focus.\n\n';

    // ─── Keyboard Shortcut (Shift+T) ──────────────────────────

    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.key === 'T') {
            e.preventDefault();
            commandInput.focus();
            terminalPrompt.style.animation = 'terminal-flash 0.3s';
            setTimeout(function() { terminalPrompt.style.animation = ''; }, 300);
        }
    });

    // ─── Mobile Improvements ───────────────────────────────────

    if ('ontouchstart' in window) {
        terminalPrompt.style.padding = '15px 10px';
        terminalPrompt.style.cursor = 'pointer';

        terminalPrompt.addEventListener('touchstart', function() {
            terminalPrompt.style.backgroundColor = 'rgba(65, 255, 0, 0.1)';
        });

        terminalPrompt.addEventListener('touchend', function() {
            setTimeout(function() { terminalPrompt.style.backgroundColor = ''; }, 100);
        });

        commandInput.style.fontSize = '16px';
        commandInput.setAttribute('autocapitalize', 'off');
        commandInput.setAttribute('autocorrect', 'off');
        commandInput.setAttribute('spellcheck', 'false');
    }

    // ─── Focus Hint ────────────────────────────────────────────

    commandInput.addEventListener('focus', function() {
        terminalPrompt.classList.add('terminal-focused');
    });

    commandInput.addEventListener('blur', function() {
        terminalPrompt.classList.remove('terminal-focused');
    });

    // ─── Auto-focus after terminal navigation ────────────────

    if (sessionStorage.getItem('terminalFocus') === '1') {
        sessionStorage.removeItem('terminalFocus');
        setTimeout(function() {
            terminalPrompt.scrollIntoView({ behavior: 'smooth', block: 'center' });
            commandInput.focus();
            terminalPrompt.style.animation = 'terminal-flash 0.3s';
            setTimeout(function() { terminalPrompt.style.animation = ''; }, 300);
        }, 500);
    }
}
