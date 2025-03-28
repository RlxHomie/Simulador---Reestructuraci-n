// Configuración para Google Apps Script
// Este script debe ser desplegado como una aplicación web en Google Apps Script
// y la URL resultante debe ser configurada en el archivo main-improved.js

/**
 * Configuración global y variables
 */
const HOJA_CONTRATOS = "Contratos";
const HOJA_DETALLES = "Detalles";
const HOJA_HISTORIAL = "Historial";
const HOJA_ENTIDADES = "Entidades";
const HOJA_TIPOS_PRODUCTO = "TiposProducto";

/**
 * doGet(e) maneja las solicitudes GET para obtener datos
 */
function doGet(e) {
  try {
    // Obtener entidades y tipos de producto
    const entidades = obtenerListaEntidades();
    const tiposProducto = obtenerListaTiposProducto();
    
    // Crear respuesta JSON
    const respuesta = {
      entidades: entidades,
      tiposProducto: tiposProducto
    };
    
    // Devolver respuesta
    return ContentService.createTextOutput(JSON.stringify(respuesta))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // En caso de error
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * doPost(e) recibe los datos en formato URL-encoded.
 * Cada campo que envies en el fetch, lo capturas en e.parameter.
 */
function doPost(e) {
  try {
    // Determinar la acción a realizar
    const accion = e.parameter.accion || "guardarContrato";
    
    switch (accion) {
      case "guardarContrato":
        return guardarContrato(e);
      case "guardarHistorial":
        return guardarHistorial(e);
      case "actualizarContrato":
        return actualizarContrato(e);
      case "obtenerHistorial":
        return obtenerHistorial();
      case "obtenerDetallesContrato":
        return obtenerDetallesContrato(e);
      default:
        return ContentService.createTextOutput(JSON.stringify({ error: "Acción no reconocida" }))
          .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    // En caso de error
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene la lista de entidades desde la hoja "Entidades"
 */
function obtenerListaEntidades() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_ENTIDADES);
  
  if (!sheet) {
    // Crear la hoja si no existe
    ss.insertSheet(HOJA_ENTIDADES);
    const newSheet = ss.getSheetByName(HOJA_ENTIDADES);
    // Añadir encabezado
    newSheet.appendRow(["Entidad"]);
    // Añadir algunas entidades de ejemplo
    newSheet.appendRow(["Banco Santander"]);
    newSheet.appendRow(["BBVA"]);
    newSheet.appendRow(["CaixaBank"]);
    newSheet.appendRow(["Bankinter"]);
    newSheet.appendRow(["Sabadell"]);
    return ["Banco Santander", "BBVA", "CaixaBank", "Bankinter", "Sabadell"];
  }
  
  // Obtener datos de la hoja
  const datos = sheet.getDataRange().getValues();
  
  // Filtrar encabezado y valores vacíos
  const entidades = datos.slice(1)
    .map(fila => fila[0])
    .filter(entidad => entidad && entidad.trim() !== "");
  
  return entidades;
}

/**
 * Obtiene la lista de tipos de producto desde la hoja "TiposProducto"
 */
function obtenerListaTiposProducto() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJA_TIPOS_PRODUCTO);
  
  if (!sheet) {
    // Crear la hoja si no existe
    ss.insertSheet(HOJA_TIPOS_PRODUCTO);
    const newSheet = ss.getSheetByName(HOJA_TIPOS_PRODUCTO);
    // Añadir encabezado
    newSheet.appendRow(["Tipo Producto"]);
    // Añadir algunos tipos de ejemplo
    newSheet.appendRow(["Préstamo Personal"]);
    newSheet.appendRow(["Tarjeta de Crédito"]);
    newSheet.appendRow(["Hipoteca"]);
    newSheet.appendRow(["Línea de Crédito"]);
    newSheet.appendRow(["Crédito al Consumo"]);
    return ["Préstamo Personal", "Tarjeta de Crédito", "Hipoteca", "Línea de Crédito", "Crédito al Consumo"];
  }
  
  // Obtener datos de la hoja
  const datos = sheet.getDataRange().getValues();
  
  // Filtrar encabezado y valores vacíos
  const tipos = datos.slice(1)
    .map(fila => fila[0])
    .filter(tipo => tipo && tipo.trim() !== "");
  
  return tipos;
}

/**
 * Guarda los datos principales del contrato
 */
function guardarContrato(e) {
  try {
    // Hoja destino para datos principales
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetContratos = ss.getSheetByName(HOJA_CONTRATOS);
    
    if (!sheetContratos) {
      // Crear la hoja si no existe
      ss.insertSheet(HOJA_CONTRATOS);
      const newSheet = ss.getSheetByName(HOJA_CONTRATOS);
      // Añadir encabezados
      newSheet.appendRow([
        "Timestamp", "Folio", "Fecha", "Nombre Deudor", "Número Deudas", 
        "Deuda Original", "Deuda Descontada", "Ahorro", "Total a Pagar", "Cuota Mensual", "Número Cuotas"
      ]);
    }
    
    // Extraer parámetros principales
    const folio = e.parameter.folio || "";
    const fecha = e.parameter.fecha || "";
    const nombreDeudor = e.parameter.nombreDeudor || "";
    const numeroDeudas = e.parameter.numeroDeudas || "";
    const deudaOriginal = e.parameter.deudaOriginal || "";
    const deudaDescontada = e.parameter.deudaDescontada || "";
    const ahorro = e.parameter.ahorro || "";
    const totalAPagar = e.parameter.totalAPagar || "";
    const cuotaMensual = e.parameter.cuotaMensual || "";
    const numCuotas = e.parameter.numCuotas || ""; // Añadido número de cuotas

    // Añadir la fila al final de la hoja de contratos
    sheetContratos.appendRow([
      new Date(),      // Marca de tiempo adicional
      folio,
      fecha,
      nombreDeudor,
      numeroDeudas,
      deudaOriginal,
      deudaDescontada,
      ahorro,
      totalAPagar,
      cuotaMensual,
      numCuotas        // Añadido número de cuotas
    ]);
    
    // Guardar detalles del contrato si existen
    if (e.parameter.detalles) {
      guardarDetallesContrato(folio, e.parameter.detalles);
    }

    // Respuesta de éxito
    return ContentService.createTextOutput("OK: Contrato guardado correctamente")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    // En caso de error
    return ContentService.createTextOutput("ERROR: " + err)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Guarda los detalles de cada línea del contrato
 */
function guardarDetallesContrato(folio, detallesJson) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetDetalles = ss.getSheetByName(HOJA_DETALLES);
    
    if (!sheetDetalles) {
      // Crear la hoja si no existe
      ss.insertSheet(HOJA_DETALLES);
      const newSheet = ss.getSheetByName(HOJA_DETALLES);
      // Añadir encabezados
      newSheet.appendRow([
        "Timestamp", "Folio", "Número Contrato", "Tipo Producto", "Entidad",
        "Deuda Original", "Porcentaje Descuento", "Deuda Con Descuento"
      ]);
    }
    
    // Parsear los detalles JSON
    const detalles = JSON.parse(detallesJson);
    
    // Guardar cada detalle como una fila
    detalles.forEach(detalle => {
      sheetDetalles.appendRow([
        new Date(),
        folio,
        detalle.numeroContrato || "",
        detalle.tipoProducto || "",
        detalle.entidad || "",
        detalle.importeDeuda || 0,
        detalle.porcentajeDescuento || 0,
        detalle.importeConDescuento || 0
      ]);
    });
    
    return true;
  } catch (err) {
    Logger.log("Error al guardar detalles: " + err);
    return false;
  }
}

/**
 * Guarda los datos en el historial
 */
function guardarHistorial(e) {
  try {
    // Hoja destino para historial
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetHistorial = ss.getSheetByName(HOJA_HISTORIAL);
    
    if (!sheetHistorial) {
      // Crear la hoja si no existe
      ss.insertSheet(HOJA_HISTORIAL);
      const newSheet = ss.getSheetByName(HOJA_HISTORIAL);
      // Añadir encabezados
      newSheet.appendRow([
        "Timestamp", "Folio", "Fecha", "Nombre Deudor", "Número Deudas", 
        "Deuda Original", "Deuda Descontada", "Ahorro", "Total a Pagar", "Número Cuotas"
      ]);
    }
    
    // Extraer parámetros
    const folio = e.parameter.folio || "";
    const fecha = e.parameter.fecha || "";
    const nombreDeudor = e.parameter.nombreDeudor || "";
    const numeroDeudas = e.parameter.numeroDeudas || "";
    const deudaOriginal = e.parameter.deudaOriginal || "";
    const deudaDescontada = e.parameter.deudaDescontada || "";
    const ahorro = e.parameter.ahorro || "";
    const totalAPagar = e.parameter.totalAPagar || "";
    const numCuotas = e.parameter.numCuotas || ""; // Añadido número de cuotas
    
    // Añadir la fila al final de la hoja de historial
    sheetHistorial.appendRow([
      new Date(),
      folio,
      fecha,
      nombreDeudor,
      numeroDeudas,
      deudaOriginal,
      deudaDescontada,
      ahorro,
      totalAPagar,
      numCuotas     // Añadido número de cuotas
    ]);
    
    // Respuesta de éxito
    return ContentService.createTextOutput("OK: Historial guardado correctamente")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    // En caso de error
    return ContentService.createTextOutput("ERROR: " + err)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Obtiene el historial de contratos
 */
function obtenerHistorial() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(HOJA_HISTORIAL);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ historial: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obtener datos de la hoja
    const datos = sheet.getDataRange().getValues();
    
    // Obtener encabezados
    const encabezados = datos[0];
    
    // Convertir datos a array de objetos
    const historial = datos.slice(1).map(fila => {
      const item = {};
      encabezados.forEach((encabezado, index) => {
        // Convertir fechas a string
        if (fila[index] instanceof Date) {
          item[encabezado] = Utilities.formatDate(fila[index], "GMT", "dd/MM/yyyy");
        } else {
          item[encabezado] = fila[index];
        }
      });
      return item;
    });
    
    // Devolver respuesta
    return ContentService.createTextOutput(JSON.stringify({ historial }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // En caso de error
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene los detalles de un contrato específico
 */
function obtenerDetallesContrato(e) {
  try {
    const folio = e.parameter.folio;
    
    if (!folio) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Folio no especificado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Obtener datos principales del contrato
    const sheetContratos = ss.getSheetByName(HOJA_CONTRATOS);
    const datosContratos = sheetContratos.getDataRange().getValues();
    const encabezadosContrato = datosContratos[0];
    
    // Buscar contrato por folio
    let datosContrato = null;
    for (let i = 1; i < datosContratos.length; i++) {
      if (datosContratos[i][1] === folio) { // Folio está en la columna 1 (índice 1)
        datosContrato = {};
        encabezadosContrato.forEach((encabezado, index) => {
          // Convertir fechas a string
          if (datosContratos[i][index] instanceof Date) {
            datosContrato[encabezado] = Utilities.formatDate(datosContratos[i][index], "GMT", "dd/MM/yyyy");
          } else {
            datosContrato[encabezado] = datosContratos[i][index];
          }
        });
        break;
      }
    }
    
    if (!datosContrato) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Contrato no encontrado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Obtener detalles del contrato
    const sheetDetalles = ss.getSheetByName(HOJA_DETALLES);
    const datosDetalles = sheetDetalles.getDataRange().getValues();
    const encabezadosDetalles = datosDetalles[0];
    
    // Filtrar detalles por folio
    const detalles = [];
    for (let i = 1; i < datosDetalles.length; i++) {
      if (datosDetalles[i][1] === folio) { // Folio está en la columna 1 (índice 1)
        const detalle = {};
        encabezadosDetalles.forEach((encabezado, index) => {
          // Convertir fechas a string
          if (datosDetalles[i][index] instanceof Date) {
            detalle[encabezado] = Utilities.formatDate(datosDetalles[i][index], "GMT", "dd/MM/yyyy");
          } else {
            detalle[encabezado] = datosDetalles[i][index];
          }
        });
        detalles.push(detalle);
      }
    }
    
    // Devolver respuesta
    return ContentService.createTextOutput(JSON.stringify({ contrato: datosContrato, detalles }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    // En caso de error
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Actualiza un contrato existente
 */
function actualizarContrato(e) {
  try {
    const folio = e.parameter.folio;
    
    if (!folio) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Folio no especificado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Obtener hoja de contratos
    const sheetContratos = ss.getSheetByName(HOJA_CONTRATOS);
    const datosContratos = sheetContratos.getDataRange().getValues();
    
    // Buscar contrato por folio
    let filaContrato = -1;
    for (let i = 1; i < datosContratos.length; i++) {
      if (datosContratos[i][1] === folio) { // Folio está en la columna 1 (índice 1)
        filaContrato = i + 1; // +1 porque las filas en Sheets empiezan en 1, no en 0
        break;
      }
    }
    
    if (filaContrato === -1) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Contrato no encontrado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Extraer parámetros principales
    const fecha = e.parameter.fecha || datosContratos[filaContrato-1][2];
    const nombreDeudor = e.parameter.nombreDeudor || datosContratos[filaContrato-1][3];
    const numeroDeudas = e.parameter.numeroDeudas || datosContratos[filaContrato-1][4];
    const deudaOriginal = e.parameter.deudaOriginal || datosContratos[filaContrato-1][5];
    const deudaDescontada = e.parameter.deudaDescontada || datosContratos[filaContrato-1][6];
    const ahorro = e.parameter.ahorro || datosContratos[filaContrato-1][7];
    const totalAPagar = e.parameter.totalAPagar || datosContratos[filaContrato-1][8];
    const cuotaMensual = e.parameter.cuotaMensual || datosContratos[filaContrato-1][9];
    const numCuotas = e.parameter.numCuotas || datosContratos[filaContrato-1][10];
    
    // Actualizar fila en la hoja de contratos
    sheetContratos.getRange(filaContrato, 3, 1, 9).setValues([[
      fecha,
      nombreDeudor,
      numeroDeudas,
      deudaOriginal,
      deudaDescontada,
      ahorro,
      totalAPagar,
      cuotaMensual,
      numCuotas
    ]]);
    
    // Actualizar detalles si existen
    if (e.parameter.detalles) {
      // Eliminar detalles anteriores
      const sheetDetalles = ss.getSheetByName(HOJA_DETALLES);
      const datosDetalles = sheetDetalles.getDataRange().getValues();
      
      // Buscar filas a eliminar (de atrás hacia adelante para no afectar índices)
      const filasAEliminar = [];
      for (let i = datosDetalles.length - 1; i > 0; i--) {
        if (datosDetalles[i][1] === folio) { // Folio está en la columna 1 (índice 1)
          filasAEliminar.push(i + 1); // +1 porque las filas en Sheets empiezan en 1, no en 0
        }
      }
      
      // Eliminar filas
      filasAEliminar.forEach(fila => {
        sheetDetalles.deleteRow(fila);
      });
      
      // Guardar nuevos detalles
      guardarDetallesContrato(folio, e.parameter.detalles);
    }
    
    // Respuesta de éxito
    return ContentService.createTextOutput("OK: Contrato actualizado correctamente")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    // En caso de error
    return ContentService.createTextOutput("ERROR: " + err)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
