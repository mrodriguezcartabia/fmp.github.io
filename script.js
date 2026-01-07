// --- NUEVA FUNCIÓN DE CARGA DE MENÚ ---
function loadNavbar() {
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) return;

    fetch('nav.html')
        .then(response => response.text())
        .then(data => {
            placeholder.innerHTML = data;
            
            // Inicializar iconos de Lucide en el menú recién cargado
            lucide.createIcons();

            // Marcar el link activo según la página actual
            const currentPage = window.location.pathname.split("/").pop() || 'index.html';
            document.querySelectorAll('.nav-link').forEach(link => {
                // Si el href coincide exactamente o si el link es index.html y estamos en la raíz
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Aplicar el idioma al menú cargado
            const currentLang = localStorage.getItem('preferredLang') || 'en';
            setLanguage(currentLang);
            
            // IMPORTANTE: Re-asignar eventos o refrescar referencias si es necesario
            // Como el logo del nav se carga dinámicamente, refrescamos la referencia:
            window.navLogo = document.getElementById('nav-logo');
        })
        .catch(error => console.error('Error cargando el menú:', error));
}
// 1. Inicialización de iconos (Lucide)
lucide.createIcons();

const translations = { en: 'Copied', es: 'Copiado', pt: 'Copiado' };

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

        // --- INICIO DEL CAMBIO ---
        setTimeout(() => {
            if (introLogo) introLogo.classList.add('exit-left');
            if (introText) introText.classList.add('exit-right');
            
            // Desvanecer el fondo negro un poco después de que inicien el movimiento
            setTimeout(() => {
                if (introScreen) introScreen.style.opacity = '0';
            }, 400);

            setTimeout(() => { 
                document.body.classList.remove('intro-active'); 
                sessionStorage.setItem('introShown', 'true'); 
                if (introScreen) introScreen.remove(); 
                revealContent();
                checkScrollParam(); 
            }, 2000); // Tiempo total de la animación de salida
        }, 2500); // Tiempo que el logo se queda quieto brillando
        // --- FIN DEL CAMBIO ---

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

// 8. LÓGICA DE NAVEGACIÓN ACTIVA (INTERSECTION OBSERVER)
function setupNavigationObserver() {
    if (!contactSection) return;

    const homeBtn = navLinks[0];
    const contactBtn = navLinks[navLinks.length - 1];

    const observerOptions = {
        root: null,
        threshold: 0.5 // Se activa cuando el 50% de la sección es visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Limpiamos ambos primero
            homeBtn.classList.remove('active');
            contactBtn.classList.remove('active');

            if (entry.isIntersecting) {
                // Si la sección de contacto es visible, activamos Contacto
                contactBtn.classList.add('active');
            } else {
                // Si no es visible, por defecto estamos en Home
                homeBtn.classList.add('active');
            }
        });
    }, observerOptions);

    observer.observe(contactSection);
}

// 9. Event Listeners
window.addEventListener("scroll", () => {
    const parallax = document.getElementById("parallax");
    if(parallax) parallax.style.transform = `translateY(${window.scrollY * 0.3}px) scale(1.1)`;
    revealContent();

    // Usamos el ID directamente o la variable actualizada
    const logo = document.getElementById('nav-logo');
    if (logo) {
        if (window.scrollY > 150) logo.classList.add('visible');
        else logo.classList.remove('visible');
    }
});

// 10. Inicialización
document.addEventListener('DOMContentLoaded', () => { 
    loadNavbar(); // <--- Llamada clave
    setLanguage(localStorage.getItem('preferredLang') || 'en'); 
    startIntro();
    setupNavigationObserver();
});
