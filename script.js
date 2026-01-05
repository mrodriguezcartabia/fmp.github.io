// Inicializar iconos de Lucide
lucide.createIcons();

const translations = { en: 'Copied!', es: '¡Copiado!', pt: 'Copiado!' };

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

const introScreen = document.getElementById('intro-screen');
const introContent = document.getElementById('intro-content');
const navLogo = document.getElementById('nav-logo');

// Función para revelar contenido al hacer scroll
function revealContent() {
    document.querySelectorAll(".reveal").forEach(el => { 
        if (el.getBoundingClientRect().top < window.innerHeight - 50) el.classList.add("active");
    });
}

// Lógica para el parámetro de scroll suave
function checkScrollParam() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scroll') === 'contact') {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            const contactSection = document.getElementById('contact-section');
            if (contactSection) {
                const offset = 100;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = contactSection.getBoundingClientRect().top;
                window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
            }
        }, 800); 
    }
}

// Orquestador de la pantalla de bienvenida
function startIntro() {
    if (sessionStorage.getItem('introShown')) { 
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
        }, 2200);
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

// Eventos globales
window.addEventListener("scroll", () => {
    const parallax = document.getElementById("parallax");
    if(parallax) parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    revealContent();
    if (window.scrollY > 150) navLogo.classList.add('visible');
    else navLogo.classList.remove('visible');
});

document.addEventListener('DOMContentLoaded', () => { 
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    startIntro(); 
});
