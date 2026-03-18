const chatBox   = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn   = document.getElementById("send-button");
const charCount = document.getElementById("char-count");
const nickInput = document.getElementById("username");

const MAX_CHARS  = 140;
const REFRESH_MS = 3000;

let totalMensajes = 0;

let usuarioAlFondo = true;

// DETECTAR SI EL USUARIO SCROLLEA ARRIBA 
chatBox.addEventListener("scroll", function () {
    const margen = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight;
    usuarioAlFondo = margen < 50;
});

// CONTADOR DE CARACTERES 
userInput.addEventListener("input", function () {
    const largo = userInput.value.length;
    charCount.textContent = largo + " / " + MAX_CHARS;

    if (largo >= 120) {
        charCount.classList.add("advertencia");
    } else {
        charCount.classList.remove("advertencia");
    }
    userInput.style.height = "auto";
    userInput.style.height = Math.min(userInput.scrollHeight, 110) + "px";
});

// ENVIAR CON ENTER
userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        enviarMensaje();
    }
});

// ENVIAR CON BOTÓN
sendBtn.addEventListener("click", function () {
    enviarMensaje();
});

const REGEX_URL    = /(https?:\/\/[^\s]+)/g;
const REGEX_IMAGEN = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;

function esImagen(url) {
    try {
        return REGEX_IMAGEN.test(new URL(url).pathname);
    } catch (e) {
        return false;
    }
}

function obtenerUrls(texto) {
    return texto.match(REGEX_URL) || [];
}

function agregarPreviewImagen(url, contenedor) {
    var img = document.createElement("img");
    img.src = url;
    img.alt = "imagen";
    img.className = "chat-image";
    img.onerror = function () { img.remove(); };
    contenedor.appendChild(img);
}

async function agregarPreviewLink(url, contenedor) {
    try {
        var proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
        var respuesta = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
        if (!respuesta.ok) return;

        var datos = await respuesta.json();
        var html  = datos.contents || "";

        var parser = new DOMParser();
        var doc    = parser.parseFromString(html, "text/html");

        function leerMeta(propiedades) {
            for (var i = 0; i < propiedades.length; i++) {
                var el = doc.querySelector('meta[property="' + propiedades[i] + '"], meta[name="' + propiedades[i] + '"]');
                if (el && el.content) return el.content;
            }
            return "";
        }

        var titulo = leerMeta(["og:title", "twitter:title"]) || doc.title || url;
        var desc   = leerMeta(["og:description", "twitter:description", "description"]);
        var imagen = leerMeta(["og:image", "twitter:image"]);
        var host   = new URL(url).hostname;

        var card = document.createElement("a");
        card.href = url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.className = "link-card";

        if (imagen) {
            var imgEl = document.createElement("img");
            imgEl.src = imagen;
            imgEl.alt = "";
            imgEl.onerror = function () { imgEl.remove(); };
            card.appendChild(imgEl);
        }

        var info = document.createElement("div");
        info.className = "link-card-info";

        var tituloEl = document.createElement("div");
        tituloEl.className = "link-card-title";
        tituloEl.textContent = titulo;
        info.appendChild(tituloEl);

        if (desc) {
            var descEl = document.createElement("div");
            descEl.className = "link-card-desc";
            descEl.textContent = desc;
            info.appendChild(descEl);
        }

        var urlEl = document.createElement("div");
        urlEl.className = "link-card-url";
        urlEl.textContent = host;
        info.appendChild(urlEl);

        card.appendChild(info);
        contenedor.appendChild(card);

    } catch (e) {

    }
}

// CREAR ELEMENTO DE MENSAJE 
function crearMensaje(msg) {
    var miNick = nickInput.value.trim() || "Anónimo";
    var esMio  = msg.user === miNick;

    var div = document.createElement("div");
    div.className = "mensaje" + (esMio ? " mio" : "");

    var nombre = document.createElement("div");
    nombre.className = "nombre";
    nombre.textContent = msg.user || "Anónimo";
    div.appendChild(nombre);

    var texto = document.createElement("div");
    texto.textContent = msg.text;
    div.appendChild(texto);

    var urls = obtenerUrls(msg.text);
    urls.forEach(function (url) {
        if (esImagen(url)) {
            agregarPreviewImagen(url, div);
        } else {
            agregarPreviewLink(url, div);
        }
    });

    return div;
}

// OBTENER MENSAJES DEL SERVIDOR 
async function getMessages() {
    try {
        var respuesta = await fetch("/api/messages");
        var mensajes  = await respuesta.json();

        if (!Array.isArray(mensajes)) return;

        if (mensajes.length === totalMensajes) return;

        var scrollAntes = chatBox.scrollTop;
        var alturaAntes = chatBox.scrollHeight;

        chatBox.innerHTML = "";
        mensajes.forEach(function (msg) {
            chatBox.appendChild(crearMensaje(msg));
        });

        totalMensajes = mensajes.length;

        if (usuarioAlFondo) {
            chatBox.scrollTop = chatBox.scrollHeight;
        } else {
            chatBox.scrollTop = scrollAntes + (chatBox.scrollHeight - alturaAntes);
        }

    } catch (e) {
        console.error("Error al obtener mensajes:", e);
    }
}
// ENVIAR MENSAJE
async function enviarMensaje() {
    var texto = userInput.value.trim();
    var nick  = nickInput.value.trim() || "Anónimo";

    if (texto === "") return;
    if (texto.length > MAX_CHARS) return;

    sendBtn.disabled = true;

    try {
        await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: nick, text: texto })
        });

        userInput.value = "";
        userInput.style.height = "auto";
        charCount.textContent = "0 / " + MAX_CHARS;
        charCount.classList.remove("advertencia");
        usuarioAlFondo = true;
        await getMessages();

    } catch (e) {
        console.error("Error al enviar:", e);
    }

    sendBtn.disabled = false;
    userInput.focus();
}

getMessages();
setInterval(getMessages, REFRESH_MS);