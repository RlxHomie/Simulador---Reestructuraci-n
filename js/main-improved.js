<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Simulador de Contratos</title>
  <style>
    /* Estilos básicos para notificaciones, loader, etc. */
    .notificacion { 
      position: fixed; top: 10px; right: 10px;
      padding: 10px; background: #333; color: #fff; border-radius: 4px;
      transform: translateY(-100px); opacity: 0; transition: all 0.5s;
    }
    .notificacion.success { background: green; }
    .notificacion.error   { background: red; }
    .fadeOut { opacity: 0 !important; }

    #indicadorCarga {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.3); display: none; align-items: center; justify-content: center;
    }
    #indicadorCarga .loader {
      padding: 20px; background: #fff; border-radius: 8px;
    }
  </style>
</head>
<body>

<h1>Simulador de Contratos</h1>

<label>Nombre Deudor: <input type="text" id="nombreDeudor"></label><br>
<label>DNI: <input type="text" id="dniCliente"></label><br>
<label>Número de Cuotas: <input type="number" id="numCuotas" value="1"></label><br>

<button id="btnAgregarFila">Agregar Fila</button>
<button id="btnCalcular">Calcular</button>
<button id="btnReAnalizar">Re-analizar</button>

<table id="tablaDeudas" border="1">
  <thead>
    <tr>
      <th>Número Contrato</th>
      <th>Tipo Producto</th>
      <th>Entidad</th>
      <th>Importe Deuda</th>
      <th>% Descuento</th>
      <th>Importe c/Descuento</th>
      <th>Acción</th>
    </tr>
  </thead>
  <tbody>
  </tbody>
</table>

<div id="resultadoFinal"></div>
<div id="resultadoTotalAPagar"></div>

<!-- Loader -->
<div id="indicadorCarga">
  <div class="loader">
    <span id="mensajeCarga">Cargando...</span>
  </div>
</div>

<!-- Scripts -->
<script src="app.js"></script>
</body>
</html>
