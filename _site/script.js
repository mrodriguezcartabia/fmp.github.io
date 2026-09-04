/* gamma.ar/new — idioma, animaciones, formulario y agente. */

const API = 'https://api.gamma.ar';
const SITEKEY = '0x4AAAAAAEaf8Pm2cWLZDXsu';

const TEXTOS = {
	es: {
		titulo: 'Asistente {marca}',
		aviso: 'Las respuestas son generadas automáticamente por un modelo de IA de terceros (Google Gemini), pueden contener errores y se registran de forma anónima para mejorar el servicio. No ingreses datos personales.',
		saludo: '¡Hola! Puedo responder sobre lo que hace Gamma y sobre las tres formas de trabajar juntos. ¿Qué querés saber?',
		abrir: 'Preguntale al asistente',
		abrirCorto: 'Asistente',
		enviar: 'Enviar',
		escribi: 'Escribí tu consulta',
		pensando: 'Pensando',
		redactar: 'Armar un mensaje para Gamma',
		falla: 'Se cortó la conexión con el asistente. Escribinos a info@gamma.ar.',
		verificando: 'Verificando que no seas un robot',
		enviando: 'Enviando',
		enviado: 'Listo, recibimos tu mensaje. Te mandamos una copia a {correo}; si no llega en unos minutos, revisá spam o escribinos directo a info@gamma.ar.',
		errorForm: 'No pudimos enviar el mensaje. Probá de nuevo o escribinos a info@gamma.ar.',
		camposForm: 'Completá el nombre, un correo válido y el mensaje.',
		copiado: 'Copiado',
		demanda: 'El asistente está con mucha demanda. Reintento en {s} s...',
		demandaUltima: 'Intentando una última vez en {s} s. Perdón por la demora: si preferís, escribinos a info@gamma.ar.',
		lento: 'Sigo pensando, dame unos segundos',
		muyLento: 'Esto está tardando; si preferís no esperar, escribinos a info@gamma.ar',
		sinVerificacion: 'No se pudo cargar la verificación de seguridad. Probá recargar la página o escribinos a info@gamma.ar.',
	},
	en: {
		titulo: 'Assistant {marca}',
		aviso: 'Answers are generated automatically by a third-party AI model (Google Gemini), may contain errors and are logged anonymously to improve the service. Do not enter personal data.',
		saludo: "Hi! I can answer questions about what Gamma does and about the three ways of working together. What would you like to know?",
		abrir: 'Ask the assistant',
		abrirCorto: 'Assistant',
		enviar: 'Send',
		escribi: 'Type your question',
		pensando: 'Thinking',
		redactar: 'Draft a message to Gamma',
		falla: 'The connection to the assistant failed. Write to info@gamma.ar.',
		verificando: 'Checking that you are not a robot',
		enviando: 'Sending',
		enviado: "Thanks, we've got your message. A copy is on its way to {correo}; if it doesn't arrive in a few minutes, check spam or write directly to info@gamma.ar.",
		errorForm: "We couldn't send the message. Try again or write to info@gamma.ar.",
		camposForm: 'Please fill in your name, a valid email and the message.',
		copiado: 'Copied',
		demanda: 'The assistant is under heavy load. Retrying in {s} s...',
		demandaUltima: 'Trying one last time in {s}s. Sorry for the wait — if you prefer, write to info@gamma.ar.',
		lento: 'Still thinking, give me a few seconds',
		muyLento: 'This is taking a while; if you would prefer not to wait, write to us at info@gamma.ar',
		sinVerificacion: 'The security check failed to load. Try reloading the page or write to info@gamma.ar.',
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

/* ------------------------------------------------------------- clientes */

function clonarTanda(el) {
	const c = el.cloneNode(true);
	c.setAttribute('aria-hidden', 'true');
	c.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
	return c;
}

function duplicarTira() {
	document.querySelectorAll('.tira-pista').forEach((pista) => {
		if (pista.dataset.base === undefined) pista.dataset.base = pista.innerHTML;
		else pista.innerHTML = pista.dataset.base;

		const base = [...pista.children];
		if (!base.length) return;
		const ancho = pista.parentElement.offsetWidth;
		const hueco = parseFloat(getComputedStyle(pista).columnGap) || 0;

		while (pista.scrollWidth + hueco < ancho && pista.children.length < 20) {
			base.forEach((el) => pista.append(clonarTanda(el)));
		}
		[...pista.children].forEach((el) => pista.append(clonarTanda(el)));

		const salto = (pista.scrollWidth + hueco) / 2;
		pista.style.setProperty('--salto', `${salto}px`);
		pista.style.animationDuration = `${Math.round(salto / 35)}s`;   // ← px por segundo
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
	let sinTurnstile = false;

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
	}, () => {
		sinTurnstile = true;
		aviso.textContent = t().sinVerificacion;
		aviso.classList.add('error');
	});

	form.addEventListener('submit', async (ev) => {
		ev.preventDefault();
		aviso.classList.remove('error');

		const datos = {
			nombre: form.nombre.value.trim(),
			empresa: form.empresa.value.trim(),
			correo: form.correo.value.trim(),
			idioma: document.documentElement.lang === 'en' ? 'en' : 'es',
			mensaje: form.mensaje.value.trim(),
			turnstile: token,
		};
		if (!datos.nombre || !datos.mensaje || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(datos.correo)) {
			aviso.textContent = t().camposForm;
			aviso.classList.add('error');
			return;
		}
		if (!token) {
			if (sinTurnstile) {
				aviso.textContent = t().sinVerificacion;
				aviso.classList.add('error');
				return;
			}
			aviso.textContent = t().verificando;
			ponerPuntos(aviso);
			return;
		}

		boton.disabled = true;
		aviso.textContent = t().enviando;
		ponerPuntos(aviso);
		try {
			const r = await fetch(`${API}/contacto`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(datos),
			});
			if (!r.ok) throw new Error(r.status);
			form.reset();
			aviso.textContent = t().enviado.replace('{correo}', datos.correo);
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
let saliendo = false;

function construirAgente() {
	if (!document.body.dataset.agente) return;

	const boton = document.createElement('button');
	boton.id = 'gw-boton';
	boton.type = 'button';
	boton.append(
		Object.assign(document.createElement('span'), { className: 'gw-largo' }),
		Object.assign(document.createElement('span'), { className: 'gw-corto' })
	);

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
				<button type="button" class="boton" id="gw-enviar"></button>
			</div>
			<button type="button" class="boton" id="gw-redactar" hidden></button>
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
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && agente.abierto) cerrarAgente();
	});
	agente.enviar.addEventListener('click', enviarConsulta);
	agente.redactar.addEventListener('click', pedirRedaccion);
	agente.texto.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarConsulta(); }
	});
	agente.texto.addEventListener('input', ajustarCaja);
	actualizarTextosAgente();
	if (previo) restaurarConversacion(previo);
}

// El botón de redactar aparece recién cuando el asistente contestó al menos una
// vez. El saludo no cuenta: no entra en historial.
function hayIntercambio() {
	return agente.historial.some((m) => m.rol === 'agente');
}
const CLAVE_ESTADO = 'gamma-agente-estado';

function restaurarConversacion(previo) {
	const saludo = burbuja('agente', t().saludo);
	saludo.dataset.saludo = '1';
	agente.historial.forEach((m) => burbuja(m.rol === 'agente' ? 'agente' : 'visitante', m.texto));
	// Texto escrito y no enviado: vivía solo en el DOM de la página anterior.
	if (previo?.pendiente) agente.texto.value = previo.pendiente;
	ajustarCaja();
	agente.redactar.hidden = !hayIntercambio();
	if (agente.terminado) agente.enviar.disabled = true;
	if (previo?.abierto) abrirAgente();
	recuperarPerdido();
}

// Si el worker terminó un turno mientras el visitante cambiaba de página, esa
// respuesta quedó en D1 y no en el navegador. Se detecta porque el último
// mensaje del historial es del visitante: nunca queda así si el turno cerró bien.
function recuperarPerdido(intentos = 12, esperando = null) {
	const h = agente.historial;
	if (!h.length || h[h.length - 1].rol !== 'visitante') return;

	// Primera vuelta: el visitante llega a la página nueva y ve su pregunta sola.
	// La burbuja le da la misma señal que tenía antes de navegar, mientras el
	// worker termina de escribir del otro lado.
	if (!esperando) {
		esperando = burbuja('agente', t().pensando);
		esperando.classList.add('pensando');
		ponerPuntos(esperando);
	}

	fetch(`${API}/ultimo`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			sesion: agente.sesion,
			vistos: h.filter((m) => m.rol === 'agente').length,
		}),
	})
		.then((r) => r.json())
		.then((d) => {
			if (!d.turnos || !d.turnos.length) {
				// El worker puede tardar medio minuto: cuando navegamos, la fila
				// todavía no existía en D1. Preguntar una sola vez nunca alcanza.
				if (intentos > 0) {
					setTimeout(() => recuperarPerdido(intentos - 1, esperando), 3000);
					return;
				}
				// Se agotó el sondeo: el worker no llegó a guardar nada.
				esperando.remove();
				burbuja('agente', t().falla);
				return;
			}
			esperando.remove();
			d.turnos.forEach((texto) => {
				burbuja('agente', texto);
				agente.historial.push({ rol: 'agente', texto });
			});
			// El turno se completó del lado del worker: la sesión ya tiene filas en
			// D1 y no va a pedir Turnstile de nuevo.
			agente.verificado = true;
			agente.redactar.hidden = !hayIntercambio();
			guardarEstado();
		})
		.catch(() => {
			if (intentos > 0) setTimeout(() => recuperarPerdido(intentos - 1, esperando), 3000);
			else esperando.remove();
		});
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
	if (saliendo) return;
	// Un historial vacío nunca debe pisar uno con contenido: eso solo pasa cuando
	// un pop() de una falla espuria dejó el array en cero justo antes de guardar.
	const anterior = leerEstado();
	if (!agente.historial.length && anterior?.historial?.length) return;
	try {
		sessionStorage.setItem(CLAVE_ESTADO, JSON.stringify({
			sesion: agente.sesion,
			historial: agente.historial.slice(-20),
			verificado: agente.verificado,
			terminado: agente.terminado,
			abierto: agente.abierto,
			pendiente: agente.texto.value,
		}));
	} catch (e) {}
}

function actualizarTextosAgente() {
	if (!agente) return;
	agente.boton.querySelector('.gw-largo').textContent = t().abrir;
	agente.boton.querySelector('.gw-corto').textContent = t().abrirCorto;
	agente.boton.setAttribute('aria-label', t().abrir);
	agente.panel.querySelector('#gw-titulo').innerHTML =
		t().titulo.replace('{marca}', '<span class="gw-marca">Gamma</span>');
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
	document.body.classList.add('gw-abierto');
	agente.boton.style.display = 'none';

	if (!agente.mensajes.children.length) {
		const saludo = burbuja('agente', t().saludo);
		saludo.dataset.saludo = '1';
	}
	agente.texto.focus();
	guardarEstado();
}

// El widget se monta recién cuando hace falta un token, no al abrir el panel. Si
// se monta al abrir, cada cambio de página previo a la primera respuesta lo
// vuelve a mostrar, y queda tapando las burbujas. Además el token expira a los
// pocos minutos, así que pedirlo antes de tiempo no sirve de nada.
function montarTurnstile() {
	if (agente.verificado || agente.widgetId) return;
	esperarTurnstile(() => {
		agente.widgetId = turnstile.render('#gw-turnstile', {
			sitekey: SITEKEY,
			theme: 'dark',
			callback: (tk) => {
				agente.token = tk;
				// Si el visitante escribió mientras se verificaba, se saca el cartel
				// y se manda lo que había quedado esperando.
				const avisos = agente.mensajes.querySelectorAll('.gw-espera-turnstile');
				avisos.forEach((a) => a.remove());
				if (avisos.length && agente.texto.value.trim()) enviarConsulta();
			},
			'expired-callback': () => { agente.token = null; },
		});
	});
}

function cerrarAgente() {
	agente.abierto = false;
	agente.panel.classList.remove('abierto');
	document.body.classList.remove('gw-abierto');
	agente.boton.style.display = '';
	guardarEstado();
}

// La caja crece con el contenido hasta el techo que fija el CSS. El 'auto' previo
// no es opcional: sin él la caja crece pero nunca se achica al borrar texto.
function ajustarCaja() {
	agente.texto.style.height = 'auto';
	agente.texto.style.height = `${agente.texto.scrollHeight}px`;
}

function burbuja(quien, texto) {
	const div = document.createElement('div');
	div.className = `gw-msg ${quien}`;
	div.textContent = texto;
	agente.mensajes.append(div);
	agente.mensajes.scrollTop = agente.mensajes.scrollHeight;
	return div;
}

// vuelta 1 es el intento original; 2 y 3 son los reintentos automáticos.
async function enviarConsulta(preguntaPrevia, vuelta = 1) {
	if (agente.terminado) return;
	// Cuando la llama el listener del botón, el primer argumento es el evento:
	// solo cuenta como reintento si viene un string.
	const reintento = typeof preguntaPrevia === 'string';
	// Sin esto, Enter durante la espera dispara un segundo pedido en paralelo.
	if (!reintento && agente.enviar.disabled) return;

	const pregunta = reintento ? preguntaPrevia : agente.texto.value.trim();
	if (!pregunta) return;
	if (!reintento && !agente.verificado && !agente.token) {
		montarTurnstile();
		// Si ya hay un cartel esperando, no apilar otro por cada click.
		if (!agente.mensajes.querySelector('.gw-espera-turnstile')) {
			const aviso = burbuja('agente', t().verificando);
			aviso.classList.add('gw-espera-turnstile');
			ponerPuntos(aviso);
		}
		return;
	}

	if (!reintento) {
		agente.texto.value = '';
		ajustarCaja();
		burbuja('visitante', pregunta);
		agente.historial.push({ rol: 'visitante', texto: pregunta });
		// Se guarda ya, no en el finally: si el visitante cambia de página mientras
		// espera, su pregunta tiene que seguir en pantalla al volver.
		guardarEstado();
	}
	agente.enviar.disabled = true;
	const esperando = burbuja('agente', t().pensando);
	esperando.classList.add('pensando');
	ponerPuntos(esperando);
	// A los 20 s el silencio empieza a parecer un cuelgue. El texto cambia aunque
	// el cliente no sepa en qué anda el worker: lo único que afirma es que sigue.
	const avisoLento = setTimeout(() => {
		esperando.textContent = t().lento;
		ponerPuntos(esperando);
	}, 20000);
	const avisoMuyLento = setTimeout(() => {
		esperando.textContent = t().muyLento;
		ponerPuntos(esperando);
	}, 40000);

	let espera = 0;
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

		// Tres vueltas con espera creciente. Un 5xx de Gemini no consume cuota, así
		// que insistir es gratis: medido el 01/09/2026, 3.6 responde bien 1 de cada
		// 3 veces, y tres intentos lo llevan cerca del 70%.
		if (data.codigo === 'demanda' && vuelta < 3) {
			agente.verificado = true;
			espera = [4, 8, 16][vuelta - 1];
		} else if (data.codigo === 'demanda') {
			agente.historial.pop();
			burbuja('agente', data.respuesta || t().falla);
			agente.verificado = true;
			agente.terminado = true;
		} else if (data.respuesta) {
			burbuja('agente', data.respuesta);
			agente.historial.push({ rol: 'agente', texto: data.respuesta });
			agente.verificado = true;
			if (data.fin) agente.terminado = true;
			agente.redactar.hidden = !hayIntercambio();
		} else {
			agente.historial.pop();
			burbuja('agente', t().falla);
		}
	} catch (e) {
		// Si el visitante cambió de página, el fetch se abortó solo: no es una
		// falla, y tocar el historial acá es lo que le hace desaparecer la pregunta.
		// 'saliendo' depende de que pagehide haya disparado a tiempo, y no siempre
		// lo hace antes del catch. AbortError es la marca directa de que el fetch
		// murió porque el documento se está descargando, sin depender del orden.
		if (saliendo || e.name === 'AbortError' || !navigator.onLine) return;
		esperando.remove();
		// La pregunta se agregó al historial en la vuelta 1 y ninguna vuelta la
		// saca, así que hay que sacarla acá sin importar en cuál estemos.
		agente.historial.pop();
		burbuja('agente', t().falla);
	} finally {
		clearTimeout(avisoLento);
		clearTimeout(avisoMuyLento);
		agente.enviar.disabled = agente.terminado || espera > 0;
		agente.token = null;
		// Solo se limpia si ya quedó verificada: si Turnstile falló, borrar el
		// widget deja al visitante sin forma de reintentar.
		if (agente.verificado) {
			// innerHTML='' saca el HTML pero deja viva la instancia interna: la
			// librería después no la encuentra y avisa por consola.
			if (agente.widgetId) {
				try { turnstile.remove(agente.widgetId); } catch (e) {}
				agente.widgetId = null;
			}
			const caja = document.getElementById('gw-turnstile');
			if (caja) caja.innerHTML = '';
		}
		guardarEstado();
	}

	// Fuera del try: así el finally no reactiva el botón antes de tiempo.
	if (espera > 0) {
		await cuentaRegresiva(espera, vuelta);
		return enviarConsulta(pregunta, vuelta + 1);
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

function ponerPuntos(el) {
	el.insertAdjacentHTML('beforeend', '<span class="gw-puntos"><i></i><i></i><i></i></span>');
	return el;
}

async function cuentaRegresiva(segundos, vuelta = 1) {
	const frase = vuelta >= 2 ? t().demandaUltima : t().demanda;
	const linea = burbuja('agente', frase.replace('{s}', segundos));
	return new Promise((listo) => {
		let quedan = segundos;
		const reloj = setInterval(() => {
			quedan -= 1;
			if (quedan > 0) {
				linea.textContent = frase.replace('{s}', quedan);
				return;
			}
			clearInterval(reloj);
			linea.remove();
			listo();
		}, 1000);
	});
}

function activarCopiaCorreo() {
	document.addEventListener('click', (ev) => {
		const enlace = ev.target.closest('a[href^="mailto:"]');
		if (!enlace || !navigator.clipboard || !matchMedia('(pointer: fine)').matches) return;
		ev.preventDefault();
		const correo = enlace.getAttribute('href').replace(/^mailto:/, '').split('?')[0];
		navigator.clipboard.writeText(correo).then(() => {
			const original = enlace.textContent;
			enlace.textContent = t().copiado;
			setTimeout(() => { enlace.textContent = original; }, 1500);
		}).catch(() => { location.href = enlace.href; });
	});
}

function esperarTurnstile(fn, alFallar, intentos = 40) {
	if (window.turnstile && turnstile.render) return fn();
	if (intentos <= 0) {
		// Turnstile no cargó. Sin esto el visitante queda esperando un captcha
		// que nunca va a aparecer, sin ningún aviso.
		console.error('turnstile no cargó');
		if (alFallar) alFallar();
		return;
	}
	setTimeout(() => esperarTurnstile(fn, alFallar, intentos - 1), 250);
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
	activarCopiaCorreo();

	document.querySelectorAll('.idiomas button').forEach((b) => {
		b.addEventListener('click', () => aplicarIdioma(b.dataset.idioma));
	});
});

window.addEventListener('load', duplicarTira);

let ajusteTira;
window.addEventListener('resize', () => {
	clearTimeout(ajusteTira);
	ajusteTira = setTimeout(duplicarTira, 250);
});
// Cambiar de página aborta el fetch en curso. Sin esta marca, el catch de
// enviarConsulta lo trata como una falla, borra la pregunta del historial y
// guarda ese estado mutilado antes de que la página termine de descargarse.
window.addEventListener('pagehide', () => {
	// El texto sin enviar solo existe en el DOM. Se guarda acá, antes de la
	// bandera, porque guardarEstado() sale temprano cuando 'saliendo' es true.
	if (agente && agente.texto.value.trim()) guardarEstado();
	saliendo = true;
});
// El navegador puede devolver la página desde el bfcache (botón atrás) con las
// variables intactas. Sin esto, 'saliendo' queda en true y guardarEstado() deja
// de guardar para siempre en esa pestaña.
window.addEventListener('pageshow', () => { saliendo = false; });
// El teclado virtual no achica el layout viewport, así que ni vh ni dvh lo ven:
// solo visualViewport sabe cuánto espacio queda de verdad. En iOS además desplaza
// el viewport hacia arriba, por eso hay que seguir también offsetTop.
if (window.visualViewport) {
	// Solo en el ancho donde el panel es pantalla completa. En escritorio está
	// anclado abajo a la derecha y fijarle 'top' lo estira hasta el borde superior.
	const movil = window.matchMedia('(max-width: 760px)');
	const ajustarPanel = () => {
		const panel = document.getElementById('gw-panel');
		if (!movil.matches) {
			document.documentElement.style.removeProperty('--gw-alto');
			if (panel) panel.style.removeProperty('top');
			return;
		}
		const vv = window.visualViewport;
		document.documentElement.style.setProperty('--gw-alto', `${vv.height}px`);
		if (panel) panel.style.top = `${vv.offsetTop}px`;
	};
	window.visualViewport.addEventListener('resize', ajustarPanel);
	window.visualViewport.addEventListener('scroll', ajustarPanel);
	// Al cruzar el breakpoint (rotar el teléfono, achicar la ventana) hay que
	// limpiar o volver a poner los valores según de qué lado quedó.
	movil.addEventListener('change', ajustarPanel);
	ajustarPanel();
}