document.addEventListener("DOMContentLoaded", function () {
    const planCards = document.querySelectorAll(".plan_card");

    function revealCards() {
        planCards.forEach((card) => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;

            if (cardPosition < screenPosition) {
                card.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", revealCards);
    revealCards(); // Trigger animation if cards are already in view on load
});
