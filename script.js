document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav ul');
    const navLinks = document.querySelectorAll('.nav ul li a'); // Select all dropdown buttons

    if (hamburger && navMenu) {
        // Toggle menu on hamburger click
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('rotate');
        });

        // Close menu when any link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('rotate');
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('myVideo');
    if (video) {
        video.playbackRate = 2.0; // 2x speed
    }
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy: ', err);
    });
}