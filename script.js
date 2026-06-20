const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cinematic page intro (1.5s on load / reload)
function initPageIntro() {
    const intro = document.getElementById('page-intro');
    if (!intro) return;

    document.body.classList.add('page-loading');

    const cleanup = () => {
        if (!intro.isConnected) return;
        intro.remove();
        document.body.classList.remove('page-loading');
    };

    if (prefersReducedMotion) {
        intro.remove();
        document.body.classList.remove('page-loading');
        return;
    }

    intro.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 1700);
}

initPageIntro();

// Function for logo click - reload and scroll to top
function reloadAndScrollToTop() {
    localStorage.setItem('scrollToTop', 'true');
    window.location.reload();
}

// Always scroll to top smoothly on page load (including manual reloads)
window.onload = function() {
    // Smooth scroll to top on every page load
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Remove the scrollToTop flag if it exists
    localStorage.removeItem('scrollToTop');
};

// Handle browser back/forward navigation
window.onpageshow = function(event) {
    if (event.persisted) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.innerHTML = navLinks.classList.contains('active') ?
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Active Section Highlighting - Add this after your mobile menu toggle code
const headerLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');

function highlightActiveSection() {
    let current = '';
    const scrollPosition = window.scrollY + 200; // Adding offset for better detection
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = sectionId;
        }
    });

    headerLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Initial highlight and scroll listener
window.addEventListener('load', highlightActiveSection);
window.addEventListener('scroll', highlightActiveSection);

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Animation on Scroll
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');

            if (entry.target.classList.contains('cgpa-ring')) {
                animateCgpaRing(entry.target);
            }

            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

function animateCgpaRing(ringEl) {
    const cgpa = parseFloat(ringEl.dataset.cgpa);
    if (Number.isNaN(cgpa)) return;

    const circumference = 2 * Math.PI * 52;
    const progress = Math.min(cgpa / 10, 1);
    const offset = circumference * (1 - progress);

    ringEl.style.setProperty('--ring-offset', `${offset}`);
    ringEl.classList.add('animate');
}

function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .section-title');

    revealElements.forEach(el => {
        if (el.closest('#home')) {
            if (prefersReducedMotion) {
                el.classList.add('animate');
            } else {
                const homeReveals = el.closest('#home').querySelectorAll('.reveal');
                const index = Array.from(homeReveals).indexOf(el);
                setTimeout(() => el.classList.add('animate'), Math.max(index, 0) * 60);
            }
            return;
        }

        if (prefersReducedMotion) {
            el.classList.add('animate');
            if (el.classList.contains('cgpa-ring')) {
                animateCgpaRing(el);
            }
            return;
        }

        revealObserver.observe(el);
    });

    document.querySelectorAll('.cgpa-ring').forEach(ring => {
        if (prefersReducedMotion) {
            animateCgpaRing(ring);
        } else {
            revealObserver.observe(ring);
        }
    });
}

// Nav shrink on scroll
const nav = document.querySelector('nav');

function handleNavScroll() {
    if (!nav) return;
    nav.classList.toggle('nav-scrolled', window.scrollY > 60);
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

initScrollAnimations();

// Custom cursor follower + neon trail + click ripple (desktop only)
const customCursorMq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 993px)');
let destroyCustomCursor = null;

function initCustomCursor() {
    if (destroyCustomCursor) {
        destroyCustomCursor();
        destroyCustomCursor = null;
    }

    if (!customCursorMq.matches || prefersReducedMotion) {
        document.body.classList.remove('custom-cursor-active');
        return;
    }

    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    document.body.classList.add('custom-cursor-active');

    const TRAIL_COUNT = 10;
    const RING_LERP = 0.28;
    const trail = [];
    let rafId = null;

    for (let i = 0; i < TRAIL_COUNT; i++) {
        const trailDot = document.createElement('div');
        trailDot.className = 'cursor-trail-dot';
        trailDot.setAttribute('aria-hidden', 'true');
        trailDot.style.opacity = String((1 - i / TRAIL_COUNT) * 0.55);
        trailDot.style.transform = `translate(-50%, -50%) scale(${1 - i * 0.035})`;
        document.body.appendChild(trailDot);
        trail.push({ el: trailDot, x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let visible = false;

    const interactiveSelector = 'a, button, input, textarea, select, label, .menu-toggle, .exp-read-more-btn';
    const cursorEls = [dot, ring, ...trail.map((t) => t.el)];

    function setCursorVisible(show) {
        if (show) {
            dot.style.opacity = '';
            ring.style.opacity = '';
            trail.forEach((t, i) => {
                t.el.style.opacity = String((1 - i / TRAIL_COUNT) * 0.55);
            });
        } else {
            cursorEls.forEach((el) => {
                el.style.opacity = '0';
            });
        }
    }

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!visible) {
            visible = true;
            setCursorVisible(true);
        }
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
        ring.classList.toggle('cursor-hover', !!e.target.closest(interactiveSelector));
    }

    function onMouseDown() {
        ring.classList.add('cursor-click');
        spawnCursorRipple(mouseX, mouseY);
    }

    function onMouseUp() {
        ring.classList.remove('cursor-click');
    }

    function onMouseLeave() {
        setCursorVisible(false);
        visible = false;
    }

    function onMouseEnter() {
        if (visible) setCursorVisible(true);
    }

    function animateCursor() {
        ringX += (mouseX - ringX) * RING_LERP;
        ringY += (mouseY - ringY) * RING_LERP;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;

        let prevX = mouseX;
        let prevY = mouseY;
        trail.forEach((t, i) => {
            const speed = 0.42 - i * 0.018;
            t.x += (prevX - t.x) * speed;
            t.y += (prevY - t.y) * speed;
            t.el.style.left = `${t.x}px`;
            t.el.style.top = `${t.y}px`;
            prevX = t.x;
            prevY = t.y;
        });

        rafId = requestAnimationFrame(animateCursor);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    animateCursor();

    destroyCustomCursor = () => {
        if (rafId) cancelAnimationFrame(rafId);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mouseleave', onMouseLeave);
        document.removeEventListener('mouseenter', onMouseEnter);
        trail.forEach((t) => t.el.remove());
        ring.classList.remove('cursor-hover', 'cursor-click');
        document.body.classList.remove('custom-cursor-active');
    };
}

function spawnCursorRipple(x, y) {
    const ripple = document.createElement('span');
    ripple.className = 'cursor-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

initCustomCursor();
customCursorMq.addEventListener('change', initCustomCursor);

// Experience modal — read full details
function initExperienceModal() {
    const modal = document.getElementById('experience-modal');
    if (!modal) return;

    const backdrop = modal.querySelector('.exp-modal-backdrop');
    const closeBtn = modal.querySelector('.exp-modal-close');
    const modalHeader = modal.querySelector('.exp-modal-header');
    const modalBody = modal.querySelector('.exp-modal-body');
    const modalFooter = modal.querySelector('.exp-modal-footer');
    let lastFocusedElement = null;

    function openModal(card) {
        const header = card.querySelector('.exp-header');
        const body = card.querySelector('.exp-body');
        const footer = card.querySelector('.experience-footer');

        modalHeader.innerHTML = header ? header.innerHTML : '';
        modalBody.innerHTML = body ? body.innerHTML : '';
        modalFooter.innerHTML = footer ? footer.innerHTML : '';

        const titleEl = modalHeader.querySelector('h3');
        if (titleEl) titleEl.id = 'exp-modal-title';

        lastFocusedElement = document.activeElement;
        modal.removeAttribute('hidden');
        requestAnimationFrame(() => modal.classList.add('active'));
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            modal.setAttribute('hidden', '');
            modalHeader.innerHTML = '';
            modalBody.innerHTML = '';
            modalFooter.innerHTML = '';
        }, 300);

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    document.querySelectorAll('.exp-read-more-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.experience-card');
            if (card) openModal(card);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

initExperienceModal();

// Starry Background Effect
function initStarryBackground() {
    // Configuration variables
    const config = {
        starCount: 30,           // Total number of stars
        minSize: 1,              // Minimum star size in px
        maxSize: 4,              // Maximum star size in px
        baseSpeed: 2,           // Base speed multiplier
        movementFactor: 0.04,    // Movement speed factor
        minOpacity: 0.3,         // Minimum opacity
        maxOpacity: 0.9,         // Maximum opacity
        shootingStarInterval: 2000, // Base time between shooting stars (ms)
        shootingStarVariance: 1000 // Random variance in interval
    };

    // Shape types
    const SHAPES = {
        CIRCLE: 'circle',
        CROSS: 'cross',
        DIAMOND: 'diamond',
        TWINKLE: 'twinkle'
    };

    // Create container if it doesn't exist
    let starContainer = document.getElementById('star-container');
    if (!starContainer) {
        starContainer = document.createElement('div');
        starContainer.id = 'star-container';
        starContainer.style.position = 'fixed';
        starContainer.style.top = '0';
        starContainer.style.left = '0';
        starContainer.style.width = '100%';
        starContainer.style.height = '100%';
        starContainer.style.pointerEvents = 'none';
        starContainer.style.zIndex = '-1';
        starContainer.style.overflow = 'hidden';
        document.body.insertBefore(starContainer, document.body.firstChild);
    }

    // Add CSS for different shapes
    addShapeStyles();

    // Create regular stars
    for (let i = 0; i < config.starCount; i++) {
        createStar();
    }

    // Start shooting star loop with random intervals
    scheduleShootingStar();

    function addShapeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .star {
                position: absolute;
                background-color: white;
                pointer-events: none;
            }
            
            .star.circle {
                border-radius: 50%;
            }
            
            .star.cross {
                background: transparent;
                position: relative;
            }
            
            .star.cross:before, .star.cross:after {
                content: '';
                position: absolute;
                background-color: inherit;
            }
            
            .star.cross:before {
                width: 100%;
                height: 20%;
                top: 40%;
                left: 0;
            }
            
            .star.cross:after {
                width: 20%;
                height: 100%;
                top: 0;
                left: 40%;
            }
            
            .star.diamond {
                transform: rotate(45deg);
            }
            
            .star.twinkle {
                animation: twinkle 2s infinite alternate;
                border-radius: 50%;
            }
            
            @keyframes twinkle {
                0% { opacity: 0.3; }
                100% { opacity: 0.9; }
            }
            
            .shooting-star {
                position: absolute;
                width: 60px;
                height: 2px;
                background: linear-gradient(90deg, rgba(255,255,255,0) 0%, white 70%, rgba(255,255,255,0) 100%);
                pointer-events: none;
                z-index: 1;
            }
        `;
        document.head.appendChild(style);
    }

    function createStar() {
        const star = document.createElement('div');
        
        // Random shape
        const shapes = Object.values(SHAPES);
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        star.className = `star ${shape}`;
        
        // Random size between min and max
        const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random initial position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random brightness
        star.style.opacity = Math.random() * (config.maxOpacity - config.minOpacity) + config.minOpacity;
        
        starContainer.appendChild(star);
        
        // Animate star
        animateStar(star);
    }

    function scheduleShootingStar() {
        // Random interval between shooting stars
        const interval = config.shootingStarInterval + Math.random() * config.shootingStarVariance;
        setTimeout(() => {
            createShootingStar();
            scheduleShootingStar(); // Schedule the next one
        }, interval);
    }

    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        
        // Random direction (0-360 degrees)
        const angle = Math.random() * 360;
        
        // Random start position based on angle
        let startX, startY;
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        
        switch(edge) {
            case 0: // top
                startX = Math.random() * 100;
                startY = -10;
                break;
            case 1: // right
                startX = 110;
                startY = Math.random() * 100;
                break;
            case 2: // bottom
                startX = Math.random() * 100;
                startY = 110;
                break;
            case 3: // left
                startX = -10;
                startY = Math.random() * 100;
                break;
        }
        
        shootingStar.style.left = `${startX}%`;
        shootingStar.style.top = `${startY}%`;
        shootingStar.style.transform = `rotate(${angle}deg)`;
        
        // Random length and thickness
        const length = 40 + Math.random() * 80;
        const thickness = 1 + Math.random();
        shootingStar.style.width = `${length}px`;
        shootingStar.style.height = `${thickness}px`;
        
        // Random speed
        const speed = 0.5 + Math.random() * 1.5;
        
        starContainer.appendChild(shootingStar);
        
        // Animation
        let opacity = 0.8 + Math.random() * 0.2;
        let x = startX;
        let y = startY;
        
        function animate() {
            // Move along the angle
            x += speed * Math.cos(angle * Math.PI / 180);
            y += speed * Math.sin(angle * Math.PI / 180);
            
            shootingStar.style.left = `${x}%`;
            shootingStar.style.top = `${y}%`;
            shootingStar.style.opacity = opacity;
            
            opacity -= 0.01;
            
            if (opacity > 0 && 
                x > -20 && x < 120 && 
                y > -20 && y < 120) {
                requestAnimationFrame(animate);
            } else {
                starContainer.removeChild(shootingStar);
            }
        }
        
        animate();
    }

    function animateStar(star) {
        const xSpeed = (Math.random() - 0.5) * config.baseSpeed;
        const ySpeed = (Math.random() - 0.5) * config.baseSpeed;
        
        function moveStar() {
            let x = parseFloat(star.style.left);
            let y = parseFloat(star.style.top);
            
            x += xSpeed * config.movementFactor;
            y += ySpeed * config.movementFactor;
            
            // Wrap around
            if (x > 100) x = 0;
            if (x < 0) x = 100;
            if (y > 100) y = 0;
            if (y < 0) y = 100;
            
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            
            requestAnimationFrame(moveStar);
        }
        
        moveStar();
    }
}

// Highlighting achievement
function highlightAchievement() {
    // Give a little time for scrolling to finish
    setTimeout(() => {
        const achievement = document.getElementById("best-paper-award");
        if (achievement) {
            achievement.classList.add("highlight");
            setTimeout(() => {
                achievement.classList.remove("highlight");
            }, 1500);
        }
    }, 500);
}

// Contact Form Submission
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-animation">
                <span class="loader"></span>
            </div>
        `;

        const alertOverlay = document.createElement('div');
        alertOverlay.className = 'overlay';
        alertOverlay.innerHTML = `
            <div class="alert-box">
                <div class="alert-icon"></div>
                <h3 class="alert-title">Success</h3>
                <p class="alert-message">Your message has been sent successfully!</p>
                <button class="alert-close">Continue</button>
            </div>
        `;

        document.body.appendChild(loadingOverlay);
        document.body.appendChild(alertOverlay);

        alertOverlay.querySelector('.alert-close').addEventListener('click', function () {
            alertOverlay.classList.remove('active');
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                timestamp: new Date().toISOString()
            };

            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                showAlert('Error', 'Please fill in all fields', 'error');
                return;
            }

            if (!validateEmail(formData.email)) {
                showAlert('Error', 'Please enter a valid email address', 'error');
                return;
            }

            loadingOverlay.classList.add('active');

            fetch('https://script.google.com/macros/s/AKfycbzU6GqUpi2C1z_-d6ZUavey7_kBYZ0tAHkBBC9-opwKH1ZHO9mXbQStxqH3UCmuB3cFfw/exec', {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(() => {
                showAlert('Success', 'Thank you! Your message has been sent.', 'success');
                contactForm.reset();
            })
            .catch((error) => {
                console.error('Error:', error);
                showAlert('Error', 'There was an error sending your message. Please try again.', 'error');
            })
            .finally(() => {
                loadingOverlay.classList.remove('active');
            });
        });

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        function showAlert(title, message, type) {
            const alertBox = alertOverlay.querySelector('.alert-box');
            const alertIcon = alertOverlay.querySelector('.alert-icon');
            alertBox.className = 'alert-box';
            alertIcon.innerHTML = '';

            if (type === 'success') {
                alertBox.classList.add('success');
                alertIcon.innerHTML = `
                    <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle class="checkmark-circle" cx="26" cy="26" r="20" fill="none"/>
                        <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                `;
            } else {
                alertBox.classList.add('error');
                alertIcon.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                `;
            }

            alertOverlay.querySelector('.alert-title').textContent = title;
            alertOverlay.querySelector('.alert-message').textContent = message;
            alertOverlay.classList.add('active');
        }
    }

    initStarryBackground();
});
