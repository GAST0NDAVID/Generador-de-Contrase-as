# Generador de Contraseñas
 
Aplicación web moderna desarrollada con **Next.js**, **TypeScript** y **Tailwind CSS** que nos permite generar contraseñas seguras y personalizadas. La interfaz está diseñada para ser simple, intuitiva y educativa, incorpora *tooltips* informativos para conceptos técnicos.

## Características Principales

* Generación de contraseñas seguras con opciones personalizables.
* Soporte de tema claro y oscuro.
* *Tooltips* explicativos para términos técnicos.
* Interfaz adaptable y moderna con componentes `shadcn/ui`.
* Código modular y fácilmente extensible.

## Tecnologías Utilizadas

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* pnpm

## Instalación y Ejecución

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

1.  **Clona el repositorio:**

    ```bash
    git clone [https://github.com/tu-usuario/generador-de-contrasenas.git](https://github.com/tu-usuario/generador-de-contrasenas.git)
    cd generador-de-contrasenas
    ```

2.  **Instala las dependencias:**

    ```bash
    pnpm install
    ```

3.  **Ejecuta el entorno de desarrollo:**

    ```bash
    pnpm dev
    ```
    Luego abre `http://localhost:3000` en tu navegador.

## Estructura del proyecto
```
generador-de-contraseñas/
│
├── app/
│ ├── layout.tsx
│ ├── page.tsx
│ └── globals.css
│
├── components/
│ ├── password-generator.tsx
│ ├── tooltip.tsx
│ ├── theme-provider.tsx
│ └── ui/...
│
├── package.json
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```
## Uso

1.  Selecciona los parámetros para tu contraseña (longitud, símbolos, números, etc.).
2.  Presiona el botón de **Generar**.
3.  Copia la contraseña al portapapeles.
4.  Si no entiendes un término técnico, pasa el cursor sobre el icono de información para ver una breve explicación.

## Licencia

Este proyecto se distribuye bajo la [licencia MIT](https://opensource.org/licenses/MIT). Eres libre de usarlo, modificarlo y compartirlo bajo los términos de dicha licencia.

