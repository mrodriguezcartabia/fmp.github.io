// Inicializar iconos de Lucide
lucide.createIcons();

const translations = { en: 'Copied!', es: '¡Copiado!', pt: 'Copiado!' };

// --- ELEMENTOS GLOBALES ---
const navLogo = document.getElementById('nav-logo');
const introScreen = document.getElementById('intro-screen');
const introContent = document.getElementById('intro-content');
const navLinks = document.querySelectorAll('.nav-link');
const contactSection = document.getElementById('contact-section');

// Selectores específicos para los enlaces
const homeLink = document.querySelector('a[href="index.html"]');
const contactLink = document.querySelector('a[href="#contact-section"]') || document.querySelector('a[href="index.html#contact-section"]');

// --- FUNCIONES ---

// Copiar email
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

// Revelar secciones al scroll
function revealContent() {
    document.querySelectorAll(".reveal").forEach(el => { 
        if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add("active");
    });
}

// Manejar el scroll automático si viene de otra página
function checkScrollParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scroll') === 'contact') {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            if (contactSection) {
                const offset = 120;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = contactSection.getBoundingClientRect().top;
                window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
            }
        }, 800); 
    }
}

// Control de la pantalla de bienvenida
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

// Idioma
function setLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.querySelectorAll('[data-en]').forEach(el => { 
        const text = el.dataset[lang];
        if(text) el.textContent = text;
    });
    document.querySelectorAll('.language-switcher button').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${lang}`));
}

// --- LÓGICA DE NAVEGACIÓN ACTIVA (HOME vs CONTACT) ---
function updateActiveLink() {
    // Detectamos si estamos en la página principal
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname === '';

    if (isHomePage && contactSection) {
        const sectionTop = contactSection.offsetTop;
        // Ajustamos el umbral para que cambie un poco antes de llegar a la sección
        const scrollPosition = window.scrollY + 500; 

        // Limpiamos la clase active de Home y Contact solamente
        if (homeLink) homeLink.classList.remove('active');
        if (contactLink) contactLink.classList.remove('active');

        if (scrollPosition >= sectionTop) {
            if (contactLink) contactLink.classList.add('active');
        } else {
            if (homeLink) homeLink.classList.add('active');
        }
    }
}

// --- EVENTOS ---

window.addEventListener("scroll", () => {
    // Parallax
    const parallax = document.getElementById("parallax");
    if(parallax) parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    
    revealContent();

    // Logo del Nav
    if (navLogo) {
        if (window.scrollY > 150) navLogo.classList.add('visible');
        else navLogo.classList.remove('visible');
    }

    // Actualizar subrayado
    updateActiveLink();
});

// Click en el menú
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // En páginas que no son index.html, esto permite que el link clickeado sea el activo
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', () => { 
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    startIntro();
    updateActiveLink(); 
});
