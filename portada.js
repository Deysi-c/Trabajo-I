document.addEventListener('DOMContentLoaded', () => {
    // --- Carousel Variables and Initialization ---
    // (This part remains the same as it controls the carousel animation)
    let currentIndex = 0;
    const cards = document.querySelectorAll('.section_card');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const carouselContainer = document.querySelector('.carousel-section-cards');
    const carouselSection = document.getElementById('carouselSection');

    let intervalId;

    function showCard(index) {
        cards.forEach((card, i) => {
            card.classList.toggle('show', i === index);
        });
    }

    function nextCard() {
        currentIndex = (currentIndex + 1) % cards.length;
        showCard(currentIndex);
    }

    function prevCard() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        showCard(currentIndex);
    }

    function startAutoPlay() {
        if (carouselSection && carouselSection.style.display !== 'none') {
            stopAutoPlay();
            intervalId = setInterval(nextCard, 1500);
        }
    }

    function stopAutoPlay() {
        clearInterval(intervalId);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            stopAutoPlay();
            nextCard();
            startAutoPlay();
        });
    }
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            stopAutoPlay();
            prevCard();
            startAutoPlay();
        });
    }

    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }

    showCard(currentIndex);
    startAutoPlay();
    // --- End Carousel Variables and Initialization ---


    // --- MAIN FUNCTION: "ENTRAR" Button (Simplified for direct redirect) ---
    window.ingresar = function() {
        const nombreUsuarioInput = document.getElementById('nombre');
        const nombreUsuario = nombreUsuarioInput.value.trim();

        if (nombreUsuario !== '') {
            // Immediately redirect to the main page
            window.location.href = 'principal.html';
        } else {
            alert('Por favor, ingresa tu nombre de usuario para continuar.');
            nombreUsuarioInput.focus();
        }
    };

    // The logout function is NOT needed on this page if the user is immediately redirected.
    // It should be implemented on 'principal.html' or other main pages to return to 'portada.html'.
});