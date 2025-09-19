// Boot Screen Component with React-like functionality
(function() {
  'use strict';

  // Global flag to prevent multiple boot screens
  if (window.__bootScreenInitialized) {
    console.log('Boot screen script already initialized, skipping entire script');
    return;
  }
  window.__bootScreenInitialized = true;

  // Handle browser navigation - reset flag on popstate
  window.addEventListener('popstate', function() {
    console.log('Browser navigation detected, resetting boot screen flag');
    window.__bootScreenInitialized = false;
  });

  // Also check if boot was already shown in this session
  if (sessionStorage.getItem('bootShown') && !window.location.search.includes('boot=true')) {
    console.log('Boot already shown in this session, skipping initialization');
    return;
  }

  class BootScreen {
    constructor() {
      this.isVisible = true;
      this.bootProgress = 0;
      this.bootLines = [];
      this.systemStats = {
        memory: 0,
        storage: 0,
        network: 0
      };
      this.isMobile = window.innerWidth <= 768;
      
      this.bootMessages = [
        "RYONGJIN TERMINAL OS v4.1.0",
        "Copyright 2077-2077 Ryongjin Industries",
        "=====================================",
        "",
        "Initializing system components...",
        "Loading kernel modules... [OK]",
        "Checking file systems... [OK]",
        "Mounting drives... [OK]",
        "Starting network services... [OK]",
        "Initializing quantum processor... [OK]",
        "Loading AI subsystems... [OK]",
        "Calibrating holographic display... [OK]",
        "Synchronizing with vault network... [OK]",
        "Loading user profile... [OK]",
        "",
        "System ready.",
        "Welcome to RYONGJIN's Blog Terminal",
        "",
        "Press any key to continue..."
      ];
      
      this.init();
    }
    
    init() {
      // Prevent duplicate boot screens
      if (document.getElementById('boot-screen-react')) {
        console.log('Boot screen already exists, skipping initialization');
        return;
      }
      
      // Create and insert boot screen
      this.createBootScreen();
      
      // Handle resize
      window.addEventListener('resize', () => {
        this.isMobile = window.innerWidth <= 768;
        this.updateLayout();
      });
      
      // Start boot sequence
      this.startBootSequence();
      
      // Handle skip events
      const handleSkip = () => {
        this.hide();
      };
      
      document.addEventListener('keydown', handleSkip, { once: true });
      document.addEventListener('click', handleSkip, { once: true });
      document.addEventListener('touchstart', handleSkip, { once: true });
    }
    
    createBootScreen() {
      this.container = document.createElement('div');
      this.container.id = 'boot-screen-react';
      this.container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--pipboy-bg);
        color: var(--pipboy-green);
        font-family: var(--pipboy-terminal-font);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        padding: ${this.isMobile ? '20px' : '40px'};
        box-sizing: border-box;
        transition: opacity 0.5s ease;
      `;
      
      this.updateLayout();
      document.body.insertBefore(this.container, document.body.firstChild);
    }
    
    updateLayout() {
      this.container.innerHTML = this.isMobile ? this.getMobileLayout() : this.getDesktopLayout();
      
      // Re-attach terminal element reference for updates
      this.terminalElement = this.container.querySelector('.boot-terminal-output');
      this.progressBar = this.container.querySelector('.boot-progress-bar');
      this.progressText = this.container.querySelector('.boot-progress-text');
      this.memoryBar = this.container.querySelector('.stat-memory');
      this.storageBar = this.container.querySelector('.stat-storage');
      this.networkBar = this.container.querySelector('.stat-network');
      this.networkText = this.container.querySelector('.stat-network-text');
    }
    
    getMobileLayout() {
      return `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 2rem; margin: 0; text-shadow: var(--pipboy-glow-intense);">RYONGJIN</h1>
          <p style="font-size: 0.875rem; opacity: 0.8; margin: 5px 0;">TERMINAL OS v4.1.0</p>
        </div>
        
        <div style="flex: 1; display: flex; flex-direction: column; gap: 20px; min-height: 0;">
          <!-- Progress Bar -->
          <div style="background: var(--pipboy-bg-alt); border: 1px solid var(--pipboy-dark-green); border-radius: 2px; padding: 15px;">
            <div style="font-size: 0.875rem; margin-bottom: 10px; opacity: 0.8;">
              Loading System... <span class="boot-progress-text">0%</span>
            </div>
            <div style="height: 10px; background: rgba(65, 255, 0, 0.2); border-radius: 2px; overflow: hidden;">
              <div class="boot-progress-bar" style="height: 100%; width: 0%; background: var(--pipboy-green); box-shadow: 0 0 10px var(--pipboy-green); transition: width 0.1s linear;"></div>
            </div>
          </div>
          
          <!-- Terminal Output -->
          <div style="flex: 1; background: var(--pipboy-bg-alt); border: 1px solid var(--pipboy-dark-green); border-radius: 2px; padding: 15px; overflow: auto; font-size: 0.75rem; line-height: 1.4;">
            <div class="boot-terminal-output"></div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 0.75rem; opacity: 0.6;">
          Tap anywhere to skip
        </div>
      `;
    }
    
    getDesktopLayout() {
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
          <div>
            <h1 style="font-size: 3rem; margin: 0; text-shadow: var(--pipboy-glow-intense);">RYONGJIN</h1>
            <p style="font-size: 1rem; opacity: 0.8; margin: 0;">TERMINAL OS v4.1.0</p>
          </div>
          <div style="display: flex; gap: 20px; font-size: 0.875rem; opacity: 0.8;">
            <span>SECURE CONNECTION</span>
            <span style="opacity: 0.4;">|</span>
            <span>SEOUL-KR</span>
            <span style="opacity: 0.4;">|</span>
            <span>${new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>
        
        <div style="flex: 1; display: grid; grid-template-columns: 400px 1fr; gap: 30px; min-height: 0;">
          <!-- Left Panel -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- System Status -->
            <div style="background: var(--pipboy-bg-alt); border: 1px solid var(--pipboy-dark-green); border-radius: 2px; padding: 20px;">
              <h3 style="font-size: 1.125rem; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid var(--pipboy-dark-green);">
                SYSTEM STATUS
              </h3>
              
              <!-- Memory -->
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <span style="font-size: 0.75rem; min-width: 70px; opacity: 0.8;">MEMORY</span>
                <div style="flex: 1; height: 8px; background: rgba(65, 255, 0, 0.2); border-radius: 4px; overflow: hidden;">
                  <div class="stat-memory" style="height: 100%; width: 0%; background: var(--pipboy-green); box-shadow: var(--pipboy-glow); transition: width 0.2s ease-out;"></div>
                </div>
                <span style="font-size: 0.75rem; min-width: 50px; text-align: right;">0%</span>
              </div>
              
              <!-- Storage -->
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <span style="font-size: 0.75rem; min-width: 70px; opacity: 0.8;">STORAGE</span>
                <div style="flex: 1; height: 8px; background: rgba(65, 255, 0, 0.2); border-radius: 4px; overflow: hidden;">
                  <div class="stat-storage" style="height: 100%; width: 0%; background: var(--pipboy-green); box-shadow: var(--pipboy-glow); transition: width 0.2s ease-out;"></div>
                </div>
                <span style="font-size: 0.75rem; min-width: 50px; text-align: right;">0%</span>
              </div>
              
              <!-- Network -->
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.75rem; min-width: 70px; opacity: 0.8;">NETWORK</span>
                <div style="flex: 1; height: 8px; background: rgba(65, 255, 0, 0.2); border-radius: 4px; overflow: hidden;">
                  <div class="stat-network" style="height: 100%; width: 0%; background: var(--pipboy-green); box-shadow: var(--pipboy-glow); transition: width 0.2s ease-out;"></div>
                </div>
                <span class="stat-network-text" style="font-size: 0.75rem; min-width: 50px; text-align: right;">0%</span>
              </div>
            </div>
            
            <!-- Pipboy Image -->
            <div style="flex: 1; background: var(--pipboy-bg-alt); border: 1px solid var(--pipboy-dark-green); border-radius: 2px; padding: 20px; display: flex; align-items: center; justify-content: center;">
              <img src="/images/pipboy-character.gif" alt="Pipboy" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 0 20px rgba(65, 255, 0, 0.6));">
            </div>
          </div>
          
          <!-- Right Panel - Terminal -->
          <div style="background: var(--pipboy-bg-alt); border: 1px solid var(--pipboy-dark-green); border-radius: 2px; padding: 20px; display: flex; flex-direction: column;">
            <h3 style="font-size: 1.125rem; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 1px solid var(--pipboy-dark-green);">
              BOOT SEQUENCE
            </h3>
            
            <div style="flex: 1; overflow: auto; font-size: 0.875rem; line-height: 1.6; font-family: var(--pipboy-terminal-font); padding-right: 10px;">
              <div class="boot-terminal-output"></div>
            </div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px;">
          <div style="display: flex; gap: 20px; font-size: 0.75rem; opacity: 0.6;">
            <span style="padding: 4px 8px; background: rgba(65, 255, 0, 0.2); border-radius: 2px;">ESC to skip</span>
            <span style="padding: 4px 8px; background: rgba(65, 255, 0, 0.2); border-radius: 2px;">F1 for help</span>
          </div>
          
          <div style="font-size: 0.875rem; opacity: 0.8;">
            Loading... <span class="boot-progress-text">0%</span>
          </div>
        </div>
      `;
    }
    
    startBootSequence() {
      let lineIndex = 0;
      
      // Boot message animation
      this.bootInterval = setInterval(() => {
        if (lineIndex < this.bootMessages.length) {
          this.addBootLine(this.bootMessages[lineIndex]);
          lineIndex++;
          
          // Update progress
          const progress = Math.round((lineIndex / this.bootMessages.length) * 100);
          this.updateProgress(progress);
        } else {
          clearInterval(this.bootInterval);
          setTimeout(() => this.hide(), 2000);
        }
      }, 100);
      
      // System stats animation
      this.statsInterval = setInterval(() => {
        this.updateSystemStats();
      }, 200);
    }
    
    addBootLine(line) {
      const lineElement = document.createElement('div');
      lineElement.style.cssText = line === '' ? 'height: 1em;' : 'animation: fadeIn 0.3s ease;';
      lineElement.textContent = line || '\u00A0';
      this.terminalElement.appendChild(lineElement);
      
      // Auto-scroll terminal
      this.terminalElement.parentElement.scrollTop = this.terminalElement.parentElement.scrollHeight;
    }
    
    updateProgress(progress) {
      this.bootProgress = progress;
      if (this.progressBar) {
        this.progressBar.style.width = `${progress}%`;
      }
      if (this.progressText) {
        this.progressText.textContent = `${progress}%`;
      }
    }
    
    updateSystemStats() {
      // Animate stats
      this.systemStats.memory = Math.min(85, this.systemStats.memory + Math.random() * 10);
      this.systemStats.storage = Math.min(62, this.systemStats.storage + Math.random() * 8);
      this.systemStats.network = Math.min(100, this.systemStats.network + Math.random() * 15);
      
      // Update bars
      if (this.memoryBar) {
        this.memoryBar.style.width = `${this.systemStats.memory}%`;
        this.memoryBar.nextElementSibling.textContent = `${Math.round(this.systemStats.memory)}%`;
      }
      if (this.storageBar) {
        this.storageBar.style.width = `${this.systemStats.storage}%`;
        this.storageBar.nextElementSibling.textContent = `${Math.round(this.systemStats.storage)}%`;
      }
      if (this.networkBar) {
        this.networkBar.style.width = `${this.systemStats.network}%`;
        if (this.networkText) {
          this.networkText.textContent = this.systemStats.network >= 100 ? 'ONLINE' : `${Math.round(this.systemStats.network)}%`;
        }
      }
    }
    
    hide() {
      clearInterval(this.bootInterval);
      clearInterval(this.statsInterval);

      this.container.style.opacity = '0';
      setTimeout(() => {
        if (this.container && this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }
        // Clear the instance when boot screen is hidden
        window.__bootScreenInstance = null;
      }, 500);
    }
  }
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  // Initialize on DOM ready
  function initializeBootScreen() {
    // Debug logging
    console.log('=== Boot Screen Debug ===');
    console.log('Current URL:', window.location.href);
    console.log('Session Storage bootShown:', sessionStorage.getItem('bootShown'));
    console.log('Window instance exists:', !!window.__bootScreenInstance);
    console.log('Boot screen element exists:', !!document.getElementById('boot-screen-react'));
    console.log('URL has boot=true:', window.location.search.includes('boot=true'));

    // Clean up any orphaned boot screens first
    const existingBootScreen = document.getElementById('boot-screen-react');
    if (existingBootScreen && !window.__bootScreenInstance) {
      console.log('Found orphaned boot screen, removing it');
      existingBootScreen.remove();
    }

    // Check if boot screen should be shown
    // Shows boot screen only for first-time visitors in this session
    const shouldShowBoot = !sessionStorage.getItem('bootShown') ||
                         window.location.search.includes('boot=true');

    if (shouldShowBoot && !window.__bootScreenInstance) {
      console.log('Showing boot screen for first-time visitor');
      // Set session storage IMMEDIATELY to prevent double boot
      sessionStorage.setItem('bootShown', 'true');
      console.log('Session storage set BEFORE creating boot screen');
      window.__bootScreenInstance = new BootScreen();
      console.log('Boot screen instance created');
    } else {
      console.log('Boot screen skipped. Reason:');
      console.log('- shouldShowBoot:', shouldShowBoot);
      console.log('- instance exists:', !!window.__bootScreenInstance);
    }
    console.log('========================');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBootScreen);
  } else {
    initializeBootScreen();
  }
})();