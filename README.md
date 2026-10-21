# Diego Hormazábal · Portfolio

Sitio personal con dos portfolios: **edición de video** para marcas de software y **QA Engineer**.

🌐 https://diegohormazabalgit.github.io

![Tests del sitio](https://github.com/DiegoHormazabalGIT/DiegoHormazabalGIT.github.io/actions/workflows/tests.yml/badge.svg)

## Estructura

```
index.html        Portada con los dos caminos
video/index.html  Portfolio de edición de video
qa/index.html     Portfolio de QA
assets/           Estilos, favicon y (pronto) el reel
tests/            Suite de Playwright
```

HTML y CSS sin frameworks ni build: GitHub Pages publica la rama `main` tal cual.

## El sitio se prueba solo

Cada push y cada pull request corre una suite de Playwright en GitHub Actions, en escritorio y en móvil (Pixel 7):

| Prueba | Qué verifica |
| --- | --- |
| Carga | Cada página responde 200, tiene título, un solo `h1` y ningún error de consola propio |
| Enlaces | Todos los enlaces internos responden 200 y cada ancla `#` apunta a una sección real |
| Accesibilidad | Sin violaciones WCAG 2 A/AA serias o críticas (axe-core) |
| Responsive | Sin scroll horizontal |
| Navegación | La portada lleva a /video y /qa |
| Contacto | El email de contacto es válido y visible |

El reporte HTML queda como artefacto de cada ejecución.

## Correr localmente

```bash
npm install
npx playwright install chromium
npm test          # levanta un servidor en :4173 y corre la suite
npm run serve     # solo el sitio, en http://localhost:4173
```

## Agregar un video

1. Sube el archivo a `assets/` (ideal: MP4 H.264, menos de 10 MB) o publícalo en YouTube/Vimeo.
2. En `video/index.html`, reemplaza el bloque `.thumb` de la pieza por el `<video>` o el enlace.
3. Cambia la etiqueta `En producción` por el resultado del proyecto.
