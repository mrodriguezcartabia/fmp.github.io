// Inicializar iconos de Lucide (iconos vectoriales)
lucide.createIcons();

const translations = { en: 'Copied!', es: '¡Copiado!', pt: 'Copiado!' };

// --- ELEMENTOS GLOBALES ---
const navLogo = document.getElementById('nav-logo');
const introScreen = document.getElementById('intro-screen');
const introContent = document.getElementById('intro-content');
const navLinks = document.querySelectorAll('.nav-link');
const contactSection = document.getElementById('contact-section');

// --- FUNCIONES DE UTILIDAD ---

/**
 * Copia el email al portapapeles y muestra un feedback visual (tooltip)
 */
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

/**
 * Hace aparecer los elementos con clase "reveal" cuando entran en el viewport
 */
function revealContent() {
    document.querySelectorAll(".reveal").forEach(el => { 
        if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add("active");
    });
}

/**
 * Gestiona el scroll suave cuando vienes de otra página con el parámetro ?scroll=contact
 */
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

/**
 * Orquestador de la pantalla de bienvenida (Intro)
 */
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

/**
 * Cambia el idioma del sitio basado en los atributos data-en, data-es, data-pt
 */
function setLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.querySelectorAll('[data-en]').forEach(el => { 
        const text = el.dataset[lang];
        if(text) el.textContent = text;
    });
    document.querySelectorAll('.language-switcher button').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${lang}`));
}

// --- LÓGICA DE NAVEGACIÓN ACTIVA (DINÁMICA) ---

/**
 * Controla el subrayado del menú entre Home y Contact basado en la posición del scroll
 */
function updateActiveLink() {
    const homeBtn = document.querySelector('a[href="index.html"]');
    const contactBtn = document.querySelector('a[href="#contact-section"]');

    // Si no hay sección de contacto, no estamos en la Home, así que salimos
    if (!contactSection) return;

    const scrollPosition = window.scrollY + 500; // Margen de detección
    const contactTop = contactSection.offsetTop;

    // Limpiamos los estados anteriores de estos dos botones
    if (homeBtn) homeBtn.classList.remove('active');
    if (contactBtn) contactBtn.classList.remove('active');

    // Decidimos cuál activar
    if (scrollPosition >= contactTop) {
        if (contactBtn) contactBtn.classList.add('active');
    } else {
        if (homeBtn) homeBtn.classList.add('active');
    }
}

// --- EVENTOS ---

window.addEventListener("scroll", () => {
    // Efecto Parallax en el fondo
    const parallax = document.getElementById("parallax");
    if(parallax) parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    
    revealContent();

    // Mostrar logo en el nav cuando se baja
    if (navLogo) {
        if (window.scrollY > 150) navLogo.classList.add('visible');
        else navLogo.classList.remove('visible');
    }

    updateActiveLink();
});

/**
 * Evita conflictos entre el click manual y el scroll dinámico en páginas estáticas
 */
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (!contactSection) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => { 
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    startIntro();
    updateActiveLink(); 
});
