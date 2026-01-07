# E2E Testing Plan for RYONGJIN's Blog

## Overview
Implement browser-based front-end and design testing using Vibium to verify the blog/webpage works correctly, with focus on font display and image sizing.

## Test Scope

### 1. Font Display Tests
- Verify DungGeunMo font loads correctly
- Check font-family fallback chain works
- Validate font rendering on headings, body text, and code blocks
- Test Korean character rendering
- Verify terminal-style monospace appearance

### 2. Image Size Tests
- Verify profile images load with correct dimensions
- Check responsive image scaling
- Validate favicon sizes
- Test Pip-Boy character GIF display
- Verify image aspect ratios are maintained

### 3. Visual Design Tests
- Validate Pip-Boy green color scheme (#41ff00)
- Check glow effects render properly
- Verify scanline animation presence
- Test dark background contrast

### 4. Navigation Tests
- Homepage loads correctly
- Posts list navigation works
- Individual post pages render
- About page displays
- Category/tag pages function

### 5. Interactive Elements Tests
- Boot screen animation triggers on first visit
- Loading screen appears on navigation
- Mobile navigation controls function
- Comments section (Giscus) loads

## Implementation Steps

1. **Setup**: Install vibium, create test directory structure
2. **Configuration**: Create test config with base URL and options
3. **Test Files**:
   - `font-display.test.js` - Font loading and rendering
   - `image-sizing.test.js` - Image dimensions and loading
   - `visual-design.test.js` - Color scheme and effects
   - `navigation.test.js` - Page navigation
   - `interactive.test.js` - Interactive elements
4. **Runner**: Create test runner script
5. **CI Integration**: Add to GitHub Actions workflow

## Expected Outputs
- Test results with pass/fail status
- Screenshots for visual verification
- Console logs for debugging
- Test report summary
