/**
 * Pip-Boy Color Scheme Selector
 * Visitor-facing color scheme picker styled as a Fallout terminal panel.
 * Persists selection in localStorage across sessions.
 */
(function() {
  'use strict';

  var SCHEMES = [
    {
      id: 'aged-phosphor',
      label: 'AGED PHOSPHOR',
      desc: 'Muted CRT green — default',
      primary: '#7ABF5E',
      isDefault: true,
      vars: {
        '--pipboy-green': '#7ABF5E',
        '--pipboy-dark-green': '#4E8A2C',
        '--pipboy-light-green': '#96D47A',
        '--pipboy-amber': '#C8B060',
        '--pipboy-bg-alt': '#061106',
        '--pipboy-rgb': '122, 191, 94',
        '--pipboy-rgb-alt': '100, 160, 76',
        '--pipboy-glow': '0 0 5px rgba(122, 191, 94, 0.5)',
        '--pipboy-glow-intense': '0 0 10px rgba(122, 191, 94, 0.7)',
        '--pipboy-glow-subtle': '0 0 2px rgba(122, 191, 94, 0.4)',
        '--syntax-default': '#7ABF5E',
        '--syntax-keyword': '#C8B060',
        '--syntax-keyword-dark': '#5E9A40',
        '--syntax-string': '#96D47A',
        '--syntax-function': '#8CC870',
        '--syntax-number': '#60C880',
        '--syntax-attribute': '#B0D8A0',
        '--syntax-operator': '#4E8A2C',
        '--syntax-comment': '#3A6828',
        '--syntax-error': '#E05040',
        '--syntax-bg': '#061106',
        '--syntax-line-highlight': '#0E200E',
        '--syntax-line-number': '#3A6A3A',
        '--syntax-error-bg': '#1A0800'
      }
    },
    {
      id: 'amber-terminal',
      label: 'AMBER TERMINAL',
      desc: 'IBM 3270 warm amber',
      primary: '#E0A830',
      vars: {
        '--pipboy-green': '#E0A830',
        '--pipboy-dark-green': '#B08020',
        '--pipboy-light-green': '#F0C860',
        '--pipboy-amber': '#FFD080',
        '--pipboy-bg-alt': '#110800',
        '--pipboy-rgb': '224, 168, 48',
        '--pipboy-rgb-alt': '180, 140, 40',
        '--pipboy-glow': '0 0 5px rgba(224, 168, 48, 0.6)',
        '--pipboy-glow-intense': '0 0 10px rgba(224, 168, 48, 0.8)',
        '--pipboy-glow-subtle': '0 0 2px rgba(224, 168, 48, 0.5)',
        '--syntax-default': '#E0A830',
        '--syntax-keyword': '#FFD080',
        '--syntax-keyword-dark': '#CC9940',
        '--syntax-string': '#F0C860',
        '--syntax-function': '#EECC55',
        '--syntax-number': '#FFB850',
        '--syntax-attribute': '#F0DCA0',
        '--syntax-operator': '#C09030',
        '--syntax-comment': '#806020',
        '--syntax-error': '#FF6633',
        '--syntax-bg': '#110800',
        '--syntax-line-highlight': '#2A1A08',
        '--syntax-line-number': '#665533',
        '--syntax-error-bg': '#1A0800'
      }
    },
    {
      id: 'phosphor-green',
      label: 'PHOSPHOR GREEN',
      desc: 'Classic bright CRT',
      primary: '#41ff00',
      vars: {
        '--pipboy-green': '#41ff00',
        '--pipboy-dark-green': '#29a000',
        '--pipboy-light-green': '#5fff1f',
        '--pipboy-amber': '#ffb000',
        '--pipboy-bg-alt': '#001100',
        '--pipboy-rgb': '65, 255, 0',
        '--pipboy-rgb-alt': '65, 255, 0',
        '--pipboy-glow': '0 0 5px rgba(65, 255, 0, 0.6)',
        '--pipboy-glow-intense': '0 0 10px rgba(65, 255, 0, 0.8)',
        '--pipboy-glow-subtle': '0 0 2px rgba(65, 255, 0, 0.5)',
        '--syntax-default': '#41ff00',
        '--syntax-keyword': '#ffb000',
        '--syntax-keyword-dark': '#cc8800',
        '--syntax-string': '#7fff5f',
        '--syntax-function': '#5fff1f',
        '--syntax-number': '#00ff88',
        '--syntax-attribute': '#aaffaa',
        '--syntax-operator': '#33aa00',
        '--syntax-comment': '#1a6600',
        '--syntax-error': '#ff4400',
        '--syntax-bg': '#001100',
        '--syntax-line-highlight': '#0a2a0a',
        '--syntax-line-number': '#336633',
        '--syntax-error-bg': '#1a0000'
      }
    },
    {
      id: 'vault-tec-blue',
      label: 'VAULT-TEC BLUE',
      desc: 'Fallout 4 blue Pip-Boy',
      primary: '#7CB8DE',
      vars: {
        '--pipboy-green': '#7CB8DE',
        '--pipboy-dark-green': '#4A8AAA',
        '--pipboy-light-green': '#A0D4F0',
        '--pipboy-amber': '#88CCEE',
        '--pipboy-bg-alt': '#000811',
        '--pipboy-rgb': '124, 184, 222',
        '--pipboy-rgb-alt': '100, 150, 190',
        '--pipboy-glow': '0 0 5px rgba(124, 184, 222, 0.5)',
        '--pipboy-glow-intense': '0 0 10px rgba(124, 184, 222, 0.7)',
        '--pipboy-glow-subtle': '0 0 2px rgba(124, 184, 222, 0.4)',
        '--syntax-default': '#7CB8DE',
        '--syntax-keyword': '#A0D4F0',
        '--syntax-keyword-dark': '#5A98B8',
        '--syntax-string': '#90C8E8',
        '--syntax-function': '#88C0E0',
        '--syntax-number': '#60B0D8',
        '--syntax-attribute': '#B8D8F0',
        '--syntax-operator': '#4A8AAA',
        '--syntax-comment': '#3A6888',
        '--syntax-error': '#E06080',
        '--syntax-bg': '#000811',
        '--syntax-line-highlight': '#081820',
        '--syntax-line-number': '#3A6688',
        '--syntax-error-bg': '#180810'
      }
    },
    {
      id: 'nuka-cola-warm',
      label: 'NUKA-COLA WARM',
      desc: 'Warm cream parchment',
      primary: '#D4C5A9',
      vars: {
        '--pipboy-green': '#D4C5A9',
        '--pipboy-dark-green': '#A89878',
        '--pipboy-light-green': '#E8DCC8',
        '--pipboy-amber': '#DDCCAA',
        '--pipboy-bg-alt': '#0A0900',
        '--pipboy-rgb': '212, 197, 169',
        '--pipboy-rgb-alt': '180, 165, 140',
        '--pipboy-glow': '0 0 5px rgba(212, 197, 169, 0.4)',
        '--pipboy-glow-intense': '0 0 10px rgba(212, 197, 169, 0.6)',
        '--pipboy-glow-subtle': '0 0 2px rgba(212, 197, 169, 0.3)',
        '--syntax-default': '#D4C5A9',
        '--syntax-keyword': '#E8DCC8',
        '--syntax-keyword-dark': '#B8A888',
        '--syntax-string': '#DDD4BC',
        '--syntax-function': '#D8CEB4',
        '--syntax-number': '#C8BEA4',
        '--syntax-attribute': '#E8E0D0',
        '--syntax-operator': '#A89878',
        '--syntax-comment': '#887858',
        '--syntax-error': '#D08060',
        '--syntax-bg': '#0A0900',
        '--syntax-line-highlight': '#1A1808',
        '--syntax-line-number': '#887868',
        '--syntax-error-bg': '#1A0800'
      }
    },
    {
      id: 'wasteland-amber',
      label: 'WASTELAND AMBER',
      desc: 'Fallout: New Vegas',
      primary: '#CC8844',
      vars: {
        '--pipboy-green': '#CC8844',
        '--pipboy-dark-green': '#996633',
        '--pipboy-light-green': '#DDAA66',
        '--pipboy-amber': '#DDAA55',
        '--pipboy-bg-alt': '#110800',
        '--pipboy-rgb': '204, 136, 68',
        '--pipboy-rgb-alt': '170, 120, 50',
        '--pipboy-glow': '0 0 5px rgba(204, 136, 68, 0.6)',
        '--pipboy-glow-intense': '0 0 10px rgba(204, 136, 68, 0.8)',
        '--pipboy-glow-subtle': '0 0 2px rgba(204, 136, 68, 0.5)',
        '--syntax-default': '#CC8844',
        '--syntax-keyword': '#DDAA66',
        '--syntax-keyword-dark': '#AA7733',
        '--syntax-string': '#DDAA66',
        '--syntax-function': '#CC9955',
        '--syntax-number': '#BB8844',
        '--syntax-attribute': '#DDBB88',
        '--syntax-operator': '#996633',
        '--syntax-comment': '#664422',
        '--syntax-error': '#FF5533',
        '--syntax-bg': '#110800',
        '--syntax-line-highlight': '#2A1808',
        '--syntax-line-number': '#886644',
        '--syntax-error-bg': '#1A0800'
      }
    },
    {
      id: 'institute-grey',
      label: 'INSTITUTE GREY',
      desc: 'Fallout 4 Institute',
      primary: '#A0B0BC',
      vars: {
        '--pipboy-green': '#A0B0BC',
        '--pipboy-dark-green': '#708090',
        '--pipboy-light-green': '#C0D0DC',
        '--pipboy-amber': '#B0C0CC',
        '--pipboy-bg-alt': '#060808',
        '--pipboy-rgb': '160, 176, 188',
        '--pipboy-rgb-alt': '130, 148, 160',
        '--pipboy-glow': '0 0 5px rgba(160, 176, 188, 0.4)',
        '--pipboy-glow-intense': '0 0 10px rgba(160, 176, 188, 0.6)',
        '--pipboy-glow-subtle': '0 0 2px rgba(160, 176, 188, 0.3)',
        '--syntax-default': '#A0B0BC',
        '--syntax-keyword': '#C0D0DC',
        '--syntax-keyword-dark': '#8898A4',
        '--syntax-string': '#B0C0CC',
        '--syntax-function': '#A8B8C4',
        '--syntax-number': '#90A8B8',
        '--syntax-attribute': '#C0CCD4',
        '--syntax-operator': '#708090',
        '--syntax-comment': '#586878',
        '--syntax-error': '#C07080',
        '--syntax-bg': '#060808',
        '--syntax-line-highlight': '#101418',
        '--syntax-line-number': '#607080',
        '--syntax-error-bg': '#180810'
      }
    }
  ];

  var DEFAULT_ID = 'aged-phosphor';
  var activeId = null;
  var panelOpen = false;

  // Apply scheme as early as possible to avoid flash of default colors
  function applyScheme(id) {
    var scheme = SCHEMES.find(function(s) { return s.id === id; });
    if (!scheme) return;
    var root = document.documentElement;
    var vars = scheme.vars;
    for (var prop in vars) {
      if (vars.hasOwnProperty(prop)) {
        root.style.setProperty(prop, vars[prop]);
      }
    }
    activeId = id;
    try { localStorage.setItem('pipboy-scheme', id); } catch(e) {}
    updatePanel();
  }

  function clearScheme() {
    var root = document.documentElement;
    SCHEMES[0].vars && Object.keys(SCHEMES[0].vars).forEach(function(prop) {
      root.style.removeProperty(prop);
    });
    activeId = DEFAULT_ID;
    try { localStorage.removeItem('pipboy-scheme'); } catch(e) {}
    updatePanel();
  }

  function updatePanel() {
    var rows = document.querySelectorAll('.csp-row');
    if (!rows.length) return;
    rows.forEach(function(row) {
      if (row.dataset.scheme === activeId) {
        row.classList.add('csp-active');
      } else {
        row.classList.remove('csp-active');
      }
    });
  }

  function togglePanel() {
    panelOpen = !panelOpen;
    var body = document.getElementById('csp-body');
    var btn = document.getElementById('csp-toggle');
    if (panelOpen) {
      body.classList.add('csp-open');
      btn.classList.add('csp-toggle-active');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      body.classList.remove('csp-open');
      btn.classList.remove('csp-toggle-active');
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  function buildPanel() {
    var panel = document.createElement('div');
    panel.id = 'color-scheme-panel';

    var style = [
      '#color-scheme-panel {',
      '  position: fixed; bottom: 20px; left: 20px; z-index: 10000;',
      '  font-family: var(--pipboy-terminal-font, monospace);',
      '  font-size: 13px;',
      '}',
      '#color-scheme-panel * { box-sizing: border-box; }',

      /* Toggle button */
      '.csp-toggle {',
      '  width: 36px; height: 36px; border-radius: 4px;',
      '  background: rgba(0,0,0,0.85); cursor: pointer;',
      '  display: flex; align-items: center; justify-content: center;',
      '  transition: all 0.2s ease;',
      '  border: 1px solid var(--pipboy-dark-green, #4E8A2C);',
      '  color: var(--pipboy-green, #7ABF5E);',
      '  font-size: 15px; line-height: 1;',
      '  opacity: 0.6;',
      '}',
      '.csp-toggle:hover { opacity: 1; box-shadow: var(--pipboy-glow-subtle); }',
      '.csp-toggle-active {',
      '  opacity: 1; border-color: var(--pipboy-green, #7ABF5E);',
      '  box-shadow: var(--pipboy-glow);',
      '}',

      /* Panel body */
      '.csp-body {',
      '  display: none; position: absolute; bottom: 46px; left: 0;',
      '  background: rgba(0, 0, 0, 0.92);',
      '  border: 1px solid var(--pipboy-dark-green, #4E8A2C);',
      '  border-radius: 4px; width: 260px;',
      '  box-shadow: 0 4px 24px rgba(0,0,0,0.7), var(--pipboy-glow-subtle);',
      '  overflow: hidden;',
      '}',
      '.csp-body.csp-open { display: block; }',

      /* Header */
      '.csp-header {',
      '  padding: 10px 12px 8px;',
      '  border-bottom: 1px solid var(--pipboy-dark-green, #4E8A2C);',
      '  display: flex; align-items: center; gap: 8px;',
      '  color: var(--pipboy-green, #7ABF5E);',
      '}',
      '.csp-header-icon { font-size: 14px; opacity: 0.7; }',
      '.csp-header-text {',
      '  font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;',
      '  opacity: 0.8;',
      '}',

      /* Scheme rows */
      '.csp-list { padding: 6px 0; }',
      '.csp-row {',
      '  display: flex; align-items: center; gap: 10px;',
      '  padding: 7px 12px; cursor: pointer;',
      '  transition: background 0.15s ease;',
      '  color: var(--pipboy-green, #7ABF5E);',
      '  opacity: 0.7;',
      '}',
      '.csp-row:hover { background: rgba(var(--pipboy-rgb, 122,191,94), 0.08); opacity: 1; }',
      '.csp-row.csp-active {',
      '  opacity: 1;',
      '  background: rgba(var(--pipboy-rgb, 122,191,94), 0.1);',
      '}',
      '.csp-dot {',
      '  width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0;',
      '  border: 1px solid rgba(255,255,255,0.15);',
      '  transition: all 0.2s ease;',
      '}',
      '.csp-row:hover .csp-dot,',
      '.csp-row.csp-active .csp-dot {',
      '  box-shadow: 0 0 8px currentColor;',
      '  border-color: rgba(255,255,255,0.3);',
      '}',
      '.csp-label-wrap { flex: 1; min-width: 0; }',
      '.csp-name {',
      '  font-size: 12px; font-weight: bold; letter-spacing: 0.5px;',
      '  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
      '}',
      '.csp-desc-text {',
      '  font-size: 10px; opacity: 0.55; margin-top: 1px;',
      '  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
      '}',
      '.csp-check {',
      '  width: 16px; text-align: center; flex-shrink: 0;',
      '  font-size: 11px; opacity: 0;',
      '}',
      '.csp-active .csp-check { opacity: 1; }',

      /* Footer */
      '.csp-footer {',
      '  padding: 8px 12px; border-top: 1px solid var(--pipboy-dark-green, #4E8A2C);',
      '  display: flex; align-items: center; justify-content: space-between;',
      '}',
      '.csp-reset-btn {',
      '  font-size: 10px; background: none; border: none;',
      '  color: var(--pipboy-green, #7ABF5E); opacity: 0.45;',
      '  cursor: pointer; font-family: inherit;',
      '  text-transform: uppercase; letter-spacing: 1px;',
      '  padding: 2px 0; transition: opacity 0.2s;',
      '}',
      '.csp-reset-btn:hover { opacity: 0.8; }',
      '.csp-saved {',
      '  font-size: 10px; opacity: 0; transition: opacity 0.3s;',
      '  color: var(--pipboy-green, #7ABF5E);',
      '}',
      '.csp-saved.csp-show { opacity: 0.6; }',

      /* Close on ESC overlay — invisible click-catcher */
      '.csp-backdrop {',
      '  display: none; position: fixed; inset: 0; z-index: 9999;',
      '}',
      '.csp-backdrop.csp-open { display: block; }',

      /* Mobile: push above bottom nav */
      '@media (max-width: 810px) {',
      '  #color-scheme-panel { bottom: 80px; left: 10px; }',
      '  .csp-body { width: 240px; }',
      '}'
    ].join('\n');

    // Build scheme rows
    var rows = SCHEMES.map(function(s) {
      return [
        '<div class="csp-row" data-scheme="' + s.id + '" role="option" tabindex="0">',
        '  <div class="csp-dot" style="background:' + s.primary + ';color:' + s.primary + '"></div>',
        '  <div class="csp-label-wrap">',
        '    <div class="csp-name">' + s.label + '</div>',
        '    <div class="csp-desc-text">' + s.desc + '</div>',
        '  </div>',
        '  <div class="csp-check">&#10003;</div>',
        '</div>'
      ].join('');
    }).join('');

    panel.innerHTML = [
      '<style>' + style + '</style>',
      '<div class="csp-backdrop" id="csp-backdrop"></div>',
      '<div class="csp-body" id="csp-body" role="listbox" aria-label="Color scheme selector">',
      '  <div class="csp-header">',
      '    <span class="csp-header-icon">&#9783;</span>',
      '    <span class="csp-header-text">DISPLAY COLOR</span>',
      '  </div>',
      '  <div class="csp-list">' + rows + '</div>',
      '  <div class="csp-footer">',
      '    <button class="csp-reset-btn" id="csp-reset" title="Reset to default Aged Phosphor">RESET DEFAULT</button>',
      '    <span class="csp-saved" id="csp-saved">SAVED</span>',
      '  </div>',
      '</div>',
      '<div class="csp-toggle" id="csp-toggle" role="button" aria-label="Change display color" aria-expanded="false" tabindex="0">',
      '  &#9783;',
      '</div>'
    ].join('\n');

    document.body.appendChild(panel);

    // Bind events
    document.getElementById('csp-toggle').addEventListener('click', togglePanel);
    document.getElementById('csp-backdrop').addEventListener('click', function() {
      if (panelOpen) togglePanel();
    });

    document.querySelectorAll('.csp-row').forEach(function(row) {
      row.addEventListener('click', function() {
        var id = row.dataset.scheme;
        if (id === DEFAULT_ID) {
          clearScheme();
        } else {
          applyScheme(id);
        }
        flashSaved();
      });
      row.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });
    });

    document.getElementById('csp-reset').addEventListener('click', function() {
      clearScheme();
      flashSaved();
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && panelOpen) togglePanel();
    });
  }

  function flashSaved() {
    var el = document.getElementById('csp-saved');
    if (!el) return;
    el.classList.add('csp-show');
    clearTimeout(el._timer);
    el._timer = setTimeout(function() { el.classList.remove('csp-show'); }, 1500);
  }

  // Apply saved scheme ASAP (before DOMContentLoaded if possible)
  function restoreSaved() {
    var saved;
    try { saved = localStorage.getItem('pipboy-scheme'); } catch(e) {}
    if (saved && saved !== DEFAULT_ID) {
      applyScheme(saved);
    } else {
      activeId = DEFAULT_ID;
    }
  }

  // Restore immediately — CSS variables set on <html> take effect before paint
  restoreSaved();

  // Build panel once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      buildPanel();
      updatePanel();
    });
  } else {
    buildPanel();
    updatePanel();
  }
})();
