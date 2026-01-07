/* --- 1. CONFIGURACIÓN Y REFERENCIAS --- */
const translations = { en: 'Copied!', es: '¡Copiado!', pt: 'Copiado!' };

const getNavLinks = () => document.querySelectorAll('.nav-link');
const getContactSection = () => document.getElementById('contact-section');

/* --- 2. GESTIÓN DE NAVEGACIÓN ACTIVA --- */
function setActiveLink() {
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    getNavLinks().forEach(link => {
        const linkPage = link.getAttribute('href').split('?')[0].split('#')[0]; // Limpia parámetros
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/* --- 3. UTILIDADES (COPIADO Y REVEAL) --- */
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

/* --- 4. PANTALLA DE BIENVENIDA (INTRO) --- */
function startIntro() {
    const introScreen = document.getElementById('intro-screen');
    const introContent = document.getElementById('intro-content');
    const introLogo = document.getElementById('intro-logo');
    const introText = document.getElementById('intro-text');

    if (sessionStorage.getItem('introShown') || !introScreen) { 
        if (introScreen) introScreen.remove(); 
        revealContent();
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

/* --- 6. OBSERVADOR DE NAVEGACIÓN --- */
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
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                    contactBtn.classList.remove('active');
                    homeBtn.classList.add('active');
                }
            }
        });
    }, { threshold: 0.5 });

    observer.observe(contactSection);
}

/* --- 7. INICIALIZACIÓN Y LÓGICA DE SCROLL --- */
document.addEventListener('DOMContentLoaded', () => {
    // 1. CAPTURAMOS LOS DATOS DE LA URL
    const urlParams = new URLSearchParams(window.location.search);
    const scrollAction = urlParams.get('scroll'); 
    const currentHash = window.location.hash;
    const contactSection = getContactSection();

    // 2. CASO ESPECIAL: VIENE DE PÁGINA EXTERNA (Who we are / Games) A CONTACTO
    // Detecta el enlace: index.html?scroll=contact
    if (scrollAction === 'contact' && contactSection) {
        // Limpiamos la URL para que no scrollee de nuevo al refrescar
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Matamos la intro de inmediato para que no estorbe
        const intro = document.getElementById('intro-screen');
        if (intro) intro.remove();
        document.body.classList.remove('intro-active');
        sessionStorage.setItem('introShown', 'true');

        // LA PAUSA DE MEDIO SEGUNDO: El usuario ve el Home arriba y luego baja
        setTimeout(() => {
            window.scrollTo({
                top: contactSection.offsetTop - 85,
                behavior: 'smooth'
            });
        }, 500);

    // 3. CASO NORMAL: CLICS CON # (Ej: entrar directo con un link guardado)
    } else if (currentHash) {
        // Quitamos el smooth del CSS un segundo para que el salto inicial sea exacto
        document.documentElement.style.scrollBehavior = 'auto';
        const target = document.querySelector(currentHash);
        if (target) {
            window.scrollTo(0, target.offsetTop - 85);
        }
        
        // Si es contacto, fuera intro
        if (currentHash === '#contact-section') {
            const intro = document.getElementById('intro-screen');
            if (intro) intro.remove();
            sessionStorage.setItem('introShown', 'true');
        }
        
        // Restauramos el smooth del CSS para clics futuros
        setTimeout(() => {
            document.documentElement.style.scrollBehavior = 'smooth';
        }, 100);

    // 4. CASO BASE: ENTRADA NORMAL A LA HOME
    } else {
        startIntro();
    }

    // EJECUCIÓN DE FUNCIONES BASE
    lucide.createIcons();
    setActiveLink(); 
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    
    // Si no hubo salto especial ni hash, revelamos contenido tras la intro
    if (scrollAction || currentHash) {
        revealContent();
    }

    setupNavigationObserver();
});

/* --- 8. EFECTOS DE SCROLL (PARALLAX Y LOGO) --- */
window.addEventListener("scroll", () => {
    const parallax = document.getElementById("parallax");
    const navLogo = document.getElementById('nav-logo'); // <--- AÑADIR ESTA LÍNEA
    
    // Fórmula matemática original para el Parallax
    if(parallax) {
        parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    }
    
    revealContent();

    // Lógica del logo
    if (navLogo) {
            if (window.scrollY > 150) {
                // Cuando bajamos: se hace visible
                navLogo.style.opacity = "1";
                navLogo.style.pointerEvents = "auto"; // Permite hacer clic
                navLogo.style.transform = "translateY(0)";
            } else {
                // Cuando estamos arriba: desaparece por completo
                navLogo.style.opacity = "0";
                navLogo.style.pointerEvents = "none"; // Evita clics accidentales mientras es invisible
                navLogo.style.transform = "translateY(-10px)";
            }
        }
});
