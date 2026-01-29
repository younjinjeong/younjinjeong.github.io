/**
 * CRT Effects Toggle Controller
 * Manages the CRT visual effects (scanlines, barrel distortion, phosphor glow)
 * with localStorage persistence and reduced motion support.
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'crt-effects-enabled';
  const CRT_DISABLED_CLASS = 'crt-effects-disabled';

  /**
   * Check if user prefers reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get saved CRT preference from localStorage
   * Defaults to enabled unless reduced motion is preferred
   */
  function getCRTPreference() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
    // Default: enabled, unless reduced motion is preferred
    return !prefersReducedMotion();
  }

  /**
   * Apply CRT effects state to the document
   */
  function applyCRTState(enabled) {
    if (enabled) {
      document.body.classList.remove(CRT_DISABLED_CLASS);
    } else {
      document.body.classList.add(CRT_DISABLED_CLASS);
    }

    // Update toggle button state
    const toggleBtn = document.getElementById('crtToggle');
    if (toggleBtn) {
      toggleBtn.classList.toggle('crt-disabled', !enabled);
      toggleBtn.setAttribute('aria-pressed', enabled.toString());
      toggleBtn.setAttribute('title', enabled ? 'CRT Effects: ON (Shift+C)' : 'CRT Effects: OFF (Shift+C)');
    }

    // Save preference
    localStorage.setItem(STORAGE_KEY, enabled.toString());
  }

  /**
   * Toggle CRT effects on/off
   */
  function toggleCRT() {
    const currentState = !document.body.classList.contains(CRT_DISABLED_CLASS);
    applyCRTState(!currentState);

    // Play sound feedback (optional)
    playSoundFeedback();
  }

  /**
   * Play TV channel change sound for feedback
   */
  function playSoundFeedback() {
    try {
      const audio = new Audio('/sounds/tv-channel-change.mp3');
      audio.volume = 0.2;
      audio.play().catch(function() {
        // Ignore audio errors (user may not have interacted yet)
      });
    } catch (e) {
      // Ignore if audio not available
    }
  }

  /**
   * Initialize CRT effects controller
   */
  function init() {
    // Apply initial state based on saved preference
    applyCRTState(getCRTPreference());

    // Toggle button click handler
    var toggleBtn = document.getElementById('crtToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleCRT();
      });
    }

    // Keyboard shortcut: Shift+C for desktop
    document.addEventListener('keydown', function(e) {
      if (e.shiftKey && (e.key === 'C' || e.key === 'c') && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Don't trigger if user is typing in an input
        var activeEl = document.activeElement;
        var isTyping = activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable
        );

        if (!isTyping) {
          e.preventDefault();
          toggleCRT();
        }
      }
    });

    // Listen for reduced motion preference changes
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', function(e) {
      if (e.matches) {
        // User enabled reduced motion, disable CRT effects
        applyCRTState(false);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose toggle function globally for external use
  window.toggleCRTEffects = toggleCRT;
})();
