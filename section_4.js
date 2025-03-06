document.addEventListener('DOMContentLoaded', () => {
    const section4 = document.getElementById('section-4');
    const h1 = section4.querySelector('h1');
    const imageContainer = section4.querySelector('.section_4_image_container');
    const paragraph = section4.querySelector('p');
    const buttonContainer = section4.querySelector('.button-container');

    const revealOnScroll = (element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if (elementTop < windowHeight * 0.85) {
            element.classList.add('visible');
        }
    };

    const handleScroll = () => {
        revealOnScroll(h1);
        revealOnScroll(imageContainer);
        revealOnScroll(paragraph);
        revealOnScroll(buttonContainer);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger once on load in case elements are already in view
});
