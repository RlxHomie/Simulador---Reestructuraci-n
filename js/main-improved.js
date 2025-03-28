/***************************************************************************************
 * 1. UTILS MODULE
 ***************************************************************************************/
function mostrarNotificacion(mensaje, tipo = "info") {
  // Eliminar notificaciones previas
  const notificaciones = document.querySelectorAll('.notificacion');
  notificaciones.forEach(n => {
    n.classList.add("fadeOut");
    setTimeout(() => n.remove(), 300);
  });

  const notif = document.createElement("div");
  notif.className = `notificacion ${tipo}`;
  notif.textContent = mensaje;
  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.transform = "translateY(0)";
    notif.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    notif.classList.add("fadeOut");
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

function toggleCargando(mostrar, msg = "Cargando...") {
  const indicador = document.getElementById("indicadorCarga");
  const mensajeCarga = document.getElementById("mensajeCarga");
  if (!indicador || !mensajeCarga) return;
  if (mostrar) {
    mensajeCarga.textContent = msg;
    indicador.style.display = "flex";
  } else {
    indicador.style.display = "none";
  }
}

function formatoMoneda(num) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(num);
}

function generarFolioRandom() {
  // Generar un folio aleatorio, por ejemplo "FOLIO-123456"
  const randomNum = Math.floor(Math.random() * 900000) + 100000;
  return "FOLIO-" + randomNum;
}

/***************************************************************************************
 * 2. GOOGLE SHEETS MODULE
 ***************************************************************************************/
const GoogleSheetsModule = (function() {
  // Pega aquí la URL de tu despliegue de Google Apps Script:
  const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwKkIakj8f7EegwblR5cBozJY8kCAFIpHIdhEqhBCGY81nBs3nGZBAXTsnk-OCNpnKB/exec";

  let entidades = [];
  let tiposProducto = [];
  let datosCargados = false;

  async function postData(payload, cargandoMsg = "", exitoMsg = "") {
    try {
      toggleCargando(true, cargandoMsg);
      const formData = new FormData();
      for (let k in payload) {
        formData.append(k, payload[k]);
      }
      const resp = await fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });
      toggleCargando(false);
      if (!resp.ok) {
        throw new Error("HTTP Error " + resp.status);
      }
      const data = await resp.json();
      if (!data.success) {
        throw new Error(data.error || "Error desconocido");
      }
      if (exitoMsg) {
        mostrarNotificacion(exitoMsg, "success");
      }
      return data;
    } catch (err) {
      toggleCargando(false);
      mostrarNotificacion(err.message, "error");
      throw err;
    }
  }

async function getData(params = {}) {
  try {
    toggleCargando(true);
    const url = new URL(GOOGLE_SHEET_ENDPOINT);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    // Cambio crítico: añadir redirect: 'follow' y headers
    const resp = await fetch(url, { 
      method: 'GET',
      mode: 'cors',
      redirect: 'follow',  // ← Obligatorio para Google Apps Script
      headers: {
        'Content-Type': 'application/json'  // ← Mejora compatibilidad
      }
    });

    toggleCargando(false);
    
    if (!resp.ok) {
      throw new Error(`HTTP Error GET ${resp.status} ${resp.statusText}`);
    }

    const data = await resp.json();
    
    if (!data.success) {
      throw new Error(data.error || "Error desconocido en GET");
    }
    
    return data;
  } catch (err) {
    toggleCargando(false);
    mostrarNotificacion(err.message, "error");
    throw err;
  }
}

// Función mejorada con manejo de errores específico
async function cargarEntidadesYTipos() {
  try {
    const data = await getData({ accion: "cargarEntidadesYTipos" });
    
    entidades = data.entidades || [];
    tiposProducto = data.tiposProducto || [];
    datosCargados = true;
    
    mostrarNotificacion("Datos iniciales cargados", "success");
    return { entidades, tiposProducto };
    
  } catch (err) {
    mostrarNotificacion("Falló carga inicial: " + err.message, "error");
    return { entidades: [], tiposProducto: [] };  // Retorna valores por defecto
  }
}

  function getEntidades() { return entidades; }
  function getTiposProducto() { return tiposProducto; }
  function isDatosCargados() { return datosCargados; }

  // Guardar contrato
  async function guardarContrato(datos) {
    // datos debe incluir: folio, fecha, nombreDeudor, etc., más "detalles" (en JSON)
    const payload = { accion: "guardarContrato" };
    Object.keys(datos).forEach(k => {
      if (k !== "detalles") {
        payload[k] = datos[k];
      }
    });
    if (datos.detalles) {
      payload.detalles = JSON.stringify(datos.detalles);
    }
    return await postData(payload, "Guardando contrato...", "Contrato guardado");
  }

  // Guardar historial
  async function guardarHistorial(datos) {
    const payload = { accion: "guardarHistorial" };
    Object.keys(datos).forEach(k => {
      if (k !== "detalles") {
        payload[k] = datos[k];
      }
    });
    return await postData(payload, "Guardando historial...", "Historial guardado");
  }

  // Obtener historial
  async function obtenerHistorial() {
    const data = await postData({ accion: "obtenerHistorial" }, "Cargando historial...");
    return data.historial || [];
  }

  // Obtener detalles de un contrato
  async function obtenerDetallesContrato(folio) {
    const data = await postData({ accion: "obtenerDetallesContrato", folio }, "Cargando detalles...");
    return data; // { contrato: {...}, detalles: [...] }
  }

  return {
    cargarEntidadesYTipos,
    getEntidades,
    getTiposProducto,
    isDatosCargados,
    guardarContrato,
    guardarHistorial,
    obtenerHistorial,
    obtenerDetallesContrato
  };
})();

/***************************************************************************************
 * 3. SIMULADOR MODULE
 ***************************************************************************************/
const SimuladorModule = (function() {
  const btnAgregarFila     = document.getElementById("btnAgregarFila");
  const btnCalcular        = document.getElementById("btnCalcular");
  const btnReAnalizar      = document.getElementById("btnReAnalizar");
  const btnMostrarHistorial= document.getElementById("btnMostrarHistorial");
  const tablaDeudas        = document.getElementById("tablaDeudas");
  const nombreDeudorInput  = document.getElementById("nombreDeudor");
  const numCuotasInput     = document.getElementById("numCuotas");
  const resultadoFinal     = document.getElementById("resultadoFinal");
  const resultadoTotalAPagar = document.getElementById("resultadoTotalAPagar");

  let contadorFilas = 0;
  let calculoResultado = null;

  async function inicializar() {
    // Listeners
    btnAgregarFila.addEventListener("click", () => {
      agregarFila();
    });
    btnCalcular.addEventListener("click", () => {
      calcularTotales();
    });
    btnReAnalizar.addEventListener("click", () => {
      reiniciar();
    });
    btnMostrarHistorial.addEventListener("click", () => {
      HistorialModule.mostrarHistorial();
    });

    // Agregar una fila inicial
    agregarFila();

    // Cargar datos de entidades y tipos de producto si no están ya
    if (!GoogleSheetsModule.isDatosCargados()) {
      try {
        await GoogleSheetsModule.cargarEntidadesYTipos();
        actualizarSelectoresEnFilas();
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
      }
    } else {
      actualizarSelectoresEnFilas();
    }
  }

  function agregarFila() {
    contadorFilas++;
    const tr = document.createElement("tr");
    tr.dataset.id = contadorFilas;

    // Número de contrato
    const tdNumContrato = document.createElement("td");
    const inputContrato = document.createElement("input");
    inputContrato.type = "text";
    inputContrato.placeholder = "Ej: 123456";
    tdNumContrato.appendChild(inputContrato);

    // Tipo de Producto
    const tdTipo = document.createElement("td");
    const selectTipo = document.createElement("select");
    tdTipo.appendChild(selectTipo);

    // Entidad
    const tdEntidad = document.createElement("td");
    const selectEnt = document.createElement("select");
    tdEntidad.appendChild(selectEnt);

    // Importe Deuda
    const tdImporte = document.createElement("td");
    const inputImporte = document.createElement("input");
    inputImporte.type = "number";
    inputImporte.placeholder = "Ej: 5000";
    inputImporte.min = "0";
    inputImporte.step = "0.01";
    tdImporte.appendChild(inputImporte);

    // % Descuento
    const tdDesc = document.createElement("td");
    const inputDesc = document.createElement("input");
    inputDesc.type = "number";
    inputDesc.placeholder = "Ej: 30";
    inputDesc.min = "0";
    inputDesc.max = "100";
    inputDesc.addEventListener("input", function() {
      const fila = this.closest("tr");
      const imp = parseFloat(fila.querySelector("td:nth-child(4) input").value) || 0;
      const porc = parseFloat(this.value) || 0;
      if (porc < 0 || porc > 100) {
        mostrarNotificacion("Porcentaje entre 0 y 100", "error");
        this.value = Math.max(0, Math.min(100, porc));
      }
      const desc = imp * (1 - (porc / 100));
      fila.querySelector("td:nth-child(6) input").value = desc.toFixed(2);
    });
    tdDesc.appendChild(inputDesc);

    // Importe con descuento
    const tdImpDesc = document.createElement("td");
    const inputImpDesc = document.createElement("input");
    inputImpDesc.type = "number";
    inputImpDesc.placeholder = "Ej: 3500";
    inputImpDesc.min = "0";
    inputImpDesc.step = "0.01";
    tdImpDesc.appendChild(inputImpDesc);

    // Botón eliminar fila
    const tdEliminar = document.createElement("td");
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", () => {
      tr.remove();
    });
    tdEliminar.appendChild(btnEliminar);

    tr.appendChild(tdNumContrato);
    tr.appendChild(tdTipo);
    tr.appendChild(tdEntidad);
    tr.appendChild(tdImporte);
    tr.appendChild(tdDesc);
    tr.appendChild(tdImpDesc);
    tr.appendChild(tdEliminar);

    tablaDeudas.appendChild(tr);

    // Actualizar los selectores con entidades y tipos
    actualizarSelector(selectTipo, GoogleSheetsModule.getTiposProducto());
    actualizarSelector(selectEnt, GoogleSheetsModule.getEntidades());
  }

  function actualizarSelectoresEnFilas() {
    const filas = tablaDeudas.querySelectorAll("tr");
    filas.forEach(fila => {
      const selectTipo = fila.querySelector("td:nth-child(2) select");
      const selectEnt = fila.querySelector("td:nth-child(3) select");
      if (selectTipo) {
        actualizarSelector(selectTipo, GoogleSheetsModule.getTiposProducto());
      }
      if (selectEnt) {
        actualizarSelector(selectEnt, GoogleSheetsModule.getEntidades());
      }
    });
  }

  function actualizarSelector(select, opciones) {
    const valorAnterior = select.value;
    select.innerHTML = "";
    const optDefault = document.createElement("option");
    optDefault.value = "";
    optDefault.textContent = "Seleccionar...";
    select.appendChild(optDefault);

    opciones.forEach(op => {
      const o = document.createElement("option");
      o.value = op;
      o.textContent = op;
      select.appendChild(o);
    });

    if (valorAnterior && opciones.includes(valorAnterior)) {
      select.value = valorAnterior;
    }
  }

  function calcularTotales() {
    const filas = tablaDeudas.querySelectorAll("tr");
    let totalOriginal = 0;
    let totalDescontado = 0;

    filas.forEach(fila => {
      const imp = parseFloat(fila.querySelector("td:nth-child(4) input").value) || 0;
      const impDesc = parseFloat(fila.querySelector("td:nth-child(6) input").value) || 0;
      totalOriginal += imp;
      totalDescontado += impDesc;
    });

    const cuotas = parseInt(numCuotasInput.value, 10) || 1;
    const pagoCuota = totalDescontado / cuotas;

    calculoResultado = {
      nombreDeudor: nombreDeudorInput.value || "Cliente",
      totalOriginal,
      totalDescontado,
      ahorro: totalOriginal - totalDescontado,
      cuotas,
      pagoCuota
    };

    // Mostrar resultado
    resultadoTotalAPagar.textContent = `
      Deudor: ${calculoResultado.nombreDeudor} |
      Total Original: ${formatoMoneda(totalOriginal)} |
      Ahorro: ${formatoMoneda(calculoResultado.ahorro)} |
      Pagas: ${formatoMoneda(totalDescontado)} en ${cuotas} cuotas de ${formatoMoneda(pagoCuota)}
    `;
    resultadoFinal.style.display = "block";

    mostrarNotificacion("Cálculo realizado", "success");
  }

  function reiniciar() {
    // Limpia tabla
    tablaDeudas.innerHTML = "";
    // Agrega fila inicial
    agregarFila();
    // Oculta resultado
    resultadoFinal.style.display = "none";
    mostrarNotificacion("Reiniciado", "info");
  }

  return {
    inicializar,
    getCalculoResultado: () => calculoResultado
  };
})();

/***************************************************************************************
 * 4. HISTORIAL MODULE
 ***************************************************************************************/
const HistorialModule = (function() {
  const historialContainer = document.getElementById("historialContainer");
  const btnCerrarHistorial = document.getElementById("btnCerrarHistorial");
  const historialBody      = document.getElementById("historialBody");

  function inicializar() {
    if (btnCerrarHistorial) {
      btnCerrarHistorial.addEventListener("click", () => {
        historialContainer.style.display = "none";
      });
    }
  }

  async function mostrarHistorial() {
    try {
      const data = await GoogleSheetsModule.obtenerHistorial();
      // Limpia el tbody
      historialBody.innerHTML = "";
      data.forEach(reg => {
        // reg tendrá las columnas según encabezados
        const tr = document.createElement("tr");
        const folio = reg.Folio || "";
        tr.innerHTML = `
          <td>${folio}</td>
          <td>${reg.Fecha || ""}</td>
          <td>${reg["Nombre Deudor"] || ""}</td>
          <td>${reg["Número Deudas"] || ""}</td>
          <td>${reg["Deuda Original"] || ""}</td>
          <td>${reg["Deuda Descontada"] || ""}</td>
          <td>${reg["Ahorro"] || ""}</td>
          <td>${reg["Total a Pagar"] || ""}</td>
          <td>
            <button data-folio="${folio}">Ver</button>
          </td>
        `;
        const btnVer = tr.querySelector("button");
        btnVer.addEventListener("click", () => {
          // Cargar detalles del contrato
          verContrato(folio);
        });

        historialBody.appendChild(tr);
      });
      historialContainer.style.display = "block";
    } catch (err) {
      console.error(err);
    }
  }

  async function verContrato(folio) {
    try {
      const data = await GoogleSheetsModule.obtenerDetallesContrato(folio);
      if (!data.contrato) {
        mostrarNotificacion("No se encontró el contrato", "error");
        return;
      }
      // Podrías mostrar un modal con datos detallados, o llenar el plan actual
      console.log("Contrato:", data.contrato);
      console.log("Detalles:", data.detalles);
      mostrarNotificacion(`Detalles contrato ${folio} en consola`, "info");
    } catch (err) {
      console.error(err);
    }
  }

  return {
    inicializar,
    mostrarHistorial
  };
})();

/***************************************************************************************
 * 5. PLAN (PDF Y GRÁFICO)
 ***************************************************************************************/
const PlanModule = (function() {
  // Aquí iría la lógica para:
  // - Rellenar el plan con datos (planContainerOuter, etc.)
  // - Generar el gráfico (Chart.js)
  // - Exportar a PDF (html2pdf)
  // - Botones: #btnDescargarPlan, #btnContratar, #btnEditarContrato
  // Por brevedad, daremos un ejemplo de inicialización:
  const planContainer = document.getElementById("planContainerOuter");
  const btnDescargar  = document.getElementById("btnDescargarPlan");
  const btnContratar  = document.getElementById("btnContratar");
  const btnEditar     = document.getElementById("btnEditarContrato");
  let myChart = null;

  function inicializar() {
    if (btnDescargar) {
      btnDescargar.addEventListener("click", () => {
        descargarPDF();
      });
    }
    if (btnContratar) {
      btnContratar.addEventListener("click", () => {
        contratarPlan();
      });
    }
    if (btnEditar) {
      btnEditar.addEventListener("click", () => {
        mostrarNotificacion("Funcionalidad de edición pendiente", "info");
      });
    }
  }

  function mostrarPlan(datos) {
    // datos = { nombreDeudor, totalOriginal, totalDescontado, ahorro, cuotas, pagoCuota }
    // Rellenar campos:
    document.getElementById("plan-nombre-deudor").textContent = datos.nombreDeudor;
    document.getElementById("plan-num-deudas").textContent     = "N/A"; // si lo deseas
    document.getElementById("plan-deuda-total").textContent    = formatoMoneda(datos.totalOriginal);
    document.getElementById("plan-folio").textContent          = generarFolioRandom();
    // etc...

    document.getElementById("plan-lo-que-debes").textContent       = formatoMoneda(datos.totalOriginal);
    document.getElementById("plan-lo-que-pagarias").textContent    = formatoMoneda(datos.totalDescontado);
    document.getElementById("plan-ahorro").textContent             = formatoMoneda(datos.ahorro);
    document.getElementById("plan-duracion").textContent           = datos.cuotas + " meses";
    document.getElementById("plan-cuota-mensual").textContent      = formatoMoneda(datos.pagoCuota);

    // Mostramos la sección
    planContainer.style.display = "block";

    // Crear grafico
    if (!myChart) {
      const ctx = document.getElementById("myChart");
      myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Lo que pagarías", "Te ahorras"],
          datasets: [{
            data: [datos.totalDescontado, datos.ahorro]
          }]
        },
        options: { responsive: true }
      });
    } else {
      myChart.data.datasets[0].data = [datos.totalDescontado, datos.ahorro];
      myChart.update();
    }
  }

  function descargarPDF() {
    // Usa html2pdf
    const plan = document.getElementById("plan-de-liquidacion");
    const opt = {
      margin: 10,
      filename: 'PlanDeLiquidacion.pdf',
      html2canvas: {},
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(plan).set(opt).save();
  }

  function contratarPlan() {
    mostrarNotificacion("Simulando contratación...", "success");
    // Aquí podrías guardar los datos en GoogleSheetsModule.guardarContrato
  }

  return {
    inicializar,
    mostrarPlan
  };
})();

/***************************************************************************************
 * 6. INICIALIZACIÓN GLOBAL
 ***************************************************************************************/
document.addEventListener("DOMContentLoaded", async () => {
  // Inicializar módulos
  SimuladorModule.inicializar();
  HistorialModule.inicializar();
  PlanModule.inicializar();
});
