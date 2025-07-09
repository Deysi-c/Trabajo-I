// Datos del reporte
const reportData = {
    unidadesProducidas: 1250,
    costosTotales: 45890,
    ventasTotales: 78340,
    ganancias: 32450,
    totalIngredientes: 247,
    ventasDelMes: [
        { producto: 'Torta de chocolate', ventas: 12340, unidades: 156 },
        { producto: 'Cupcake de Café', ventas: 8750, unidades: 142 },
        { producto: 'Cupcake de mago', ventas: 6890, unidades: 98 },
    ]
};

// Función para formatear números con comas
function formatNumber(num) {
    return num.toLocaleString('es-ES');
}

// Función para encontrar el producto más y menos vendido
function getProductHighlights() {
    const sortedByUnits = [...reportData.ventasDelMes].sort((a, b) => b.unidades - a.unidades);
    return {
        masVendido: sortedByUnits[0],
        menosVendido: sortedByUnits[sortedByUnits.length - 1]
    };
}

// Función para actualizar los datos en el DOM
function updateReportData() {
    // Actualizar métricas principales
    document.getElementById('unidadesProducidas').textContent = formatNumber(reportData.unidadesProducidas);
    document.getElementById('costosTotales').textContent = formatNumber(reportData.costosTotales);
    document.getElementById('ventasTotales').textContent = formatNumber(reportData.ventasTotales);
    document.getElementById('ganancias').textContent = formatNumber(reportData.ganancias);
    document.getElementById('totalIngredientes').textContent = formatNumber(reportData.totalIngredientes);

    // Actualizar productos destacados
    const highlights = getProductHighlights();
    document.getElementById('mejorProducto').textContent = highlights.masVendido.producto;
    document.querySelector('.best-seller .product-sales').textContent = `${highlights.masVendido.unidades} unidades`;
    
    document.getElementById('peorProducto').textContent = highlights.menosVendido.producto;
    document.querySelector('.worst-seller .product-sales').textContent = `${highlights.menosVendido.unidades} unidades`;

    // Actualizar fecha del reporte
    const now = new Date();
    const fechaFormateada = now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('fechaReporte').textContent = fechaFormateada;
}

// Función para exportar a Excel (simulada)
function exportToExcel() {
    // Crear contenido CSV
    let csvContent = "Reporte de Ventas\n\n";
    csvContent += "Métricas Principales\n";
    csvContent += "Concepto,Valor\n";
    csvContent += `Unidades Producidas,${reportData.unidadesProducidas}\n`;
    csvContent += `Costos Totales,$${reportData.costosTotales}\n`;
    csvContent += `Ventas Totales,$${reportData.ventasTotales}\n`;
    csvContent += `Ganancias,$${reportData.ganancias}\n`;
    csvContent += `Total Ingredientes,${reportData.totalIngredientes}\n\n`;
    
    csvContent += "Ventas del Mes\n";
    csvContent += "Producto,Ventas ($),Unidades\n";
    reportData.ventasDelMes.forEach(item => {
        csvContent += `${item.producto},$${item.ventas},${item.unidades}\n`;
    });

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar mensaje de confirmación
    showNotification('Reporte Excel descargado exitosamente', 'success');
}

// Función para exportar a PDF (simulada)
function exportToPDF() {
    // Simular la generación de PDF
    const reportContent = {
        title: 'Reporte de Ventas',
        date: new Date().toLocaleDateString('es-ES'),
        metrics: {
            unidadesProducidas: reportData.unidadesProducidas,
            costosTotales: reportData.costosTotales,
            ventasTotales: reportData.ventasTotales,
            ganancias: reportData.ganancias,
            totalIngredientes: reportData.totalIngredientes
        },
        sales: reportData.ventasDelMes,
        highlights: getProductHighlights()
    };

    // En una implementación real, aquí usarías una librería como jsPDF
    console.log('Contenido del PDF:', reportContent);
    
    // Simular descarga
    showNotification('Reporte PDF generado exitosamente', 'success');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });

    // Color según el tipo
    if (type === 'success') {
        notification.style.background = '#9CAF88';
    } else if (type === 'error') {
        notification.style.background = '#FF4444';
    } else {
        notification.style.background = '#FF8C42';
    }

    document.body.appendChild(notification);

    // Animación de entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para animar los números
function animateNumbers() {
    const numbers = document.querySelectorAll('.number');
    
    numbers.forEach(numberElement => {
        const finalValue = parseInt(numberElement.textContent.replace(/,/g, ''));
        const duration = 1500; // 1.5 segundos
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Función de easing
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(finalValue * easeOutQuart);
            
            numberElement.textContent = formatNumber(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                numberElement.textContent = formatNumber(finalValue);
            }
        }
        
        // Iniciar desde 0
        numberElement.textContent = '0';
        requestAnimationFrame(updateNumber);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar datos del reporte
    updateReportData();
    
    // Animar números después de un pequeño delay
    setTimeout(animateNumbers, 500);
    
    // Botones de exportación
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
});

// Función para actualizar datos en tiempo real (simulada)
function updateRealTimeData() {
    // Simular cambios pequeños en los datos
    const variations = {
        unidadesProducidas: Math.floor(Math.random() * 10) - 5,
        costosTotales: Math.floor(Math.random() * 1000) - 500,
        ventasTotales: Math.floor(Math.random() * 2000) - 1000,
        totalIngredientes: Math.floor(Math.random() * 5) - 2
    };
    
    // Aplicar variaciones
    Object.keys(variations).forEach(key => {
        if (reportData[key]) {
            reportData[key] = Math.max(0, reportData[key] + variations[key]);
        }
    });
    
    // Recalcular ganancias
    reportData.ganancias = reportData.ventasTotales - reportData.costosTotales;
    
    // Actualizar display
    updateReportData();
}

// Actualizar datos cada 30 segundos (opcional)
// setInterval(updateRealTimeData, 30000);

// Función para refrescar el reporte
function refreshReport() {
    showNotification('Actualizando reporte...', 'info');
    
    setTimeout(() => {
        updateRealTimeData();
        animateNumbers();
        showNotification('Reporte actualizado exitosamente', 'success');
    }, 1000);
}

// Agregar botón de refrescar (opcional)
document.addEventListener('DOMContentLoaded', function() {
    const refreshButton = document.createElement('button');
    refreshButton.textContent = '🔄 Actualizar';
    refreshButton.className = 'btn-export';
    refreshButton.style.background = '#FF8C42';
    refreshButton.style.color = 'white';
    refreshButton.addEventListener('click', refreshReport);
    
    document.querySelector('.export-buttons').appendChild(refreshButton);
});