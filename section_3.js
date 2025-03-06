document.addEventListener("DOMContentLoaded", function () {
    const observerOptions = {
        root: null,
        threshold: 0.3
    };

    const elements = [
        document.querySelector(".section_3_image"),
        document.querySelector(".section_3_contents h1"),
        document.querySelector(".section_3_contents p"),
        document.querySelector(".section_3_button")
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add("visible");
                }, index * 300); // Adds a 300ms delay for each element
            }
        });
    }, observerOptions);

    elements.forEach(element => observer.observe(element));
});
