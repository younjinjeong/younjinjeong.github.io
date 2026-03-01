/**
 * Language Detection and Suggestion System
 * Detects browser language preference and suggests the appropriate
 * translation if available on the current page.
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'preferred-lang';
  var DISMISSED_KEY = 'lang-suggestion-dismissed';

  function getPreferredLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ko') {
      return stored;
    }
    var browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (browserLang === 'ko' || browserLang.startsWith('ko-')) {
      return 'ko';
    }
    return 'en';
  }

  function setPreferredLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function wasDismissed() {
    return sessionStorage.getItem(DISMISSED_KEY) === window.location.pathname;
  }

  function dismissSuggestion() {
    sessionStorage.setItem(DISMISSED_KEY, window.location.pathname);
  }

  function getCurrentArticleLang() {
    var article = document.querySelector('article[lang]');
    return article ? (article.getAttribute('lang') || 'en') : 'en';
  }

  function getTranslations() {
    var translations = {};
    var links = document.querySelectorAll('.language-switcher .lang-option[data-lang]');
    links.forEach(function(link) {
      translations[link.getAttribute('data-lang')] = link.getAttribute('href');
    });
    return translations;
  }

  function showSuggestion(targetLang, targetUrl) {
    var banner = document.createElement('div');
    banner.className = 'lang-suggestion visible';
    banner.setAttribute('role', 'alert');

    var messages = {
      ko: '\uC774 \uAE00\uC758 <a href="' + targetUrl + '">\uD55C\uAD6D\uC5B4 \uBC84\uC804</a>\uC774 \uC788\uC2B5\uB2C8\uB2E4.',
      en: 'An <a href="' + targetUrl + '">English version</a> of this article is available.'
    };

    banner.innerHTML = messages[targetLang] +
      ' <button class="dismiss-btn" aria-label="Dismiss">X</button>';

    document.body.appendChild(banner);

    banner.querySelector('.dismiss-btn').addEventListener('click', function() {
      banner.classList.remove('visible');
      dismissSuggestion();
      setTimeout(function() { banner.remove(); }, 300);
    });

    banner.querySelector('a').addEventListener('click', function() {
      setPreferredLang(targetLang);
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Save preference when clicking language switcher links
    var switcherLinks = document.querySelectorAll('.language-switcher .lang-option[data-lang]');
    switcherLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        setPreferredLang(this.getAttribute('data-lang'));
      });
    });

    // Check if we should suggest a different language
    var translations = getTranslations();
    if (Object.keys(translations).length === 0) return;

    var preferredLang = getPreferredLang();
    var currentLang = getCurrentArticleLang();

    if (preferredLang !== currentLang && translations[preferredLang] && !wasDismissed()) {
      setTimeout(function() {
        showSuggestion(preferredLang, translations[preferredLang]);
      }, 1500);
    }
  });
})();
