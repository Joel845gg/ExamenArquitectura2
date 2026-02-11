import { mostrarProductos } from './cargueInventario.js';
import { productosGlobal } from './estadoGlobal.js';

function limpiarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

export function aplicarFiltros() {
    const inputBusqueda = document.getElementById('inputBusquedaNombre');
    const botonBuscar = document.getElementById('buscarProducto');
    const selectCategoria = document.getElementById('filtroCategoria');

    /**
     * Filtra productos según texto y categoría
     */
    const filtrarTodo = () => {
        const texto = limpiarTexto(inputBusqueda.value);
        const categoria = selectCategoria.value;

        const filtrados = productosGlobal.filter(producto => {
            const coincideTexto = limpiarTexto(producto.nombre).includes(texto);
            const coincideCategoria = categoria === 'todos' || producto.categoria === categoria;
            return coincideTexto && coincideCategoria;
        });

        mostrarProductos(filtrados);  // Renderiza resultados
    };

    // Event listeners (búsqueda en tiempo real y por botón)
    inputBusqueda.addEventListener('input', filtrarTodo);
    botonBuscar.addEventListener('click', filtrarTodo);
    selectCategoria.addEventListener('change', filtrarTodo);
}

// Manejo del menú móvil
export function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && mainNav) {
        // Función para alternar el menú
        const toggleMenu = () => {
            mainNav.classList.toggle('active');
            mobileMenuBtn.innerHTML = mainNav.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        };

        // Evento para el botón móvil
        mobileMenuBtn.addEventListener('click', toggleMenu);

        // Eventos para los enlaces de navegación
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    }
}

// Función para mostrar mensajes tipo toast (en la esquina superior derecha)
export function mostrarMensaje(mensaje, tipo = 'success') {
    // Crear elemento toast si no existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(toastContainer);
    }

    // Crear toast individual
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 
                          tipo === 'error' ? 'fa-exclamation-circle' : 
                          'fa-info-circle'}"></i>
            <span>${mensaje}</span>
        </div>
    `;
    
    // Estilos básicos del toast (mover esto a CSS después)
    toast.style.cssText = `
        background: ${tipo === 'success' ? '#4CAF50' : 
                     tipo === 'error' ? '#f44336' : '#ff9800'};
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;

    toastContainer.appendChild(toast);

    // Auto-eliminar después de 2 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.2s ease';
        setTimeout(() => toast.remove(), 200);
    }, 2000);
}

