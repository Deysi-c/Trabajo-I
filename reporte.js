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
        { producto: 'Cupcake de mago', ventas: 6890, unidades: 98 }
    ]
};

// Función para formatear números
function formatNumber(num) {
    return num.toLocaleString('es-ES');
}

// Función para actualizar los datos en el DOM
function updateReportData() {
    // Actualizar métricas principales
    document.getElementById('unidadesProducidas').textContent = formatNumber(reportData.unidadesProducidas);
    document.getElementById('costosTotales').textContent = formatNumber(reportData.costosTotales);
    document.getElementById('ventasTotales').textContent = formatNumber(reportData.ventasTotales);
    document.getElementById('ganancias').textContent = formatNumber(reportData.ganancias);
    document.getElementById('totalIngredientes').textContent = formatNumber(reportData.totalIngredientes);

    // Encontrar producto más y menos vendido
    const sortedProducts = [...reportData.ventasDelMes].sort((a, b) => b.unidades - a.unidades);
    const masVendido = sortedProducts[0];
    const menosVendido = sortedProducts[sortedProducts.length - 1];

    // Actualizar productos destacados
    document.getElementById('mejorProducto').textContent = masVendido.producto;
    document.querySelector('.best-seller .product-sales').textContent = `${masVendido.unidades} unidades`;
    
    document.getElementById('peorProducto').textContent = menosVendido.producto;
    document.querySelector('.worst-seller .product-sales').textContent = `${menosVendido.unidades} unidades`;

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

// Función para exportar a Excel (CSV)
function exportToExcel() {
    let csvContent = "Reporte de Ventas\n\n";
    csvContent += "Métricas Principales\n";
    csvContent += "Concepto,Valor\n";
    csvContent += `Unidades Producidas,${reportData.unidadesProducidas}\n`;
    csvContent += `Costos Totales,S/ ${reportData.costosTotales}\n`;
    csvContent += `Ventas Totales,S/ ${reportData.ventasTotales}\n`;
    csvContent += `Ganancias,S/ ${reportData.ganancias}\n`;
    csvContent += `Total Ingredientes,${reportData.totalIngredientes}\n\n`;
    
    csvContent += "Ventas del Mes\n";
    csvContent += "Producto,Ventas,Unidades\n";
    reportData.ventasDelMes.forEach(item => {
        csvContent += `${item.producto},S/ ${item.ventas},${item.unidades}\n`;
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
    
    showNotification('Reporte Excel descargado exitosamente', 'success');
}

// Función para exportar a PDF
function exportToPDF() {
    const button = document.getElementById('exportPDF');
    const originalText = button.innerHTML;
    
    // Mostrar estado de carga
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando PDF...';
    button.disabled = true;
    
    // Verificar si jsPDF está disponible
    if (typeof window.jspdf === 'undefined') {
        showNotification('Error: Librería PDF no disponible', 'error');
        button.innerHTML = originalText;
        button.disabled = false;
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Configuración
        const margin = 20;
        let yPosition = 30;
        
        // Título
        pdf.setFontSize(20);
        pdf.setTextColor(123, 31, 162);
        pdf.text('Reporte de Ventas', margin, yPosition);
        
        // Fecha
        yPosition += 15;
        pdf.setFontSize(12);
        pdf.setTextColor(102, 102, 102);
        const fecha = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        pdf.text(`Generado el ${fecha}`, margin, yPosition);
        
        // Línea divisoria
        yPosition += 10;
        pdf.setDrawColor(123, 31, 162);
        pdf.line(margin, yPosition, 190, yPosition);
        
        // Métricas principales
        yPosition += 20;
        pdf.setFontSize(16);
        pdf.setTextColor(123, 31, 162);
        pdf.text('Métricas Principales', margin, yPosition);
        
        yPosition += 15;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        
        const metrics = [
            ['Unidades Producidas:', `${formatNumber(reportData.unidadesProducidas)} unidades`],
            ['Costos Totales:', `S/ ${formatNumber(reportData.costosTotales)}`],
            ['Ventas Totales:', `S/ ${formatNumber(reportData.ventasTotales)}`],
            ['Ganancias:', `S/ ${formatNumber(reportData.ganancias)}`],
            ['Total Ingredientes:', `${formatNumber(reportData.totalIngredientes)} ingredientes`]
        ];
        
        metrics.forEach(([label, value]) => {
            pdf.text(label, margin + 5, yPosition);
            pdf.text(value, margin + 80, yPosition);
            yPosition += 10;
        });
        
        // Ventas del mes
        yPosition += 15;
        pdf.setFontSize(16);
        pdf.setTextColor(123, 31, 162);
        pdf.text('Ventas del Mes', margin, yPosition);
        
        yPosition += 15;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        
        // Encabezados
        pdf.text('Producto', margin + 5, yPosition);
        pdf.text('Ventas', margin + 80, yPosition);
        pdf.text('Unidades', margin + 130, yPosition);
        
        yPosition += 5;
        pdf.line(margin, yPosition, 190, yPosition);
        yPosition += 10;
        
        // Datos
        reportData.ventasDelMes.forEach(item => {
            pdf.text(item.producto, margin + 5, yPosition);
            pdf.text(`S/ ${formatNumber(item.ventas)}`, margin + 80, yPosition);
            pdf.text(`${item.unidades}`, margin + 130, yPosition);
            yPosition += 10;
        });
        
        // Productos destacados
        yPosition += 15;
        pdf.setFontSize(16);
        pdf.setTextColor(123, 31, 162);
        pdf.text('Productos Destacados', margin, yPosition);
        
        yPosition += 15;
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        
        const sortedProducts = [...reportData.ventasDelMes].sort((a, b) => b.unidades - a.unidades);
        const masVendido = sortedProducts[0];
        const menosVendido = sortedProducts[sortedProducts.length - 1];
        
        pdf.text('Más Vendido:', margin + 5, yPosition);
        pdf.text(`${masVendido.producto} (${masVendido.unidades} unidades)`, margin + 5, yPosition + 8);
        
        yPosition += 25;
        pdf.text('Menos Vendido:', margin + 5, yPosition);
        pdf.text(`${menosVendido.producto} (${menosVendido.unidades} unidades)`, margin + 5, yPosition + 8);
        
        // Pie de página
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Reporte generado por COST AND PLANNER', margin, 280);
        
        // Descargar
        const nombreArchivo = `reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(nombreArchivo);
        
        showNotification('Reporte PDF descargado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al generar PDF:', error);
        showNotification('Error al generar PDF: ' + error.message, 'error');
    } finally {
        // Restaurar botón
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        background: colors[type] || colors.info,
        fontWeight: '600',
        zIndex: '1000',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        transform: 'translateX(300px)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para animar números
function animateNumbers() {
    const numbers = document.querySelectorAll('.number');
    
    numbers.forEach(numberElement => {
        const finalValue = parseInt(numberElement.textContent.replace(/,/g, ''));
        const duration = 1000;
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(finalValue * progress);
            
            numberElement.textContent = formatNumber(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        numberElement.textContent = '0';
        requestAnimationFrame(updateNumber);
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    updateReportData();
    
    // Animar números después de cargar
    setTimeout(animateNumbers, 300);
    
    // Event listeners para botones
    document.getElementById('exportExcel').addEventListener('click', exportToExcel);
    document.getElementById('exportPDF').addEventListener('click', exportToPDF);
});
