// contact.js

(function() {
  emailjs.init("AM24yfzSTRKWOflib"); // 🔑 Replace with your actual public key
})();

document.addEventListener('DOMContentLoaded', function () {
const form = document.getElementById('contact-form');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  emailjs.sendForm('service_3g1w5hp', 'template_qgzxbph', this)
    .then(() => {
      showModal('Email sent successfully!');
      form.reset(); // Optional: reset form after sending
    })
    .catch((error) => {
      alert('❌ Failed to send message:\n' + JSON.stringify(error));
    });
});
});

// Function to show the modal
function showModal(message) {
const modal = document.getElementById('success-modal');
const modalText = document.getElementById('modal-text');
const overlay = document.getElementById('overlay');
modalText.textContent = message;
modal.classList.add('modal-show');
overlay.classList.add('overlay-show');
}

// Close the modal
function closeModal() {
const modal = document.getElementById('success-modal');
const overlay = document.getElementById('overlay');
modal.classList.remove('modal-show');
overlay.classList.remove('overlay-show');
}

// Close modal when clicking outside of it
document.getElementById('overlay').addEventListener('click', closeModal);
