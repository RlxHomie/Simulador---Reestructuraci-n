// Test Plan para el Simulador de Reestructuración DMD

## Pruebas de Generación de PDF

1. **Prueba de generación básica de PDF**
   - Completar el formulario con datos válidos
   - Calcular el plan
   - Hacer clic en "Descargar PDF"
   - Verificar que el PDF se descargue correctamente y contenga todos los datos

2. **Prueba de PDF con múltiples deudas**
   - Agregar varias filas de deudas (al menos 3)
   - Calcular el plan
   - Descargar el PDF
   - Verificar que todas las deudas aparezcan en el PDF

3. **Prueba de PDF con nombres especiales**
   - Usar nombres con caracteres especiales (acentos, ñ, etc.)
   - Calcular y descargar el PDF
   - Verificar que los caracteres se muestren correctamente

## Pruebas de Almacenamiento en Google Sheets

1. **Prueba de guardado de contrato nuevo**
   - Completar el formulario con datos válidos
   - Calcular el plan
   - Hacer clic en "Contratar Plan"
   - Verificar en Google Sheets que los datos se hayan guardado en la hoja "Contratos"
   - Verificar que los detalles se hayan guardado en la hoja "Detalles"

2. **Prueba de guardado en historial**
   - Completar y contratar un plan
   - Verificar que los datos se hayan guardado en la hoja "Historial"

3. **Prueba de carga de catálogos**
   - Verificar que los selectores de entidades y tipos de producto se carguen correctamente desde las hojas "Entidades" y "TiposProducto"

## Pruebas de Edición de Contratos del Historial

1. **Prueba de visualización del historial**
   - Hacer clic en "Mostrar Historial"
   - Verificar que se muestren los contratos guardados

2. **Prueba de visualización de contrato desde historial**
   - En el historial, hacer clic en el botón "Ver detalle" de un contrato
   - Verificar que se muestre correctamente el plan de liquidación

3. **Prueba de edición de contrato desde historial**
   - En el historial, hacer clic en el botón "Editar contrato" de un contrato
   - Verificar que se carguen los datos en el formulario
   - Modificar algunos valores
   - Calcular nuevamente
   - Verificar que se muestre el plan actualizado
   - Hacer clic en "Contratar Plan"
   - Verificar que se actualice el contrato en Google Sheets
   - Verificar que se añada una nueva entrada en el historial

4. **Prueba de edición desde visualización de contrato**
   - Ver un contrato desde el historial
   - Hacer clic en "Editar Contrato"
   - Verificar que se carguen los datos en el formulario
   - Modificar algunos valores
   - Calcular y contratar
   - Verificar la actualización en Google Sheets

## Pruebas de Interfaz de Usuario

1. **Prueba de validación de formularios**
   - Intentar calcular sin nombre de deudor
   - Intentar calcular sin completar una fila
   - Verificar que se muestren mensajes de error apropiados

2. **Prueba de cálculos**
   - Completar una fila con valores conocidos
   - Verificar que el importe con descuento se calcule correctamente
   - Calcular el plan
   - Verificar que los totales y la cuota mensual sean correctos

3. **Prueba de responsividad**
   - Verificar que la interfaz se adapte a diferentes tamaños de pantalla

## Pruebas de Integración

1. **Prueba de flujo completo**
   - Crear un nuevo contrato
   - Guardarlo
   - Visualizarlo desde el historial
   - Editarlo
   - Actualizarlo
   - Descargar el PDF
   - Verificar que todo el proceso funcione correctamente

## Notas para la Implementación en Producción

1. Asegurarse de que el script de Google Apps Script esté desplegado como una aplicación web con los permisos adecuados
2. Verificar que la URL del endpoint en main-improved.js coincida con la URL del script desplegado
3. Comprobar que las hojas de cálculo tengan los nombres correctos: "Contratos", "Detalles", "Historial", "Entidades", "TiposProducto"
4. Verificar que las rutas a los recursos (CSS, JS, imágenes) sean correctas en el entorno de producción
