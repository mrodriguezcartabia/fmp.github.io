/* --- 1. CONFIGURACIÓN Y REFERENCIAS --- */
const translations = { en: 'Copied', es: 'Copiado', pt: 'Copiado' };

// Función para obtener los links en cualquier momento (evita errores de referencia)
const getNavLinks = () => document.querySelectorAll('.nav-link');
const getContactSection = () => document.getElementById('contact-section');

/* --- 2. GESTIÓN DE NAVEGACIÓN ACTIVA (ESTÁTICO) --- */
function setActiveLink() {
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    getNavLinks().forEach(link => {
        // Si el href coincide con la página actual, activamos la barra violeta
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* --- 3. FUNCIONES DE UTILIDAD (COPIADO Y REVEAL) --- */
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
    const contactSection = getContactSection();
    if (urlParams.get('scroll') === 'contact' && contactSection) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
            const offset = 120;
            window.scrollTo({ top: contactSection.offsetTop - offset, behavior: 'smooth' });
        }, 800); 
    }
}

/* --- 4. PANTALLA DE BIENVENIDA (INTRO) --- */
function startIntro() {
    const introScreen = document.getElementById('intro-screen');
    const introContent = document.getElementById('intro-content');
    const introLogo = document.getElementById('intro-logo');
    const introText = document.getElementById('intro-text');

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
            if (introLogo) introLogo.classList.add('exit-left');
            if (introText) introText.classList.add('exit-right');
            setTimeout(() => { if (introScreen) introScreen.style.opacity = '0'; }, 400);

            setTimeout(() => { 
                document.body.classList.remove('intro-active'); 
                sessionStorage.setItem('introShown', 'true'); 
                if (introScreen) introScreen.remove(); 
                revealContent();
                checkScrollParam(); 
            }, 2000);
        }, 2500);
    }, 300);
}

/* --- 5. SISTEMA DE IDIOMAS --- */
function setLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    document.querySelectorAll('[data-en]').forEach(el => { 
        const text = el.dataset[lang];
        if(text) el.textContent = text;
    });
    document.querySelectorAll('.language-switcher button').forEach(btn => 
        btn.classList.toggle('active', btn.id === `lang-${lang}`)
    );
}

/* --- 6. OBSERVADOR DE NAVEGACIÓN (Solo en Home) --- */
function setupNavigationObserver() {
    const contactSection = getContactSection();
    const navLinks = getNavLinks();
    if (!contactSection || navLinks.length === 0) return;

    const homeBtn = navLinks[0];
    const contactBtn = navLinks[navLinks.length - 1];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                contactBtn.classList.add('active');
                homeBtn.classList.remove('active');
            } else {
                // Solo volvemos a marcar Home si estamos realmente en index.html
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    contactBtn.classList.remove('active');
                    homeBtn.classList.add('active');
                }
            }
        });
    }, { threshold: 0.5 });

    observer.observe(contactSection);
}

/* --- 7. EVENT LISTENERS --- */
window.addEventListener("scroll", () => {
    const parallax = document.getElementById("parallax");
    const navLogo = document.getElementById('nav-logo');
    
    if(parallax) parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    revealContent();

    if (navLogo) {
        if (window.scrollY > 150) navLogo.classList.add('visible');
        else navLogo.classList.remove('visible');
    }
});

// Re-activar el manejo de clics manuales para que la barra cambie antes del scroll
function setupClickListeners() {
    getNavLinks().forEach(link => {
        link.addEventListener('click', () => {
            if (!getContactSection()) { // Si no estamos en Home, el cambio es directo
                getNavLinks().forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

/* --- 8. INICIALIZACIÓN --- */
document.addEventListener('DOMContentLoaded', () => { 
    lucide.createIcons();
    setActiveLink(); 
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    startIntro();
    setupNavigationObserver();
    setupClickListeners();
});
