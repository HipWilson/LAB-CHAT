# LAB-CHAT 

Chat en tiempo real para el laboratorio 6 de Desarrollo Web.

## Tecnologías
- **Frontend:** HTML, CSS, JavaScript (vanilla)
- **Backend:** Go

## Estructura
```
chat-go/
├── main.go          # Servidor Go
└── static/
    ├── index.html   # Estructura de la página
    ├── styles.css   # Estilos
    └── script.js    # Lógica del chat
```

## Cómo correrlo

**1. Clonar el repositorio**
```bash
git clone git@github.com:HipWilson/LAB-CHAT.git
cd LAB-CHAT
```

**2. Correr el servidor**
```bash
go run main.go
```

**3. Abrir en el navegador**
```
http://localhost:8000
```

## Funcionalidades
- Enviar mensajes en tiempo real
- Escribir tu nombre de usuario
- Límite de 140 caracteres por mensaje
- Enviar mensaje con Enter
- Auto-refresh cada 3 segundos
- Preserva la posición del scroll al recibir mensajes nuevos
- Preview automático de imágenes en los mensajes
- Preview de páginas web con título, descripción e imagen
