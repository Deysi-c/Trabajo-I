document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const formReceta = document.getElementById('form-receta');
    const recetaIdInput = document.getElementById('receta-id');
    const nombreRecetaInput = document.getElementById('nombre-receta');
    const porcionesBaseInput = document.getElementById('porciones-base');
    const costoBaseInput = document.getElementById('costo-base');
    const preparacionRecetaInput = document.getElementById('preparacion-receta');

    const ingredientesContainer = document.getElementById('ingredientes-container');
    const btnAddIngrediente = document.getElementById('btn-add-ingrediente');
    
    const selectReceta = document.getElementById('select-receta');
    const calculadoraContainer = document.getElementById('calculadora-container');
    const resultadoContainer = document.getElementById('resultado-container');
    const resultadoContenido = document.getElementById('resultado-contenido');
    const btnCalcular = document.getElementById('btn-calcular');
    const listaRecetasDiv = document.getElementById('lista-recetas');

    // Cargar recetas desde localStorage o inicializar un array vacío
    let recetasGuardadas = JSON.parse(localStorage.getItem('recetas')) || [];

    // --- FUNCIONES ---

    const anadirCampoIngrediente = (nombre = '', cantidad = '', unidad = '') => {
        const div = document.createElement('div');
        div.classList.add('ingrediente-fila');
        div.innerHTML = `
            <input type="text" placeholder="Nombre del Ingrediente" class="ingrediente-nombre" value="${nombre}" required>
            <input type="number" placeholder="Cant." min="0" step="any" class="ingrediente-cantidad" value="${cantidad}" required>
            <input type="text" placeholder="Unidad (ej: gr, ml, ud)" class="ingrediente-unidad" value="${unidad}" required>
            <button type="button" class="btn btn-danger btn-remove">-</button>
        `;
        ingredientesContainer.appendChild(div);

        div.querySelector('.btn-remove').addEventListener('click', () => {
            div.remove();
        });
    };
    
    const guardarReceta = (e) => {
        e.preventDefault();
        
        const ingredientes = [];
        const filasIngredientes = ingredientesContainer.querySelectorAll('.ingrediente-fila');

        for (const fila of filasIngredientes) {
            ingredientes.push({
                nombre: fila.querySelector('.ingrediente-nombre').value,
                cantidad: parseFloat(fila.querySelector('.ingrediente-cantidad').value),
                unidad: fila.querySelector('.ingrediente-unidad').value,
            });
        }
        
        const nuevaReceta = {
            id: recetaIdInput.value ? parseInt(recetaIdInput.value) : Date.now(),
            nombre: nombreRecetaInput.value,
            porcionesBase: parseInt(porcionesBaseInput.value),
            costoBase: parseFloat(costoBaseInput.value), // New cost field
            ingredientes: ingredientes,
            preparacion: preparacionRecetaInput.value 
        };

        if (recetaIdInput.value) {
            // Editing existing recipe
            const index = recetasGuardadas.findIndex(rec => rec.id === nuevaReceta.id);
            if (index !== -1) {
                recetasGuardadas[index] = nuevaReceta;
                alert('¡Receta actualizada con éxito!');
            }
        } else {
            // Adding new recipe
            recetasGuardadas.push(nuevaReceta);
            alert('¡Receta guardada con éxito!');
        }
        
        localStorage.setItem('recetas', JSON.stringify(recetasGuardadas));
        
        formReceta.reset();
        recetaIdInput.value = ''; // Clear ID after saving/updating
        ingredientesContainer.innerHTML = '';
        anadirCampoIngrediente(); // Add one empty ingredient field
        poblarSelectRecetas();
        mostrarListaRecetas();
    };

    const poblarSelectRecetas = () => {
        selectReceta.innerHTML = '<option value="">-- Elige una receta guardada --</option>';
        recetasGuardadas.forEach((receta, index) => {
            const option = document.createElement('option');
            option.value = index; // Use index for quick access in array
            option.textContent = receta.nombre;
            selectReceta.appendChild(option);
        });
    };

    const manejarSeleccionReceta = () => {
        if (selectReceta.value) {
            calculadoraContainer.classList.remove('hidden');
        } else {
            calculadoraContainer.classList.add('hidden');
            resultadoContainer.classList.add('hidden');
        }
    };
    
    const calcularPorciones = () => {
        const recetaIndex = selectReceta.value;
        if (recetaIndex === '') return;

        const receta = recetasGuardadas[recetaIndex];
        const nuevasPorciones = parseInt(document.getElementById('nuevas-porciones').value);

        if (!nuevasPorciones || nuevasPorciones < 1) {
            alert('Por favor, introduce un número válido de porciones.');
            return;
        }
        
        const factor = nuevasPorciones / receta.porcionesBase;
        
        // 1. HTML para los ingredientes
        let ingredientesHtml = `<h3>Ingredientes Necesarios para ${nuevasPorciones} porciones:</h3><ul id="resultado-ingredientes">`;
        receta.ingredientes.forEach(ing => {
            const nuevaCantidad = ing.cantidad * factor;
            const cantidadFormateada = Number.isInteger(nuevaCantidad) ? nuevaCantidad : nuevaCantidad.toFixed(2);
            ingredientesHtml += `<li>${cantidadFormateada} ${ing.unidad} de ${ing.nombre}</li>`;
        });
        ingredientesHtml += '</ul>';

        // 2. HTML para la preparación (si existe)
        let preparacionHtml = '';
        if (receta.preparacion && receta.preparacion.trim() !== '') {
            preparacionHtml = `
                <div id="resultado-preparacion">
                    <h3>Preparación de la Receta</h3>
                    <p>${receta.preparacion}</p>
                </div>
            `;
        }
        
        // 3. HTML para el resumen financiero
        const costoCalculado = receta.costoBase * factor;
        const costoPorPorcion = costoCalculado / nuevasPorciones;

        const financieroHtml = `
            <div id="resultado-financiero">
                <h3>Resumen Financiero para ${nuevasPorciones} porciones:</h3>
                <p>Costo Total de Producción: <span>S/${costoCalculado.toFixed(2)}</span></p>
                <p>Costo por Porción: <span>S/${costoPorPorcion.toFixed(2)}</span></p>
            </div>
        `;

        // Se combinan todas las partes y se muestran
        resultadoContenido.innerHTML = ingredientesHtml + preparacionHtml + financieroHtml;
        resultadoContainer.classList.remove('hidden');
    };

    const mostrarListaRecetas = () => {
        listaRecetasDiv.innerHTML = '';
        if (recetasGuardadas.length === 0) {
            listaRecetasDiv.innerHTML = '<p>No hay recetas guardadas aún.</p>';
            return;
        }

        recetasGuardadas.forEach(receta => {
            const div = document.createElement('div');
            div.classList.add('receta-item');
            div.innerHTML = `
                <span>${receta.nombre} (${receta.porcionesBase} porciones)</span>
                <div class="receta-actions">
                    <button class="btn btn-primary btn-edit" data-id="${receta.id}">Editar</button>
                    <button class="btn btn-danger btn-delete" data-id="${receta.id}">Eliminar</button>
                </div>
            `;
            listaRecetasDiv.appendChild(div);
        });

        // Add event listeners for edit and delete buttons
        listaRecetasDiv.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', (e) => editarReceta(parseInt(e.target.dataset.id)));
        });

        listaRecetasDiv.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => eliminarReceta(parseInt(e.target.dataset.id)));
        });
    };

    const editarReceta = (id) => {
        const receta = recetasGuardadas.find(rec => rec.id === id);
        if (!receta) return;

        // Populate the form fields
        recetaIdInput.value = receta.id;
        nombreRecetaInput.value = receta.nombre;
        porcionesBaseInput.value = receta.porcionesBase;
        costoBaseInput.value = receta.costoBase;
        preparacionRecetaInput.value = receta.preparacion;

        // Clear existing ingredient fields
        ingredientesContainer.innerHTML = '';
        // Add ingredient fields with existing data
        receta.ingredientes.forEach(ing => {
            anadirCampoIngrediente(ing.nombre, ing.cantidad, ing.unidad);
        });

        // Scroll to the form
        formReceta.scrollIntoView({ behavior: 'smooth' });
    };

    const eliminarReceta = (id) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
            recetasGuardadas = recetasGuardadas.filter(receta => receta.id !== id);
            localStorage.setItem('recetas', JSON.stringify(recetasGuardadas));
            poblarSelectRecetas();
            mostrarListaRecetas();
            // Hide calculation results if the deleted recipe was selected
            if (selectReceta.value === String(id)) {
                calculadoraContainer.classList.add('hidden');
                resultadoContainer.classList.add('hidden');
            }
        }
    };

    // --- EVENT LISTENERS ---
    formReceta.addEventListener('submit', guardarReceta);
    btnAddIngrediente.addEventListener('click', anadirCampoIngrediente);
    selectReceta.addEventListener('change', manejarSeleccionReceta);
    btnCalcular.addEventListener('click', calcularPorciones);

    // --- INICIALIZACIÓN ---
    anadirCampoIngrediente(); // Add one empty ingredient field on load
    poblarSelectRecetas();
    mostrarListaRecetas();

    // Responsive navigation toggle
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");

    navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("nav-menu_visible");

        if (navMenu.classList.contains("nav-menu_visible")) {
            navToggle.setAttribute("aria-label", "Cerrar menú");
        } else {
            navToggle.setAttribute("aria-label", "Abrir menú");
        }
    });
});