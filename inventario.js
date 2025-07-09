// inventario.js

// Variables globales
let inventario = [];
let productoEditando = null;
let filtroActual = 'todos';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
  cargarInventario();
  inicializarEventos();
  establecerFechaActual();
  actualizarEstadisticas();
});

// Eventos
function inicializarEventos() {
  // Formulario principal
  document.getElementById('form-producto').addEventListener('submit', agregarProducto);
  
  // Cambio de tipo de producto
  document.getElementById('tipo').addEventListener('change', toggleCaducidad);
  
  // Búsqueda
  document.getElementById('buscar').addEventListener('input', filtrarProductos);
  
  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', cambiarFiltro);
  });
  
  // Modal
  document.querySelector('.close').addEventListener('click', cerrarModal);
  document.getElementById('form-editar').addEventListener('submit', actualizarProducto);
  document.getElementById('edit-tipo').addEventListener('change', toggleCaducidadEdit);
  
  // Cerrar modal al hacer clic fuera
  window.addEventListener('click', function(e) {
    const modal = document.getElementById('modal-editar');
    if (e.target === modal) {
      cerrarModal();
    }
  });
}

// Establecer fecha actual
function establecerFechaActual() {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha-ingreso').value = hoy;
}

// Toggle caducidad
function toggleCaducidad() {
  const tipo = document.getElementById('tipo').value;
  const grupoCaducidad = document.getElementById('grupo-caducidad');
  const fechaCaducidad = document.getElementById('fecha-caducidad');
  
  if (tipo === 'perecible') {
    grupoCaducidad.style.display = 'flex';
    fechaCaducidad.required = true;
  } else {
    grupoCaducidad.style.display = 'none';
    fechaCaducidad.required = false;
    fechaCaducidad.value = '';
  }
}

function toggleCaducidadEdit() {
  const tipo = document.getElementById('edit-tipo').value;
  const grupoCaducidad = document.getElementById('edit-grupo-caducidad');
  const fechaCaducidad = document.getElementById('edit-fecha-caducidad');
  
  if (tipo === 'perecible') {
    grupoCaducidad.style.display = 'flex';
    fechaCaducidad.required = true;
  } else {
    grupoCaducidad.style.display = 'none';
    fechaCaducidad.required = false;
    fechaCaducidad.value = '';
  }
}

// Agregar producto
function agregarProducto(e) {
  e.preventDefault();
  
  const nombre = document.getElementById('nombre').value.trim();
  const tipo = document.getElementById('tipo').value;
  const cantidad = parseFloat(document.getElementById('cantidad').value);
  const unidad = document.getElementById('unidad').value;
  const fechaIngreso = document.getElementById('fecha-ingreso').value;
  const fechaCaducidad = document.getElementById('fecha-caducidad').value;
  const stockMinimo = parseFloat(document.getElementById('stock-minimo').value) || 5;
  const precio = parseFloat(document.getElementById('precio').value) || 0;
  
  // Validaciones
  if (!nombre || !tipo || !cantidad || !unidad || !fechaIngreso) {
    mostrarNotificacion('Por favor completa todos los campos obligatorios', 'error');
    return;
  }
  
  if (tipo === 'perecible' && !fechaCaducidad) {
    mostrarNotificacion('La fecha de caducidad es obligatoria para productos perecibles', 'error');
    return;
  }
  
  if (tipo === 'perecible' && fechaCaducidad <= fechaIngreso) {
    mostrarNotificacion('La fecha de caducidad debe ser posterior a la fecha de ingreso', 'error');
    return;
  }
  
  // Crear producto
  const producto = {
    id: Date.now(),
    nombre,
    tipo,
    cantidad,
    unidad,
    fechaIngreso,
    fechaCaducidad: tipo === 'perecible' ? fechaCaducidad : null,
    stockMinimo,
    precio,
    fechaCreacion: new Date().toISOString()
  };
  
  inventario.push(producto);
  guardarInventario();
  mostrarInventario();
  actualizarEstadisticas();
  limpiarFormulario();
  
  mostrarNotificacion(`Producto "${nombre}" agregado exitosamente`, 'exito');
}

// Limpiar formulario
function limpiarFormulario() {
  document.getElementById('form-producto').reset();
  document.getElementById('grupo-caducidad').style.display = 'none';
  document.getElementById('fecha-caducidad').required = false;
  establecerFechaActual();
}

// Mostrar inventario
function mostrarInventario() {
  const tbody = document.getElementById('tabla-body');
  tbody.innerHTML = '';
  
  let productosFiltrados = filtrarInventario();
  
  if (productosFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: #8B4513;">
          <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
          No se encontraron productos
        </td>
      </tr>
    `;
    return;
  }
  
  productosFiltrados.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><strong>${producto.nombre}</strong></td>
      <td>
        <span class="badge-tipo ${producto.tipo}">
          <i class="fas ${producto.tipo === 'perecible' ? 'fa-apple-alt' : 'fa-box'}"></i>
          ${producto.tipo === 'perecible' ? 'Perecible' : 'No Perecible'}
        </span>
      </td>
      <td>${formatearFecha(producto.fechaIngreso)}</td>
      <td>${producto.fechaCaducidad ? formatearFecha(producto.fechaCaducidad) : '-'}</td>
      <td><strong>${producto.cantidad}</strong></td>
      <td>${producto.unidad}</td>
      <td>S/ ${producto.precio.toFixed(2)}</td>
      <td>${obtenerEstadoProducto(producto)}</td>
      <td class="acciones">
        <button class="btn-accion btn-editar" onclick="editarProducto(${producto.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-accion btn-eliminar" onclick="eliminarProducto(${producto.id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

// Filtrar inventario
function filtrarInventario() {
  let productos = [...inventario];
  const busqueda = document.getElementById('buscar').value.toLowerCase();
  
  // Filtrar por búsqueda
  if (busqueda) {
    productos = productos.filter(p => 
      p.nombre.toLowerCase().includes(busqueda) ||
      p.tipo.toLowerCase().includes(busqueda) ||
      p.unidad.toLowerCase().includes(busqueda)
    );
  }
  
  // Filtrar por tipo
  switch (filtroActual) {
    case 'perecible':
      productos = productos.filter(p => p.tipo === 'perecible');
      break;
    case 'no-perecible':
      productos = productos.filter(p => p.tipo === 'no-perecible');
      break;
    case 'por-vencer':
      productos = productos.filter(p => {
        if (!p.fechaCaducidad) return false;
        const diasRestantes = calcularDiasRestantes(p.fechaCaducidad);
        return diasRestantes <= 7 && diasRestantes > 0;
      });
      break;
    case 'bajo-stock':
      productos = productos.filter(p => p.cantidad <= p.stockMinimo);
      break;
  }
  
  return productos;
}

// Cambiar filtro
function cambiarFiltro(e) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  filtroActual = e.target.dataset.filter;
  mostrarInventario();
}

// Filtrar productos (búsqueda)
function filtrarProductos() {
  mostrarInventario();
}

// Obtener estado del producto
function obtenerEstadoProducto(producto) {
  let estados = [];
  
  // Verificar stock
  if (producto.cantidad <= producto.stockMinimo) {
    estados.push('<span class="estado-bajo-stock"><i class="fas fa-exclamation-triangle"></i> Bajo Stock</span>');
  }
  
  // Verificar caducidad (solo para perecibles)
  if (producto.fechaCaducidad) {
    const diasRestantes = calcularDiasRestantes(producto.fechaCaducidad);
    
    if (diasRestantes < 0) {
      estados.push('<span class="estado-vencido"><i class="fas fa-times-circle"></i> Vencido</span>');
    } else if (diasRestantes <= 7) {
      estados.push('<span class="estado-por-vencer"><i class="fas fa-clock"></i> Por Vencer</span>');
    }
  }
  
  if (estados.length === 0) {
    estados.push('<span class="estado-normal"><i class="fas fa-check-circle"></i> Normal</span>');
  }
  
  return estados.join('<br>');
}

// Calcular días restantes
function calcularDiasRestantes(fechaCaducidad) {
  const hoy = new Date();
  const caducidad = new Date(fechaCaducidad);
  const diferencia = caducidad - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

// Formatear fecha
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Editar producto
function editarProducto(id) {
  const producto = inventario.find(p => p.id === id);
  if (!producto) return;
  
  productoEditando = id;
  
  // Llenar formulario de edición
  document.getElementById('edit-nombre').value = producto.nombre;
  document.getElementById('edit-tipo').value = producto.tipo;
  document.getElementById('edit-cantidad').value = producto.cantidad;
  document.getElementById('edit-unidad').value = producto.unidad;
  document.getElementById('edit-fecha-ingreso').value = producto.fechaIngreso;
  document.getElementById('edit-fecha-caducidad').value = producto.fechaCaducidad || '';
  document.getElementById('edit-stock-minimo').value = producto.stockMinimo;
  document.getElementById('edit-precio').value = producto.precio;
  
  // Mostrar/ocultar campo de caducidad
  toggleCaducidadEdit();
  
  // Mostrar modal
  document.getElementById('modal-editar').style.display = 'block';
}

// Actualizar producto
function actualizarProducto(e) {
  e.preventDefault();
  
  if (!productoEditando) return;
  
  const nombre = document.getElementById('edit-nombre').value.trim();
  const tipo = document.getElementById('edit-tipo').value;
  const cantidad = parseFloat(document.getElementById('edit-cantidad').value);
  const unidad = document.getElementById('edit-unidad').value;
  const fechaIngreso = document.getElementById('edit-fecha-ingreso').value;
  const fechaCaducidad = document.getElementById('edit-fecha-caducidad').value;
  const stockMinimo = parseFloat(document.getElementById('edit-stock-minimo').value) || 5;
  const precio = parseFloat(document.getElementById('edit-precio').value) || 0;
  
  // Validaciones
  if (!nombre || !tipo || !cantidad || !unidad || !fechaIngreso) {
    mostrarNotificacion('Por favor completa todos los campos obligatorios', 'error');
    return;
  }
  
  if (tipo === 'perecible' && !fechaCaducidad) {
    mostrarNotificacion('La fecha de caducidad es obligatoria para productos perecibles', 'error');
    return;
  }
  
  if (tipo === 'perecible' && fechaCaducidad <= fechaIngreso) {
    mostrarNotificacion('La fecha de caducidad debe ser posterior a la fecha de ingreso', 'error');
    return;
  }
  
  // Actualizar producto
  const indice = inventario.findIndex(p => p.id === productoEditando);
  if (indice !== -1) {
    inventario[indice] = {
      ...inventario[indice],
      nombre,
      tipo,
      cantidad,
      unidad,
      fechaIngreso,
      fechaCaducidad: tipo === 'perecible' ? fechaCaducidad : null,
      stockMinimo,
      precio
    };
    
    guardarInventario();
    mostrarInventario();
    actualizarEstadisticas();
    cerrarModal();
    
    mostrarNotificacion(`Producto "${nombre}" actualizado exitosamente`, 'exito');
  }
}

// Eliminar producto
function eliminarProducto(id) {
  const producto = inventario.find(p => p.id === id);
  if (!producto) return;
  
  if (confirm(`¿Estás seguro de que deseas eliminar "${producto.nombre}"?`)) {
    inventario = inventario.filter(p => p.id !== id);
    guardarInventario();
    mostrarInventario();
    actualizarEstadisticas();
    
    mostrarNotificacion(`Producto "${producto.nombre}" eliminado`, 'exito');
  }
}

// Cerrar modal
function cerrarModal() {
  document.getElementById('modal-editar').style.display = 'none';
  productoEditando = null;
}

// Actualizar estadísticas
function actualizarEstadisticas() {
  const totalPerecibles = inventario.filter(p => p.tipo === 'perecible').length;
  const totalNoPerecibles = inventario.filter(p => p.tipo === 'no-perecible').length;
  
  let porVencer = 0;
  let bajoStock = 0;
  
  inventario.forEach(producto => {
    // Contar productos por vencer
    if (producto.fechaCaducidad) {
      const diasRestantes = calcularDiasRestantes(producto.fechaCaducidad);
      if (diasRestantes <= 7 && diasRestantes > 0) {
        porVencer++;
      }
    }
    
    // Contar productos con bajo stock
    if (producto.cantidad <= producto.stockMinimo) {
      bajoStock++;
    }
  });
  
  document.getElementById('total-perecibles').textContent = totalPerecibles;
  document.getElementById('total-no-perecibles').textContent = totalNoPerecibles;
  document.getElementById('por-vencer').textContent = porVencer;
  document.getElementById('bajo-stock').textContent = bajoStock;
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'exito') {
  const contenedor = document.getElementById('notificaciones');
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion ${tipo}`;
  
  const icono = tipo === 'exito' ? 'fa-check-circle' : 
               tipo === 'error' ? 'fa-times-circle' : 'fa-exclamation-triangle';
  
  notificacion.innerHTML = `
    <i class="fas ${icono}"></i>
    ${mensaje}
  `;
  
  contenedor.appendChild(notificacion);
  
  // Remover después de 4 segundos
  setTimeout(() => {
    if (notificacion.parentNode) {
      notificacion.parentNode.removeChild(notificacion);
    }
  }, 4000);
}

// Guardar inventario
function guardarInventario() {
  // En un entorno real, aquí harías una llamada al servidor
  // Por ahora, simularemos con un almacenamiento temporal en memoria
  console.log('Inventario guardado:', inventario);
}

// Cargar inventario
function cargarInventario() {
  // Datos de ejemplo para demostración
  inventario = [
    {
      id: 1,
      nombre: 'Leche Entera',
      tipo: 'perecible',
      cantidad: 5,
      unidad: 'Litros',
      fechaIngreso: '2025-06-01',
      fechaCaducidad: '2025-06-10',
      stockMinimo: 3,
      precio: 4.50,
      fechaCreacion: new Date().toISOString()
    },
    {
      id: 2,
      nombre: 'Harina de Trigo',
      tipo: 'no-perecible',
      cantidad: 10,
      unidad: 'Kilos',
      fechaIngreso: '2025-06-01',
      fechaCaducidad: null,
      stockMinimo: 5,
      precio: 3.20,
      fechaCreacion: new Date().toISOString()
    },
    {
      id: 3,
      nombre: 'Yogurt Natural',
      tipo: 'perecible',
      cantidad: 2,
      unidad: 'Unidades',
      fechaIngreso: '2025-06-02',
      fechaCaducidad: '2025-06-08',
      stockMinimo: 5,
      precio: 6.00,
      fechaCreacion: new Date().toISOString()
    }
  ];
  
  mostrarInventario();
}

// NUEVA FUNCIÓN PARA REDUCIR STOCK
function reducirStock(productId, quantityToReduce) {
  const producto = inventario.find(p => p.id === productId);

  if (!producto) {
    mostrarNotificacion(`Error: Producto con ID ${productId} no encontrado.`, 'error');
    return false;
  }

  if (producto.cantidad < quantityToReduce) {
    mostrarNotificacion(`Advertencia: No hay suficiente stock de "${producto.nombre}". Stock actual: ${producto.cantidad} ${producto.unidad}.`, 'warning');
    return false;
  }

  producto.cantidad -= quantityToReduce;
  guardarInventario();
  mostrarInventario();
  actualizarEstadisticas();
  mostrarNotificacion(`Stock de "${producto.nombre}" reducido en ${quantityToReduce} ${producto.unidad}. Nuevo stock: ${producto.cantidad} ${producto.unidad}.`, 'exito');
  return true;
}

// Opcional: Exponer la función globalmente si se necesita llamar desde otro script en el mismo contexto
window.reducirStock = reducirStock;