document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const monthYearDisplay = document.getElementById('month-year');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const addEventBtn = document.getElementById('addEventBtn');

    const eventModal = document.getElementById('eventModal');
    const closeModalBtn = eventModal.querySelector('.close-button');
    const modalTitle = document.getElementById('modal-title');

    // Elementos del formulario (agregar/editar)
    const eventFormSection = document.getElementById('event-form');
    const eventDateDisplay = document.getElementById('event-date-display');
    const eventTitleInput = document.getElementById('event-title');
    const eventPlaceInput = document.getElementById('event-place');
    const eventDescriptionInput = document.getElementById('event-description');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const updateEventBtn = document.getElementById('updateEventBtn');

    // Elementos de la vista de detalles
    const eventDetailsViewSection = document.getElementById('event-details-view');
    const viewTitle = document.getElementById('view-title');
    const viewPlace = document.getElementById('view-place');
    const viewDescription = document.getElementById('view-description');
    const markCompletedBtn = document.getElementById('markCompletedBtn');
    const editEventBtn = document.getElementById('editEventBtn');
    const deleteEventBtn = document.getElementById('deleteEventBtn');

    // --- Variables de Estado ---
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null; // Almacena la fecha con la que se está interactuando (para agregar/ver)
    let currentEditingEventId = null; // Almacena el ID del evento que se está editando

    // --- Almacenamiento de Datos (usando localStorage para persistencia) ---
    // Estructura: { 'YYYY-MM-DD': [{ id: 'uuid', title: '', place: '', description: '', completed: false }, ...] }
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};

    function saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }

    // --- Generación del Calendario ---
    function generateCalendar() {
        calendarDaysGrid.innerHTML = ''; // Limpiar días anteriores
        monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' });

        // Ajustar el primer día de la semana para que sea Lunes (getDay() retorna 0 para Domingo)
        // Si getDay() es 0 (Domingo), queremos que sea 6 (último día de la semana anterior para Lunes-Domingo)
        // Si getDay() es 1 (Lunes), queremos que sea 0 (primer día de la semana)
        let firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        firstDayOfMonth = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // Ajuste para que 0 sea Lunes

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Añadir celdas vacías para los días antes del 1 del mes
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty-day');
            calendarDaysGrid.appendChild(emptyDay);
        }

        // Añadir los días reales del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayElement = document.createElement('div');
            dayElement.classList.add('calendar-day');
            dayElement.dataset.date = dateString; // Almacenar la cadena de fecha para fácil búsqueda

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);

            // Resaltar el día actual
            const today = new Date();
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayElement.classList.add('current-day');
            }

            // Añadir eventos para este día
            if (events[dateString]) {
                events[dateString].forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.classList.add('event-item');
                    eventItem.textContent = event.title;
                    eventItem.dataset.eventId = event.id; // Almacenar ID del evento
                    eventItem.dataset.eventDate = dateString; // Almacenar fecha del evento para búsqueda

                    if (event.completed) {
                        eventItem.classList.add('completed');
                    }

                    eventItem.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevenir el clic en el día detrás
                        openViewEventModal(event.id, dateString);
                    });
                    dayElement.appendChild(eventItem);
                });
            }

            dayElement.addEventListener('click', () => openAddEventModal(dateString));
            calendarDaysGrid.appendChild(dayElement);
        }
    }

    // --- Funciones del Modal ---

    function openModal() {
        eventModal.style.display = 'block';
    }

    function closeModal() {
        eventModal.style.display = 'none';
        resetModalForm();
    }

    function resetModalForm() {
        eventTitleInput.value = '';
        eventPlaceInput.value = '';
        eventDescriptionInput.value = '';
        eventDateDisplay.value = '';
        currentEditingEventId = null;

        eventFormSection.style.display = 'block';
        eventDetailsViewSection.style.display = 'none';
        saveEventBtn.style.display = 'block';
        updateEventBtn.style.display = 'none';
        modalTitle.textContent = ''; // Reiniciar título
    }

    function openAddEventModal(dateString) {
        selectedDate = dateString;
        modalTitle.textContent = 'Agregar Nuevo Pedido/Evento';

        // Descomponer la fecha 'YYYY-MM-DD'
        const [year, month, day] = dateString.split('-').map(Number);
        // Crear la fecha en la zona horaria local
        const displayDate = new Date(year, month - 1, day); // Mes es 0-indexado

        eventDateDisplay.value = displayDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        openModal();
    }

    function openViewEventModal(eventId, dateString) {
        selectedDate = dateString;
        currentEditingEventId = eventId;
        const event = events[dateString].find(e => e.id === eventId);

        if (!event) {
            console.error('Evento no encontrado para ver:', eventId, dateString);
            return;
        }

        modalTitle.textContent = 'Detalles del Pedido/Evento';
        eventFormSection.style.display = 'none';
        eventDetailsViewSection.style.display = 'block';

        viewTitle.textContent = event.title;
        viewPlace.textContent = event.place;
        viewDescription.textContent = event.description;

        // Actualizar el estado del botón de marcar como completado
        if (event.completed) {
            markCompletedBtn.textContent = 'Desmarcar como Entregado';
            markCompletedBtn.classList.add('unmark');
            markCompletedBtn.classList.remove('mark');
        } else {
            markCompletedBtn.textContent = 'Marcar como Entregado';
            markCompletedBtn.classList.add('mark');
            markCompletedBtn.classList.remove('unmark');
        }

        openModal();
    }

    function openEditEventModal(eventId, dateString) {
        selectedDate = dateString;
        currentEditingEventId = eventId;
        const event = events[dateString].find(e => e.id === eventId);

        if (!event) {
            console.error('Evento no encontrado para editar:', eventId, dateString);
            return;
        }

        modalTitle.textContent = 'Editar Pedido/Evento';
        eventFormSection.style.display = 'block';
        eventDetailsViewSection.style.display = 'none';
        saveEventBtn.style.display = 'none';
        updateEventBtn.style.display = 'block';

        // Corrección: Usar la dateString proporcionada para formatear la fecha mostrada en el input
        // Descomponer la fecha 'YYYY-MM-DD'
        const [year, month, day] = dateString.split('-').map(Number);
        // Crear la fecha en la zona horaria local
        const displayDate = new Date(year, month - 1, day); // Mes es 0-indexado
        eventDateDisplay.value = displayDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        
        eventTitleInput.value = event.title;
        eventPlaceInput.value = event.place;
        eventDescriptionInput.value = event.description;

        openModal();
    }


    // --- Manejadores de Eventos ---
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar();
    });

    addEventBtn.addEventListener('click', () => {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        openAddEventModal(dateString); // Abrir modal para la fecha actual por defecto
    });

    closeModalBtn.addEventListener('click', closeModal);

    // Cerrar modal si se hace clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === eventModal) {
            closeModal();
        }
    });

    saveEventBtn.addEventListener('click', () => {
        const title = eventTitleInput.value.trim();
        const place = eventPlaceInput.value.trim();
        const description = eventDescriptionInput.value.trim();

        if (!title || !selectedDate) {
            alert('Por favor, ingresa un título para el pedido/evento.');
            return;
        }

        const newEvent = {
            id: Date.now().toString(), // ID simple único
            title,
            place,
            description,
            completed: false
        };

        if (!events[selectedDate]) {
            events[selectedDate] = [];
        }
        events[selectedDate].push(newEvent);
        saveEvents();
        generateCalendar();
        closeModal();
        alert('Pedido/Evento guardado exitosamente.');
    });

    updateEventBtn.addEventListener('click', () => {
        const title = eventTitleInput.value.trim();
        const place = eventPlaceInput.value.trim();
        const description = eventDescriptionInput.value.trim();

        if (!title || !selectedDate || !currentEditingEventId) {
            alert('Error al actualizar el pedido/evento.');
            return;
        }

        const eventIndex = events[selectedDate].findIndex(e => e.id === currentEditingEventId);

        if (eventIndex > -1) {
            events[selectedDate][eventIndex].title = title;
            events[selectedDate][eventIndex].place = place;
            events[selectedDate][eventIndex].description = description;
            saveEvents();
            generateCalendar();
            closeModal();
            alert('Pedido/Evento actualizado exitosamente.');
        } else {
            alert('No se encontró el pedido/evento para actualizar.');
        }
    });

    markCompletedBtn.addEventListener('click', () => {
        if (!selectedDate || !currentEditingEventId) return;

        const eventIndex = events[selectedDate].findIndex(e => e.id === currentEditingEventId);
        if (eventIndex > -1) {
            events[selectedDate][eventIndex].completed = !events[selectedDate][eventIndex].completed; // Alternar estado
            saveEvents();
            generateCalendar(); // Volver a renderizar el calendario para mostrar el cambio de estado
            closeModal();
            alert(`Pedido/Evento ${events[selectedDate][eventIndex].completed ? 'marcado como entregado' : 'desmarcado'}.`);
        }
    });

    editEventBtn.addEventListener('click', () => {
        if (selectedDate && currentEditingEventId) {
            openEditEventModal(currentEditingEventId, selectedDate);
        }
    });

    deleteEventBtn.addEventListener('click', () => {
        if (!selectedDate || !currentEditingEventId) return;

        if (confirm('¿Estás seguro de que quieres eliminar este pedido/evento?')) {
            events[selectedDate] = events[selectedDate].filter(e => e.id !== currentEditingEventId);
            if (events[selectedDate].length === 0) {
                delete events[selectedDate]; // Eliminar el array si está vacío
            }
            saveEvents();
            generateCalendar();
            closeModal();
            alert('Pedido/Evento eliminado.');
        }
    });


    // --- Carga Inicial ---
    generateCalendar();
});