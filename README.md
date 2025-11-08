Generador de Contraseñas
Aplicación web moderna desarrollada con Next.js, TypeScript y Tailwind CSS que permite generar contraseñas seguras y personalizadas. Su interfaz está diseñada para ser simple, intuitiva y educativa, incorporando tooltips informativos para conceptos técnicos.
Características
- Generación de contraseñas seguras con opciones personalizables.
- Soporte de tema claro y oscuro.
- Tooltips explicativos para términos técnicos.
- Interfaz adaptable y moderna con componentes shadcn/ui.
- Código modular y fácilmente extensible.
Tecnologías utilizadas
- Next.js 
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- pnpm
Instalación y ejecución
1. Clona el repositorio:
•	git clone https://github.com/tu-usuario/generador-de-contrasenas.git
cd generador-de-contrasenas
2. Instala las dependencias:
•	pnpm install
3. Ejecuta el entorno de desarrollo:
•	pnpm dev
Luego abre http://localhost:3000 en tu navegador.
Estructura del proyecto
generador-de-contrasenas/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── password-generator.tsx
│   ├── tooltip.tsx
│   ├── theme-provider.tsx
│   └── ui/...
│
├── package.json
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs

Uso
1. Selecciona los parámetros para tu contraseña (longitud, símbolos, números, etc.).
2. Presiona el botón de Generar.
3. Copia la contraseña al portapapeles.
4. Si no entiendes un término técnico, pasa el cursor sobre el icono de información para ver una breve explicación.
Licencia
Este proyecto se distribuye bajo la licencia MIT. Eres libre de usarlo, modificarlo y compartirlo bajo los términos de dicha licencia.

