# Simulador de Reestructuración DMD

Este repositorio contiene el código fuente para el Simulador de Reestructuración de Deudas de DMD, una aplicación web que permite simular planes de liquidación de deudas, guardar contratos en Google Sheets y generar PDFs con los planes calculados.

## Estructura del Proyecto

```
proyecto/
├── assets/               # Recursos estáticos
│   ├── DMD-LOGO.png      # Logo de la empresa
│   └── favicon.png       # Favicon del sitio
├── css/                  # Hojas de estilo
│   └── styles-improved.css  # Estilos mejorados
├── js/                   # Scripts de JavaScript
│   └── main-improved.js  # Lógica principal mejorada
├── libs/                 # Bibliotecas externas
│   ├── html2canvas.min.js     # Para capturar HTML como imagen
│   ├── jspdf.umd.min.js       # Para generar PDFs
│   └── html2pdf.bundle.min.js # Para convertir HTML a PDF
├── test/                 # Archivos de prueba
│   └── test-plan.md      # Plan de pruebas
├── appscript.js          # Código para Google Apps Script
├── index.html            # Página principal
└── README.md             # Documentación del proyecto
```

## Características

- Simulación de planes de liquidación de deudas
- Cálculo de descuentos y cuotas mensuales
- Generación de PDFs con los planes calculados
- Almacenamiento de contratos en Google Sheets
- Historial de contratos con funcionalidad de edición
- Interfaz de usuario intuitiva y responsive

## Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a Internet para guardar datos en Google Sheets
- Cuenta de Google para configurar Google Apps Script

## Configuración

### Google Apps Script

1. Accede a [Google Apps Script](https://script.google.com/)
2. Crea un nuevo proyecto
3. Copia el contenido del archivo `appscript.js` en el editor
4. Guarda el proyecto
5. Despliega como aplicación web:
   - Ejecutar como: Tu cuenta
   - Quién tiene acceso: Cualquier persona, incluso anónimo
6. Copia la URL generada y actualízala en el archivo `js/main-improved.js` (constante `GOOGLE_SHEET_ENDPOINT`)

### Google Sheets

1. Crea una nueva hoja de cálculo en Google Sheets llamada "Planes Contratados"
2. Crea las siguientes hojas:
   - Entidades
   - TiposProducto
   - Contratos
   - Detalles
   - Historial

## Uso

1. Abre el archivo `index.html` en un navegador web
2. Completa el formulario con los datos del cliente y sus deudas
3. Haz clic en "Calcular" para generar el plan de liquidación
4. Utiliza "Descargar PDF" para obtener una copia del plan
5. Haz clic en "Contratar Plan" para guardar los datos en Google Sheets
6. Accede al historial para ver, editar o regenerar contratos anteriores

## Solución de Problemas

### PDF en blanco

Si el PDF se descarga en blanco, verifica:
- Que todas las bibliotecas (html2canvas, jsPDF, html2pdf) estén correctamente cargadas
- Que las rutas a las imágenes sean correctas
- Que no haya errores de JavaScript en la consola del navegador

### Problemas con Google Sheets

Si los datos no se guardan correctamente:
- Verifica que la URL del endpoint en `main-improved.js` sea correcta
- Asegúrate de que las hojas en Google Sheets tengan los nombres exactos: "Contratos", "Detalles", "Historial", "Entidades", "TiposProducto"
- Revisa los permisos de la aplicación web en Google Apps Script

## Licencia

© 2023 DMD - Todos los derechos reservados
