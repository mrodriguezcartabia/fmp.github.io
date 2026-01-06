// 1. Inicialización de iconos (Lucide)
lucide.createIcons();

const translations = { en: 'Copied!', es: '¡Copiado!', pt: 'Copiado!' };

// 2. Selección de elementos clave
const navLogo = document.getElementById('nav-logo');
const introScreen = document.getElementById('intro-screen');
const introContent = document.getElementById('intro-content');
const navLinks = document.querySelectorAll('.nav-link');
const contactSection = document.getElementById('contact-section');

// 3. Funciones de Utilidad
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

function revealContent() {
    document.querySelectorAll(".reveal").forEach(el => { 
        if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add("active");
    });
}

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

function setLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.querySelectorAll('[data-en]').forEach(el => { 
        const text = el.dataset[lang];
        if(text) el.textContent = text;
    });
    document.querySelectorAll('.language-switcher button').forEach(btn => btn.classList.toggle('active', btn.id === `lang-${lang}`));
}

// 4. Lógica de Navegación Activa (Exclusión Mutua)
function updateActiveLink() {
    // Identificamos los botones específicos
    const homeBtn = document.querySelector('a[href="index.html"]');
    const contactBtn = document.querySelector('a[href="#contact-section"]');

    // Si no estamos en la página que tiene la sección de contacto, no ejecutamos la lógica
    if (!contactSection) return;

    const scrollPosition = window.scrollY;
    // Umbral: cambiamos a contacto 500px antes de llegar al final
    const contactThreshold = contactSection.offsetTop - 500; 

    // Limpiamos la clase active de TODOS los links para evitar duplicados
    navLinks.forEach(link => link.classList.remove('active'));

    if (scrollPosition >= contactThreshold) {
        if (contactBtn) contactBtn.classList.add('active');
    } else {
        if (homeBtn) homeBtn.classList.add('active');
    }
}

// 5. Listeners de Eventos
window.addEventListener("scroll", () => {
    // Parallax
    const parallax = document.getElementById("parallax");
    if(parallax) parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    
    revealContent();

    // Logo en el nav
    if (navLogo) {
        if (window.scrollY > 150) navLogo.classList.add('visible');
        else navLogo.classList.remove('visible');
    }

    // Actualizar subrayado
    updateActiveLink();
});

// Click manual (Solo para páginas estáticas como Games)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (!contactSection) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
});

// 6. Ejecución Inicial
document.addEventListener('DOMContentLoaded', () => { 
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    startIntro();
    // Forzamos la actualización al cargar
    updateActiveLink(); 
});
