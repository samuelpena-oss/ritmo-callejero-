// ===== RITMO CALLEJERO - CARRITO DE COMPRAS =====

const Carrito = {
    items: [],

    init() {
        // Cargar del localStorage si existe
        const guardado = localStorage.getItem('carritoRitmo');
        if (guardado) this.items = JSON.parse(guardado);
        this.actualizarBadge();
    },

    guardar() {
        localStorage.setItem('carritoRitmo', JSON.stringify(this.items));
    },

    agregar(nombre, precio, imagen) {
        const existe = this.items.find(i => i.nombre === nombre);
        if (existe) {
            existe.cantidad++;
        } else {
            this.items.push({ nombre, precio, imagen, cantidad: 1 });
        }
        this.guardar();
        this.actualizarBadge();
        this.actualizarPanel();
        this.mostrarToast(`¡${nombre} al carrito! 🔥`);
    },

    eliminar(nombre) {
        this.items = this.items.filter(i => i.nombre !== nombre);
        this.guardar();
        this.actualizarBadge();
        this.actualizarPanel();
    },

    cambiarCantidad(nombre, delta) {
        const item = this.items.find(i => i.nombre === nombre);
        if (!item) return;
        item.cantidad += delta;
        if (item.cantidad <= 0) this.eliminar(nombre);
        else {
            this.guardar();
            this.actualizarBadge();
            this.actualizarPanel();
        }
    },

    total() {
        return this.items.reduce((sum, i) => {
            const p = parseInt(i.precio.replace(/[^0-9]/g, '')) || 0;
            return sum + p * i.cantidad;
        }, 0);
    },

    actualizarBadge() {
        const total = this.items.reduce((s, i) => s + i.cantidad, 0);
        document.querySelectorAll('.carrito-badge').forEach(b => {
            b.textContent = total;
            b.style.display = total > 0 ? 'flex' : 'none';
        });
    },

    actualizarPanel() {
        const lista = document.getElementById('carritoItems');
        const totalEl = document.getElementById('carritoTotal');
        if (!lista) return;

        if (this.items.length === 0) {
            lista.innerHTML = `
                <div class="carrito-vacio">
                    <svg viewBox="0 0 24 24"><path d="M17 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2M1 2v2h2l3.6 7.6L5.2 14C5.1 14.3 5 14.7 5 15c0 1.1.9 2 2 2h14v-2H7.4c-.1 0-.2-.1-.2-.2v-.1l1-1.8H19c.7 0 1.3-.4 1.6-1l3.6-6.4c.1-.2.2-.5.2-.8 0-.6-.5-1-1.1-1H5.2L4.3 2H1m6 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    <p>TU CARRITO ESTÁ VACÍO</p>
                </div>`;
        } else {
            lista.innerHTML = this.items.map(item => `
                <div class="carrito-item">
                    ${item.imagen
                        ? `<img src="${item.imagen}" class="carrito-item-img" alt="${item.nombre}">`
                        : `<div class="carrito-item-img-placeholder">👕</div>`}
                    <div class="carrito-item-info">
                        <div class="carrito-item-nombre">${item.nombre}</div>
                        <div class="carrito-item-precio">$${parseInt(item.precio.replace(/[^0-9]/g,'')).toLocaleString('es-CO')}</div>
                        <div class="carrito-item-controles">
                            <button class="ctrl-btn" onclick="Carrito.cambiarCantidad('${item.nombre}', -1)">−</button>
                            <span class="ctrl-cantidad">${item.cantidad}</span>
                            <button class="ctrl-btn" onclick="Carrito.cambiarCantidad('${item.nombre}', 1)">+</button>
                        </div>
                    </div>
                    <button class="carrito-item-eliminar" onclick="Carrito.eliminar('${item.nombre}')" title="Eliminar">✕</button>
                </div>`).join('');
        }

        if (totalEl) {
            totalEl.textContent = '$' + this.total().toLocaleString('es-CO');
        }
    },

    abrir() {
        document.getElementById('carritoOverlay').classList.add('activo');
        document.getElementById('carritoPanel').classList.add('activo');
        this.actualizarPanel();
        document.body.style.overflow = 'hidden';
    },

    cerrar() {
        document.getElementById('carritoOverlay').classList.remove('activo');
        document.getElementById('carritoPanel').classList.remove('activo');
        document.body.style.overflow = '';
    },

    mostrarToast(msg) {
        let toast = document.getElementById('toastCarrito');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastCarrito';
            toast.className = 'toast-carrito';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 2500);
    },

    checkout() {
        if (this.items.length === 0) {
            this.mostrarToast('¡Agrega productos primero! 🛒');
            return;
        }
        window.location.href = 'formulario.html';
    }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    Carrito.init();

    // Cerrar al hacer click en overlay
    const overlay = document.getElementById('carritoOverlay');
    if (overlay) overlay.addEventListener('click', () => Carrito.cerrar());
});
