// Boot Screen React Component - Using React.createElement for compatibility
const { useState, useEffect, useRef, createElement: h } = React;

const BootScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootLines, setBootLines] = useState([]);
  const [systemStats, setSystemStats] = useState({
    memory: 0,
    storage: 0,
    network: 0
  });
  const [isMobile, setIsMobile] = useState(false);
  
  const bootMessages = [
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

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Animate boot sequence
    let lineIndex = 0;
    let currentLines = [];
    
    const bootInterval = setInterval(() => {
      if (lineIndex < bootMessages.length) {
        currentLines = [...currentLines, bootMessages[lineIndex]];
        setBootLines(currentLines);
        lineIndex++;
        
        // Update progress
        const progress = Math.round((lineIndex / bootMessages.length) * 100);
        setBootProgress(progress);
      } else {
        clearInterval(bootInterval);
        // Auto-hide after boot complete
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    }, 100);
    
    // Animate system stats
    const statsInterval = setInterval(() => {
      setSystemStats({
        memory: Math.min(85, systemStats.memory + Math.random() * 10),
        storage: Math.min(62, systemStats.storage + Math.random() * 8),
        network: Math.min(100, systemStats.network + Math.random() * 15)
      });
    }, 200);
    
    // Skip on any key press or click
    const handleSkip = () => {
      clearInterval(bootInterval);
      clearInterval(statsInterval);
      handleClose();
    };
    
    document.addEventListener('keydown', handleSkip);
    document.addEventListener('click', handleSkip);
    
    return () => {
      clearInterval(bootInterval);
      clearInterval(statsInterval);
      document.removeEventListener('keydown', handleSkip);
      document.removeEventListener('click', handleSkip);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      // Remove boot screen from DOM
      const bootScreenContainer = document.getElementById('boot-screen-container');
      if (bootScreenContainer) {
        bootScreenContainer.remove();
      }
    }, 500);
  };
  
  if (!isVisible) {
    return null;
  }
  
  // Mobile Layout
  if (isMobile) {
    return (
      <div className="boot-screen-react mobile" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--pipboy-bg)',
        color: 'var(--pipboy-green)',
        fontFamily: 'var(--pipboy-terminal-font)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: '2rem',
            margin: 0,
            textShadow: 'var(--pipboy-glow-intense)'
          }}>RYONGJIN</h1>
          <p style={{
            fontSize: '0.875rem',
            opacity: 0.8,
            margin: '5px 0'
          }}>TERMINAL OS v4.1.0</p>
        </div>
        
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Progress Bar */}
          <div style={{
            background: 'var(--pipboy-bg-alt)',
            border: '1px solid var(--pipboy-dark-green)',
            borderRadius: '2px',
            padding: '15px'
          }}>
            <div style={{
              fontSize: '0.875rem',
              marginBottom: '10px',
              opacity: 0.8
            }}>Loading System... {bootProgress}%</div>
            <div style={{
              height: '10px',
              background: 'rgba(65, 255, 0, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${bootProgress}%`,
                background: 'var(--pipboy-green)',
                boxShadow: '0 0 10px var(--pipboy-green)',
                transition: 'width 0.1s linear'
              }} />
            </div>
          </div>
          
          {/* Terminal Output */}
          <div style={{
            flex: 1,
            background: 'var(--pipboy-bg-alt)',
            border: '1px solid var(--pipboy-dark-green)',
            borderRadius: '2px',
            padding: '15px',
            overflow: 'auto',
            fontSize: '0.75rem',
            lineHeight: 1.4
          }}>
            {bootLines.map((line, index) => (
              <div key={index} style={{
                opacity: line === '' ? 0 : 1,
                minHeight: line === '' ? '1em' : 'auto'
              }}>
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.75rem',
          opacity: 0.6
        }}>
          Tap anywhere to skip
        </div>
      </div>
    );
  }
  
  // Desktop Layout
  return (
    <div className="boot-screen-react desktop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--pipboy-bg)',
      color: 'var(--pipboy-green)',
      fontFamily: 'var(--pipboy-terminal-font)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      padding: '40px',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.5s ease'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{
            fontSize: '3rem',
            margin: 0,
            textShadow: 'var(--pipboy-glow-intense)'
          }}>RYONGJIN</h1>
          <p style={{
            fontSize: '1rem',
            opacity: 0.8,
            margin: 0
          }}>TERMINAL OS v4.1.0</p>
        </div>
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '0.875rem',
          opacity: 0.8
        }}>
          <span>SECURE CONNECTION</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>SEOUL-KR</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span>{new Date().toISOString().split('T')[0]}</span>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '30px',
        minHeight: 0
      }}>
        {/* Left Panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* System Status */}
          <div style={{
            background: 'var(--pipboy-bg-alt)',
            border: '1px solid var(--pipboy-dark-green)',
            borderRadius: '2px',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              margin: '0 0 15px 0',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--pipboy-dark-green)'
            }}>SYSTEM STATUS</h3>
            
            {Object.entries({
              MEMORY: systemStats.memory,
              STORAGE: systemStats.storage,
              NETWORK: systemStats.network === 100 ? 'ONLINE' : systemStats.network
            }).map(([label, value]) => (
              <div key={label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '15px'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  minWidth: '70px',
                  opacity: 0.8
                }}>{label}</span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: 'rgba(65, 255, 0, 0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${typeof value === 'number' ? value : 100}%`,
                    background: 'var(--pipboy-green)',
                    boxShadow: 'var(--pipboy-glow)',
                    transition: 'width 0.2s ease-out'
                  }} />
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  minWidth: '50px',
                  textAlign: 'right'
                }}>{typeof value === 'number' ? `${Math.round(value)}%` : value}</span>
              </div>
            ))}
          </div>
          
          {/* Pipboy Image */}
          <div style={{
            flex: 1,
            background: 'var(--pipboy-bg-alt)',
            border: '1px solid var(--pipboy-dark-green)',
            borderRadius: '2px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/images/pipboy-character.gif" 
              alt="Pipboy"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 20px rgba(65, 255, 0, 0.6))'
              }}
            />
          </div>
        </div>
        
        {/* Right Panel - Terminal */}
        <div style={{
          background: 'var(--pipboy-bg-alt)',
          border: '1px solid var(--pipboy-dark-green)',
          borderRadius: '2px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            margin: '0 0 15px 0',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--pipboy-dark-green)'
          }}>BOOT SEQUENCE</h3>
          
          <div style={{
            flex: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            fontFamily: 'var(--pipboy-terminal-font)',
            paddingRight: '10px'
          }}>
            {bootLines.map((line, index) => (
              <div key={index} style={{
                opacity: line === '' ? 0 : 1,
                minHeight: line === '' ? '1em' : 'auto',
                animation: 'fadeIn 0.3s ease'
              }}>
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '30px'
      }}>
        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '0.75rem',
          opacity: 0.6
        }}>
          <span style={{
            padding: '4px 8px',
            background: 'rgba(65, 255, 0, 0.2)',
            borderRadius: '2px'
          }}>ESC to skip</span>
          <span style={{
            padding: '4px 8px',
            background: 'rgba(65, 255, 0, 0.2)',
            borderRadius: '2px'
          }}>F1 for help</span>
        </div>
        
        <div style={{
          fontSize: '0.875rem',
          opacity: 0.8
        }}>
          Loading... {bootProgress}%
        </div>
      </div>
    </div>
  );
};

// Initialize React Boot Screen
document.addEventListener('DOMContentLoaded', () => {
  // Create container for React app
  const container = document.createElement('div');
  container.id = 'boot-screen-container';
  document.body.insertBefore(container, document.body.firstChild);
  
  // Add fade-in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  // Render React component
  ReactDOM.render(<BootScreen />, container);
});