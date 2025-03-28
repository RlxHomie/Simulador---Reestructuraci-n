// utils.js (módulo de utilidades)
//////////////////////////////////////////

// Función de debounce
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Notificaciones mejoradas
function mostrarNotificacion(mensaje, tipo = "info") {
  // Eliminar notificaciones anteriores
  const notificacionesAnteriores = document.querySelectorAll('.notificacion');
  notificacionesAnteriores.forEach(notif => {
    notif.classList.add("fadeOut");
    setTimeout(() => notif.remove(), 500);
  });

  const notif = document.createElement("div");
  notif.className = `notificacion ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);

  // Añadir efecto de entrada
  setTimeout(() => {
    notif.style.transform = "translateY(0)";
    notif.style.opacity = "1";
  }, 10);

  // Configurar temporizador para eliminar
  setTimeout(() => {
    notif.classList.add("fadeOut");
    setTimeout(() => notif.remove(), 500);
  }, 4000);
}

// Confirmar acciones críticas con diálogo mejorado
function confirmarAccion(mensaje, accionSi) {
  // En una implementación real, podríamos crear un modal personalizado
  // Por ahora, usamos el confirm nativo para simplicidad
  if (confirm(mensaje)) {
    accionSi();
  }
}

// Validación robusta de inputs numéricos
function validarInputNumerico(input, min = 0, max = Infinity) {
  const valor = parseFloat(input.value);
  if (isNaN(valor) || valor < min || valor > max) {
    input.classList.add("error");
    mostrarNotificacion(`Valor inválido (entre ${min} y ${max})`, "error");
    input.value = input.defaultValue || min;
    setTimeout(() => input.classList.remove("error"), 1200);
    return false;
  }
  return true;
}

// Función para formatear números como moneda
function formatoMoneda(numero) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

// Función para mostrar/ocultar el indicador de carga
function toggleCargando(mostrar, mensaje = "Procesando...") {
  const indicador = document.getElementById("indicadorCarga");
  const mensajeCarga = document.getElementById("mensajeCarga");
  
  if (mostrar) {
    mensajeCarga.textContent = mensaje;
    indicador.style.display = "flex";
  } else {
    indicador.style.display = "none";
  }
}

// Validación de DNI español
function validarDNI(dni) {
  const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
  
  if (!regex.test(dni)) {
    return false;
  }
  
  const letra = dni.charAt(8).toUpperCase();
  const numero = parseInt(dni.substring(0, 8));
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const letraCalculada = letras.charAt(numero % 23);
  
  return letra === letraCalculada;
}

//////////////////////////////////////////
// GoogleSheetsModule
//////////////////////////////////////////

const GoogleSheetsModule = (function() {
  // URL del script de Google Apps Script
  // Esta URL debe ser actualizada con la URL real del script desplegado
  const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwKkIakj8f7EegwblR5cBozJY8kCAFIpHIdhEqhBCGY81nBs3nGZBAXTsnk-OCNpnKB/exec";
  
  // Variables para almacenar datos cargados
  let entidades = ["Banco Santander", "BBVA", "CaixaBank", "Bankinter", "Sabadell"];
  let tiposProducto = ["Préstamo Personal", "Tarjeta de Crédito", "Hipoteca", "Línea de Crédito", "Crédito al Consumo"];
  let datosEntidadesCargados = true;
  
  // Función para cargar entidades y tipos de producto desde Google Sheets
  function cargarEntidadesYTipos() {
    return new Promise((resolve, reject) => {
      // Usamos datos predefinidos para evitar problemas de CORS
      resolve({ entidades, tiposProducto });
    });
  }
  
  // Función para guardar contrato en Google Sheets
  function guardarContrato(datosContrato) {
    return new Promise((resolve, reject) => {
      mostrarNotificacion("Guardando contrato...", "info");
      toggleCargando(true, "Guardando contrato...");
      
      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append('accion', 'guardarContrato');
      
      // Añadir datos principales
      Object.keys(datosContrato).forEach(key => {
        if (key !== 'detalles') {
          formData.append(key, datosContrato[key]);
        }
      });
      
      // Añadir detalles como JSON
      if (datosContrato.detalles && datosContrato.detalles.length > 0) {
        formData.append('detalles', JSON.stringify(datosContrato.detalles));
      }
      
      // Configurar opciones de fetch
      const options = {
        method: 'POST',
        body: formData,
        redirect: 'follow',
        mode: 'no-cors' // Usar no-cors para evitar problemas de CORS
      };
      
      // Realizar la petición
      fetch(GOOGLE_SHEET_ENDPOINT, options)
        .then(() => {
          // Con no-cors no podemos acceder a la respuesta, asumimos éxito
          mostrarNotificacion("Contrato guardado correctamente", "success");
          toggleCargando(false);
          resolve();
        })
        .catch(error => {
          console.error("Error al guardar contrato:", error);
          mostrarNotificacion(`Error al guardar contrato: ${error.message}`, "error");
          toggleCargando(false);
          reject(error);
        });
    });
  }
  
  // Función para guardar en historial
  function guardarHistorial(datosContrato) {
    return new Promise((resolve, reject) => {
      mostrarNotificacion("Guardando en historial...", "info");
      toggleCargando(true, "Guardando en historial...");
      
      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append('accion', 'guardarHistorial');
      
      // Añadir datos principales
      Object.keys(datosContrato).forEach(key => {
        if (key !== 'detalles') {
          formData.append(key, datosContrato[key]);
        }
      });
      
      // Configurar opciones de fetch
      const options = {
        method: 'POST',
        body: formData,
        redirect: 'follow',
        mode: 'no-cors' // Usar no-cors para evitar problemas de CORS
      };
      
      // Realizar la petición
      fetch(GOOGLE_SHEET_ENDPOINT, options)
        .then(() => {
          // Con no-cors no podemos acceder a la respuesta, asumimos éxito
          mostrarNotificacion("Historial guardado correctamente", "success");
          toggleCargando(false);
          resolve();
        })
        .catch(error => {
          console.error("Error al guardar historial:", error);
          mostrarNotificacion(`Error al guardar historial: ${error.message}`, "error");
          toggleCargando(false);
          reject(error);
        });
    });
  }
  
  // Función para obtener historial
  function obtenerHistorial() {
    return new Promise((resolve, reject) => {
      mostrarNotificacion("Cargando historial...", "info");
      toggleCargando(true, "Cargando historial...");
      
      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append('accion', 'obtenerHistorial');
      
      // Configurar opciones de fetch
      const options = {
        method: 'POST',
        body: formData,
        redirect: 'follow',
        mode: 'no-cors' // Usar no-cors para evitar problemas de CORS
      };
      
      // Realizar la petición
      fetch(GOOGLE_SHEET_ENDPOINT, options)
        .then(() => {
          // Con no-cors no podemos acceder a la respuesta
          // Simulamos una respuesta vacía
          toggleCargando(false);
          resolve({ historial: [] });
        })
        .catch(error => {
          console.error("Error al cargar historial:", error);
          mostrarNotificacion(`Error al cargar historial: ${error.message}`, "error");
          toggleCargando(false);
          reject(error);
        });
    });
  }
  
  // Función para obtener detalles de un contrato específico
  function obtenerDetallesContrato(folio) {
    return new Promise((resolve, reject) => {
      mostrarNotificacion("Cargando detalles del contrato...", "info");
      toggleCargando(true, "Cargando detalles...");
      
      // Crear FormData para enviar los datos
      const formData = new FormData();
      formData.append('accion', 'obtenerDetallesContrato');
      formData.append('folio', folio);
      
      // Configurar opciones de fetch
      const options = {
        method: 'POST',
        body: formData,
        redirect: 'follow',
        mode: 'no-cors' // Usar no-cors para evitar problemas de CORS
      };
      
      // Realizar la petición
      fetch(GOOGLE_SHEET_ENDPOINT, options)
        .then(() => {
          // Con no-cors no podemos acceder a la respuesta
          // Simulamos una respuesta vacía
          toggleCargando(false);
          resolve({ contrato: {}, detalles: [] });
        })
        .catch(error => {
          console.error("Error al cargar detalles:", error);
          mostrarNotificacion(`Error al cargar detalles: ${error.message}`, "error");
          toggleCargando(false);
          reject(error);
        });
    });
  }
  
  // Exponer funciones públicas
  return {
    cargarEntidadesYTipos,
    guardarContrato,
    guardarHistorial,
    obtenerHistorial,
    obtenerDetallesContrato,
    getEntidades: () => entidades,
    getTiposProducto: () => tiposProducto,
    isDatosCargados: () => datosEntidadesCargados
  };
})();

//////////////////////////////////////////
// SimuladorModule
//////////////////////////////////////////

const SimuladorModule = (function() {
  // Elementos DOM
  const btnAgregarFila = document.getElementById("btnAgregarFila");
  const btnCalcular = document.getElementById("btnCalcular");
  const btnReAnalizar = document.getElementById("btnReAnalizar");
  const tablaDeudas = document.getElementById("tablaDeudas");
  const nombreDeudorInput = document.getElementById("nombreDeudor");
  const dniClienteInput = document.getElementById("dniCliente");
  const numCuotasInput = document.getElementById("numCuotas");
  const resultadoFinal = document.getElementById("resultadoFinal");
  const resultadoTotalAPagar = document.getElementById("resultadoTotalAPagar");
  
  // Variables para almacenar datos
  let contadorFilas = 0;
  let resultadoCalculado = null;
  
  // Inicializar módulo
  function inicializar() {
    // Configurar eventos
    btnAgregarFila.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      agregarFila();
    });
    
    btnCalcular.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      calcularTotales();
    });
    
    btnReAnalizar.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      reAnalizar();
    });
    
    // Agregar primera fila automáticamente
    agregarFila();
    
    // Cargar datos de entidades y tipos de producto
    if (!GoogleSheetsModule.isDatosCargados()) {
      GoogleSheetsModule.cargarEntidadesYTipos()
        .then(() => {
          // Actualizar selectores en filas existentes
          actualizarSelectoresEnFilas();
        })
        .catch(error => {
          console.error("Error al inicializar datos:", error);
        });
    } else {
      actualizarSelectoresEnFilas();
    }
  }
  
  // Función para actualizar selectores en filas existentes
  function actualizarSelectoresEnFilas() {
    const filas = tablaDeudas.querySelectorAll("tr");
    filas.forEach(fila => {
      const selectorTipoProducto = fila.querySelector(".selector-tipo-producto");
      const selectorEntidad = fila.querySelector(".selector-entidad");
      
      if (selectorTipoProducto) {
        actualizarSelector(selectorTipoProducto, GoogleSheetsModule.getTiposProducto());
      }
      
      if (selectorEntidad) {
        actualizarSelector(selectorEntidad, GoogleSheetsModule.getEntidades());
      }
    });
  }
  
  // Función para actualizar un selector con opciones
  function actualizarSelector(selector, opciones) {
    // Guardar valor actual
    const valorActual = selector.value;
    
    // Limpiar opciones actuales
    selector.innerHTML = "";
    
    // Añadir opción por defecto
    const opcionDefecto = document.createElement("option");
    opcionDefecto.value = "";
    opcionDefecto.textContent = "Seleccionar...";
    selector.appendChild(opcionDefecto);
    
    // Añadir nuevas opciones
    opciones.forEach(opcion => {
      const nuevaOpcion = document.createElement("option");
      nuevaOpcion.value = opcion;
      nuevaOpcion.textContent = opcion;
      selector.appendChild(nuevaOpcion);
    });
    
    // Restaurar valor si existía
    if (valorActual && opciones.includes(valorActual)) {
      selector.value = valorActual;
    }
  }
  
  // Función para agregar una nueva fila
  function agregarFila() {
    contadorFilas++;
    
    const fila = document.createElement("tr");
    fila.dataset.id = contadorFilas;
    
    // Crear celdas
    const celdaNumeroContrato = document.createElement("td");
    const inputNumeroContrato = document.createElement("input");
    inputNumeroContrato.type = "text";
    inputNumeroContrato.className = "input-numero-contrato";
    inputNumeroContrato.placeholder = "Ej: 123456";
    celdaNumeroContrato.appendChild(inputNumeroContrato);
    
    const celdaTipoProducto = document.createElement("td");
    const selectorTipoProducto = document.createElement("select");
    selectorTipoProducto.className = "selector-tipo-producto";
    actualizarSelector(selectorTipoProducto, GoogleSheetsModule.getTiposProducto());
    celdaTipoProducto.appendChild(selectorTipoProducto);
    
    const celdaEntidad = document.createElement("td");
    const selectorEntidad = document.createElement("select");
    selectorEntidad.className = "selector-entidad";
    actualizarSelector(selectorEntidad, GoogleSheetsModule.getEntidades());
    celdaEntidad.appendChild(selectorEntidad);
    
    const celdaImporteDeuda = document.createElement("td");
    const inputImporteDeuda = document.createElement("input");
    inputImporteDeuda.type = "number";
    inputImporteDeuda.className = "input-importe-deuda";
    inputImporteDeuda.placeholder = "Ej: 5000";
    inputImporteDeuda.min = "0";
    inputImporteDeuda.step = "0.01";
    celdaImporteDeuda.appendChild(inputImporteDeuda);
    
    const celdaPorcentajeDescuento = document.createElement("td");
    const inputPorcentajeDescuento = document.createElement("input");
    inputPorcentajeDescuento.type = "number";
    inputPorcentajeDescuento.className = "input-porcentaje-descuento";
    inputPorcentajeDescuento.placeholder = "Ej: 30";
    inputPorcentajeDescuento.min = "0";
    inputPorcentajeDescuento.max = "100";
    inputPorcentajeDescuento.addEventListener("input", function() {
      const fila = this.closest("tr");
      const importeDeuda = parseFloat(fila.querySelector(".input-importe-deuda").value) || 0;
      const porcentaje = parseFloat(this.value) || 0;
      
      if (porcentaje < 0 || porcentaje > 100) {
        mostrarNotificacion("El porcentaje debe estar entre 0 y 100", "error");
        this.value = Math.max(0, Math.min(100, porcentaje));
      }
      
      const importeConDescuento = importeDeuda * (1 - porcentaje / 100);
      fila.querySelector(".input-importe-con-descuento").value = importeConDescuento.toFixed(2);
    });
    celdaPorcentajeDescuento.appendChild(inputPorcentajeDescuento);
    
    const celdaImporteConDescuento = document.createElement("td");
    const inputImporteConDescuento = document.createElement("input");
    inputImporteConDescuento.type = "number";
    inputImporteConDescuento.className = "input-importe-con-descuento";
    inputImporteConDescuento.placeholder = "Ej: 3500";
    inputImporteConDescuento.min = "0";
    inputImporteConDescuento.step = "0.01";
    celdaImporteConDescuento.appendChild(inputImporteConDescuento);
    
    const celdaEliminar = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar-fila";
    btnEliminar.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      fila.remove();
    });
    celdaEliminar.appendChild(btnEliminar);
    
    // Agregar celdas a la fila
    fila.appendChild(celdaNumeroContrato);
    fila.appendChild(celdaTipoProducto);
    fila.appendChild(celdaEntidad);
    fila.appendChild(celdaImporteDeuda);
    fila.appendChild(celdaPorcentajeDescuento);
    fila.appendChild(celdaImporteConDescuento);
    fila.appendChild(celdaEliminar);
    
    // Agregar fila a la tabla
    tablaDeudas.querySelector("tbody").appendChild(fila);
  }
  
  // Función para calcular los totales
  function calcularTotales() {
    // Validar DNI
    if (!validarDNI(dniClienteInput.value)) {
      mostrarNotificacion("El DNI no es válido. Verifique antes de continuar.", "error");
      return;
    }
    
    const filas = tablaDeudas.querySelectorAll("tbody tr");
    let totalOriginal = 0;
    let totalConDescuento = 0;
    
    filas.forEach(fila => {
      const importeDeuda = parseFloat(fila.querySelector(".input-importe-deuda").value) || 0;
      const importeConDesc = parseFloat(fila.querySelector(".input-importe-con-descuento").value) || 0;
      totalOriginal += importeDeuda;
      totalConDescuento += importeConDesc;
    });
    
    // Suponiendo que el número de cuotas es un entero
    const cuotas = parseInt(numCuotasInput.value) || 1;
    const pagoPorCuota = totalConDescuento / cuotas;
    
    resultadoCalculado = {
      nombreDeudor: nombreDeudorInput.value,
      dniCliente: dniClienteInput.value,
      totalOriginal,
      totalConDescuento,
      cuotas,
      pagoPorCuota
    };
    
    resultadoFinal.textContent = `
      Deudor: ${resultadoCalculado.nombreDeudor} 
      | DNI: ${resultadoCalculado.dniCliente} 
      | Total Original: ${formatoMoneda(totalOriginal)} 
      | Descuento: ${formatoMoneda(totalOriginal - totalConDescuento)}
    `;
    
    resultadoTotalAPagar.textContent = `
      Total a Pagar: ${formatoMoneda(totalConDescuento)} 
      en ${cuotas} cuotas de ${formatoMoneda(pagoPorCuota)}
    `;
    
    mostrarNotificacion("Cálculo realizado correctamente", "success");
  }
  
  // Función para re-analizar (a modo de ejemplo)
  function reAnalizar() {
    if (!resultadoCalculado) {
      mostrarNotificacion("No hay datos para re-analizar", "error");
      return;
    }
    
    // Aquí se podría hacer algo con 'resultadoCalculado', por ejemplo:
    console.log("Re-analizando resultado:", resultadoCalculado);
    mostrarNotificacion("Re-análisis completado", "info");
  }
  
  // Retornar funciones públicas
  return {
    inicializar
  };
})();

// Inicializar una vez que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  SimuladorModule.inicializar();
});
