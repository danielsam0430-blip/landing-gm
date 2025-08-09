# Landing Grupo Millenial (Vite + React)

## Cómo desplegar en Vercel (sin Git)
1. Entra a https://vercel.com/new (inicia sesión).
2. Elige **Subir proyecto** y arrastra la carpeta completa de este proyecto.
3. Confirma:
   - Framework: **Vite + React**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Clic en **Deploy**. En 1–2 minutos tendrás tu URL pública.

## Tracking
En `src/App.jsx`, reemplaza en `CONFIG.tracking`:
- `ga4Id: "G-XXXXXXXXXX"` por tu GA4 real.
- `pixelId: "123456789012345"` por tu Pixel real.

## Endpoint de leads
El formulario envía a Google Apps Script (Sheets). Puedes cambiar `leadEndpoint` en `src/App.jsx` si migras a n8n/Zapier.

## Pruebas rápidas
- Usa **GA4 DebugView** y **Meta Pixel Helper** para validar eventos.
- Envía el formulario para verificar la inserción en tu Google Sheet.
