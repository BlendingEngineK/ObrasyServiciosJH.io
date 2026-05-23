# Vista privada para GitHub Pages

Esta carpeta esta pensada para publicarse en GitHub Pages. El HTML original no se sube en claro: `build-protected-page.mjs` genera `index.html` y `404.html` cifrados con AES-GCM a partir de `../Landing Page para_ Servicios y Obras Jorge Huerta/Landing JH - export.html`.

## Generar la vista protegida

Ejecuta:

```powershell
node .\build-protected-page.mjs
```

El script pedira la clave y generara `index.html`. Usa una clave larga si vas a compartir el enlace fuera de un grupo pequeno.

## Publicar

Sube el contenido de esta carpeta a un repositorio de GitHub Pages. En GitHub, activa Pages desde `Settings > Pages` y publica desde la rama principal, carpeta raiz.

GitHub Pages privado real solo esta disponible para sitios de proyecto dentro de organizaciones con GitHub Enterprise Cloud. Para una cuenta normal, esta vista usa cifrado en el navegador.
