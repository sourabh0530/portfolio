/**
 * Optimized UI/UX Interactions for Portfolio
 * Features: RequestAnimationFrame, IntersectionObserver, Micro-interactions, and 3D Tilt.
 * Designed for smoothness, premium feel, and low CPU usage.
 */

document.addEventListener("DOMContentLoaded", () => {
    // --- State & Performance ---
    let isTabActive = true;
    
    document.addEventListener("visibilitychange", () => {
        isTabActive = !document.hidden;
        // Pause heavy animations via body class if needed
        document.body.classList.toggle('animations-paused', !isTabActive);
    });

    // --- 1. Cursor Glow ---
    // Soft cursor glow effect using CSS variables
    const updateCursorGlow = (e) => {
        if (!isTabActive) return;
        requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
        });
    };
    window.addEventListener('mousemove', updateCursorGlow, { passive: true });

    // --- 2. Scroll Progress Indicator & Navbar ---
    const progressBar = document.createElement('div');
    progressBar.classList.add('scroll-progress');
    document.body.appendChild(progressBar);

    const navbar = document.getElementById('navbar');
    
    const updateScrollState = () => {
        if (!isTabActive) return;
        requestAnimationFrame(() => {
            // Update Progress Bar
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / scrollTotal) * 100;
            progressBar.style.width = `${progress}%`;
            
            // Scrolled Navbar Glassmorphism
            if (navbar) {
                if (window.scrollY > 40) navbar.classList.add('scrolled');
                else navbar.classList.remove('scrolled');
            }
        });
    };
    window.addEventListener('scroll', updateScrollState, { passive: true });

    // --- 3. Premium Scroll Reveals (IntersectionObserver) ---
    // More performant than relying on window.scroll events
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Section-level crossfading
                if (entry.target.tagName.toLowerCase() === 'section') {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
                
                // Unobserve after revealing to save CPU
                observer.unobserve(entry.target); 
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal, section').forEach(el => {
        // Setup initial state for sections for a smooth entry
        if (el.tagName.toLowerCase() === 'section' && el.id !== 'home') {
            el.style.opacity = 0;
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        revealObserver.observe(el);
    });

    // --- 4. 3D Tilt Cards with Soft Glare ---
    const tiltCards = document.querySelectorAll('.glass-card, .skill-square-box, .project-card');
    
    tiltCards.forEach(card => {
        const resetTilt = () => {
            if (!isTabActive) return;
            requestAnimationFrame(() => {
                card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)`;
                const glare = card.querySelector('.glare');
                if (glare) glare.style.opacity = 0;
            });
        };

        card.addEventListener('mousemove', (e) => {
            if (!isTabActive) return;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Smooth, subtle tilting (max 4 degrees to remain professional, not flashy)
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;
                
                card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                
                // Glare layer
                let glare = card.querySelector('.glare');
                if (!glare) {
                    glare = document.createElement('div');
                    glare.classList.add('glare');
                    glare.style.position = 'absolute';
                    glare.style.top = '0';
                    glare.style.left = '0';
                    glare.style.width = '100%';
                    glare.style.height = '100%';
                    glare.style.pointerEvents = 'none';
                    glare.style.borderRadius = 'inherit';
                    glare.style.transition = 'opacity 0.4s ease';
                    card.appendChild(glare);
                }
                
                glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)`;
                glare.style.opacity = 1;
            });
        });

        card.addEventListener('mouseleave', resetTilt);
    });

    // --- 5. Global Parallax & Hero Parallax Effect ---
    const hero = document.getElementById('home');
    const floatingWords = document.querySelectorAll('.floating-words span');
    
    document.addEventListener('mousemove', (e) => {
        if (!isTabActive) return;
        requestAnimationFrame(() => {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            
            // Reverse micro-movements for background words globally
            floatingWords.forEach(word => {
                word.style.transform = `translate(${-x * 1.5}px, ${-y * 1.5}px)`;
            });
        });
    });

    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            if (!isTabActive) return;
            requestAnimationFrame(() => {
                const x = (window.innerWidth - e.pageX * 2) / 100;
                const y = (window.innerHeight - e.pageY * 2) / 100;
                
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) {
                    heroContent.style.transform = `translate(${x}px, ${y}px)`;
                }
            });
        });
        
        // Reset when mouse leaves hero bounds
        hero.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                const heroContent = document.querySelector('.hero-content');
                if (heroContent) heroContent.style.transform = `translate(0px, 0px)`;
            });
        });
    }

    // --- 6. Realistic Human-like Typing Effect ---
    const subtitle = document.querySelector('.hero-role');
    if (subtitle) {
        // We capture original HTML to maintain any <span> tags holding colors
        const htmlToType = subtitle.innerHTML;
        subtitle.innerHTML = '';
        
        let i = 0;
        let isInsideTag = false;
        let currentString = '';

        const typeWriter = () => {
            if (i < htmlToType.length) {
                const char = htmlToType.charAt(i);
                currentString += char;
                subtitle.innerHTML = currentString;
                
                // Don't delay on HTML tags
                if (char === '<') isInsideTag = true;
                if (char === '>') isInsideTag = false;
                
                i++;
                
                // Realistic variation: fast tags, slightly variable text characters
                let delay = isInsideTag ? 0 : Math.random() * (70 - 20) + 20;
                
                // Add a brief pause on spaces to mimic real typing bursts
                if (char === ' ' && !isInsideTag) delay += 30;

                setTimeout(typeWriter, delay);
            }
        };
        // Trigger after initial DOM load entry animations finish
        setTimeout(typeWriter, 1000);
    }

    // --- 7. Button Ripple Micro-interactions ---
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.width = '10px';
            ripple.style.height = '10px';
            ripple.style.background = 'rgba(255, 255, 255, 0.4)';
            ripple.style.borderRadius = '50%';
            ripple.style.transform = 'translate(-50%, -50%) scale(0)';
            ripple.style.animation = 'ripple 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            ripple.style.pointerEvents = 'none';
            
            // Ensure button handles absolute ripple absolute positioning
            if (getComputedStyle(this).position === 'static') {
                this.style.position = 'relative';
            }
            this.style.overflow = 'hidden';

            this.appendChild(ripple);
            
            // Clean up node
            setTimeout(() => ripple.remove(), 500);
        });
    });

    // --- 8. Nav Links & Mobile Menu Routing ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('nav-active');
            const icon = hamburger.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('nav-active')) {
                    navMenu.classList.remove('nav-active');
                    const icon = hamburger.querySelector('i');
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });
    }

    // Navigation Active State observer
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 }); // Triggers when section is halfway crossed
    
    document.querySelectorAll('section, header').forEach(sec => navObserver.observe(sec));
});

// Polyfill dynamic keyframes for the Button Ripple (injected by JS to keep everything centralized)
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to { transform: translate(-50%, -50%) scale(25); opacity: 0; }
    }
    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: var(--primary-color, #64FFDA);
        z-index: 9999;
        transition: width 0.1s ease;
    }
`;
document.head.appendChild(style);
