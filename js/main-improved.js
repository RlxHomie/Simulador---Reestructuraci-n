/***************************************************************************************
 * utils.js
 ***************************************************************************************/
// Función de debounce
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Notificaciones con animación
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

// Validar DNI español
function validarDNI(dni) {
  const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
  if (!regex.test(dni)) {
    return false;
  }
  const letra = dni.charAt(8).toUpperCase();
  const numero = parseInt(dni.substring(0, 8), 10);
  const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const letraCalculada = letras.charAt(numero % 23);
  return letra === letraCalculada;
}

// Formatear números como moneda (EUR)
function formatoMoneda(numero) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(numero);
}

// Mostrar/ocultar indicador de carga
function toggleCargando(mostrar, mensaje = "Procesando...") {
  const indicador = document.getElementById("indicadorCarga");
  const mensajeCarga = document.getElementById("mensajeCarga");
  if (!indicador || !mensajeCarga) return;
  if (mostrar) {
    mensajeCarga.textContent = mensaje;
    indicador.style.display = "flex";
  } else {
    indicador.style.display = "none";
  }
}

/***************************************************************************************
 * GoogleSheetsModule
 * Encargado de comunicar el front con Google Apps Script
 ***************************************************************************************/
const GoogleSheetsModule = (function() {
  // Reemplaza con tu URL de despliegue de la Web App
  const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwKkIakj8f7EegwblR5cBozJY8kCAFIpHIdhEqhBCGY81nBs3nGZBAXTsnk-OCNpnKB/exec";
  
  // Datos en memoria
  let entidades = [];
  let tiposProducto = [];
  let datosEntidadesCargados = false;

  // Función genérica para POST
  async function postData(payload, mensajeCargando = "", mensajeExito = "") {
    try {
      if (mensajeCargando) {
        mostrarNotificacion(mensajeCargando, "info");
        toggleCargando(true, mensajeCargando);
      }

      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        formData.append(key, payload[key]);
      });

      const response = await fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      toggleCargando(false);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error desconocido en la respuesta");
      }

      if (mensajeExito) {
        mostrarNotificacion(mensajeExito, "success");
      }
      return data;
    } catch (error) {
      console.error(error);
      mostrarNotificacion(error.message, "error");
      toggleCargando(false);
      throw error;
    }
  }

  // Función genérica para GET
  async function getData(params = {}) {
    try {
      toggleCargando(true, "Cargando datos...");
      const url = new URL(GOOGLE_SHEET_ENDPOINT);
      // Agregar parámetros GET
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors'
      });
      toggleCargando(false);

      if (!response.ok) {
        throw new Error(`Error HTTP GET: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Error desconocido en la respuesta GET");
      }
      return data;
    } catch (error) {
      console.error(error);
      mostrarNotificacion(error.message, "error");
      toggleCargando(false);
      throw error;
    }
  }

  // Cargar entidades y tipos (GET)
  async function cargarEntidadesYTipos() {
    // Llama a doGet con accion=cargarEntidadesYTipos
    const data = await getData({ accion: "cargarEntidadesYTipos" });
    entidades = data.entidades || [];
    tiposProducto = data.tiposProducto || [];
    datosEntidadesCargados = true;
    return { entidades, tiposProducto };
  }

  // Guardar contrato
  async function guardarContrato(datosContrato) {
    const payload = { accion: 'guardarContrato' };
    // Copiamos cada propiedad excepto 'detalles'
    Object.keys(datosContrato).forEach(key => {
      if (key !== 'detalles') {
        payload[key] = datosContrato[key];
      }
    });
    // Detalles en JSON
    if (datosContrato.detalles) {
      payload.detalles = JSON.stringify(datosContrato.detalles);
    }
    return await postData(payload, "Guardando contrato...", "Contrato guardado correctamente");
  }

  // Guardar historial
  async function guardarHistorial(datosContrato) {
    const payload = { accion: 'guardarHistorial' };
    Object.keys(datosContrato).forEach(key => {
      if (key !== 'detalles') {
        payload[key] = datosContrato[key];
      }
    });
    return await postData(payload, "Guardando en historial...", "Historial guardado correctamente");
  }

  // Obtener historial (GET)
  async function obtenerHistorial() {
    // Llama a doPost con accion=obtenerHistorial
    // (Podrías también hacerlo GET si adaptas tu doGet)
    const payload = { accion: "obtenerHistorial" };
    const data = await postData(payload, "Cargando historial...");
    // data.historial debería existir
    return data.historial || [];
  }

  // Obtener detalles de un contrato (POST o GET)
  async function obtenerDetallesContrato(folio) {
    const payload = { accion: "obtenerDetallesContrato", folio };
    const data = await postData(payload, "Cargando detalles...");
    return data; // { contrato: {}, detalles: [] }
  }

  // Retornar funciones públicas
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

/***************************************************************************************
 * SimuladorModule
 * Encargado de la lógica principal de la página (DOM, cálculos, etc.)
 ***************************************************************************************/
const SimuladorModule = (function() {
  // Referencias a elementos del DOM
  const btnAgregarFila     = document.getElementById("btnAgregarFila");
  const btnCalcular        = document.getElementById("btnCalcular");
  const btnReAnalizar      = document.getElementById("btnReAnalizar");
  const tablaDeudas        = document.getElementById("tablaDeudas");
  const nombreDeudorInput  = document.getElementById("nombreDeudor");
  const dniClienteInput    = document.getElementById("dniCliente");
  const numCuotasInput     = document.getElementById("numCuotas");
  const resultadoFinal     = document.getElementById("resultadoFinal");
  const resultadoTotalAPagar = document.getElementById("resultadoTotalAPagar");

  let contadorFilas = 0;
  let resultadoCalculado = null;

  // Inicializar
  async function inicializar() {
    // Eventos
    btnAgregarFila.addEventListener("click", () => {
      btnAgregarFila.classList.add("clicked");
      setTimeout(() => btnAgregarFila.classList.remove("clicked"), 200);
      agregarFila();
    });

    btnCalcular.addEventListener("click", () => {
      btnCalcular.classList.add("clicked");
      setTimeout(() => btnCalcular.classList.remove("clicked"), 200);
      calcularTotales();
    });

    btnReAnalizar.addEventListener("click", () => {
      btnReAnalizar.classList.add("clicked");
      setTimeout(() => btnReAnalizar.classList.remove("clicked"), 200);
      reAnalizar();
    });

    // Agregar una fila inicial
    agregarFila();

    // Cargar entidades y tipos de producto si no están cargados
    if (!GoogleSheetsModule.isDatosCargados()) {
      try {
        await GoogleSheetsModule.cargarEntidadesYTipos();
        actualizarSelectoresEnFilas();
      } catch (error) {
        console.error("Error al cargar entidades/tipos:", error);
      }
    } else {
      actualizarSelectoresEnFilas();
    }
  }

  // Actualizar los <select> de tipo de producto y entidad en cada fila
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

  // Actualizar un <select> con opciones
  function actualizarSelector(selector, opciones) {
    const valorActual = selector.value;
    selector.innerHTML = "";
    const opcionDefecto = document.createElement("option");
    opcionDefecto.value = "";
    opcionDefecto.textContent = "Seleccionar...";
    selector.appendChild(opcionDefecto);

    opciones.forEach(op => {
      const opt = document.createElement("option");
      opt.value = op;
      opt.textContent = op;
      selector.appendChild(opt);
    });

    if (valorActual && opciones.includes(valorActual)) {
      selector.value = valorActual;
    }
  }

  // Agregar fila a la tabla
  function agregarFila() {
    contadorFilas++;
    const fila = document.createElement("tr");
    fila.dataset.id = contadorFilas;

    // Celda Número de Contrato
    const tdContrato = document.createElement("td");
    const inputContrato = document.createElement("input");
    inputContrato.type = "text";
    inputContrato.className = "input-numero-contrato";
    inputContrato.placeholder = "Ej: 123456";
    tdContrato.appendChild(inputContrato);

    // Celda Tipo de Producto
    const tdTipo = document.createElement("td");
    const selectTipo = document.createElement("select");
    selectTipo.className = "selector-tipo-producto";
    actualizarSelector(selectTipo, GoogleSheetsModule.getTiposProducto());
    tdTipo.appendChild(selectTipo);

    // Celda Entidad
    const tdEntidad = document.createElement("td");
    const selectEnt = document.createElement("select");
    selectEnt.className = "selector-entidad";
    actualizarSelector(selectEnt, GoogleSheetsModule.getEntidades());
    tdEntidad.appendChild(selectEnt);

    // Celda Importe Deuda
    const tdImporte = document.createElement("td");
    const inputImporte = document.createElement("input");
    inputImporte.type = "number";
    inputImporte.className = "input-importe-deuda";
    inputImporte.placeholder = "Ej: 5000";
    inputImporte.min = "0";
    inputImporte.step = "0.01";
    tdImporte.appendChild(inputImporte);

    // Celda Porcentaje Descuento
    const tdDescuento = document.createElement("td");
    const inputDesc = document.createElement("input");
    inputDesc.type = "number";
    inputDesc.className = "input-porcentaje-descuento";
    inputDesc.placeholder = "Ej: 30";
    inputDesc.min = "0";
    inputDesc.max = "100";
    inputDesc.addEventListener("input", function() {
      const fila = this.closest("tr");
      const imp = parseFloat(fila.querySelector(".input-importe-deuda").value) || 0;
      const porc = parseFloat(this.value) || 0;
      if (porc < 0 || porc > 100) {
        mostrarNotificacion("El porcentaje debe estar entre 0 y 100", "error");
        this.value = Math.max(0, Math.min(100, porc));
      }
      const desc = imp * (1 - porc / 100);
      fila.querySelector(".input-importe-con-descuento").value = desc.toFixed(2);
    });
    tdDescuento.appendChild(inputDesc);

    // Celda Importe Con Descuento
    const tdImporteDesc = document.createElement("td");
    const inputImpDesc = document.createElement("input");
    inputImpDesc.type = "number";
    inputImpDesc.className = "input-importe-con-descuento";
    inputImpDesc.placeholder = "Ej: 3500";
    inputImpDesc.min = "0";
    inputImpDesc.step = "0.01";
    tdImporteDesc.appendChild(inputImpDesc);

    // Celda Eliminar
    const tdEliminar = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.className = "btn-eliminar-fila";
    btnEliminar.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      fila.remove();
    });
    tdEliminar.appendChild(btnEliminar);

    // Adjuntar celdas
    fila.appendChild(tdContrato);
    fila.appendChild(tdTipo);
    fila.appendChild(tdEntidad);
    fila.appendChild(tdImporte);
    fila.appendChild(tdDescuento);
    fila.appendChild(tdImporteDesc);
    fila.appendChild(tdEliminar);

    // Agregar al tbody
    tablaDeudas.querySelector("tbody").appendChild(fila);
  }

  // Calcular totales
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
      const imp = parseFloat(fila.querySelector(".input-importe-deuda").value) || 0;
      const impDesc = parseFloat(fila.querySelector(".input-importe-con-descuento").value) || 0;
      totalOriginal += imp;
      totalConDescuento += impDesc;
    });
    const cuotas = parseInt(numCuotasInput.value, 10) || 1;
    const pagoPorCuota = totalConDescuento / cuotas;

    resultadoCalculado = {
      nombreDeudor : nombreDeudorInput.value,
      dniCliente   : dniClienteInput.value,
      totalOriginal,
      totalConDescuento,
      cuotas,
      pagoPorCuota
    };

    resultadoFinal.textContent = `
      Deudor: ${resultadoCalculado.nombreDeudor} 
      | DNI: ${resultadoCalculado.dniCliente} 
      | Total Original: ${formatoMoneda(totalOriginal)} 
      | Ahorro: ${formatoMoneda(totalOriginal - totalConDescuento)}
    `;
    resultadoTotalAPagar.textContent = `
      Total a Pagar: ${formatoMoneda(totalConDescuento)} 
      en ${cuotas} cuotas de ${formatoMoneda(pagoPorCuota)}
    `;
    mostrarNotificacion("Cálculo realizado correctamente", "success");
  }

  // Re-analizar (demo)
  function reAnalizar() {
    if (!resultadoCalculado) {
      mostrarNotificacion("No hay datos para re-analizar", "error");
      return;
    }
    console.log("Re-analizando...", resultadoCalculado);
    mostrarNotificacion("Re-análisis completado", "info");
  }

  // Retornamos para que se pueda inicializar desde fuera
  return {
    inicializar
  };
})();

/***************************************************************************************
 * Inicializar el módulo al cargar el DOM
 ***************************************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  SimuladorModule.inicializar();
});
