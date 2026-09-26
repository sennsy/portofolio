const data = {
    Produk: [
        "./assets/poster-produk1.png",
        "./assets/poster-produk2.png",
        "./assets/poster-produk3.png",
        "./assets/Feed-1.png",
        "./assets/Feed-2.png",
        "./assets/Feed-3.png",
        "./assets/dibikinin 1.png",
        "./assets/dibikinin 2.png"
    ],

    Poster: [
        "./assets/poster1.png",
        "./assets/poster2.png",
        "./assets/poster3.png",
        "./assets/posteralek.png",
        "./assets/feed ig.png"
    ],

    Clothing: [
        "./assets/clothing1.png",
        "./assets/clothing2.png",
        "./assets/clothing3.png"
    ],

    Thumbnail: [
        "./assets/thumbnail1.png",
        "./assets/thumbnail2.png"
    ],

    Banner: [
        "./assets/banner.png"
    ]
};

const tabs = document.getElementById("tabs");
const track = document.getElementById("track");

/* Cek ukuran layar */
const isMobilePortfolio =
    window.matchMedia("(max-width:768px)").matches;

let currentIndex = 0;
const allSlides = [];

/* Gabungkan semua gambar */
Object.keys(data).forEach(category => {
    data[category].forEach(src => {
        allSlides.push({
            category,
            src
        });
    });
});

/* Buat tombol kategori */
Object.keys(data).forEach(category => {
    const button = document.createElement("button");
    button.className = "tab-btn";
    button.textContent = category;

    button.onclick = () => {
        currentIndex = allSlides.findIndex(
            item => item.category === category
        );

        if (isMobilePortfolio) {
            scrollToSlideMobile(currentIndex);
            updateActiveTab();
        } else {
            renderSlides();
        }
    };

    tabs.appendChild(button);
});

/* Buat semua slide (TIDAK digandakan lagi) */
allSlides.forEach(item => {
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.innerHTML = `<img src="${item.src}" loading="lazy">`;
    track.appendChild(slide);
});

/* Simpan referensi slide */
const originalSlideEls = Array.from(track.children);

function updateActiveTab() {
    const activeCategory = allSlides[currentIndex].category;
    document.querySelectorAll(".tab-btn").forEach(button => {
        button.classList.remove("active");
        if (button.textContent === activeCategory) {
            button.classList.add("active");
        }
    });
}

function renderSlides() {
    const slides = document.querySelectorAll(".slide");
    slides.forEach((slide, index) => {
        slide.className = "slide";
        if (index === currentIndex) {
            slide.classList.add("active");
        } else if (index === (currentIndex - 1 + allSlides.length) % allSlides.length) {
            slide.classList.add("prev");
        } else if (index === (currentIndex + 1) % allSlides.length) {
            slide.classList.add("next");
        }
    });
    updateActiveTab();
}

function move(direction) {
    currentIndex = (currentIndex + direction + allSlides.length) % allSlides.length;
    renderSlides();
}

/* ========================= */
/* PORTFOLIO - MOBILE GALLERY */
/* (tanpa loop, hanya geser biasa) */
/* ========================= */

function scrollToSlideMobile(index) {
    const carouselEl = document.querySelector(".carousel-container");
    const target = originalSlideEls[index];
    if (!carouselEl || !target) return;

    carouselEl.scrollTo({
        left: target.offsetLeft - 14,
        behavior: "smooth"
    });
}

function initMobilePortfolioGallery() {
    const carouselEl = document.querySelector(".carousel-container");
    const hint = document.getElementById("portfolioScrollHint");

    if (!carouselEl) return;

    // Tampilkan/sembunyikan petunjuk geser
    carouselEl.addEventListener("scroll", () => {
        if (carouselEl.scrollLeft > 10) {
            hint.classList.add("hide");
        } else {
            hint.classList.remove("hide");
        }
        updateMobileActiveTabFromScroll(carouselEl);
    }, { passive: true });
}

function updateMobileActiveTabFromScroll(carouselEl) {
    const containerCenter = carouselEl.scrollLeft + carouselEl.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    originalSlideEls.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - containerCenter);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
        }
    });

    if (closestIndex !== currentIndex) {
        currentIndex = closestIndex;
        updateActiveTab();
    }
}

/* ========================= */
/* LIGHTBOX GAMBAR */
/* ========================= */

function openPortfolioLightbox(src, alt) {
    const overlay = document.createElement("div");
    overlay.className = "portfolio-lightbox";
    overlay.innerHTML = `
        <button class="portfolio-lightbox-close" aria-label="Tutup">&times;</button>
        <img src="${src}" alt="${alt || ""}">
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => overlay.classList.add("show"));

    function closeLightbox() {
        overlay.classList.remove("show");
        document.body.style.overflow = "";
        setTimeout(() => overlay.remove(), 250);
        document.removeEventListener("keydown", onKey);
    }

    function onKey(e) {
        if (e.key === "Escape") closeLightbox();
    }

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay || e.target.classList.contains("portfolio-lightbox-close")) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", onKey);
}

track?.addEventListener("click", (e) => {
    const img = e.target.closest("img");
    if (img) openPortfolioLightbox(img.src, img.alt);
});

/* Jalankan fungsi sesuai ukuran layar */
if (isMobilePortfolio) {
    initMobilePortfolioGallery();
} else {
    setInterval(() => {
        move(1);
    }, 5000);
    renderSlides();
}

/* ========================= */
/* BAGIAN LAINNYA (TETAP SAMA) */
/* ========================= */

/* Floating Phone */
const phone = document.querySelector(".phone-image");
document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", () => {
        document.getElementById("payment").scrollIntoView({ behavior: "smooth" });
    });
});

/* Sticky Navbar */
const stickyNavbar = document.querySelector(".sticky-navbar");
let hideTimer;

window.addEventListener("scroll", () => {
    if (window.scrollY > 120) {
        stickyNavbar.classList.remove("hide");
        stickyNavbar.classList.add("show");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => stickyNavbar.classList.add("hide"), 1200);
    } else {
        stickyNavbar.classList.remove("show", "hide");
    }
});

/* Scroll Reveal */
const reveals = document.querySelectorAll(".reveal,.reveal-left,.reveal-right,.reveal-scale");
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: .15, rootMargin: "0px 0px -8% 0px" });
reveals.forEach(el => observer.observe(el));

/* Scroll Progress Bar */
const progressFill = document.querySelector(".scroll-progress-fill");
window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = (scrollTop / scrollHeight) * 100;
    progressFill.style.width = percent + "%";
});

/* Mouse Glow Effect */
const mouseGlow = document.querySelector(".mouse-glow");
let glowX = window.innerWidth / 2;
let glowY = window.innerHeight / 2;
let currentGlowX = glowX;
let currentGlowY = glowY;

document.addEventListener("mousemove", (e) => {
    glowX = e.clientX;
    glowY = e.clientY;
});

function animateGlow() {
    currentGlowX += (glowX - currentGlowX) * 0.08;
    currentGlowY += (glowY - currentGlowY) * 0.08;
    mouseGlow.style.transform = `translate(${currentGlowX - 350}px, ${currentGlowY - 350}px)`;
    requestAnimationFrame(animateGlow);
}
animateGlow();

/* Custom Cursor */
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const cursorText = document.querySelector(".cursor-text");
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + "px";
    cursorRing.style.top = ringY + "px";
    requestAnimationFrame(animateCursor);
}
animateCursor();

/* Cursor Hover Effect */
const hoverTargets = document.querySelectorAll('a, button, .btn, .cta-button, .contact-btn, .nav-links a');
hoverTargets.forEach(item => {
    item.addEventListener("mouseenter", () => {
        cursorRing.classList.add("active");
        cursorDot.classList.add("hide");
        cursorText.textContent = "CLICK";
    });
    item.addEventListener("mouseleave", () => {
        cursorRing.classList.remove("active");
        cursorDot.classList.remove("hide");
        cursorText.textContent = "";
    });
});

/* Parallax Card Effect */
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = card.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        card.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${y * -10}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1)';
    });
});

/* Magnetic Button Effect */
const buttons = document.querySelectorAll('.btn, .cta-button');
buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = btn.getBoundingClientRect();
        const x = (e.clientX - left) - width / 2;
        const y = (e.clientY - top) - height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

/* Aktif Navigasi Berdasarkan Posisi Scroll */
const sections = document.querySelectorAll("section[id]");
const navs = [...document.querySelectorAll(".nav-links a")];
window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const top = section.offsetTop - 140;
        if (window.scrollY >= top) current = section.id;
    });
    navs.forEach(link => {
        link.classList.remove("active-link");
        if (link.getAttribute("href") === "#" + current) link.classList.add("active-link");
    });
});

/* Tombol Menu Mobile */
const mobileBtn = document.querySelector(".mobile-menu-btn");
const mainNav = document.getElementById("mainNav");
mobileBtn?.addEventListener("click", () => {
    mainNav.classList.toggle("show");
});

/* Tombol Menu di Sticky Navbar */
const stickyMenuBtn = document.getElementById("stickyMenuBtn");
stickyMenuBtn?.addEventListener("click", () => {
    document.getElementById("hero").scrollIntoView({ behavior: "smooth" });
});


