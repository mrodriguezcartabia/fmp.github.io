/* gamma.ar/new — idioma, animaciones, formulario y agente. */

const API = 'https://api.gamma.ar';
const SITEKEY = '0x4AAAAAAEaf8Pm2cWLZDXsu';

const TEXTOS = {
	es: {
		titulo: 'Asistente',
		aviso: 'Las respuestas son generadas automáticamente por un modelo de IA de terceros (Google Gemini), pueden contener errores y se registran de forma anónima para mejorar el servicio. No ingreses datos personales.',
		saludo: 'Puedo responder sobre lo que hace Gamma y sobre las tres formas de trabajar juntos. ¿Qué querés saber?',
		abrir: 'Preguntale al asistente',
		enviar: 'Enviar',
		escribi: 'Escribí tu consulta',
		pensando: 'Pensando…',
		redactar: 'Armar un mensaje para Gamma',
		falla: 'Se cortó la conexión con el asistente. Escribinos a info@gamma.ar.',
		verificando: 'Verificando que no seas un robot…',
		enviando: 'Enviando…',
		enviado: 'Listo, recibimos tu mensaje. Te mandamos una copia a tu correo; si no llega en unos minutos, revisá spam o escribinos directo a info@gamma.ar.',
		errorForm: 'No pudimos enviar el mensaje. Probá de nuevo o escribinos a info@gamma.ar.',
		camposForm: 'Completá el nombre, un correo válido y el mensaje.',
	},
	en: {
		titulo: 'Assistant',
		aviso: 'Answers are generated automatically by a third-party AI model (Google Gemini), may contain errors and are logged anonymously to improve the service. Do not enter personal data.',
		saludo: "I can answer questions about what Gamma does and about the three ways of working together. What would you like to know?",
		abrir: 'Ask the assistant',
		enviar: 'Send',
		escribi: 'Type your question',
		pensando: 'Thinking…',
		redactar: 'Draft a message to Gamma',
		falla: 'The connection to the assistant failed. Write to info@gamma.ar.',
		verificando: 'Checking that you are not a robot…',
		enviando: 'Sending…',
		enviado: "Thanks, we've got your message. A copy is on its way to your inbox; if it doesn't arrive in a few minutes, check spam or write directly to info@gamma.ar.",
		errorForm: "We couldn't send the message. Try again or write to info@gamma.ar.",
		camposForm: 'Please fill in your name, a valid email and the message.',
	},
};

let idioma = 'es';
const t = () => TEXTOS[idioma];

/* ------------------------------------------------------------- idioma */

function aplicarIdioma(nuevo) {
	idioma = nuevo === 'en' ? 'en' : 'es';
	document.documentElement.lang = idioma;
	try { localStorage.setItem('gamma-idioma', idioma); } catch (e) {}

	document.querySelectorAll('[data-es]').forEach((el) => {
		const texto = el.dataset[idioma];
		if (!texto) return;
		if (el.hasAttribute('data-html')) el.innerHTML = texto;
		else el.textContent = texto;
	});
	document.querySelectorAll('.idiomas button').forEach((b) => {
		b.classList.toggle('activo', b.dataset.idioma === idioma);
	});
	actualizarTextosAgente();
}

function marcarMenu() {
	const actual = location.pathname.split('/').pop() || 'index.html';
	document.querySelectorAll('.menu a').forEach((a) => {
		a.classList.toggle('activo', a.getAttribute('href') === actual);
	});
}

/* ------------------------------------------------------------- reveal */

function activarReveal() {
	const items = document.querySelectorAll('.reveal');
	if (!('IntersectionObserver' in window)) {
		items.forEach((el) => el.classList.add('visible'));
		return;
	}
	const obs = new IntersectionObserver(
		(entradas) => {
			entradas.forEach((e) => {
				if (e.isIntersecting) {
					e.target.classList.add('visible');
					obs.unobserve(e.target);
				}
			});
		},
		{ rootMargin: '0px 0px -10% 0px' }
	);
	items.forEach((el) => obs.observe(el));
}

/* ------------------------------------------------------------- contacto */

function activarFormulario() {
	const form = document.getElementById('form-contacto');
	if (!form) return;

	const aviso = document.getElementById('aviso-form');
	const boton = form.querySelector('button[type="submit"]');
	let token = null;

	// mensaje redactado por el agente en la otra página
	try {
		const previo = sessionStorage.getItem('gamma-mensaje');
		if (previo) {
			form.mensaje.value = previo;
			sessionStorage.removeItem('gamma-mensaje');
		}
	} catch (e) {}

	esperarTurnstile(() => {
		turnstile.render('#turnstile-form', {
			sitekey: SITEKEY,
			theme: 'dark',
			callback: (tk) => { token = tk; },
			'expired-callback': () => { token = null; },
		});
	});

	form.addEventListener('submit', async (ev) => {
		ev.preventDefault();
		aviso.classList.remove('error');

		const datos = {
			nombre: form.nombre.value.trim(),
			empresa: form.empresa.value.trim(),
			correo: form.correo.value.trim(),
			mensaje: form.mensaje.value.trim(),
			turnstile: token,
		};
		if (!datos.nombre || !datos.mensaje || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo)) {
			aviso.textContent = t().camposForm;
			aviso.classList.add('error');
			return;
		}
		if (!token) {
			aviso.textContent = t().verificando;
			return;
		}

		boton.disabled = true;
		aviso.textContent = t().enviando;
		try {
			const r = await fetch(`${API}/contacto`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(datos),
			});
			if (!r.ok) throw new Error(r.status);
			form.reset();
			aviso.textContent = t().enviado;
		} catch (e) {
			aviso.textContent = t().errorForm;
			aviso.classList.add('error');
		} finally {
			boton.disabled = false;
			token = null;
			if (window.turnstile) turnstile.reset();
		}
	});
}

/* ------------------------------------------------------------- agente */

let agente = null;

function construirAgente() {
	if (!document.body.dataset.agente) return;

	const boton = document.createElement('button');
	boton.id = 'gw-boton';
	boton.type = 'button';

	const panel = document.createElement('div');
	panel.id = 'gw-panel';
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-label', 'Asistente');
	panel.innerHTML = `
		<div class="gw-barra">
			<span id="gw-titulo"></span>
			<span class="gw-acciones">
				<button type="button" id="gw-tamano" aria-label="Cambiar tamaño">&#10530;</button>
				<button type="button" id="gw-cerrar" aria-label="Cerrar">&times;</button>
			</span>
		</div>
		<p class="gw-aviso" id="gw-aviso"></p>
		<div id="gw-mensajes"></div>
		<div id="gw-turnstile"></div>
		<div class="gw-pie">
			<div class="gw-fila">
				<textarea id="gw-texto" rows="2" maxlength="500"></textarea>
				<button type="button" id="gw-enviar"></button>
			</div>
			<button type="button" id="gw-redactar" hidden></button>
		</div>`;

	document.body.append(boton, panel);
	const previo = leerEstado();

	agente = {
		boton, panel,
		mensajes: panel.querySelector('#gw-mensajes'),
		texto: panel.querySelector('#gw-texto'),
		enviar: panel.querySelector('#gw-enviar'),
		redactar: panel.querySelector('#gw-redactar'),
		historial: Array.isArray(previo?.historial) ? previo.historial : [],
		sesion: previo?.sesion || nuevaSesion(),
		token: null,
		verificado: !!previo?.verificado,
		terminado: !!previo?.terminado,
		abierto: false,
	};

	boton.addEventListener('click', abrirAgente);
	panel.querySelector('#gw-cerrar').addEventListener('click', cerrarAgente);
	panel.querySelector('#gw-tamano').addEventListener('click', () => {
		const grande = panel.classList.toggle('grande');
		try { localStorage.setItem('gamma-agente-grande', grande ? '1' : '0'); } catch (e) {}
	});
	try {
		if (localStorage.getItem('gamma-agente-grande') === '1') panel.classList.add('grande');
	} catch (e) {}
	agente.enviar.addEventListener('click', enviarConsulta);
	agente.redactar.addEventListener('click', pedirRedaccion);
	agente.texto.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarConsulta(); }
	});

	actualizarTextosAgente();
	if (previo) restaurarConversacion(previo);
}

const CLAVE_ESTADO = 'gamma-agente-estado';

function restaurarConversacion(previo) {
	const saludo = burbuja('agente', t().saludo);
	saludo.dataset.saludo = '1';
	agente.historial.forEach((m) => burbuja(m.rol === 'agente' ? 'agente' : 'visitante', m.texto));
	if (agente.historial.length >= 4) agente.redactar.hidden = false;
	if (agente.terminado) agente.enviar.disabled = true;
	if (previo?.abierto) abrirAgente();
}

function leerEstado() {
	try {
		const crudo = sessionStorage.getItem(CLAVE_ESTADO);
		const e = crudo ? JSON.parse(crudo) : null;
		return e && typeof e.sesion === 'string' ? e : null;
	} catch (e) { return null; }
}

function guardarEstado() {
	if (!agente) return;
	try {
		sessionStorage.setItem(CLAVE_ESTADO, JSON.stringify({
			sesion: agente.sesion,
			historial: agente.historial.slice(-20),
			verificado: agente.verificado,
			terminado: agente.terminado,
			abierto: agente.abierto,
		}));
	} catch (e) {}
}

function actualizarTextosAgente() {
	if (!agente) return;
	agente.boton.textContent = t().abrir;
	agente.panel.querySelector('#gw-titulo').textContent = t().titulo;
	agente.panel.querySelector('#gw-aviso').textContent = t().aviso;
	agente.enviar.textContent = t().enviar;
	agente.redactar.textContent = t().redactar;
	agente.texto.placeholder = t().escribi;
	const saludo = agente.mensajes.querySelector('[data-saludo]');
	if (saludo) saludo.textContent = t().saludo;
}

function abrirAgente() {
	agente.abierto = true;
	agente.panel.classList.add('abierto');
	agente.boton.style.display = 'none';

	if (!agente.mensajes.children.length) {
		const saludo = burbuja('agente', t().saludo);
		saludo.dataset.saludo = '1';
	}
	if (!agente.verificado) {
		esperarTurnstile(() => {
			turnstile.render('#gw-turnstile', {
				sitekey: SITEKEY,
				theme: 'dark',
				callback: (tk) => { agente.token = tk; },
				'expired-callback': () => { agente.token = null; },
			});
		});
	}
	agente.texto.focus();
	guardarEstado();
}

function cerrarAgente() {
	agente.abierto = false;
	agente.panel.classList.remove('abierto');
	agente.boton.style.display = '';
	guardarEstado();
}

function burbuja(quien, texto) {
	const div = document.createElement('div');
	div.className = `gw-msg ${quien}`;
	div.textContent = texto;
	agente.mensajes.append(div);
	agente.mensajes.scrollTop = agente.mensajes.scrollHeight;
	return div;
}

async function enviarConsulta() {
	if (agente.terminado) return;
	const pregunta = agente.texto.value.trim();
	if (!pregunta) return;
	if (!agente.verificado && !agente.token) {
		burbuja('agente', t().verificando);
		return;
	}

	agente.texto.value = '';
	agente.enviar.disabled = true;
	burbuja('visitante', pregunta);
	agente.historial.push({ rol: 'visitante', texto: pregunta });
	const esperando = burbuja('agente', t().pensando);
	esperando.classList.add('pensando');

	try {
		const r = await fetch(`${API}/consulta`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pregunta,
				idioma,
				sesion: agente.sesion,
				turnstile: agente.token,
			}),
		});
		const data = await r.json();
		esperando.remove();

		if (data.respuesta) {
			burbuja('agente', data.respuesta);
			agente.historial.push({ rol: 'agente', texto: data.respuesta });
			agente.verificado = true;
			if (data.fin) agente.terminado = true;
			if (agente.historial.length >= 4) agente.redactar.hidden = false;
		} else {
			agente.historial.pop();
			burbuja('agente', t().falla);
		}
	} catch (e) {
		esperando.remove();
		agente.historial.pop();
		burbuja('agente', t().falla);
	} finally {
		agente.enviar.disabled = agente.terminado;
		agente.token = null;
		const caja = document.getElementById('gw-turnstile');
		if (caja) caja.innerHTML = '';
		guardarEstado();
	}
}

async function pedirRedaccion() {
	agente.redactar.disabled = true;
	try {
		const r = await fetch(`${API}/redactar`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idioma, sesion: agente.sesion, historial: agente.historial }),
		});
		const data = await r.json();
		if (data.mensaje) {
			try { sessionStorage.setItem('gamma-mensaje', data.mensaje); } catch (e) {}
			cerrarAgente();
			location.href = 'contacto.html';
			return;
		}
		burbuja('agente', t().falla);
	} catch (e) {
		burbuja('agente', t().falla);
	} finally {
		agente.redactar.disabled = false;
	}
}

/* ------------------------------------------------------------- utilidades */

function nuevaSesion() {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function esperarTurnstile(fn, intentos = 40) {
	if (window.turnstile && turnstile.render) return fn();
	if (intentos <= 0) return;
	setTimeout(() => esperarTurnstile(fn, intentos - 1), 250);
}

/* ------------------------------------------------------------- arranque */

document.addEventListener('DOMContentLoaded', () => {
	let guardado = 'es';
	try { guardado = localStorage.getItem('gamma-idioma') || 'es'; } catch (e) {}

	construirAgente();
	aplicarIdioma(guardado);
	marcarMenu();
	activarReveal();
	activarFormulario();

	document.querySelectorAll('.idiomas button').forEach((b) => {
		b.addEventListener('click', () => aplicarIdioma(b.dataset.idioma));
	});
});