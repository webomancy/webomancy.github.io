// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// Function to add animation class when scrolled into view
function handleScroll() {
    const mainCardContainers = document.querySelectorAll('.main_card_container');
    mainCardContainers.forEach(container => {
        if (isInViewport(container)) {
            container.classList.add('visible');
        }
    });
}

// Listen for scroll events
window.addEventListener('scroll', handleScroll);

// Initial check in case elements are already in view
document.addEventListener('DOMContentLoaded', handleScroll);
