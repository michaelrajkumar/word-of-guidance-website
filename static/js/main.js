/**
 * Word of Guidance - Main JavaScript
 * Handles menu toggle, navigation, and interactivity
 */

(function() {
  'use strict';

  // ============================================
  // MENU TOGGLE FUNCTIONALITY
  // ============================================

  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !isExpanded);
      mainNav.setAttribute('aria-expanded', !isExpanded);
    });

    // Close menu when a link is clicked
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        // Don't close if it's a dropdown parent
        if (!this.parentElement.classList.contains('has-children')) {
          menuToggle.setAttribute('aria-expanded', 'false');
          mainNav.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.site-header')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============================================
  // LANGUAGE SWITCHER
  // ============================================

  const langSwitcherBtn = document.getElementById('langSwitcherBtn');
  const langDropdown = document.getElementById('langDropdown');

  if (langSwitcherBtn && langDropdown) {
    langSwitcherBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.language-switcher-header')) {
        langDropdown.classList.remove('active');
      }
    });
  }

  // ============================================
  // DROPDOWN MENU HANDLING
  // ============================================

  const navItems = document.querySelectorAll('.nav-item.has-children');

  navItems.forEach(item => {
    const link = item.querySelector(':scope > .nav-link');


    // Handle clicks for mobile/tablet
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 1023) {
        // Prevent link navigation only if it has a submenu
        if (item.querySelector('.submenu')) {
          e.preventDefault();

          // If it's a nested submenu, just toggle it
          if (item.closest('.submenu')) {
            item.classList.toggle('active');
          } else {
            // If it's a top-level menu, close others before opening
            navItems.forEach(otherItem => {
              if (otherItem !== item) {
                otherItem.classList.remove('active');
                // Also close nested active items
                otherItem.querySelectorAll('.active').forEach(nestedActive => {
                  nestedActive.classList.remove('active');
                });
              }
            });
            item.classList.toggle('active');
          }
        }
      }
    });
  });

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        const target = document.querySelector(href);
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ============================================
  // FORM HANDLING
  // ============================================

  const contactForm = document.querySelector('.contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      // Honeypot check
      const honeypot = this.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) {
        e.preventDefault();
        return false;
      }
    });
  }

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  // Handle Escape key to close menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      if (mainNav) {
        mainNav.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ============================================
  // HEADER SCROLL EFFECT
  // ============================================

  const siteHeader = document.querySelector('.site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // ============================================
  // RESPONSIVE BEHAVIOR
  // ============================================

  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Reset menu on resize
      if (window.innerWidth > 768 && menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        if (mainNav) {
          mainNav.setAttribute('aria-expanded', 'false');
        }
      }
    }, 250);
  });

  // ============================================
  // LAZY LOADING IMAGES
  // ============================================

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  // ============================================
  // ACTIVE LINK HIGHLIGHTING
  // ============================================

  function setActiveLink() {
    const currentLocation = location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '#' && currentLocation.includes(href)) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  setActiveLink();

  // ============================================
  // PERFORMANCE: PRELOAD CRITICAL RESOURCES
  // ============================================

  // Preload fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Open+Sans:wght@300;400;600;700&display=swap';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);

  // ============================================
  // ANALYTICS & TRACKING (Optional)
  // ============================================

  // Add your analytics code here if needed
  // Example: Google Analytics, Matomo, etc.

  console.log('Word of Guidance website loaded successfully');
})();
