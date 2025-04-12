// Mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('translate-x-0');
    mobileMenu.classList.toggle('-translate-x-full');
});

// Close menu when clicking a link
const menuLinks = document.querySelectorAll('#mobile-menu a');
menuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('-translate-x-full');
    });
});

// Smooth scrolling for all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add shadow on scroll
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('shadow-xl');
    } else {
        nav.classList.remove('shadow-xl');
    }
});

// Initialize Vanta.js background
document.addEventListener('DOMContentLoaded', function() {
    VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x3b82f6,
        backgroundColor: 0x050a15,
        points: 12.00,
        maxDistance: 22.00,
        spacing: 18.00
    });

    // ScrollReveal animations for other sections
    ScrollReveal().reveal('.portfolio-item', {
        delay: 200,
        distance: '30px',
        origin: 'bottom',
        interval: 100,
        easing: 'ease-in-out',
        reset: false
    });

    ScrollReveal().reveal('#about .grid > div', {
        delay: 200,
        distance: '30px',
        origin: 'bottom',
        interval: 200,
        easing: 'ease-in-out',
        reset: false
    });

    ScrollReveal().reveal('.plan-card', {
        delay: 200,
        distance: '50px',
        origin: 'bottom',
        interval: 100,
        easing: 'ease-in-out',
        reset: false
    });
});