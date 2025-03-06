document.addEventListener('DOMContentLoaded', function() { // Ensure DOM is loaded

    const buttons = document.querySelectorAll('[href^="#"]'); // Select elements with href starting with #

    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) { // Check if the element exists
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
