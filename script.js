// Inicializar iconos de Lucide
lucide.createIcons();

const translations = { en: 'Copied!', es: '¡Copiado!', pt: 'Copiado!' };

// --- ELEMENTOS GLOBALES ---
const navLogo = document.getElementById('nav-logo');
const introScreen = document.getElementById('intro-screen');
const introContent = document.getElementById('intro-content');
const navLinks = document.querySelectorAll('.nav-link');
const contactLink = document.querySelector('a[href="#contact-section"]') || document.querySelector('a[href*="scroll=contact"]');
const homeLink = document.querySelector('a[href="index.html"]');
const contactSection = document.getElementById('contact-section');

// Función para copiar email al portapapeles
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

// Función para revelar contenido al hacer scroll (animación de entrada)
function revealContent() {
    document.querySelectorAll(".reveal").forEach(el => { 
        if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add("active");
    });
}

// Lógica para el parámetro de scroll suave y activación de pestaña al venir de otra página
function checkScrollParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scroll') === 'contact') {
        
        // Resaltar visualmente "Contact" antes de iniciar el viaje
        navLinks.forEach(link => link.classList.remove('active'));
        if (contactLink) contactLink.classList.add('active');

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

// Orquestador de la pantalla de bienvenida (Intro)
function startIntro() {
    if (sessionStorage.getItem('introShown') || !introScreen) { 
        if (introScreen) introScreen.remove(); 
        revealContent();
        checkScrollParam(); 
        return; 
    }
    document.body.classList.add('intro-active');
    setTimeout(() => {
        introContent.classList.remove('opacity-0');
        setTimeout(() => introContent.classList.add('shimmer-active'), 500);
        setTimeout(() => {
            introContent.style.opacity = '0';
            introScreen.style.opacity = '0';
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

// Cambiador de idioma
function setLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.querySelectorAll('[data-en]').forEach(el => { 
        const text = el.dataset[lang];
        if(text) el.textContent = text;
    });
    document.querySelectorAll('.language-switcher button').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${lang}`));
}

// --- LOGICA DE NAVEGACION ACTIVA (SCROLL) ---
function updateActiveLink() {
    // Solo ejecutamos esta lógica si estamos en la página que tiene la sección de contacto (Home)
    if (contactSection && contactLink && homeLink) {
        const sectionTop = contactSection.offsetTop;
        const scrollPosition = window.scrollY + 450; // Umbral de detección

        if (scrollPosition >= sectionTop) {
            // Estamos en o debajo de la sección de contacto
            navLinks.forEach(link => link.classList.remove('active'));
            contactLink.classList.add('active');
        } else {
            // Estamos arriba (Home / Primera sección)
            navLinks.forEach(link => link.classList.remove('active'));
            homeLink.classList.add('active');
        }
    }
}

// --- EVENTOS GLOBALES ---

window.addEventListener("scroll", () => {
    // Efecto Parallax en el fondo
    const parallax = document.getElementById("parallax");
    if(parallax) parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    
    // Revelar elementos
    revealContent();

    // Mostrar/Ocultar Logo pequeño del Nav
    if (navLogo) {
        if (window.scrollY > 150) navLogo.classList.add('visible');
        else navLogo.classList.remove('visible');
    }

    // Actualizar qué link del menú está subrayado
    updateActiveLink();
});

// Manejo de clicks para respuesta visual inmediata
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            // Forzamos el estado activo al hacer click antes del scroll
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => { 
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    startIntro(); 
    // Ejecutar una vez al cargar para marcar la posición inicial
    updateActiveLink();
});
