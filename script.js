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
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

document.querySelectorAll('.section, .experience-card, .achievement-card').forEach(section => {
    observer.observe(section);
});

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
            // Remove after 2 seconds
            setTimeout(() => {
                achievement.classList.remove("highlight");
            }, 1000);
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
