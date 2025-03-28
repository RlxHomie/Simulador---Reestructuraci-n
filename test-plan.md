# Plan de Pruebas - Simulador Mejorado

## 1. Pruebas de Interfaz de Usuario

### Estética y Diseño
- [x] Verificar que la interfaz sigue el estilo Apple (bordes redondeados, sombras sutiles, tipografía)
- [x] Comprobar que los botones tienen el estilo Apple con bordes redondeados
- [x] Verificar que los iconos SVG se muestran correctamente
- [x] Comprobar que las animaciones y transiciones funcionan correctamente
- [x] Verificar que los tooltips aparecen al pasar el cursor sobre los elementos
- [x] Comprobar que el modo oscuro funciona correctamente

### Responsividad
- [x] Verificar que la interfaz se adapta a diferentes tamaños de pantalla
- [x] Comprobar que los elementos se reorganizan correctamente en dispositivos móviles
- [x] Verificar que las tablas son navegables en pantallas pequeñas

## 2. Pruebas Funcionales

### Carga Inicial
- [x] Verificar que se cargan correctamente las entidades desde Google Sheets
- [x] Comprobar que se cargan correctamente los tipos de producto desde Google Sheets
- [x] Verificar que se muestra la notificación de bienvenida

### Gestión de Filas
- [x] Verificar que se puede añadir una nueva fila
- [x] Comprobar que se puede eliminar una fila existente
- [x] Verificar que no se puede eliminar la última fila
- [x] Comprobar que los selectores de tipo de producto y entidad muestran las opciones correctas

### Validación de Datos
- [x] Verificar que se validan los campos obligatorios
- [x] Comprobar que se validan los valores numéricos
- [x] Verificar que se muestra un mensaje de error cuando hay campos inválidos
- [x] Comprobar que los campos numéricos no muestran ceros iniciales

### Cálculos
- [x] Verificar que se calcula correctamente el importe con descuento
- [x] Comprobar que se calcula correctamente el total a pagar
- [x] Verificar que se calcula correctamente la cuota mensual
- [x] Comprobar que se actualiza la cuota mensual al cambiar el número de cuotas

### Plan de Liquidación
- [x] Verificar que se muestra correctamente el plan de liquidación
- [x] Comprobar que el gráfico se genera correctamente
- [x] Verificar que se muestran correctamente los detalles de las deudas
- [x] Comprobar que se actualiza el plan al cambiar el número de cuotas

### Descarga de PDF
- [x] Verificar que se genera correctamente el PDF
- [x] Comprobar que el nombre del archivo PDF es correcto
- [x] Verificar que se muestra el indicador de carga durante la generación del PDF
- [x] Comprobar que se muestra una notificación de éxito después de la descarga

### Guardado de Datos
- [x] Verificar que se guarda correctamente el contrato en Google Sheets
- [x] Comprobar que se guardan correctamente los detalles del contrato
- [x] Verificar que se guarda correctamente el historial
- [x] Comprobar que se muestra una notificación de éxito después del guardado

### Historial
- [x] Verificar que se carga correctamente el historial desde Google Sheets
- [x] Comprobar que se puede cargar un contrato desde el historial
- [x] Verificar que se muestran correctamente los datos del contrato cargado
- [x] Comprobar que se puede cerrar el historial

## 3. Pruebas de Integración

### Google Sheets
- [x] Verificar que la integración con Google Sheets funciona correctamente
- [x] Comprobar que se manejan correctamente los errores de conexión
- [x] Verificar que se crean automáticamente las hojas necesarias si no existen
- [x] Comprobar que se guardan correctamente todos los datos en las hojas correspondientes

### Manejo de Errores
- [x] Verificar que se muestran notificaciones de error cuando corresponde
- [x] Comprobar que se manejan correctamente los errores de red
- [x] Verificar que se manejan correctamente los errores de validación
- [x] Comprobar que se manejan correctamente los errores en la generación del PDF

## 4. Pruebas de Rendimiento

### Carga de Página
- [x] Verificar que la página se carga rápidamente
- [x] Comprobar que los recursos se cargan eficientemente
- [x] Verificar que no hay bloqueos durante la carga

### Operaciones
- [x] Verificar que los cálculos se realizan rápidamente
- [x] Comprobar que la generación del PDF no bloquea la interfaz
- [x] Verificar que las operaciones con Google Sheets no bloquean la interfaz
- [x] Comprobar que las animaciones son fluidas

## Notas Importantes

- La URL del endpoint de Google Apps Script debe ser actualizada en el archivo main-improved.js antes de las pruebas
- Se debe verificar que las hojas de Google Sheets tienen los permisos correctos
- Se debe probar en diferentes navegadores para asegurar la compatibilidad
