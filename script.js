/* --- 1. CONFIGURACIÓN Y REFERENCIAS --- */
const translations = { en: 'Copied!', es: '¡Copiado!', pt: 'Copiado!' };
const getNavLinks = () => document.querySelectorAll('.nav-link');
const getContactSection = () => document.getElementById('contact-section');
let isAnimating = false;

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
async function startIntro() {
    const introScreen = document.getElementById('intro-screen');
    const introContent = document.getElementById('intro-content');
    const introLogo = document.getElementById('intro-logo');
    const introText = document.getElementById('intro-text');
    // Si la intro se mostró, mostramos directo
    if (sessionStorage.getItem('introShown') || !introScreen) { 
        if (introScreen) introScreen.remove(); 
        //Mostrar bullets inmediatamente sin animación
        document.querySelectorAll('.bullet-item').forEach(li => {
            li.classList.remove('opacity-0', 'translate-y-4');
            const container = li.querySelector('.typing-container');
            if(container) {
                const lang = localStorage.getItem('preferredLang') || 'en';
                container.innerHTML = container.getAttribute(`data-${lang}`);
            }
        });
        isAnimating = false;
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

            setTimeout(async () => { 
                document.body.classList.remove('intro-active'); 
                if (introScreen) introScreen.remove(); 
                revealContent();
                // Espera luego de la intro
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                // Animación secuencial de los bullets
                sessionStorage.setItem('introShown', 'true');
                startBulletsAnimation();
            }, 1000);
        }, 2500);
    }, 300);
}
 
async function startBulletsAnimation() {
    const bullets = document.querySelectorAll('.bullet-item');
    
    // ETIQUETA DE REINICIO si cambia el idioma
    mainLoop: while (true) { 
        // 1. Capturamos el idioma al inicio de este intento
        let currentLang = localStorage.getItem('preferredLang') || 'en';
        // Capturamos la "versión" actual del clic
        let currentTick = localStorage.getItem('langUpdateTick');

        // --- FASE DE LIMPIEZA Y RESERVA DE ESPACIO ---
        for (const bullet of bullets) {
            const container = bullet.querySelector('.typing-container');
            if (!container) continue;

            const text = container.getAttribute(`data-${currentLang}`);
            
            // Medimos y bloqueamos altura para evitar saltos
            container.style.visibility = 'hidden';
            container.style.minHeight = '0px';
            container.innerHTML = text;
            const height = container.offsetHeight;
            container.style.minHeight = `${height}px`;
            
            container.innerHTML = ''; // Vaciamos
            container.style.visibility = 'visible';
            bullet.style.opacity = "0"; // Ocultamos el bullet
        }

        // --- FASE DE ESCRITURA ---
        for (const bullet of bullets) {
            const container = bullet.querySelector('.typing-container');
            const text = container.getAttribute(`data-${currentLang}`);

            bullet.style.opacity = "1";

            // --- BUCLE LETRA POR LETRA ---
            for (let i = 0; i < text.length; i++) {
                // VERIFICACIÓN CRÍTICA: ¿Cambiaron el idioma mientras escribía esta letra?
                if (currentTick !== localStorage.getItem('langUpdateTick')) {
                    continue mainLoop; // SALTO INSTANTÁNEO AL INICIO
                }

                // Si se presionó un botón que NO es de idioma (ej: Games), detenemos todo
                if (!isAnimating) return; 

                container.innerHTML += text.charAt(i);
                await new Promise(r => setTimeout(r, 30));
            }

            await new Promise(r => setTimeout(r, 800));
        }

        // Si terminó todos los bullets sin que el idioma cambiara, salimos del while
        if (currentLang === localStorage.getItem('preferredLang')) {
            isAnimating = false;
            break; // Rompe el 'while(true)' porque ya terminó la tarea
        }
    }
}
 
/* --- 5. SISTEMA DE IDIOMAS --- */
function setLanguage(lang) {
    localStorage.setItem('preferredLang', lang);
    // Guardamos el momento exacto del clic para avisarle a la animación de bucle
    localStorage.setItem('langUpdateTick', Date.now().toString());
    document.querySelectorAll('[data-en]').forEach(el => { 
        const text = el.dataset[lang];
        if(text) el.innerHTML = text; // IMPORTANTE: Usar innerHTML
    });

    const iframe = document.getElementById('streamlit-app');
    if (iframe) {
        // Obtenemos la URL base (sin el parámetro lang anterior si existiera)
        const baseUrl = "https://callamzn-mys8k7ezb75qeov5gvpc4i.streamlit.app/?embed=true";
        // Recargamos el iframe con el nuevo idioma
        iframe.src = `${baseUrl}&lang=${lang}`;
    }    
    document.querySelectorAll('.language-switcher button').forEach(btn => 
        btn.classList.toggle('active', btn.id === `lang-${lang}`)
    );
    // Avisamos a MathJax que procese los nuevos .innerHTML
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise();
    }
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
    }, { threshold: 0.85 });

    observer.observe(contactSection);
}

/* --- 7. INICIALIZACIÓN Y LÓGICA DE SCROLL --- */
document.addEventListener('DOMContentLoaded', () => {
    // 1. CAPTURAMOS LOS DATOS DE LA URL
    const urlParams = new URLSearchParams(window.location.search);
    const scrollAction = urlParams.get('scroll'); 
    const currentHash = window.location.hash;
    const contactSection = getContactSection();

    // CASO ESPECIAL: VIENE DE PÁGINA EXTERNA (Who we are / Games) A CONTACTO
    // Detecta el enlace: index.html?scroll=contact
    if (scrollAction === 'contact' && contactSection) {
        // Limpiamos la URL para que no scrollee de nuevo al refrescar
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Matamos la intro de inmediato para que no estorbe
        const intro = document.getElementById('intro-screen');
        if (intro) intro.remove();
        document.body.classList.remove('intro-active');
        sessionStorage.setItem('introShown', 'true');
        startBulletsAnimation();
        sessionStorage.setItem('bulletsFinished', 'true');

        // Función que ejecuta el scroll
        const performScroll = () => {
            setTimeout(() => { // Un pequeño respiro para el renderizado final
                window.scrollTo({
                    top: contactSection.offsetTop - 85,
                    behavior: 'smooth'
                });
            }, 100);
        };

        // Si la página ya cargó todo (incluyendo imágenes), scrolleamos ya.
        // Si no, esperamos al evento 'load'.
        if (document.readyState === 'complete') {
            performScroll();
        } else {
            window.addEventListener('load', performScroll);
        }
        // Dentro del caso scrollAction === 'contact'
        document.querySelectorAll('.bullet-item').forEach(li => li.classList.remove('opacity-0', 'translate-y-4'));
        
    //  CASO NORMAL: CLICS CON # (Ej: entrar directo con un link guardado)
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
        document.querySelectorAll('.bullet-item').forEach(li => li.classList.remove('opacity-0', 'translate-y-4'));

    // CASO BASE: ENTRADA NORMAL A LA HOME
    } else {
        isAnimating = true; 
        startIntro();        
    }

    // EJECUCIÓN DE FUNCIONES BASE
    lucide.createIcons();
    setActiveLink(); 
    const introShown = sessionStorage.getItem('introShown');

    if (introShown === 'true') {
        // Si ya se mostró, forzamos que no haya animaciones en setLanguage
        document.querySelectorAll('.bullet-item').forEach(li => {
            li.classList.remove('opacity-0', 'translate-y-4');
            li.style.opacity = "1";
            const container = li.querySelector('.typing-container');
            if (container) {
                container.style.visibility = 'visible';
                container.style.minHeight = "auto";
                const lang = localStorage.getItem('preferredLang') || 'en';
                container.innerHTML = container.getAttribute(`data-${lang}`);
            }
        });
        revealContent();
    } 
    setLanguage(localStorage.getItem('preferredLang') || 'en', true);
        
    // Si no hubo salto especial ni hash, revelamos contenido tras la intro
    if (scrollAction || currentHash) {
        revealContent();
    }

    /// CAPTURA DE CLICS EN NAVEGACIÓN
    // Buscamos todos los enlaces que NO sean de idioma
    const menuLinks = document.querySelectorAll('.nav-link, #nav-logo a');

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Si el usuario hace clic en Inicio, Games, Who we are o Contacto...
            // Apagamos la animación de los bullets.
            if (isAnimating) isAnimating = false;
        });
    });

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

/* --- 9. MENÚ DESPLEGABLE --- */
function toggleCalculations(elementId) {
    const content = document.getElementById(elementId);
    if (content) {
        content.classList.toggle('hidden')
    }
}
