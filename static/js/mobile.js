// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const pipboyNav = document.querySelector('.pipboy-nav');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    
    if (!mobileMenuToggle || !pipboyNav || !mobileOverlay) {
        return;
    }
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        mobileMenuToggle.classList.toggle('active');
        pipboyNav.classList.toggle('mobile-active');
        mobileOverlay.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (pipboyNav.classList.contains('mobile-active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    // Menu toggle button click
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking overlay
    mobileOverlay.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking a link
    const navLinks = pipboyNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (pipboyNav.classList.contains('mobile-active')) {
                toggleMobileMenu();
            }
        });
    });
    
    // Handle resize events
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Close mobile menu if screen becomes larger
            if (window.innerWidth > 768 && pipboyNav.classList.contains('mobile-active')) {
                toggleMobileMenu();
            }
        }, 250);
    });
    
    // Touch gestures for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const swipeDistance = touchEndX - touchStartX;
        
        // Swipe right to open menu
        if (swipeDistance > swipeThreshold && !pipboyNav.classList.contains('mobile-active')) {
            if (touchStartX < 30) { // Only from left edge
                toggleMobileMenu();
            }
        }
        
        // Swipe left to close menu
        if (swipeDistance < -swipeThreshold && pipboyNav.classList.contains('mobile-active')) {
            toggleMobileMenu();
        }
    }
});