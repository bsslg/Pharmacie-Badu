/* =========================================================
   PHARMACIE BADU
   Application de gestion de pharmacie
   Version 1.0
   ========================================================= */

'use strict';

/* =========================================================
   CONFIGURATION
   ========================================================= */

const STORAGE_KEY = 'PHARMACIE_BADU_V1';

let state = {
    products: [],
    sales: [],
    purchases: [],
    customers: [],
    suppliers: [],
    expenses: [],
    cashSession: null,
    cashMovements: []
};

let cart = [];


/* =========================================================
   OUTILS
   ========================================================= */

const $ = id => document.getElementById(id);

function uid(prefix = 'ID') {
    return prefix + '_' + Date.now() + '_' +
        Math.random().toString(36).substring(2, 8);
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function now() {
    return new Date().toISOString();
}

function money(value) {
    const n = Number(value) || 0;
    return new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' GNF';
}

function number(value) {
    return Number(value) || 0;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDate(date) {
    if (!date) return '-';

    const d = new Date(date + 'T00:00:00');

    if (isNaN(d)) return date;

    return d.toLocaleDateString('fr-FR');
}

function formatDateTime(date) {
    if (!date) return '-';

    const d = new Date(date);

    if (isNaN(d)) return '-';

    return d.toLocaleString('fr-FR');
}

function showApp() {
    const loading = $('loadingScreen');
    const app = $('app');

    if (loading) {
        loading.classList.add('hidden');
        loading.style.display = 'none';
    }

    if (app) {
        app.classList.add('ready');
        app.style.display = '';
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const data = JSON.parse(saved);

        state = {
            products: Array.isArray(data.products) ? data.products : [],
            sales: Array.isArray(data.sales) ? data.sales : [],
            purchases: Array.isArray(data.purchases) ? data.purchases : [],
            customers: Array.isArray(data.customers) ? data.customers : [],
            suppliers: Array.isArray(data.suppliers) ? data.suppliers : [],
            expenses: Array.isArray(data.expenses) ? data.expenses : [],
            cashSession: data.cashSession || null,
            cashMovements: Array.isArray(data.cashMovements)
                ? data.cashMovements
                : []
        };

    } catch (error) {
        console.error('Erreur chargement:', error);
    }
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function toast(message, type = 'success') {
    const container = $('toastContainer');

    if (!container) {
        alert(message);
        return;
    }

    const div = document.createElement('div');

    div.className = 'toast ' + type;

    div.innerHTML = `
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3500);
}


/* =========================================================
   MODALES
   ========================================================= */

function openModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.add('hidden');
    modal.style.display = 'none';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    });
}


/* =========================================================
   NAVIGATION
   ========================================================= */

const pageNames = {
    dashboard: ['Tableau de bord', 'Vue générale de la pharmacie'],
    sales: ['Ventes', 'Gestion des ventes et encaissements'],
    products: ['Produits & Stock', 'Gestion des médicaments et produits'],
    purchases: ['Achats', 'Gestion des achats et approvisionnements'],
    customers: ['Clients', 'Gestion des clients'],
    suppliers: ['Fournisseurs', 'Gestion des fournisseurs'],
    expenses: ['Dépenses', 'Gestion des dépenses'],
    cash: ['Caisse', 'Gestion de la caisse'],
    reports: ['Rapports', 'Analyse financière et commerciale']
};

function showSection(section) {

    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.remove('active');
    });

    const target = $('section-' + section);

    if (target) {
        target.classList.add('active');
    }

    document.querySelectorAll('.menu-item').forEach(btn => {
        btn.classList.remove('active');

        if (btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });

    const info = pageNames[section];

    if (info) {
        if ($('pageTitle')) $('pageTitle').textContent = info[0];
        if ($('pageSubtitle')) $('pageSubtitle').textContent = info[1];
    }

    const sidebar = document.querySelector('.sidebar');

    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }

    if (section === 'dashboard') renderDashboard();
    if (section === 'sales') renderSales();
    if (section === 'products') renderProducts();
    if (section === 'purchases') renderPurchases();
    if (section === 'customers') renderCustomers();
    if (section === 'suppliers') renderSuppliers();
    if (section === 'expenses') renderExpenses();
    if (section === 'cash') renderCash();
    if (section === 'reports') renderReports();
}


/* =========================================================
   PRODUITS
   ========================================================= */

function renderSupplierOptions() {

    const select = $('productSupplier');

    if (!select) return;

    select.innerHTML = `
        <option value="">Aucun fournisseur</option>
        ${state.suppliers.map(s => `
            <option value="${escapeHtml(s.id)}">
                ${escapeHtml(s.name)}
            </option>
        `).join('')}
    `;
}

function renderPurchaseProductOptions() {

    const select = $('purchaseProduct');

    if (!select) return;

    select.innerHTML = `
        <option value="">Sélectionner un produit</option>
        ${state.products.map(p => `
            <option value="${escapeHtml(p.id)}">
                ${escapeHtml(p.name)}
            </option>
        `).join('')}
    `;
}

function renderProducts() {

    const table = $('productsTable');

    if (!table) return;

    const search = ($('productSearch')?.value || '').toLowerCase();
    const category = $('productCategoryFilter')?.value || '';
    const stockFilter = $('stockFilter')?.value || '';

    let products = [...state.products];

    products = products.filter(p => {

        const matchesSearch =
            !search ||
            String(p.name).toLowerCase().includes(search) ||
            String(p.category || '').toLowerCase().includes(search);

        const matchesCategory =
            !category || p.category === category;

        let matchesStock = true;

        if (stockFilter === 'low') {
            matchesStock = number(p.stock) <= number(p.alertStock);
        }

        if (stockFilter === 'out') {
            matchesStock = number(p.stock) <= 0;
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    table.innerHTML = products.length ? products.map(p => {

        const stock = number(p.stock);
        const alertStock = number(p.alertStock);

        let badge = 'badge-success';
        let text = 'Disponible';

        if (stock <= 0) {
            badge = 'badge-danger';
            text = 'Rupture';
        } else if (stock <= alertStock) {
            badge = 'badge-warning';
            text = 'Stock faible';
        }

        let expiry = '-';

        if (p.expiry) {
            expiry = formatDate(p.expiry);

            if (p.expiry < today()) {
                expiry += ' ⚠️';
            }
        }

        return `
            <tr>
                <td><strong>${escapeHtml(p.name)}</strong></td>
                <td>${escapeHtml(p.category || '-')}</td>
                <td>${money(p.salePrice)}</td>
                <td>${money(p.purchasePrice)}</td>
                <td>${stock}</td>
                <td>
                    <span class="badge ${badge}">
                        ${text}
                    </span>
                </td>
                <td>${expiry}</td>
                <td class="table-actions">
                    <button class="table-action-btn"
                        onclick="editProduct('${p.id}')">
                        Modifier
                    </button>

                    <button class="table-action-btn delete"
                        onclick="deleteProduct('${p.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;

    }).join('') : `
        <tr>
            <td colspan="8" class="empty-state">
                Aucun produit enregistré.
            </td>
        </tr>
    `;

    const low = state.products.filter(p =>
        number(p.stock) <= number(p.alertStock)
    ).length;

    const expired = state.products.filter(p =>
        p.expiry && p.expiry < today()
    ).length;

    const expiring = state.products.filter(p => {

        if (!p.expiry) return false;

        const diff =
            (new Date(p.expiry) - new Date(today())) /
            86400000;

        return diff >= 0 && diff <= 30;

    }).length;

    if ($('totalProducts'))
        $('totalProducts').textContent = state.products.length;

    if ($('lowStockProducts'))
        $('lowStockProducts').textContent = low;

    if ($('expiredProducts'))
        $('expiredProducts').textContent = expired;

    if ($('expiringProducts'))
        $('expiringProducts').textContent = expiring;

    renderSupplierOptions();
    renderPurchaseProductOptions();
}

function openProductModal(id = null) {

    const form = $('productForm');

    if (!form) return;

    form.reset();

    if ($('productId'))
        $('productId').value = '';

    if (id) {

        const p = state.products.find(x => x.id === id);

        if (!p) return;

        $('productId').value = p.id;
        $('productName').value = p.name || '';
        $('productCategory').value = p.category || '';
        $('productPurchasePrice').value = p.purchasePrice || 0;
        $('productSalePrice').value = p.salePrice || 0;
        $('productStock').value = p.stock || 0;
        $('productAlertStock').value = p.alertStock || 5;
        $('productExpiry').value = p.expiry || '';
        $('productLot').value = p.lot || '';
        $('productSupplier').value = p.supplierId || '';
        $('productDescription').value = p.description || '';
    }

    openModal('productModal');
}

function editProduct(id) {
    openProductModal(id);
}

function saveProduct(event) {

    event.preventDefault();

    const id = $('productId')?.value;

    const product = {
        id: id || uid('PROD'),
        name: $('productName')?.value.trim(),
        category: $('productCategory')?.value || '',
        purchasePrice: number($('productPurchasePrice')?.value),
        salePrice: number($('productSalePrice')?.value),
        stock: number($('productStock')?.value),
        alertStock: number($('productAlertStock')?.value || 5),
        expiry: $('productExpiry')?.value || '',
        lot: $('productLot')?.value.trim() || '',
        supplierId: $('productSupplier')?.value || '',
        description: $('productDescription')?.value.trim() || '',
        updatedAt: now()
    };

    if (!product.name) {
        toast('Le nom du produit est obligatoire.', 'error');
        return;
    }

    if (id) {

        const index = state.products.findIndex(p => p.id === id);

        if (index !== -1) {
            state.products[index] = {
                ...state.products[index],
                ...product
            };
        }

    } else {

        product.createdAt = now();

        state.products.push(product);
    }

    saveState();

    closeModal('productModal');

    renderProducts();
    renderDashboard();

    toast('Produit enregistré avec succès.');
}

function deleteProduct(id) {

    const product = state.products.find(p => p.id === id);

    if (!product) return;

    if (!confirm(`Supprimer "${product.name}" ?`)) return;

    state.products = state.products.filter(p => p.id !== id);

    saveState();

    renderProducts();
    renderDashboard();

    toast('Produit supprimé.');
}


/* =========================================================
   VENTES / PANIER
   ========================================================= */

function renderSaleProducts() {

    const grid = $('saleProductsGrid');

    if (!grid) return;

    const search =
        ($('saleProductSearch')?.value || '').toLowerCase();

    const products = state.products.filter(p => {

        const available = number(p.stock) > 0;

        const match =
            !search ||
            p.name.toLowerCase().includes(search) ||
            String(p.category || '').toLowerCase().includes(search);

        return available && match;
    });

    grid.innerHTML = products.length ? products.map(p => `
        <div class="product-sale-card"
             onclick="addToCart('${p.id}')">

            <div class="product-sale-card-icon">
                💊
            </div>

            <strong>
                ${escapeHtml(p.name)}
            </strong>

            <div class="product-sale-card-price">
                ${money(p.salePrice)}
            </div>

            <div class="product-sale-card-stock">
                Stock : ${number(p.stock)}
            </div>

        </div>
    `).join('') : `
        <div class="empty-state">
            Aucun produit disponible.
        </div>
    `;
}

function addToCart(productId) {

    const product = state.products.find(p => p.id === productId);

    if (!product) return;

    if (number(product.stock) <= 0) {
        toast('Produit en rupture de stock.', 'error');
        return;
    }

    const existing = cart.find(x => x.productId === productId);

    if (existing) {

        if (existing.quantity >= number(product.stock)) {
            toast('Stock insuffisant.', 'error');
            return;
        }

        existing.quantity++;

    } else {

        cart.push({
            productId: product.id,
            quantity: 1
        });
    }

    renderCart();
}

function changeCartQuantity(productId, change) {

    const item = cart.find(x => x.productId === productId);

    if (!item) return;

    const product = state.products.find(p => p.id === productId);

    if (!product) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(x => x.productId !== productId);
    }

    if (item.quantity > number(product.stock)) {
        item.quantity = number(product.stock);
        toast('Stock maximum atteint.', 'warning');
    }

    renderCart();
}

function removeFromCart(productId) {

    cart = cart.filter(x => x.productId !== productId);

    renderCart();
}

function cartSubtotal() {

    return cart.reduce((total, item) => {

        const p = state.products.find(x => x.id === item.productId);

        if (!p) return total;

        return total +
            number(p.salePrice) * number(item.quantity);

    }, 0);
}

function renderCart() {

    const container = $('cartItems');

    if (!container) return;

    const subtotal = cartSubtotal();

    if ($('cartCount'))
        $('cartCount').textContent =
            cart.reduce((a, b) => a + number(b.quantity), 0);

    if (!cart.length) {

        container.innerHTML = `
            <div class="empty-state">
                Le panier est vide.
            </div>
        `;

    } else {

        container.innerHTML = cart.map(item => {

            const p =
                state.products.find(x => x.id === item.productId);

            if (!p) return '';

            return `
                <div class="cart-item">

                    <div class="cart-item-info">
                        <strong>${escapeHtml(p.name)}</strong>
                        <small>${money(p.salePrice)}</small>
                    </div>

                    <div class="cart-item-controls">

                        <button class="quantity-btn"
                            onclick="changeCartQuantity('${p.id}', -1)">
                            −
                        </button>

                        <span class="cart-item-quantity">
                            ${item.quantity}
                        </span>

                        <button class="quantity-btn"
                            onclick="changeCartQuantity('${p.id}', 1)">
                            +
                        </button>

                        <button class="quantity-btn"
                            onclick="removeFromCart('${p.id}')">
                            ×
                        </button>

                    </div>

                </div>
            `;

        }).join('');
    }

    if ($('cartSubtotal'))
        $('cartSubtotal').textContent = money(subtotal);

    const discount = number($('saleDiscount')?.value);

    if ($('cartDiscount'))
        $('cartDiscount').textContent = money(discount);

    if ($('cartTotal'))
        $('cartTotal').textContent =
            money(Math.max(0, subtotal - discount));
}

function openSaleModal() {

    if (!cart.length) {
        toast('Ajoutez au moins un produit.', 'warning');
        return;
    }

    if ($('saleForm')) $('saleForm').reset();

    if ($('checkoutSubtotal'))
        $('checkoutSubtotal').textContent =
            money(cartSubtotal());

    if ($('checkoutDiscount'))
        $('checkoutDiscount').textContent = money(0);

    if ($('checkoutTotal'))
        $('checkoutTotal').textContent =
            money(cartSubtotal());

    if ($('saleReceived'))
        $('saleReceived').value = cartSubtotal();

    calculateChange();

    renderCustomerOptions();

    openModal('saleModal');
}

function calculateChange() {

    const subtotal = cartSubtotal();
    const discount = number($('saleDiscount')?.value);
    const total = Math.max(0, subtotal - discount);
    const received = number($('saleReceived')?.value);

    if ($('checkoutSubtotal'))
        $('checkoutSubtotal').textContent = money(subtotal);

    if ($('checkoutDiscount'))
        $('checkoutDiscount').textContent = money(discount);

    if ($('checkoutTotal'))
        $('checkoutTotal').textContent = money(total);

    if ($('checkoutChange'))
        $('checkoutChange').textContent =
            money(Math.max(0, received - total));
}

function renderCustomerOptions() {

    const select = $('saleCustomer');

    if (!select) return;

    select.innerHTML = `
        <option value="">Client comptoir</option>

        ${state.customers.map(c => `
            <option value="${escapeHtml(c.id)}">
                ${escapeHtml(c.name)}
            </option>
        `).join('')}
    `;
}

function saveSale(event) {

    event.preventDefault();

    if (!cart.length) {
        toast('Le panier est vide.', 'error');
        return;
    }

    const subtotal = cartSubtotal();
    const discount = number($('saleDiscount')?.value);
    const total = Math.max(0, subtotal - discount);
    const received = number($('saleReceived')?.value);
    const payment = $('salePayment')?.value || 'Espèces';

    if (discount > subtotal) {
        toast('La remise ne peut pas dépasser le total.', 'error');
        return;
    }

    if (received < total) {
        toast('Montant reçu insuffisant.', 'error');
        return;
    }

    /* Vérification stock */

    for (const item of cart) {

        const product =
            state.products.find(p => p.id === item.productId);

        if (!product || number(product.stock) < item.quantity) {
            toast(`Stock insuffisant pour ${product?.name || 'un produit'}.`, 'error');
            return;
        }
    }

    /* Création de la vente */

    const sale = {
        id: uid('VENTE'),
        reference: 'V-' + Date.now(),
        date: now(),
        customerId: $('saleCustomer')?.value || '',
        payment,
        subtotal,
        discount,
        total,
        received,
        change: received - total,
        items: []
    };

    cart.forEach(item => {

        const product =
            state.products.find(p => p.id === item.productId);

        product.stock -= item.quantity;

        sale.items.push({
            productId: product.id,
            name: product.name,
            quantity: item.quantity,
            salePrice: product.salePrice,
            purchasePrice: product.purchasePrice
        });
    });

    state.sales.push(sale);

    /* Mouvement caisse */

    state.cashMovements.push({
        id: uid('MVT'),
        type: 'in',
        label: 'Vente ' + sale.reference,
        amount: total,
        payment,
        date: now(),
        reference: sale.id
    });

    saveState();

    cart = [];

    closeModal('saleModal');

    renderAll();

    toast('Vente enregistrée avec succès.');

    printSale(sale);
}

function deleteSale(id) {

    const sale = state.sales.find(s => s.id === id);

    if (!sale) return;

    if (!confirm('Supprimer cette vente ? Le stock sera restauré.')) {
        return;
    }

    sale.items.forEach(item => {

        const product =
            state.products.find(p => p.id === item.productId);

        if (product) {
            product.stock += number(item.quantity);
        }
    });

    state.cashMovements = state.cashMovements.filter(
        m => m.reference !== id
    );

    state.sales = state.sales.filter(s => s.id !== id);

    saveState();

    renderAll();

    toast('Vente supprimée et stock restauré.');
}

function renderSales() {

    renderSaleProducts();
    renderCart();

    const table = $('salesTable');

    if (!table) return;

    const dateFilter = $('salesDateFilter')?.value || '';
    const paymentFilter = $('salesPaymentFilter')?.value || '';

    let sales = [...state.sales].reverse();

    if (dateFilter) {
        sales = sales.filter(s =>
            String(s.date).slice(0, 10) === dateFilter
        );
    }

    if (paymentFilter) {
        sales = sales.filter(s =>
            s.payment === paymentFilter
        );
    }

    table.innerHTML = sales.length ? sales.map(s => {

        const customer =
            state.customers.find(c => c.id === s.customerId);

        return `
            <tr>
                <td>${escapeHtml(s.reference)}</td>
                <td>${formatDateTime(s.date)}</td>
                <td>${escapeHtml(customer?.name || 'Client comptoir')}</td>
                <td>${money(s.total)}</td>
                <td>${escapeHtml(s.payment)}</td>
                <td>
                    <span class="badge badge-success">
                        Payée
                    </span>
                </td>
                <td class="table-actions">
                    <button class="table-action-btn"
                        onclick="printSaleById('${s.id}')">
                        Ticket
                    </button>

                    <button class="table-action-btn delete"
                        onclick="deleteSale('${s.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;

    }).join('') : `
        <tr>
            <td colspan="7" class="empty-state">
                Aucune vente.
            </td>
        </tr>
    `;
}


/* =========================================================
   IMPRESSION TICKET
   ========================================================= */

function printSaleById(id) {

    const sale = state.sales.find(s => s.id === id);

    if (sale) printSale(sale);
}

function printSale(sale) {

    const items = sale.items.map(item => `
        <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${item.quantity}</td>
            <td>${money(item.salePrice)}</td>
            <td>${money(item.salePrice * item.quantity)}</td>
        </tr>
    `).join('');

    const win = window.open('', '_blank', 'width=800,height=700');

    if (!win) {
        toast('Autorisez les fenêtres pop-up pour imprimer.', 'warning');
        return;
    }

    win.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Ticket ${escapeHtml(sale.reference)}</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                }

                h1 {
                    text-align: center;
                }

                .center {
                    text-align: center;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th, td {
                    padding: 8px;
                    border-bottom: 1px solid #ddd;
                    text-align: left;
                }

                .total {
                    font-size: 20px;
                    font-weight: bold;
                    text-align: right;
                    margin-top: 20px;
                }
            </style>
        </head>

        <body>

            <h1>PHARMACIE BADU</h1>

            <div class="center">
                Ticket : ${escapeHtml(sale.reference)}<br>
                ${formatDateTime(sale.date)}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Qté</th>
                        <th>Prix</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>
                    ${items}
                </tbody>
            </table>

            <div class="total">
                Sous-total : ${money(sale.subtotal)}<br>
                Remise : ${money(sale.discount)}<br>
                TOTAL : ${money(sale.total)}
            </div>

            <p>
                Paiement : ${escapeHtml(sale.payment)}
            </p>

            <p>
                Montant reçu : ${money(sale.received)}
            </p>

            <p>
                Monnaie : ${money(sale.change)}
            </p>

            <hr>

            <div class="center">
                Merci pour votre confiance.
            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>

        </body>
        </html>
    `);

    win.document.close();
}


/* =========================================================
   ACHATS
   ========================================================= */

function savePurchase(event) {

    event.preventDefault();

    const productId = $('purchaseProduct')?.value;
    const supplierId = $('purchaseSupplier')?.value || '';
    const quantity = number($('purchaseQuantity')?.value);
    const unitPrice = number($('purchaseUnitPrice')?.value);
    const date = $('purchaseDate')?.value || today();
    const reference = $('purchaseReference')?.value.trim() ||
        'ACH-' + Date.now();

    const product =
        state.products.find(p => p.id === productId);

    if (!product) {
        toast('Sélectionnez un produit.', 'error');
        return;
    }

    if (quantity <= 0) {
        toast('Quantité invalide.', 'error');
        return;
    }

    if (unitPrice < 0) {
        toast('Prix invalide.', 'error');
        return;
    }

    product.stock += quantity;

    product.purchasePrice = unitPrice;

    const purchase = {
        id: uid('ACHAT'),
        reference,
        productId,
        supplierId,
        quantity,
        unitPrice,
        total: quantity * unitPrice,
        date,
        createdAt: now()
    };

    state.purchases.push(purchase);

    saveState();

    closeModal('purchaseModal');

    renderAll();

    toast('Achat enregistré.');
}

function deletePurchase(id) {

    const purchase =
        state.purchases.find(p => p.id === id);

    if (!purchase) return;

    if (!confirm('Supprimer cet achat ?')) return;

    const product =
        state.products.find(p => p.id === purchase.productId);

    if (product) {

        product.stock =
            Math.max(0, number(product.stock) - number(purchase.quantity));
    }

    state.purchases =
        state.purchases.filter(p => p.id !== id);

    saveState();

    renderAll();

    toast('Achat supprimé.');
}

function renderPurchases() {

    const table = $('purchasesTable');

    if (!table) return;

    table.innerHTML = state.purchases.length
        ? [...state.purchases].reverse().map(p => {

            const product =
                state.products.find(x => x.id === p.productId);

            const supplier =
                state.suppliers.find(x => x.id === p.supplierId);

            return `
                <tr>
                    <td>${escapeHtml(p.reference)}</td>
                    <td>${formatDate(p.date)}</td>
                    <td>${escapeHtml(product?.name || '-')}</td>
                    <td>${escapeHtml(supplier?.name || '-')}</td>
                    <td>${p.quantity}</td>
                    <td>${money(p.unitPrice)}</td>
                    <td>${money(p.total)}</td>

                    <td>
                        <button class="table-action-btn delete"
                            onclick="deletePurchase('${p.id}')">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `;

        }).join('')
        : `
            <tr>
                <td colspan="8" class="empty-state">
                    Aucun achat.
                </td>
            </tr>
        `;
}

function openPurchaseModal() {

    if ($('purchaseForm')) $('purchaseForm').reset();

    if ($('purchaseDate'))
        $('purchaseDate').value = today();

    renderPurchaseProductOptions();
    renderPurchaseSupplierOptions();

    openModal('purchaseModal');
}

function renderPurchaseSupplierOptions() {

    const select = $('purchaseSupplier');

    if (!select) return;

    select.innerHTML = `
        <option value="">Aucun fournisseur</option>

        ${state.suppliers.map(s => `
            <option value="${escapeHtml(s.id)}">
                ${escapeHtml(s.name)}
            </option>
        `).join('')}
    `;
}


/* =========================================================
   CLIENTS
   ========================================================= */

function saveCustomer(event) {

    event.preventDefault();

    const name = $('customerName')?.value.trim();

    if (!name) {
        toast('Le nom du client est obligatoire.', 'error');
        return;
    }

    state.customers.push({
        id: uid('CLIENT'),
        name,
        phone: $('customerPhone')?.value.trim() || '',
        address: $('customerAddress')?.value.trim() || '',
        notes: $('customerNotes')?.value.trim() || '',
        createdAt: now()
    });

    saveState();

    closeModal('customerModal');

    renderAll();

    toast('Client ajouté.');
}

function deleteCustomer(id) {

    if (!confirm('Supprimer ce client ?')) return;

    state.customers =
        state.customers.filter(c => c.id !== id);

    saveState();

    renderCustomers();

    toast('Client supprimé.');
}

function renderCustomers() {

    const table = $('customersTable');

    if (!table) return;

    const search =
        ($('customerSearch')?.value || '').toLowerCase();

    const customers =
        state.customers.filter(c =>
            !search ||
            c.name.toLowerCase().includes(search) ||
            String(c.phone || '').includes(search)
        );

    table.innerHTML = customers.length
        ? customers.map(c => `
            <tr>
                <td>${escapeHtml(c.name)}</td>
                <td>${escapeHtml(c.phone || '-')}</td>
                <td>${escapeHtml(c.address || '-')}</td>
                <td>${escapeHtml(c.notes || '-')}</td>
                <td>
                    <button class="table-action-btn delete"
                        onclick="deleteCustomer('${c.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `).join('')
        : `
            <tr>
                <td colspan="5" class="empty-state">
                    Aucun client.
                </td>
            </tr>
        `;
}


/* =========================================================
   FOURNISSEURS
   ========================================================= */

function saveSupplier(event) {

    event.preventDefault();

    const name = $('supplierName')?.value.trim();

    if (!name) {
        toast('Le nom du fournisseur est obligatoire.', 'error');
        return;
    }

    state.suppliers.push({
        id: uid('FOURN'),
        name,
        contact: $('supplierContact')?.value.trim() || '',
        phone: $('supplierPhone')?.value.trim() || '',
        email: $('supplierEmail')?.value.trim() || '',
        address: $('supplierAddress')?.value.trim() || '',
        createdAt: now()
    });

    saveState();

    closeModal('supplierModal');

    renderAll();

    toast('Fournisseur ajouté.');
}

function deleteSupplier(id) {

    if (!confirm('Supprimer ce fournisseur ?')) return;

    state.suppliers =
        state.suppliers.filter(s => s.id !== id);

    saveState();

    renderAll();

    toast('Fournisseur supprimé.');
}

function renderSuppliers() {

    const table = $('suppliersTable');

    if (!table) return;

    const search =
        ($('supplierSearch')?.value || '').toLowerCase();

    const suppliers =
        state.suppliers.filter(s =>
            !search ||
            s.name.toLowerCase().includes(search) ||
            String(s.phone || '').includes(search)
        );

    table.innerHTML = suppliers.length
        ? suppliers.map(s => `
            <tr>
                <td>${escapeHtml(s.name)}</td>
                <td>${escapeHtml(s.contact || '-')}</td>
                <td>${escapeHtml(s.phone || '-')}</td>
                <td>${escapeHtml(s.email || '-')}</td>
                <td>${escapeHtml(s.address || '-')}</td>
                <td>
                    <button class="table-action-btn delete"
                        onclick="deleteSupplier('${s.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `).join('')
        : `
            <tr>
                <td colspan="6" class="empty-state">
                    Aucun fournisseur.
                </td>
            </tr>
        `;
}


/* =========================================================
   DEPENSES
   ========================================================= */

function saveExpense(event) {

    event.preventDefault();

    const label = $('expenseLabel')?.value.trim();
    const amount = number($('expenseAmount')?.value);
    const payment = $('expensePayment')?.value || 'Espèces';

    if (!label) {
        toast('Le libellé est obligatoire.', 'error');
        return;
    }

    if (amount <= 0) {
        toast('Le montant doit être supérieur à zéro.', 'error');
        return;
    }

    const expense = {
        id: uid('DEP'),
        label,
        category: $('expenseCategory')?.value || '',
        amount,
        payment,
        date: $('expenseDate')?.value || today(),
        note: $('expenseNote')?.value.trim() || '',
        createdAt: now()
    };

    state.expenses.push(expense);

    state.cashMovements.push({
        id: uid('MVT'),
        type: 'out',
        label: 'Dépense : ' + label,
        amount,
        payment,
        date: now(),
        reference: expense.id
    });

    saveState();

    closeModal('expenseModal');

    renderAll();

    toast('Dépense enregistrée.');
}

function deleteExpense(id) {

    if (!confirm('Supprimer cette dépense ?')) return;

    state.expenses =
        state.expenses.filter(e => e.id !== id);

    state.cashMovements =
        state.cashMovements.filter(m => m.reference !== id);

    saveState();

    renderAll();

    toast('Dépense supprimée.');
}

function renderExpenses() {

    const table = $('expensesTable');

    if (!table) return;

    table.innerHTML = state.expenses.length
        ? [...state.expenses].reverse().map(e => `
            <tr>
                <td>${formatDate(e.date)}</td>
                <td>${escapeHtml(e.label)}</td>
                <td>${escapeHtml(e.category || '-')}</td>
                <td>${money(e.amount)}</td>
                <td>${escapeHtml(e.payment)}</td>
                <td>${escapeHtml(e.note || '-')}</td>
                <td>
                    <button class="table-action-btn delete"
                        onclick="deleteExpense('${e.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `).join('')
        : `
            <tr>
                <td colspan="7" class="empty-state">
                    Aucune dépense.
                </td>
            </tr>
        `;
}


/* =========================================================
   CAISSE
   ========================================================= */

function openCashModal(type) {

    if ($('cashForm')) $('cashForm').reset();

    if ($('cashModalTitle')) {

        $('cashModalTitle').textContent =
            type === 'open'
                ? 'Ouvrir la caisse'
                : 'Mouvement de caisse';
    }

    if ($('cashForm')) {
        $('cashForm').dataset.type = type;
    }

    openModal('cashModal');
}

function saveCashAction(event) {

    event.preventDefault();

    const type =
        $('cashForm')?.dataset.type || 'open';

    const amount =
        number($('cashOpeningAmount')?.value);

    const note =
        $('cashNote')?.value.trim() || '';

    if (amount < 0) {
        toast('Montant invalide.', 'error');
        return;
    }

    if (type === 'open') {

        if (state.cashSession?.open) {
            toast('La caisse est déjà ouverte.', 'warning');
            return;
        }

        state.cashSession = {
            id: uid('CAISSE'),
            openedAt: now(),
            opening: amount,
            open: true
        };

        state.cashMovements.push({
            id: uid('MVT'),
            type: 'opening',
            label: 'Ouverture de caisse',
            amount,
            payment: 'Espèces',
            date: now(),
            reference: state.cashSession.id,
            note
        });

    } else {

        if (!state.cashSession?.open) {
            toast('La caisse est fermée.', 'warning');
            return;
        }

        state.cashSession.closedAt = now();
        state.cashSession.closing = amount;
        state.cashSession.open = false;

        state.cashMovements.push({
            id: uid('MVT'),
            type: 'closing',
            label: 'Clôture de caisse',
            amount,
            payment: 'Espèces',
            date: now(),
            reference: state.cashSession.id,
            note
        });
    }

    saveState();

    closeModal('cashModal');

    renderAll();

    toast(type === 'open'
        ? 'Caisse ouverte.'
        : 'Caisse clôturée.'
    );
}

function calculateCash() {

    let balance = 0;

    state.cashMovements.forEach(m => {

        const amount = number(m.amount);

        if (m.type === 'in' || m.type === 'opening') {
            balance += amount;
        }

        if (m.type === 'out') {
            balance -= amount;
        }

        if (m.type === 'closing') {
            // La clôture ne modifie pas le solde.
        }
    });

    return balance;
}

function renderCash() {

    const balance = calculateCash();

    if ($('cashBalance'))
        $('cashBalance').textContent = money(balance);

    const opening =
        state.cashSession?.opening || 0;

    if ($('cashOpening'))
        $('cashOpening').textContent = money(opening);

    const cashIn =
        state.cashMovements
            .filter(m => m.type === 'in')
            .reduce((a, m) => a + number(m.amount), 0);

    const cashOut =
        state.cashMovements
            .filter(m => m.type === 'out')
            .reduce((a, m) => a + number(m.amount), 0);

    if ($('cashIn'))
        $('cashIn').textContent = money(cashIn);

    if ($('cashOut'))
        $('cashOut').textContent = money(cashOut);

    if ($('cashSessionStatus')) {

        $('cashSessionStatus').innerHTML =
            state.cashSession?.open
                ? '<span class="badge badge-success">OUVERTE</span>'
                : '<span class="badge badge-danger">FERMÉE</span>';
    }

    const mainButton = $('cashMainAction');

    if (mainButton) {

        mainButton.textContent =
            state.cashSession?.open
                ? 'Clôturer la caisse'
                : 'Ouvrir la caisse';

        mainButton.onclick = () => {
            openCashModal(
                state.cashSession?.open
                    ? 'close'
                    : 'open'
            );
        };
    }

    const table = $('cashTable');

    if (!table) return;

    table.innerHTML = [...state.cashMovements]
        .reverse()
        .map(m => {

            let type = 'Information';

            if (m.type === 'in') type = 'Entrée';
            if (m.type === 'out') type = 'Sortie';
            if (m.type === 'opening') type = 'Ouverture';
            if (m.type === 'closing') type = 'Clôture';

            return `
                <tr>
                    <td>${formatDateTime(m.date)}</td>
                    <td>${escapeHtml(type)}</td>
                    <td>${escapeHtml(m.label)}</td>
                    <td>${money(m.amount)}</td>
                    <td>${escapeHtml(m.payment || '-')}</td>
                </tr>
            `;

        }).join('');
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function getTodaySales() {

    return state.sales.filter(s =>
        String(s.date).slice(0, 10) === today()
    );
}

function getTodayExpenses() {

    return state.expenses.filter(e =>
        e.date === today()
    );
}

function getProfit(sales) {

    return sales.reduce((total, sale) => {

        const cost = sale.items.reduce((sum, item) =>
            sum +
            number(item.purchasePrice) *
            number(item.quantity),
            0
        );

        return total +
            number(sale.total) -
            cost;

    }, 0);
}

function renderDashboard() {

    const sales = getTodaySales();
    const expenses = getTodayExpenses();

    const revenue =
        sales.reduce((a, s) => a + number(s.total), 0);

    const expenseTotal =
        expenses.reduce((a, e) => a + number(e.amount), 0);

    const profit =
        getProfit(sales) - expenseTotal;

    if ($('dashboardRevenue'))
        $('dashboardRevenue').textContent = money(revenue);

    if ($('dashboardSales'))
        $('dashboardSales').textContent = sales.length;

    if ($('dashboardExpenses'))
        $('dashboardExpenses').textContent =
            money(expenseTotal);

    if ($('dashboardProfit'))
        $('dashboardProfit').textContent =
            money(profit);

    const cash = calculateCash();

    if ($('dashboardCash'))
        $('dashboardCash').textContent = money(cash);

    if ($('dashboardCashPhysical'))
        $('dashboardCashPhysical').textContent = money(cash);

    if ($('dashboardCashElectronic')) {

        const electronic =
            state.sales
                .filter(s =>
                    s.payment !== 'Espèces'
                )
                .reduce((a, s) => a + number(s.total), 0);

        $('dashboardCashElectronic').textContent =
            money(electronic);
    }

    if ($('cashStatusBadge')) {

        $('cashStatusBadge').innerHTML =
            state.cashSession?.open
                ? '<span class="badge badge-success">Caisse ouverte</span>'
                : '<span class="badge badge-danger">Caisse fermée</span>';
    }

    renderAlerts();
    renderRecentSales();
}

function renderAlerts() {

    const container = $('dashboardAlerts');

    if (!container) return;

    const alerts = [];

    state.products.forEach(p => {

        if (number(p.stock) <= 0) {

            alerts.push({
                type: 'danger',
                icon: '🚨',
                title: 'Rupture de stock',
                text: p.name
            });

        } else if (number(p.stock) <= number(p.alertStock)) {

            alerts.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Stock faible',
                text: `${p.name} — ${p.stock} restant(s)`
            });
        }

        if (p.expiry && p.expiry < today()) {

            alerts.push({
                type: 'danger',
                icon: '💊',
                title: 'Produit expiré',
                text: p.name
            });

        } else if (p.expiry) {

            const diff =
                (new Date(p.expiry) -
                    new Date(today())) / 86400000;

            if (diff >= 0 && diff <= 30) {

                alerts.push({
                    type: 'warning',
                    icon: '📅',
                    title: 'Expiration prochaine',
                    text: `${p.name} — ${formatDate(p.expiry)}`
                });
            }
        }
    });

    if ($('alertCount'))
        $('alertCount').textContent = alerts.length;

    container.innerHTML = alerts.length
        ? alerts.slice(0, 8).map(a => `
            <div class="alert-item ${a.type}">

                <div class="alert-item-icon">
                    ${a.icon}
                </div>

                <div class="alert-item-info">
                    <strong>${escapeHtml(a.title)}</strong>
                    <span>${escapeHtml(a.text)}</span>
                </div>

            </div>
        `).join('')
        : `
            <div class="empty-state">
                ✅ Aucune alerte.
            </div>
        `;
}

function renderRecentSales() {

    const table = $('recentSalesTable');

    if (!table) return;

    const sales =
        [...state.sales].reverse().slice(0, 8);

    table.innerHTML = sales.length
        ? sales.map(s => `
            <tr>
                <td>${escapeHtml(s.reference)}</td>
                <td>${formatDateTime(s.date)}</td>
                <td>${money(s.total)}</td>
                <td>${escapeHtml(s.payment)}</td>
            </tr>
        `).join('')
        : `
            <tr>
                <td colspan="4" class="empty-state">
                    Aucune vente récente.
                </td>
            </tr>
        `;
}


/* =========================================================
   RAPPORTS
   ========================================================= */

function renderReports() {

    const start =
        $('reportStartDate')?.value || today();

    const end =
        $('reportEndDate')?.value || today();

    const sales =
        state.sales.filter(s => {

            const d = String(s.date).slice(0, 10);

            return d >= start && d <= end;
        });

    const expenses =
        state.expenses.filter(e =>
            e.date >= start && e.date <= end
        );

    const revenue =
        sales.reduce((a, s) => a + number(s.total), 0);

    const expenseTotal =
        expenses.reduce((a, e) => a + number(e.amount), 0);

    const profit =
        getProfit(sales) - expenseTotal;

    if ($('reportRevenue'))
        $('reportRevenue').textContent = money(revenue);

    if ($('reportExpenses'))
        $('reportExpenses').textContent = money(expenseTotal);

    if ($('reportProfit'))
        $('reportProfit').textContent = money(profit);

    if ($('reportSales'))
        $('reportSales').textContent = sales.length;

    const productsMap = {};

    sales.forEach(sale => {

        sale.items.forEach(item => {

            if (!productsMap[item.productId]) {

                productsMap[item.productId] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }

            productsMap[item.productId].quantity +=
                number(item.quantity);

            productsMap[item.productId].revenue +=
                number(item.quantity) *
                number(item.salePrice);
        });
    });

    const topProducts =
        Object.values(productsMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

    const table = $('topProductsTable');

    if (table) {

        table.innerHTML = topProducts.length
            ? topProducts.map(p => `
                <tr>
                    <td>${escapeHtml(p.name)}</td>
                    <td>${p.quantity}</td>
                    <td>${money(p.revenue)}</td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="3" class="empty-state">
                        Aucune donnée.
                    </td>
                </tr>
            `;
    }
}


/* =========================================================
   EVENEMENTS
   ========================================================= */

function bindEvents() {

    /* Navigation */

    document.querySelectorAll('.menu-item').forEach(button => {

        button.addEventListener('click', () => {

            const section = button.dataset.section;

            if (section) {
                showSection(section);
            }
        });
    });

    /* Liens internes */

    document.querySelectorAll('[data-section-link]')
        .forEach(button => {

            button.addEventListener('click', () => {

                showSection(button.dataset.sectionLink);
            });
        });

    /* Menu mobile */

    const mobileButton = $('mobileMenuBtn');

    if (mobileButton) {

        mobileButton.addEventListener('click', () => {

            const sidebar =
                document.querySelector('.sidebar');

            if (sidebar) {
                sidebar.classList.toggle('mobile-open');
            }
        });
    }

    /* Produits */

    $('addProductBtn')?.addEventListener(
        'click',
        () => openProductModal()
    );

    $('productForm')?.addEventListener(
        'submit',
        saveProduct
    );

    $('productSearch')?.addEventListener(
        'input',
        renderProducts
    );

    $('productCategoryFilter')?.addEventListener(
        'change',
        renderProducts
    );

    $('stockFilter')?.addEventListener(
        'change',
        renderProducts
    );

    /* Ventes */

    $('saleProductSearch')?.addEventListener(
        'input',
        renderSaleProducts
    );

    $('saleDiscount')?.addEventListener(
        'input',
        () => {
            renderCart();
            calculateChange();
        }
    );

    $('saleReceived')?.addEventListener(
        'input',
        calculateChange
    );

    $('checkoutBtn')?.addEventListener(
        'click',
        openSaleModal
    );

    $('saleForm')?.addEventListener(
        'submit',
        saveSale
    );

    $('salesDateFilter')?.addEventListener(
        'change',
        renderSales
    );

    $('salesPaymentFilter')?.addEventListener(
        'change',
        renderSales
    );

    /* Achats */

    $('addPurchaseBtn')?.addEventListener(
        'click',
        openPurchaseModal
    );

    $('purchaseForm')?.addEventListener(
        'submit',
        savePurchase
    );

    $('purchaseProduct')?.addEventListener(
        'change',
        () => {

            const product =
                state.products.find(
                    p => p.id === $('purchaseProduct').value
                );

            if (product && $('purchaseUnitPrice')) {
                $('purchaseUnitPrice').value =
                    product.purchasePrice || 0;
            }

            calculatePurchaseTotal();
        }
    );

    $('purchaseQuantity')?.addEventListener(
        'input',
        calculatePurchaseTotal
    );

    $('purchaseUnitPrice')?.addEventListener(
        'input',
        calculatePurchaseTotal
    );

    /* Clients */

    $('addCustomerBtn')?.addEventListener(
        'click',
        () => {

            $('customerForm')?.reset();

            openModal('customerModal');
        }
    );

    $('customerForm')?.addEventListener(
        'submit',
        saveCustomer
    );

    $('customerSearch')?.addEventListener(
        'input',
        renderCustomers
    );

    /* Fournisseurs */

    $('addSupplierBtn')?.addEventListener(
        'click',
        () => {

            $('supplierForm')?.reset();

            openModal('supplierModal');
        }
    );

    $('supplierForm')?.addEventListener(
        'submit',
        saveSupplier
    );

    $('supplierSearch')?.addEventListener(
        'input',
        renderSuppliers
    );

    /* Dépenses */

    $('addExpenseBtn')?.addEventListener(
        'click',
        () => {

            $('expenseForm')?.reset();

            if ($('expenseDate'))
                $('expenseDate').value = today();

            openModal('expenseModal');
        }
    );

    $('expenseForm')?.addEventListener(
        'submit',
        saveExpense
    );

    /* Caisse */

    $('cashForm')?.addEventListener(
        'submit',
        saveCashAction
    );

    /* Rapports */

    $('reportStartDate')?.addEventListener(
        'change',
        renderReports
    );

    $('reportEndDate')?.addEventListener(
        'change',
        renderReports
    );

    $('generateReportBtn')?.addEventListener(
        'click',
        renderReports
    );

    $('printReportBtn')?.addEventListener(
        'click',
        () => window.print()
    );

    /* Fermeture des modales */

    document.querySelectorAll('[data-close-modal]')
        .forEach(button => {

            button.addEventListener('click', () => {

                closeModal(button.dataset.closeModal);
            });
        });

    document.querySelectorAll('.modal')
        .forEach(modal => {

            modal.addEventListener('click', event => {

                if (event.target === modal) {
                    modal.classList.add('hidden');
                    modal.style.display = 'none';
                }
            });
        });

    document.addEventListener('keydown', event => {

        if (event.key === 'Escape') {
            closeAllModals();
        }
    });

    /* Notification */

    $('notificationBtn')?.addEventListener(
        'click',
        () => {

            showSection('dashboard');

            $('dashboardAlerts')?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    );
}


/* =========================================================
   TOTAL ACHAT
   ========================================================= */

function calculatePurchaseTotal() {

    const quantity =
        number($('purchaseQuantity')?.value);

    const price =
        number($('purchaseUnitPrice')?.value);

    const total = quantity * price;

    if ($('purchaseTotal')) {
        $('purchaseTotal').value = Math.round(total);
    }
}


/* =========================================================
   RENDU GLOBAL
   ========================================================= */

function renderAll() {

    renderSupplierOptions();
    renderPurchaseProductOptions();

    renderDashboard();
    renderSales();
    renderProducts();
    renderPurchases();
    renderCustomers();
    renderSuppliers();
    renderExpenses();
    renderCash();
    renderReports();
}


/* =========================================================
   DONNÉES DE DÉMONSTRATION
   ========================================================= */

function createDemoData() {

    if (state.products.length > 0) return;

    state.products = [

        {
            id: uid('PROD'),
            name: 'Paracétamol 500mg',
            category: 'Médicaments',
            purchasePrice: 3000,
            salePrice: 5000,
            stock: 50,
            alertStock: 10,
            expiry: '',
            lot: '',
            supplierId: '',
            description: '',
            createdAt: now()
        },

        {
            id: uid('PROD'),
            name: 'Vitamine C',
            category: 'Vitamines',
            purchasePrice: 5000,
            salePrice: 8000,
            stock: 30,
            alertStock: 5,
            expiry: '',
            lot: '',
            supplierId: '',
            description: '',
            createdAt: now()
        },

        {
            id: uid('PROD'),
            name: 'Amoxicilline',
            category: 'Antibiotiques',
            purchasePrice: 7000,
            salePrice: 10000,
            stock: 20,
            alertStock: 5,
            expiry: '',
            lot: '',
            supplierId: '',
            description: '',
            createdAt: now()
        }
    ];

    saveState();
}


/* =========================================================
   INITIALISATION
   ========================================================= */

function init() {

    loadState();

    /*
       Si tu veux démarrer avec quelques produits
       de démonstration, cette fonction les ajoute
       uniquement lorsque la base est vide.
    */

    createDemoData();

    /* Dates par défaut */

    if ($('reportStartDate'))
        $('reportStartDate').value = today();

    if ($('reportEndDate'))
        $('reportEndDate').value = today();

    if ($('salesDateFilter'))
        $('salesDateFilter').value = '';

    if ($('expenseDate'))
        $('expenseDate').value = today();

    if ($('purchaseDate'))
        $('purchaseDate').value = today();

    bindEvents();

    renderAll();

    showSection('dashboard');
}


/* =========================================================
   DÉMARRAGE SÉCURISÉ
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    try {

        init();

    } catch (error) {

        console.error(
            'Erreur PHARMACIE BADU :',
            error
        );

        /*
           Très important :
           même en cas d'erreur JavaScript,
           on ne laisse pas l'écran
           "Chargement..." bloqué.
        */

        showApp();

        setTimeout(() => {

            toast(
                'Une erreur est survenue. Consultez la console.',
                'error'
            );

        }, 500);
    }

    /*
       Sécurité supplémentaire contre
       un écran de chargement bloqué.
    */

    setTimeout(showApp, 1500);
});


/* =========================================================
   FIN
   ========================================================= */
