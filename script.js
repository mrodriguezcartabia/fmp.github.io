// 1. Inicialización de iconos (Lucide)
lucide.createIcons();

const translations = { en: 'Copied!', es: '¡Copiado!', pt: 'Copiado!' };

// 2. Selección de elementos clave
const navLogo = document.getElementById('nav-logo');
const introScreen = document.getElementById('intro-screen');
const introContent = document.getElementById('intro-content');
const navLinks = document.querySelectorAll('.nav-link');
const contactSection = document.getElementById('contact-section');

// 3. Funciones de Utilidad (Copiado de Email)
function copyEmail(email, btn) {
    navigator.clipboard.writeText(email).then(() => {
        const iconElement = btn.querySelector('i');
        const currentLang = localStorage.getItem('preferredLang') || 'en';
        const tooltip = document.createElement('span');
        tooltip.className = 'copy-tooltip';
        tooltip.innerText = translations[currentLang];
        btn.appendChild(tooltip);
        btn.classList.add('text-green-100');
        btn.classList.remove('text-indigo-200');
        iconElement.setAttribute('data-lucide', 'check');
        lucide.createIcons();
        setTimeout(() => {
            tooltip.remove();
            btn.classList.remove('text-green-100');
            btn.classList.add('text-indigo-200');
            iconElement.setAttribute('data-lucide', 'copy');
            lucide.createIcons();
        }, 1500);
    });
}

// 4. Animación de aparición (Reveal)
function revealContent() {
    document.querySelectorAll(".reveal").forEach(el => { 
        if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add("active");
    });
}

// 5. Gestión de scroll desde otras páginas
function checkScrollParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scroll') === 'contact') {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            if (contactSection) {
                const offset = 120;
                window.scrollTo({ top: contactSection.offsetTop - offset, behavior: 'smooth' });
            }
        }, 800); 
    }
}

// 6. Pantalla de Bienvenida (Intro)
function startIntro() {
    if (sessionStorage.getItem('introShown') || !introScreen) { 
        if (introScreen) introScreen.remove(); 
        revealContent();
        checkScrollParam(); 
        return; 
    }
    document.body.classList.add('intro-active');
    setTimeout(() => {
        if (introContent) introContent.classList.remove('opacity-0');
        setTimeout(() => introContent && introContent.classList.add('shimmer-active'), 500);
        setTimeout(() => {
            if (introContent) introContent.style.opacity = '0';
            if (introScreen) introScreen.style.opacity = '0';
            setTimeout(() => { 
                document.body.classList.remove('intro-active'); 
                sessionStorage.setItem('introShown', 'true'); 
                if (introScreen) introScreen.remove(); 
                revealContent();
                checkScrollParam(); 
            }, 1200);
        }, 2500);
    }, 300);
}

// 7. Sistema de Idiomas
function setLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.querySelectorAll('[data-en]').forEach(el => { 
        const text = el.dataset[lang];
        if(text) el.textContent = text;
    });
    document.querySelectorAll('.language-switcher button').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${lang}`));
}

// 8. Lógica de Navegación Activa (SELECTOR MEJORADO)
function updateActiveLink() {
    // Usamos selectores que buscan el texto o parte del href para asegurar que los encuentre
    const homeBtn = document.querySelector('a[href*="index.html"]') || navLinks[0];
    const contactBtn = document.querySelector('a[href="#contact-section"]');

    if (!contactSection) return;

    const scrollY = window.scrollY;
    const contactTop = contactSection.offsetTop - 500; 

    // Limpieza total
    navLinks.forEach(link => link.classList.remove('active'));

    // Lógica de asignación
    if (scrollY >= contactTop) {
        if (contactBtn) contactBtn.classList.add('active');
    } else {
        // Por defecto, si no es contacto, SIEMPRE es home
        if (homeBtn) homeBtn.classList.add('active');
    }
}

// 9. Event Listeners
window.addEventListener("scroll", () => {
    const parallax = document.getElementById("parallax");
    if(parallax) parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    
    revealContent();

    if (navLogo) {
        if (window.scrollY > 150) navLogo.classList.add('visible');
        else navLogo.classList.remove('visible');
    }

    updateActiveLink();
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (!contactSection) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// 10. Inicialización
document.addEventListener('DOMContentLoaded', () => { 
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    startIntro();
    // Ejecutamos varias veces para asegurar que el cálculo sea correcto tras cargar imágenes
    updateActiveLink();
    setTimeout(updateActiveLink, 100);
    setTimeout(updateActiveLink, 1000);
});
