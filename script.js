// ================= SAFE ELEMENT SELECT =================
const scrollTopBtn = document.querySelector('.footer-scroll-top');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');
const projectCards = document.querySelectorAll('.project-card');

// ================= SCROLL TO TOP BUTTON =================
window.addEventListener('scroll', () => {
    if (scrollTopBtn) {
        if (window.scrollY > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    }
});

// Smooth scroll to top
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ================= SMOOTH NAVBAR SCROLL =================
navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ================= ACTIVE NAV LINK HIGHLIGHT =================
window.addEventListener('scroll', () => {
    let currentSection = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }
    });
});

// ================= SCROLL ANIMATION (FADE-IN) =================
const revealOnScroll = () => {
    sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        const trigger = window.innerHeight - 100;

        if (top < trigger) {
            section.classList.add('show');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ================= PROJECT CARD EXPAND =================
projectCards.forEach(card => {
    card.addEventListener('click', () => {

        projectCards.forEach(c => {
            if (c !== card) c.classList.remove('expanded');
        });

        card.classList.toggle('expanded');
    });
});
