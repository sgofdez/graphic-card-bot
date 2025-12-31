# Graphic Card Bot

Este proyecto es un bot de scrapping diseñado para monitorizar ofertas de tarjetas gráficas en tiendas online y notificar a los usuarios por correo electrónico cuando se detectan nuevas ofertas.

## Características principales
- Scrapping de varias tiendas online (actualmente soporta Neobyte y PcComponentes).
- Envío de notificaciones por email cuando se detectan nuevas ofertas.
- Plantillas de email personalizables usando Handlebars.
- Configuración sencilla mediante archivos JSON y JS.

## Estructura del proyecto
- `src/` - Código fuente principal
  - `index.js` - Punto de entrada de la aplicación
  - `scrapper.js` - Lógica principal de scrapping y orquestación
  - `mailer.js` - Envío de emails
  - `config.js` - Configuración general
  - `store.json` - Almacén de ofertas ya notificadas
  - `sites/` - Scrappers específicos para cada tienda
  - `templates/` - Plantillas de email (Handlebars)
- `package.json` - Dependencias y scripts de npm

## Instalación
1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/graphic-card-bot.git
   cd graphic-card-bot
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura los parámetros en `src/config.js` y las plantillas en `src/templates/`.

## Uso
Para iniciar el bot en modo desarrollo:
```bash
npm run dev
```

El bot ejecutará el scrapping y enviará emails si detecta nuevas ofertas.

## Personalización
- Puedes añadir nuevas tiendas creando un nuevo archivo en `src/sites/` siguiendo el ejemplo de los scrappers existentes.
- Modifica las plantillas de email en `src/templates/` para personalizar el mensaje.

## Licencia
MIT
