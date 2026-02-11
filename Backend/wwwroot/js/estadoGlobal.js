// estadoGlobal.js - Estado global compartido entre módulos

// Estado global de productos
export let productosGlobal = [];

// Estado global del carrito (en memoria)
export let carrito = [];

// Inicializar carrito desde localStorage si está disponible
try {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
} catch (error) {
    console.log('localStorage no disponible, usando carrito en memoria');
}

// Función para guardar el carrito
export function guardarCarrito(nuevoCarrito) {
    carrito = nuevoCarrito;
    
    // Intentar guardar en localStorage si está disponible
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('carrito', JSON.stringify(carrito));
        }
    } catch (error) {
        // Si localStorage no está disponible
        console.log('Carrito guardado solo en memoria');
    }
    
    // Siempre actualizar el contador
    actualizarContadorGlobal();
}

// Función para actualizar el contador del carrito en todas las páginas
export function actualizarContadorGlobal() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const contadores = document.querySelectorAll('.cart-count');
    contadores.forEach(contador => {
        contador.textContent = totalItems;
    });
}

// Función para limpiar el carrito
export function limpiarCarrito() {
    guardarCarrito([]);
}

// Función para obtener el total del carrito
export function obtenerTotalCarrito() {
    return carrito.reduce((total, item) => {
        const producto = productosGlobal.find(p => p.id === item.productoId);
        return total + (producto ? producto.precio * item.cantidad : 0);
    }, 0);
}