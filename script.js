// ================= Scroll to Top Button =================
const scrollTopBtn = document.querySelector('.footer-scroll-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ================= Smooth Scroll for Navbar Links =================
const navLinks = document.querySelectorAll('.nav-links a');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ================= Project Card Pop-Up =================
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('click', () => {
        // Close any other open card first
        projectCards.forEach(c => {
            if (c !== card) c.classList.remove('expanded');
        });

        // Toggle expanded for clicked card
        card.classList.toggle('expanded');
    });
});
