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

//////////////////////////////////////////
// GoogleSheetsModule
//////////////////////////////////////////

const GoogleSheetsModule = (function() {
  // URL del script de Google Apps Script
  // Esta URL debe ser actualizada con la URL real del script desplegado
  const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbx-evKLIAg8i1zEDKElx_Lu-RtKDxuleI-TYc55DLnHiHa0I-gZy_i1yD_CUBpbxW7l/exec";
  
  // Variables para almacenar datos cargados
  let entidades = [];
  let tiposProducto = [];
  let datosEntidadesCargados = false;
  
  // Función para cargar entidades y tipos de producto desde Google Sheets
  function cargarEntidadesYTipos() {
    return new Promise((resolve, reject) => {
      mostrarNotificacion("Cargando datos desde Google Sheets...", "info");
      toggleCargando(true, "Cargando catálogos...");
      
      fetch(GOOGLE_SHEET_ENDPOINT)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error de red: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (data.error) {
            mostrarNotificacion("Error al cargar datos: " + data.error, "error");
            reject(data.error);
            return;
          }
          
          // Guardar datos en variables del módulo
          entidades = data.entidades || [];
          tiposProducto = data.tiposProducto || [];
          datosEntidadesCargados = true;
          
          mostrarNotificacion("Datos cargados correctamente", "success");
          resolve({ entidades, tiposProducto });
        })
        .catch(error => {
          mostrarNotificacion("Error de conexión al cargar datos", "error");
          console.error("Error al cargar entidades y tipos:", error);
          reject(error);
        })
        .finally(() => {
          toggleCargando(false);
        });
    });
  }
  
  // Función para obtener entidades (carga si no están disponibles)
  function obtenerEntidades() {
    if (datosEntidadesCargados) {
      return Promise.resolve(entidades);
    } else {
      return cargarEntidadesYTipos().then(data => data.entidades);
    }
  }
  
  // Función para obtener tipos de producto (carga si no están disponibles)
  function obtenerTiposProducto() {
    if (datosEntidadesCargados) {
      return Promise.resolve(tiposProducto);
    } else {
      return cargarEntidadesYTipos().then(data => data.tiposProducto);
    }
  }
  
  // Función para guardar datos de contrato en Google Sheets
  function guardarContrato(datosContrato) {
    return new Promise((resolve, reject) => {
      toggleCargando(true, "Guardando contrato...");
      const formData = new URLSearchParams();
      
      // Datos principales del contrato
      formData.append("accion", "guardarContrato");
      formData.append("folio", datosContrato.folio);
      formData.append("fecha", datosContrato.fecha);
      formData.append("nombreDeudor", datosContrato.nombreDeudor);
      formData.append("numeroDeudas", datosContrato.numeroDeudas);
      formData.append("deudaOriginal", datosContrato.deudaOriginal);
      formData.append("deudaDescontada", datosContrato.deudaDescontada);
      formData.append("ahorro", datosContrato.ahorro);
      formData.append("totalAPagar", datosContrato.totalAPagar);
      formData.append("cuotaMensual", datosContrato.cuotaMensual);
      formData.append("numCuotas", datosContrato.numCuotas); // Añadido número de cuotas
      
      // Detalles de cada línea de contrato
      if (datosContrato.detalles && datosContrato.detalles.length > 0) {
        formData.append("detalles", JSON.stringify(datosContrato.detalles));
      }
      
      fetch(GOOGLE_SHEET_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        if (data.includes("OK")) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(error => {
        reject(error);
      })
      .finally(() => {
        toggleCargando(false);
      });
    });
  }
  
  // Función para guardar historial en Google Sheets
  function guardarHistorial(datosHistorial) {
    return new Promise((resolve, reject) => {
      toggleCargando(true, "Guardando en historial...");
      const formData = new URLSearchParams();
      
      // Datos para el historial
      formData.append("accion", "guardarHistorial");
      formData.append("folio", datosHistorial.folio);
      formData.append("fecha", datosHistorial.fecha);
      formData.append("nombreDeudor", datosHistorial.nombreDeudor);
      formData.append("numeroDeudas", datosHistorial.numeroDeudas);
      formData.append("deudaOriginal", datosHistorial.deudaOriginal);
      formData.append("deudaDescontada", datosHistorial.deudaDescontada);
      formData.append("ahorro", datosHistorial.ahorro);
      formData.append("totalAPagar", datosHistorial.totalAPagar);
      formData.append("numCuotas", datosHistorial.numCuotas); // Añadido número de cuotas
      
      fetch(GOOGLE_SHEET_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }
        return response.text();
      })
      .then(data => {
        if (data.includes("OK")) {
          resolve(data);
        } else {
          reject(data);
        }
      })
      .catch(error => {
        reject(error);
      })
      .finally(() => {
        toggleCargando(false);
      });
    });
  }
  
  // Función para cargar historial desde Google Sheets
  function cargarHistorial() {
    return new Promise((resolve, reject) => {
      toggleCargando(true, "Cargando historial...");
      
      const formData = new URLSearchParams();
      formData.append("accion", "obtenerHistorial");
      
      fetch(GOOGLE_SHEET_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.historial || []);
        }
      })
      .catch(error => {
        reject(error);
      })
      .finally(() => {
        toggleCargando(false);
      });
    });
  }
  
  // Función para obtener detalles de un contrato específico
  function obtenerDetallesContrato(folio) {
    return new Promise((resolve, reject) => {
      toggleCargando(true, "Cargando detalles del contrato...");
      
      const formData = new URLSearchParams();
      formData.append("accion", "obtenerDetallesContrato");
      formData.append("folio", folio);
      
      fetch(GOOGLE_SHEET_ENDPOINT, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
      })
      .catch(error => {
        reject(error);
      })
      .finally(() => {
        toggleCargando(false);
      });
    });
  }
  
  // Exponer funciones públicas
  return {
    cargarEntidadesYTipos,
    obtenerEntidades,
    obtenerTiposProducto,
    guardarContrato,
    guardarHistorial,
    cargarHistorial,
    obtenerDetallesContrato
  };
})();

//////////////////////////////////////////
// TablaDeudasModule
//////////////////////////////////////////

const TablaDeudasModule = (function() {
  // Elementos DOM
  const tablaDeudas = document.getElementById("tablaDeudas");
  const btnAgregarFila = document.getElementById("btnAgregarFila");
  
  // Contador para IDs únicos de filas
  let contadorFilas = 0;
  
  // Inicializar módulo
  function inicializar() {
    // Agregar primera fila al cargar
    agregarFila();
    
    // Configurar evento para agregar filas
    btnAgregarFila.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      agregarFila();
    });
    
    // Configurar delegación de eventos para la tabla
    tablaDeudas.addEventListener("click", manejarClickTabla);
    tablaDeudas.addEventListener("input", debounce(manejarInputTabla, 300));
    tablaDeudas.addEventListener("change", manejarCambioTabla);
    
    // Corregir formato numérico para todas las filas
    corregirFormatoNumerico();
  }
  
  // Función para agregar una nueva fila a la tabla
  function agregarFila() {
    const idFila = `fila-${contadorFilas++}`;
    const tr = document.createElement("tr");
    tr.id = idFila;
    
    // Crear celdas
    tr.innerHTML = `
      <td><input type="text" class="numero-contrato" placeholder="Contrato" /></td>
      <td>
        <select class="tipo-producto">
          <option value="">Seleccionar...</option>
          <!-- Opciones cargadas dinámicamente -->
        </select>
      </td>
      <td>
        <select class="entidad">
          <option value="">Seleccionar...</option>
          <!-- Opciones cargadas dinámicamente -->
        </select>
      </td>
      <td><input type="number" class="importe-deuda" placeholder="0.00" min="0" step="0.01" /></td>
      <td><input type="number" class="porcentaje-descuento" placeholder="0" min="0" max="100" /></td>
      <td><input type="text" class="importe-con-descuento" placeholder="0.00" readonly /></td>
      <td><button class="btn-borrar" title="Eliminar fila">×</button></td>
    `;
    
    // Añadir fila a la tabla
    tablaDeudas.appendChild(tr);
    
    // Cargar opciones en los selectores
    cargarOpcionesTipoProducto(tr.querySelector(".tipo-producto"));
    cargarOpcionesEntidad(tr.querySelector(".entidad"));
    
    // Aplicar formato numérico a la nueva fila
    const inputsNumericos = tr.querySelectorAll('input[type="number"]');
    inputsNumericos.forEach(input => {
      // Al enfocar, eliminar ceros iniciales
      input.addEventListener('focus', function() {
        // Si el valor es solo cero, vaciar el campo
        if (this.value === '0' || this.value === 0) {
          this.value = '';
        }
        // Si tiene ceros al inicio, eliminarlos
        else if (this.value.startsWith('0') && this.value.length > 1 && !this.value.startsWith('0.')) {
          this.value = parseFloat(this.value).toString();
        }
      });
      
      // Al perder el foco, formatear correctamente
      input.addEventListener('blur', function() {
        // Si está vacío, no hacer nada (no poner cero)
        if (this.value === '') {
          return;
        }
        
        // Convertir a número y formatear
        const valor = parseFloat(this.value);
        if (!isNaN(valor)) {
          // Para campos de porcentaje, no usar decimales
          if (this.classList.contains('porcentaje-descuento')) {
            this.value = Math.round(valor);
          } 
          // Para campos de importe, usar dos decimales
          else {
            this.value = valor.toString();
          }
        }
      });
    });
    
    return tr;
  }
  
  // Cargar opciones de tipo de producto en un selector
  function cargarOpcionesTipoProducto(select) {
    GoogleSheetsModule.obtenerTiposProducto()
      .then(tipos => {
        // Limpiar opciones existentes excepto la primera
        while (select.options.length > 1) {
          select.remove(1);
        }
        
        // Añadir nuevas opciones
        tipos.forEach(tipo => {
          const option = document.createElement("option");
          option.value = tipo;
          option.textContent = tipo;
          select.appendChild(option);
        });
      })
      .catch(error => {
        console.error("Error al cargar tipos de producto:", error);
        mostrarNotificacion("Error al cargar tipos de producto", "error");
      });
  }
  
  // Cargar opciones de entidad en un selector
  function cargarOpcionesEntidad(select) {
    GoogleSheetsModule.obtenerEntidades()
      .then(entidades => {
        // Limpiar opciones existentes excepto la primera
        while (select.options.length > 1) {
          select.remove(1);
        }
        
        // Añadir nuevas opciones
        entidades.forEach(entidad => {
          const option = document.createElement("option");
          option.value = entidad;
          option.textContent = entidad;
          select.appendChild(option);
        });
      })
      .catch(error => {
        console.error("Error al cargar entidades:", error);
        mostrarNotificacion("Error al cargar entidades", "error");
      });
  }
  
  // Manejar eventos de clic en la tabla (delegación)
  function manejarClickTabla(event) {
    // Si se hizo clic en un botón de borrar
    if (event.target.classList.contains("btn-borrar")) {
      const fila = event.target.closest("tr");
      
      // Si hay más de una fila, permitir eliminar
      if (tablaDeudas.rows.length > 1) {
        confirmarAccion("¿Estás seguro de eliminar esta fila?", () => {
          fila.remove();
          // Recalcular si hay datos en la tabla
          if (tablaDeudas.rows.length > 0) {
            calcularImportesConDescuento();
          }
        });
      } else {
        mostrarNotificacion("Debe haber al menos una fila en la tabla", "info");
      }
    }
  }
  
  // Manejar eventos de input en la tabla (delegación)
  function manejarInputTabla(event) {
    const input = event.target;
    
    // Si es un campo de importe o porcentaje
    if (input.classList.contains("importe-deuda") || 
        input.classList.contains("porcentaje-descuento")) {
      calcularImporteConDescuento(input.closest("tr"));
    }
  }
  
  // Manejar eventos de cambio en la tabla (delegación)
  function manejarCambioTabla(event) {
    const select = event.target;
    
    // Si es un selector de tipo o entidad, no hacemos nada especial por ahora
    // Podríamos añadir lógica específica si fuera necesario
  }
  
  // Calcular importe con descuento para una fila
  function calcularImporteConDescuento(fila) {
    const importeInput = fila.querySelector(".importe-deuda");
    const porcentajeInput = fila.querySelector(".porcentaje-descuento");
    const resultadoInput = fila.querySelector(".importe-con-descuento");
    
    // Obtener valores
    const importe = parseFloat(importeInput.value) || 0;
    const porcentaje = parseFloat(porcentajeInput.value) || 0;
    
    // Calcular resultado
    const descuento = importe * (porcentaje / 100);
    const importeConDescuento = importe - descuento;
    
    // Mostrar resultado formateado
    resultadoInput.value = importeConDescuento.toFixed(2);
  }
  
  // Calcular importes con descuento para todas las filas
  function calcularImportesConDescuento() {
    const filas = tablaDeudas.querySelectorAll("tr");
    filas.forEach(fila => calcularImporteConDescuento(fila));
  }
  
  // Obtener datos de todas las filas
  function obtenerDatosFilas() {
    const filas = tablaDeudas.querySelectorAll("tr");
    const datos = [];
    
    filas.forEach(fila => {
      const numeroContrato = fila.querySelector(".numero-contrato").value.trim();
      const tipoProducto = fila.querySelector(".tipo-producto").value;
      const entidad = fila.querySelector(".entidad").value;
      const importeDeuda = parseFloat(fila.querySelector(".importe-deuda").value) || 0;
      const porcentajeDescuento = parseFloat(fila.querySelector(".porcentaje-descuento").value) || 0;
      const importeConDescuento = parseFloat(fila.querySelector(".importe-con-descuento").value) || 0;
      
      // Solo añadir filas con datos válidos
      if (numeroContrato || tipoProducto || entidad || importeDeuda > 0) {
        datos.push({
          numeroContrato,
          tipoProducto,
          entidad,
          importeDeuda,
          porcentajeDescuento,
          importeConDescuento
        });
      }
    });
    
    return datos;
  }
  
  // Validar datos de la tabla
  function validarDatos() {
    const filas = tablaDeudas.querySelectorAll("tr");
    let valido = true;
    
    filas.forEach(fila => {
      const numeroContrato = fila.querySelector(".numero-contrato");
      const tipoProducto = fila.querySelector(".tipo-producto");
      const entidad = fila.querySelector(".entidad");
      const importeDeuda = fila.querySelector(".importe-deuda");
      
      // Validar campos obligatorios
      if (!numeroContrato.value.trim()) {
        numeroContrato.classList.add("error");
        valido = false;
      } else {
        numeroContrato.classList.remove("error");
      }
      
      if (!tipoProducto.value) {
        tipoProducto.classList.add("error");
        valido = false;
      } else {
        tipoProducto.classList.remove("error");
      }
      
      if (!entidad.value) {
        entidad.classList.add("error");
        valido = false;
      } else {
        entidad.classList.remove("error");
      }
      
      // Validar importe
      if (!importeDeuda.value || parseFloat(importeDeuda.value) <= 0) {
        importeDeuda.classList.add("error");
        valido = false;
      } else {
        importeDeuda.classList.remove("error");
      }
    });
    
    if (!valido) {
      mostrarNotificacion("Por favor, complete todos los campos requeridos", "error");
    }
    
    return valido;
  }
  
  // Cargar datos en la tabla
  function cargarDatos(datos) {
    // Limpiar tabla actual
    while (tablaDeudas.firstChild) {
      tablaDeudas.removeChild(tablaDeudas.firstChild);
    }
    
    // Si no hay datos, agregar una fila vacía
    if (!datos || datos.length === 0) {
      agregarFila();
      return;
    }
    
    // Cargar cada fila de datos
    datos.forEach(dato => {
      const fila = agregarFila();
      
      fila.querySelector(".numero-contrato").value = dato.numeroContrato || "";
      
      const tipoProductoSelect = fila.querySelector(".tipo-producto");
      const entidadSelect = fila.querySelector(".entidad");
      
      // Cargar tipo de producto y entidad cuando estén disponibles
      GoogleSheetsModule.obtenerTiposProducto().then(tipos => {
        // Asegurarse de que el tipo existe en la lista
        if (tipos.includes(dato.tipoProducto)) {
          tipoProductoSelect.value = dato.tipoProducto;
        }
      });
      
      GoogleSheetsModule.obtenerEntidades().then(entidades => {
        // Asegurarse de que la entidad existe en la lista
        if (entidades.includes(dato.entidad)) {
          entidadSelect.value = dato.entidad;
        }
      });
      
      fila.querySelector(".importe-deuda").value = dato.importeDeuda || 0;
      fila.querySelector(".porcentaje-descuento").value = dato.porcentajeDescuento || 0;
      
      // Calcular importe con descuento
      calcularImporteConDescuento(fila);
    });
  }
  
  // Exponer funciones públicas
  return {
    inicializar,
    agregarFila,
    calcularImportesConDescuento,
    obtenerDatosFilas,
    validarDatos,
    cargarDatos
  };
})();

//////////////////////////////////////////
// SimuladorModule
//////////////////////////////////////////

const SimuladorModule = (function() {
  // Elementos DOM
  const btnCalcular = document.getElementById("btnCalcular");
  const btnReAnalizar = document.getElementById("btnReAnalizar");
  const nombreDeudorInput = document.getElementById("nombreDeudor");
  const numCuotasInput = document.getElementById("numCuotas");
  const resultadoFinal = document.getElementById("resultadoFinal");
  const resultadoTotalAPagar = document.getElementById("resultadoTotalAPagar");
  
  // Variables para almacenar resultados
  let resultadoActual = null;
  
  // Inicializar módulo
  function inicializar() {
    // Configurar eventos
    btnCalcular.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      calcular();
    });
    
    btnReAnalizar.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      reAnalizar();
    });
    
    // Validación de número de cuotas
    numCuotasInput.addEventListener("change", function() {
      validarInputNumerico(this, 1, 120);
      if (resultadoActual) {
        actualizarResultados();
      }
    });
  }
  
  // Función principal de cálculo
  function calcular() {
    // Validar nombre del deudor
    if (!nombreDeudorInput.value.trim()) {
      nombreDeudorInput.classList.add("error");
      mostrarNotificacion("Por favor, ingrese el nombre del cliente", "error");
      setTimeout(() => nombreDeudorInput.classList.remove("error"), 1200);
      return;
    }
    
    // Validar datos de la tabla
    if (!TablaDeudasModule.validarDatos()) {
      return;
    }
    
    // Validar número de cuotas
    if (!validarInputNumerico(numCuotasInput, 1, 120)) {
      return;
    }
    
    // Obtener datos de las filas
    const datosFilas = TablaDeudasModule.obtenerDatosFilas();
    
    // Calcular totales
    const deudaOriginal = datosFilas.reduce((total, fila) => total + fila.importeDeuda, 0);
    const deudaDescontada = datosFilas.reduce((total, fila) => total + fila.importeConDescuento, 0);
    const ahorro = deudaOriginal - deudaDescontada;
    const numCuotas = parseInt(numCuotasInput.value) || 12;
    const cuotaMensual = deudaDescontada / numCuotas;
    
    // Guardar resultado
    resultadoActual = {
      nombreDeudor: nombreDeudorInput.value.trim(),
      numeroDeudas: datosFilas.length,
      deudaOriginal,
      deudaDescontada,
      ahorro,
      numCuotas,
      cuotaMensual,
      detalles: datosFilas,
      fecha: new Date().toLocaleDateString('es-ES'),
      folio: generarFolio()
    };
    
    // Mostrar resultado
    actualizarResultados();
    
    // Mostrar plan de liquidación
    PlanLiquidacionModule.mostrarPlan(resultadoActual);
    
    // Guardar en historial
    guardarEnHistorial(resultadoActual);
  }
  
  // Función para re-analizar (limpiar y empezar de nuevo)
  function reAnalizar() {
    confirmarAccion("¿Estás seguro de reiniciar el simulador? Se perderán los datos no guardados.", () => {
      // Limpiar campos
      nombreDeudorInput.value = "";
      numCuotasInput.value = "12";
      
      // Limpiar tabla
      TablaDeudasModule.cargarDatos([]);
      
      // Ocultar resultados
      resultadoFinal.style.display = "none";
      resultadoActual = null;
      
      // Ocultar plan de liquidación
      PlanLiquidacionModule.ocultarPlan();
      
      mostrarNotificacion("Simulador reiniciado correctamente", "info");
    });
  }
  
  // Actualizar visualización de resultados
  function actualizarResultados() {
    if (!resultadoActual) return;
    
    // Recalcular cuota mensual si cambió el número de cuotas
    const numCuotas = parseInt(numCuotasInput.value) || 12;
    resultadoActual.numCuotas = numCuotas;
    resultadoActual.cuotaMensual = resultadoActual.deudaDescontada / numCuotas;
    
    // Actualizar texto de resultado
    resultadoTotalAPagar.innerHTML = `<strong>Total a Pagar:</strong> ${formatoMoneda(resultadoActual.deudaDescontada)} en ${numCuotas} cuotas de ${formatoMoneda(resultadoActual.cuotaMensual)}`;
    
    // Mostrar resultado
    resultadoFinal.style.display = "block";
    
    // Actualizar plan de liquidación si está visible
    if (document.getElementById("planContainerOuter").style.display !== "none") {
      PlanLiquidacionModule.actualizarPlan(resultadoActual);
    }
  }
  
  // Generar folio único
  function generarFolio() {
    const fecha = new Date();
    const timestamp = fecha.getTime();
    const random = Math.floor(Math.random() * 1000);
    return `FOLIO-${timestamp}-${random}`;
  }
  
  // Guardar en historial
  function guardarEnHistorial(resultado) {
    const datosHistorial = {
      folio: resultado.folio,
      fecha: resultado.fecha,
      nombreDeudor: resultado.nombreDeudor,
      numeroDeudas: resultado.numeroDeudas,
      deudaOriginal: resultado.deudaOriginal,
      deudaDescontada: resultado.deudaDescontada,
      ahorro: resultado.ahorro,
      totalAPagar: resultado.deudaDescontada,
      numCuotas: resultado.numCuotas
    };
    
    GoogleSheetsModule.guardarHistorial(datosHistorial)
      .then(() => {
        console.log("Historial guardado correctamente");
      })
      .catch(error => {
        console.error("Error al guardar historial:", error);
        mostrarNotificacion("Error al guardar en historial", "error");
      });
  }
  
  // Cargar datos de un contrato existente
  function cargarContrato(datosContrato) {
    // Cargar datos básicos
    nombreDeudorInput.value = datosContrato.nombreDeudor || "";
    numCuotasInput.value = datosContrato.numCuotas || 12;
    
    // Cargar detalles en la tabla
    TablaDeudasModule.cargarDatos(datosContrato.detalles || []);
    
    // Actualizar resultado actual
    resultadoActual = {
      nombreDeudor: datosContrato.nombreDeudor,
      numeroDeudas: datosContrato.numeroDeudas,
      deudaOriginal: datosContrato.deudaOriginal,
      deudaDescontada: datosContrato.deudaDescontada,
      ahorro: datosContrato.ahorro,
      numCuotas: datosContrato.numCuotas,
      cuotaMensual: datosContrato.cuotaMensual,
      detalles: datosContrato.detalles,
      fecha: datosContrato.fecha,
      folio: datosContrato.folio
    };
    
    // Mostrar resultados
    actualizarResultados();
    
    // Mostrar plan de liquidación
    PlanLiquidacionModule.mostrarPlan(resultadoActual);
    
    mostrarNotificacion(`Contrato ${datosContrato.folio} cargado correctamente`, "success");
  }
  
  // Exponer funciones públicas
  return {
    inicializar,
    calcular,
    reAnalizar,
    cargarContrato
  };
})();

//////////////////////////////////////////
// PlanLiquidacionModule
//////////////////////////////////////////

const PlanLiquidacionModule = (function() {
  // Elementos DOM
  const planContainerOuter = document.getElementById("planContainerOuter");
  const btnDescargarPlan = document.getElementById("btnDescargarPlan");
  const btnContratar = document.getElementById("btnContratar");
  const btnEditarContrato = document.getElementById("btnEditarContrato");
  
  // Variables para el gráfico
  let myChart = null;
  
  // Inicializar módulo
  function inicializar() {
    // Configurar eventos
    btnDescargarPlan.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      descargarPlanMejorado();
    });
    
    btnContratar.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      contratarPlan();
    });
    
    btnEditarContrato.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      editarContrato();
    });
  }
  
  // Mostrar plan de liquidación
  function mostrarPlan(datos) {
    // Actualizar datos del plan
    document.getElementById("plan-nombre-deudor").textContent = datos.nombreDeudor;
    document.getElementById("plan-num-deudas").textContent = datos.numeroDeudas;
    document.getElementById("plan-deuda-total").textContent = formatoMoneda(datos.deudaOriginal);
    document.getElementById("plan-folio").textContent = datos.folio;
    document.getElementById("plan-fecha").textContent = datos.fecha;
    
    document.getElementById("plan-lo-que-debes").textContent = formatoMoneda(datos.deudaOriginal);
    document.getElementById("plan-lo-que-pagarias").textContent = formatoMoneda(datos.deudaDescontada);
    document.getElementById("plan-ahorro").textContent = formatoMoneda(datos.ahorro);
    
    document.getElementById("plan-cuota-mensual").textContent = formatoMoneda(datos.cuotaMensual);
    const porcentajeDescuento = (datos.ahorro / datos.deudaOriginal) * 100;
    document.getElementById("plan-descuento-total").textContent = `${porcentajeDescuento.toFixed(2)}%`;
    document.getElementById("plan-duracion").textContent = `${datos.numCuotas} meses`;
    
    // Actualizar tabla de detalles
    const tablaBody = document.getElementById("plan-tabla-body");
    tablaBody.innerHTML = "";
    
    datos.detalles.forEach(detalle => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${detalle.entidad}</td>
        <td>${formatoMoneda(detalle.importeDeuda)}</td>
        <td>${formatoMoneda(detalle.importeConDescuento)}</td>
      `;
      tablaBody.appendChild(tr);
    });
    
    // Crear o actualizar gráfico
    crearGrafico(datos.deudaOriginal, datos.deudaDescontada);
    
    // Mostrar contenedor del plan
    planContainerOuter.style.display = "block";
    
    // Ocultar botón de editar contrato (solo visible en modo edición)
    btnEditarContrato.style.display = "none";
    
    // Desplazar a la vista del plan
    planContainerOuter.scrollIntoView({ behavior: "smooth" });
  }
  
  // Ocultar plan de liquidación
  function ocultarPlan() {
    planContainerOuter.style.display = "none";
  }
  
  // Actualizar plan con nuevos datos
  function actualizarPlan(datos) {
    mostrarPlan(datos);
  }
  
  // Crear gráfico de comparación
  function crearGrafico(deudaOriginal, deudaDescontada) {
    const ctx = document.getElementById("myChart").getContext("2d");
    
    // Destruir gráfico anterior si existe
    if (myChart) {
      myChart.destroy();
    }
    
    // Crear nuevo gráfico
    myChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Lo que pagarías", "Te ahorras"],
        datasets: [{
          data: [deudaDescontada, deudaOriginal - deudaDescontada],
          backgroundColor: ["#0071e3", "#34c759"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              font: {
                family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                size: 12
              },
              color: "#1d1d1f"
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                return `${context.label}: ${formatoMoneda(value)}`;
              }
            }
          }
        }
      }
    });
  }
  
  // Contratar plan (guardar en Google Sheets)
  function contratarPlan() {
    // Obtener datos actuales
    const nombreDeudor = document.getElementById("plan-nombre-deudor").textContent;
    const folio = document.getElementById("plan-folio").textContent;
    const fecha = document.getElementById("plan-fecha").textContent;
    const numDeudas = parseInt(document.getElementById("plan-num-deudas").textContent) || 0;
    const deudaOriginal = parseFloat(document.getElementById("plan-lo-que-debes").textContent.replace(/[€.]/g, "").replace(",", ".")) || 0;
    const deudaDescontada = parseFloat(document.getElementById("plan-lo-que-pagarias").textContent.replace(/[€.]/g, "").replace(",", ".")) || 0;
    const ahorro = parseFloat(document.getElementById("plan-ahorro").textContent.replace(/[€.]/g, "").replace(",", ".")) || 0;
    const cuotaMensual = parseFloat(document.getElementById("plan-cuota-mensual").textContent.replace(/[€.]/g, "").replace(",", ".")) || 0;
    const numCuotas = parseInt(document.getElementById("plan-duracion").textContent) || 12;
    
    // Obtener detalles de la tabla
    const detalles = [];
    const filas = document.querySelectorAll("#plan-tabla-body tr");
    
    filas.forEach(fila => {
      const entidad = fila.cells[0].textContent;
      const importeDeuda = parseFloat(fila.cells[1].textContent.replace(/[€.]/g, "").replace(",", ".")) || 0;
      const importeConDescuento = parseFloat(fila.cells[2].textContent.replace(/[€.]/g, "").replace(",", ".")) || 0;
      const porcentajeDescuento = importeDeuda > 0 ? ((importeDeuda - importeConDescuento) / importeDeuda) * 100 : 0;
      
      detalles.push({
        numeroContrato: "N/A", // No disponible en la tabla del plan
        tipoProducto: "N/A", // No disponible en la tabla del plan
        entidad,
        importeDeuda,
        porcentajeDescuento,
        importeConDescuento
      });
    });
    
    // Crear objeto de datos del contrato
    const datosContrato = {
      folio,
      fecha,
      nombreDeudor,
      numeroDeudas: numDeudas,
      deudaOriginal,
      deudaDescontada,
      ahorro,
      totalAPagar: deudaDescontada,
      cuotaMensual,
      numCuotas,
      detalles
    };
    
    // Guardar contrato en Google Sheets
    GoogleSheetsModule.guardarContrato(datosContrato)
      .then(() => {
        mostrarNotificacion("Contrato guardado correctamente", "success");
        // Mostrar botón de editar contrato
        btnEditarContrato.style.display = "inline-block";
      })
      .catch(error => {
        console.error("Error al guardar contrato:", error);
        mostrarNotificacion("Error al guardar contrato: " + error, "error");
      });
  }
  
  // Editar contrato existente
  function editarContrato() {
    // Esta función se llamaría desde el historial o al editar un contrato existente
    // Por ahora, simplemente ocultamos el plan y volvemos al simulador
    ocultarPlan();
    mostrarNotificacion("Puede editar los datos y calcular nuevamente", "info");
  }
  
  // Exponer funciones públicas
  return {
    inicializar,
    mostrarPlan,
    ocultarPlan,
    actualizarPlan
  };
})();

//////////////////////////////////////////
// HistorialModule
//////////////////////////////////////////

const HistorialModule = (function() {
  // Elementos DOM
  const historialContainer = document.getElementById("historialContainer");
  const btnMostrarHistorial = document.getElementById("btnMostrarHistorial");
  const btnCerrarHistorial = document.getElementById("btnCerrarHistorial");
  const historialBody = document.getElementById("historialBody");
  
  // Inicializar módulo
  function inicializar() {
    // Configurar eventos
    btnMostrarHistorial.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      mostrarHistorial();
    });
    
    btnCerrarHistorial.addEventListener("click", function() {
      this.classList.add("clicked");
      setTimeout(() => this.classList.remove("clicked"), 200);
      ocultarHistorial();
    });
    
    // Configurar delegación de eventos para la tabla de historial
    historialBody.addEventListener("click", manejarClickHistorial);
  }
  
  // Mostrar historial
  function mostrarHistorial() {
    // Mostrar contenedor
    historialContainer.style.display = "block";
    
    // Cargar datos del historial
    cargarHistorial();
    
    // Desplazar a la vista del historial
    historialContainer.scrollIntoView({ behavior: "smooth" });
  }
  
  // Ocultar historial
  function ocultarHistorial() {
    historialContainer.style.display = "none";
  }
  
  // Cargar datos del historial desde Google Sheets
  function cargarHistorial() {
    // Limpiar tabla
    historialBody.innerHTML = "";
    
    // Mostrar indicador de carga
    toggleCargando(true, "Cargando historial...");
    
    // Cargar datos
    GoogleSheetsModule.cargarHistorial()
      .then(historial => {
        if (historial.length === 0) {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td colspan="9">No hay registros en el historial</td>`;
          historialBody.appendChild(tr);
        } else {
          // Ordenar por fecha (más reciente primero)
          historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          
          // Añadir filas
          historial.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${item.folio}</td>
              <td>${item.fecha}</td>
              <td>${item.nombreDeudor}</td>
              <td>${item.numeroDeudas}</td>
              <td>${formatoMoneda(item.deudaOriginal)}</td>
              <td>${formatoMoneda(item.deudaDescontada)}</td>
              <td>${formatoMoneda(item.ahorro)}</td>
              <td>${formatoMoneda(item.totalAPagar)}</td>
              <td>
                <button class="btn-cargar-historial" data-folio="${item.folio}">Cargar</button>
                <button class="btn-eliminar-historial" data-folio="${item.folio}">Eliminar</button>
              </td>
            `;
            historialBody.appendChild(tr);
          });
        }
      })
      .catch(error => {
        console.error("Error al cargar historial:", error);
        mostrarNotificacion("Error al cargar historial: " + error, "error");
        
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="9">Error al cargar historial</td>`;
        historialBody.appendChild(tr);
      })
      .finally(() => {
        toggleCargando(false);
      });
  }
  
  // Manejar eventos de clic en la tabla de historial
  function manejarClickHistorial(event) {
    // Si se hizo clic en un botón de cargar
    if (event.target.classList.contains("btn-cargar-historial")) {
      const folio = event.target.getAttribute("data-folio");
      cargarContratoDesdeHistorial(folio);
    }
    
    // Si se hizo clic en un botón de eliminar
    if (event.target.classList.contains("btn-eliminar-historial")) {
      const folio = event.target.getAttribute("data-folio");
      confirmarAccion(`¿Estás seguro de eliminar el registro ${folio}?`, () => {
        eliminarRegistroHistorial(folio);
      });
    }
  }
  
  // Cargar contrato desde historial
  function cargarContratoDesdeHistorial(folio) {
    // Mostrar indicador de carga
    toggleCargando(true, "Cargando contrato...");
    
    // Obtener detalles del contrato
    GoogleSheetsModule.obtenerDetallesContrato(folio)
      .then(datos => {
        // Ocultar historial
        ocultarHistorial();
        
        // Cargar contrato en el simulador
        SimuladorModule.cargarContrato(datos);
      })
      .catch(error => {
        console.error("Error al cargar contrato:", error);
        mostrarNotificacion("Error al cargar contrato: " + error, "error");
      })
      .finally(() => {
        toggleCargando(false);
      });
  }
  
  // Eliminar registro del historial
  function eliminarRegistroHistorial(folio) {
    // Esta función requeriría implementación en el backend (Google Apps Script)
    // Por ahora, simplemente mostramos un mensaje
    mostrarNotificacion("Función de eliminación no implementada en el backend", "info");
    
    // En una implementación real, se enviaría una solicitud al backend
    // y se actualizaría la tabla al recibir respuesta exitosa
  }
  
  // Exponer funciones públicas
  return {
    inicializar,
    mostrarHistorial,
    ocultarHistorial
  };
})();

//////////////////////////////////////////
// Función para descargar PDF mejorada
//////////////////////////////////////////

function descargarPlanMejorado() {
  // Mostrar notificación de inicio
  mostrarNotificacion("Generando PDF, por favor espere...", "info");
  toggleCargando(true, "Generando PDF...");
  
  // Obtener el elemento que contiene el plan
  const planDiv = document.getElementById("plan-de-liquidacion");
  if (!planDiv) {
    mostrarNotificacion("Error: No se encontró el contenido del plan", "error");
    toggleCargando(false);
    return;
  }
  
  // Preparar datos para el nombre del archivo
  const fechaFilename = (document.getElementById("plan-fecha")?.textContent || "").replaceAll("/", "-");
  const nombreDeudor = (document.getElementById("plan-nombre-deudor")?.textContent || "Simulacion").trim();
  const folioActual = document.getElementById("plan-folio")?.textContent || "";
  
  // Configuración para html2pdf
  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${nombreDeudor}_${fechaFilename}_${folioActual.replace("FOLIO-", "")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
      windowWidth: document.documentElement.offsetWidth,
      windowHeight: document.documentElement.offsetHeight,
      logging: false,
      letterRendering: true
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true
    }
  };
  
  // Usar el método .save() directamente en lugar de encadenarlo
  const pdf = html2pdf();
  pdf.set(opt);
  
  // Usar promesas para manejar el proceso
  pdf.from(planDiv)
    .outputPdf()
    .then(function(pdf) {
      // Forzar la descarga usando un enlace
      const blob = new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = opt.filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        mostrarNotificacion("PDF descargado correctamente", "success");
        toggleCargando(false);
      }, 100);
    })
    .catch(function(error) {
      console.error("Error al generar PDF:", error);
      mostrarNotificacion("Error al generar PDF: " + error, "error");
      toggleCargando(false);
    });
}

//////////////////////////////////////////
// Función para corregir el formato de los campos numéricos
//////////////////////////////////////////

function corregirFormatoNumerico() {
  // Seleccionar todos los inputs numéricos en la tabla
  const inputsNumericos = document.querySelectorAll('#tablaDeudas input[type="number"]');
  
  // Para cada input, añadir eventos para manejar el formato
  inputsNumericos.forEach(input => {
    // Al enfocar, eliminar ceros iniciales
    input.addEventListener('focus', function() {
      // Si el valor es solo cero, vaciar el campo
      if (this.value === '0' || this.value === 0) {
        this.value = '';
      }
      // Si tiene ceros al inicio, eliminarlos
      else if (this.value.startsWith('0') && this.value.length > 1 && !this.value.startsWith('0.')) {
        this.value = parseFloat(this.value).toString();
      }
    });
    
    // Al perder el foco, formatear correctamente
    input.addEventListener('blur', function() {
      // Si está vacío, no hacer nada (no poner cero)
      if (this.value === '') {
        return;
      }
      
      // Convertir a número y formatear
      const valor = parseFloat(this.value);
      if (!isNaN(valor)) {
        // Para campos de porcentaje, no usar decimales
        if (this.closest('td').cellIndex === 4) { // Columna de % Descuento
          this.value = Math.round(valor);
        } 
        // Para campos de importe, usar dos decimales
        else {
          this.value = valor.toString();
        }
      }
    });
  });
}

//////////////////////////////////////////
// Inicialización de la aplicación
//////////////////////////////////////////

document.addEventListener("DOMContentLoaded", function() {
  // Inicializar módulos
  TablaDeudasModule.inicializar();
  SimuladorModule.inicializar();
  PlanLiquidacionModule.inicializar();
  HistorialModule.inicializar();
  
  // Cargar datos iniciales
  GoogleSheetsModule.cargarEntidadesYTipos()
    .catch(error => {
      console.error("Error al cargar datos iniciales:", error);
      mostrarNotificacion("Error al cargar datos iniciales. Algunas funciones pueden no estar disponibles.", "error");
    });
  
  // Mostrar notificación de bienvenida
  setTimeout(() => {
    mostrarNotificacion("Bienvenido al Simulador de Reestructuración DMD", "info");
  }, 500);
  
  // Detectar modo oscuro
  const prefiereModoOscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefiereModoOscuro) {
    document.body.classList.add('dark-mode');
    mostrarNotificacion("Modo oscuro activado automáticamente", "info");
  }
  
  // Escuchar cambios en la preferencia de modo oscuro
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (e.matches) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  });
});
