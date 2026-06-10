# LAPIKO — Guía rápida

Dos partes: **A)** publicar la app hoy como app instalable (gratis) y **B)** preparar Firebase para la sincronización entre dispositivos (lo conectamos juntos cuando vuelvas).

---

## Qué hace ya la app

App funcional con **guardado real en el dispositivo**: crear, editar y borrar recetas (varias preparaciones, foto opcional, coste, etiquetas, ingredientes/pasos opcionales); favoritas, "Quiero hacer", diario, lista de la compra y etiquetas, **todo persiste**; y **compartir por enlace** (el enlace lleva la receta dentro y el otro puede agregarla).

Ahora además es una **PWA instalable**: se instala como app de verdad, con icono propio, **a pantalla completa sin la barra de Chrome**, sale en el cajón de aplicaciones y **funciona sin conexión**.

**Límite de esta fase:** los datos viven en *ese* dispositivo. Aún no se sincronizan solos entre móvil y ordenador, ni hay login. Eso lo añade la Parte B.

---

## A) Publicar en GitHub Pages e instalar como app

Ahora son **5 archivos** (todos van juntos, en la misma carpeta del repositorio):

- `lapiko.html` → **renómbralo a `index.html`**
- `manifest.webmanifest`
- `sw.js`
- `icon-192.png`
- `icon-512.png`

### Subirlos
1. Cuenta en **github.com** si no la tienes.
2. Crea un repositorio nuevo (**New**), p. ej. `lapiko`, **Public**.
3. Renombra en tu ordenador `lapiko.html` → **`index.html`**.
4. En el repo: **Add file → Upload files**, y arrastra los **5 archivos** a la vez. **Commit changes**.
5. **Settings → Pages** → Branch `main`, carpeta `/ (root)` → **Save**.
6. Espera 1-2 min. Sale la URL pública: `https://TU-USUARIO.github.io/lapiko/`

### Instalarla en el Pixel 8 (como app, sin barra de Chrome)
1. Abre esa URL en **Chrome**.
2. Menú **⋮** (arriba derecha).
3. Verás **"Instalar app"** (o "Añadir a la pantalla de inicio" → Instalar). Tócalo y confirma.
4. El icono del bote aparece en tu pantalla de inicio y en el cajón de apps. Al abrirlo: pantalla completa, sin barra de direcciones, con su splash. 

> Si la primera vez te saliera solo "Añadir a la pantalla de inicio" sin "Instalar", recarga la página una vez (Chrome tarda unos segundos en leer el manifest) y vuelve a abrir el menú.

### Actualizar la app en el futuro
Cuando te pase un `index.html` nuevo:
1. Súbelo al repo (Add file → Upload → Commit), reemplazando el anterior.
2. **Importante:** abre `sw.js` y **sube el número de versión** (`lapiko-v1` → `lapiko-v2`, etc.) y súbelo también. Eso obliga a la app a refrescar la copia guardada en los móviles; si no, podría seguir mostrándote la versión antigua.

Tus recetas **no se borran** al actualizar: viven en tu dispositivo, no en los archivos.

---

## B) Preparar Firebase (sincronizar móvil ↔ ordenador y login)

**Tú haces estos pasos** (necesitan tu cuenta de Google); **yo conecto el código** contigo cuando vuelvas. No subas la app con Firebase a medio conectar.

### B.1 Crear el proyecto
1. **console.firebase.google.com** con tu cuenta de Google.
2. **Add project** → nombre `lapiko` → puedes desactivar Analytics → Create.

### B.2 Inicio de sesión
**Build → Authentication → Get started** → pestaña **Sign-in method** → activa **Email/Password** y **Google** → Guardar.

### B.3 Base de datos
**Build → Firestore Database → Create database** → **Start in production mode** → región europea (`eur3` / `europe-west`) → Create.

### B.4 Reglas de seguridad
En **Firestore → Rules**, pega esto y pulsa **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /shared/{shareId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
                            && resource.data.owner == request.auth.uid;
    }
  }
}
```

### B.5 Conseguir la configuración (esto es lo que me pasas)
1. Engranaje ⚙️ → **Project settings**.
2. **Your apps** → icono **Web `</>`** → registra una app web (nombre `lapiko`), **sin** hosting.
3. Copia el bloque `firebaseConfig` que te da (`apiKey`, `authDomain`, `projectId`, …) y **pásamelo en el chat**. (Esa config de web está pensada para ir en el código del navegador, no es una contraseña; la seguridad real la dan las reglas de arriba.)

Con eso engancho el login y la sincronización, lo probamos juntos, y a partir de ahí: editas en el móvil y aparece en el ordenador, y los enlaces compartidos serán cortos en vez de llevar la receta dentro.

---

## Resumen
- **Hoy:** sube los 5 archivos (con `index.html`) a GitHub Pages e instálala desde Chrome con "Instalar app".
- **Para sincronizar:** pasos B.1–B.5 y me pasas el `firebaseConfig`.
