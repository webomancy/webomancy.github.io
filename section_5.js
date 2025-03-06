// Function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= window.innerHeight * 0.75 // Trigger when 75% of the element is visible
    );
}

// Function to add "visible" class when element is scrolled into view
function handleScroll() {
    const image = document.querySelector('.section_5_image');
    const h1 = document.querySelector('.section_5_contents h1');
    const p = document.querySelector('.section_5_contents p');

    if (isInViewport(image)) {
        image.classList.add('visible');
    }
    if (isInViewport(h1)) {
        h1.classList.add('visible');
    }
    if (isInViewport(p)) {
        p.classList.add('visible');
    }
}

// Listen for scroll event
window.addEventListener('scroll', handleScroll);

// Initial check in case elements are already in view when page loads
document.addEventListener('DOMContentLoaded', handleScroll);
