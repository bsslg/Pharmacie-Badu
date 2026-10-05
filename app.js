/* =========================================================
   PHARMACIE BADU - APPLICATION DE GESTION
   Version 1.0
   Stockage local du navigateur
   ========================================================= */

"use strict";

const STORAGE_KEY = "PHARMACIE_BADU_V1";
const EXPIRING_DAYS = 30;

let state = loadState();
let cart = [];
let editingProductId = null;
let editingCustomerId = null;
let editingSupplierId = null;

/* =========================================================
   OUTILS
   ========================================================= */

const $ = (id) => document.getElementById(id);

function uid(prefix = "ID") {
    return prefix + "-" + Date.now() + "-" +
        Math.random().toString(36).substring(2, 8).toUpperCase();
}

function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function dateKey(date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return todayKey();

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;
}

function money(value) {
    return new Intl.NumberFormat("fr-FR").format(
        Math.round(Number(value) || 0)
    ) + " GNF";
}

function number(value) {
    return Number(value) || 0;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(value) {
    if (!value) return "-";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return value;

    return d.toLocaleDateString("fr-FR");
}

function formatDateTime(value) {
    if (!value) return "-";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) return value;

    return d.toLocaleString("fr-FR");
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
    const empty = {
        products: [],
        sales: [],
        purchases: [],
        customers: [],
        suppliers: [],
        expenses: [],
        cashSession: null,
        cashMovements: []
    };

    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return empty;

        const data = JSON.parse(saved);

        return {
            ...empty,
            ...data,
            products: data.products || [],
            sales: data.sales || [],
            purchases: data.purchases || [],
            customers: data.customers || [],
            suppliers: data.suppliers || [],
            expenses: data.expenses || [],
            cashMovements: data.cashMovements || []
        };
    } catch (error) {
        console.error("Erreur de chargement :", error);
        return empty;
    }
}

/* =========================================================
   TOAST
   ========================================================= */

function toast(message, type = "success") {
    const container = $("toastContainer");

    if (!container) {
        alert(message);
        return;
    }

    const item = document.createElement("div");

    item.className = `toast ${type}`;

    item.textContent = message;

    container.appendChild(item);

    setTimeout(() => {
        item.remove();
    }, 3500);
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(sectionId) {
    document.querySelectorAll(".content-section").forEach(section => {
        section.classList.remove("active");
    });

    const section = $(sectionId);

    if (section) {
        section.classList.add("active");
    }

    document.querySelectorAll(".menu-item").forEach(button => {
        button.classList.remove("active");

        if (button.dataset.section === sectionId) {
            button.classList.add("active");
        }
    });

    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function setupNavigation() {
    document.querySelectorAll(".menu-item").forEach(button => {
        button.addEventListener("click", () => {
            const section = button.dataset.section;

            if (section) {
                showSection(section);
            }
        });
    });

    document.querySelectorAll("[data-section-link]").forEach(button => {
        button.addEventListener("click", () => {
            showSection(button.dataset.sectionLink);
        });
    });

    const mobileMenuBtn = $("mobileMenuBtn");

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", () => {
            const sidebar = document.querySelector(".sidebar");

            if (sidebar) {
                sidebar.classList.toggle("mobile-open");
            }
        });
    }

    const quickSaleBtn = $("quickSaleBtn");

    if (quickSaleBtn) {
        quickSaleBtn.addEventListener("click", () => {
            showSection("sales");

            setTimeout(() => {
                $("saleProductSearch")?.focus();
            }, 200);
        });
    }

    const notificationBtn = $("notificationBtn");

    if (notificationBtn) {
        notificationBtn.addEventListener("click", () => {
            showSection("products");
        });
    }
}

/* =========================================================
   MODALES
   ========================================================= */

function openModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.remove("hidden");
}

function closeModal(id) {
    const modal = $(id);

    if (!modal) return;

    modal.classList.add("hidden");
}

function setupModals() {
    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", () => {
            closeModal(button.dataset.closeModal);
        });
    });

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.classList.add("hidden");
            }
        });
    });
}

/* =========================================================
   PRODUITS
   ========================================================= */

function productById(id) {
    return state.products.find(p => p.id === id);
}

function supplierById(id) {
    return state.suppliers.find(s => s.id === id);
}

function renderSupplierOptions() {
    const select = $("productSupplier");

    if (!select) return;

    const current = select.value;

    select.innerHTML =
        `<option value="">-- Aucun fournisseur --</option>` +
        state.suppliers.map(s => `
            <option value="${s.id}">
                ${escapeHTML(s.name)}
            </option>
        `).join("");

    select.value = current;
}

function openProductModal(id = null) {
    editingProductId = id;

    const form = $("productForm");

    if (form) form.reset();

    $("productId").value = id || "";

    renderSupplierOptions();

    if (id) {
        const product = productById(id);

        if (!product) return;

        $("productId").value = product.id;
        $("productName").value = product.name || "";
        $("productCategory").value = product.category || "";
        $("productPurchasePrice").value = product.purchasePrice || 0;
        $("productSalePrice").value = product.salePrice || 0;
        $("productStock").value = product.stock || 0;
        $("productAlertStock").value = product.alertStock ?? 5;
        $("productExpiry").value = product.expiry || "";
        $("productLot").value = product.lot || "";
        $("productSupplier").value = product.supplierId || "";
        $("productDescription").value = product.description || "";

        const title = $("productModalTitle");

        if (title) title.textContent = "Modifier le produit";
    } else {
        $("productAlertStock").value = 5;

        const title = $("productModalTitle");

        if (title) title.textContent = "Ajouter un produit";
    }

    openModal("productModal");
}

function saveProduct(event) {
    event.preventDefault();

    const name = $("productName").value.trim();

    if (!name) {
        toast("Le nom du produit est obligatoire.", "error");
        return;
    }

    const productData = {
        name,
        category: $("productCategory").value,
        purchasePrice: number($("productPurchasePrice").value),
        salePrice: number($("productSalePrice").value),
        stock: number($("productStock").value),
        alertStock: number($("productAlertStock").value),
        expiry: $("productExpiry").value,
        lot: $("productLot").value.trim(),
        supplierId: $("productSupplier").value,
        description: $("productDescription").value.trim()
    };

    if (editingProductId) {
        const product = productById(editingProductId);

        if (product) {
            Object.assign(product, productData);
            toast("Produit modifié avec succès.");
        }
    } else {
        state.products.push({
            id: uid("PROD"),
            ...productData,
            createdAt: new Date().toISOString()
        });

        toast("Produit ajouté avec succès.");
    }

    saveState();
    closeModal("productModal");
    renderAll();
}

function deleteProduct(id) {
    const product = productById(id);

    if (!product) return;

    if (!confirm(`Supprimer "${product.name}" ?`)) return;

    state.products = state.products.filter(p => p.id !== id);

    saveState();
    renderAll();

    toast("Produit supprimé.");
}

function productStatus(product) {
    const stock = number(product.stock);
    const alertStock = number(product.alertStock);

    if (stock <= 0) {
        return `<span class="badge badge-danger">Rupture</span>`;
    }

    if (stock <= alertStock) {
        return `<span class="badge badge-warning">Stock faible</span>`;
    }

    if (isExpired(product.expiry)) {
        return `<span class="badge badge-danger">Expiré</span>`;
    }

    if (isExpiringSoon(product.expiry)) {
        return `<span class="badge badge-warning">Expire bientôt</span>`;
    }

    return `<span class="badge badge-success">Disponible</span>`;
}

function isExpired(expiry) {
    if (!expiry) return false;

    return expiry < todayKey();
}

function isExpiringSoon(expiry) {
    if (!expiry) return false;

    const today = new Date(todayKey() + "T00:00:00");
    const expiryDate = new Date(expiry + "T00:00:00");

    if (expiryDate < today) return false;

    const difference =
        (expiryDate - today) / (1000 * 60 * 60 * 24);

    return difference <= EXPIRING_DAYS;
}

function renderProducts() {
    const table = $("productsTable");

    if (!table) return;

    const search = ($("productSearch")?.value || "").toLowerCase();
    const category = $("productCategoryFilter")?.value || "";
    const stockFilter = $("stockFilter")?.value || "";

    let products = [...state.products];

    products = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(search) ||
            (product.category || "").toLowerCase().includes(search) ||
            (product.lot || "").toLowerCase().includes(search);

        const matchesCategory =
            !category || product.category === category;

        let matchesStock = true;

        if (stockFilter === "low") {
            matchesStock =
                number(product.stock) <= number(product.alertStock);
        }

        if (stockFilter === "out") {
            matchesStock = number(product.stock) <= 0;
        }

        if (stockFilter === "expired") {
            matchesStock = isExpired(product.expiry);
        }

        if (stockFilter === "expiring") {
            matchesStock = isExpiringSoon(product.expiry);
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    table.innerHTML = products.length
        ? products.map(product => `
            <tr>
                <td>
                    <strong>${escapeHTML(product.name)}</strong>
                    ${product.lot
                        ? `<small>Lot : ${escapeHTML(product.lot)}</small>`
                        : ""}
                </td>

                <td>${escapeHTML(product.category || "-")}</td>

                <td>${money(product.purchasePrice)}</td>

                <td>${money(product.salePrice)}</td>

                <td>
                    <strong>${number(product.stock)}</strong>
                </td>

                <td>
                    ${product.expiry
                        ? formatDate(product.expiry)
                        : "-"}
                </td>

                <td>${productStatus(product)}</td>

                <td>
                    <div class="table-actions">
                        <button
                            class="table-action-btn"
                            onclick="editProduct('${product.id}')">
                            Modifier
                        </button>

                        <button
                            class="table-action-btn delete"
                            onclick="removeProduct('${product.id}')">
                            Supprimer
                        </button>
                    </div>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="8" class="empty-state">
                    Aucun produit enregistré.
                </td>
            </tr>
        `;

    const totalProducts = $("totalProducts");
    const lowStockProducts = $("lowStockProducts");
    const expiredProducts = $("expiredProducts");
    const expiringProducts = $("expiringProducts");

    if (totalProducts) {
        totalProducts.textContent = state.products.length;
    }

    if (lowStockProducts) {
        lowStockProducts.textContent =
            state.products.filter(p =>
                number(p.stock) <= number(p.alertStock)
            ).length;
    }

    if (expiredProducts) {
        expiredProducts.textContent =
            state.products.filter(p => isExpired(p.expiry)).length;
    }

    if (expiringProducts) {
        expiringProducts.textContent =
            state.products.filter(p => isExpiringSoon(p.expiry)).length;
    }

    updateCategoryFilter();
}

function updateCategoryFilter() {
    const select = $("productCategoryFilter");

    if (!select) return;

    const current = select.value;

    const categories = [
        ...new Set(
            state.products
                .map(p => p.category)
                .filter(Boolean)
        )
    ].sort();

    select.innerHTML =
        `<option value="">Toutes les catégories</option>` +
        categories.map(category => `
            <option value="${escapeHTML(category)}">
                ${escapeHTML(category)}
            </option>
        `).join("");

    select.value = current;
}

window.editProduct = function(id) {
    openProductModal(id);
};

window.removeProduct = function(id) {
    deleteProduct(id);
};

/* =========================================================
   VENTES
   ========================================================= */

function renderSaleProducts() {
    const container = $("saleProductsGrid");

    if (!container) return;

    const search =
        ($("saleProductSearch")?.value || "").toLowerCase();

    const products = state.products.filter(product => {
        return (
            number(product.stock) > 0 &&
            !isExpired(product.expiry) &&
            (
                product.name.toLowerCase().includes(search) ||
                (product.category || "").toLowerCase().includes(search)
            )
        );
    });

    container.innerHTML = products.length
        ? products.map(product => `
            <div
                class="product-sale-card"
                onclick="addToCart('${product.id}')">

                <div class="product-sale-card-icon">
                    💊
                </div>

                <strong>
                    ${escapeHTML(product.name)}
                </strong>

                <div class="product-sale-card-price">
                    ${money(product.salePrice)}
                </div>

                <div class="product-sale-card-stock">
                    Stock : ${number(product.stock)}
                </div>
            </div>
        `).join("")
        : `
            <div class="empty-state">
                Aucun produit disponible.
            </div>
        `;
}

window.addToCart = function(id) {
    const product = productById(id);

    if (!product) return;

    if (number(product.stock) <= 0) {
        toast("Produit en rupture de stock.", "error");
        return;
    }

    if (isExpired(product.expiry)) {
        toast("Ce produit est expiré.", "error");
        return;
    }

    const existing = cart.find(item => item.productId === id);

    if (existing) {
        if (existing.quantity >= number(product.stock)) {
            toast("Stock insuffisant.", "error");
            return;
        }

        existing.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitPrice: number(product.salePrice),
            purchasePrice: number(product.purchasePrice)
        });
    }

    renderCart();
};

function removeFromCart(id) {
    cart = cart.filter(item => item.productId !== id);
    renderCart();
}

function changeCartQuantity(id, amount) {
    const item = cart.find(x => x.productId === id);

    if (!item) return;

    const product = productById(id);

    if (!product) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    if (item.quantity > number(product.stock)) {
        item.quantity = number(product.stock);
        toast("Quantité limitée au stock disponible.", "warning");
    }

    renderCart();
}

function cartSubtotal() {
    return cart.reduce(
        (total, item) =>
            total + item.quantity * item.unitPrice,
        0
    );
}

function currentDiscount() {
    return number($("saleDiscount")?.value);
}

function cartTotal() {
    return Math.max(
        0,
        cartSubtotal() - currentDiscount()
    );
}

function renderCart() {
    const container = $("cartItems");

    if (!container) return;

    if (!cart.length) {
        container.innerHTML = `
            <div class="empty-state">
                Le panier est vide.
            </div>
        `;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">

                <div class="cart-item-info">
                    <strong>${escapeHTML(item.name)}</strong>
                    <small>${money(item.unitPrice)} / unité</small>
                </div>

                <div class="cart-item-controls">

                    <button
                        class="quantity-btn"
                        onclick="changeQuantity('${item.productId}', -1)">
                        −
                    </button>

                    <span class="cart-item-quantity">
                        ${item.quantity}
                    </span>

                    <button
                        class="quantity-btn"
                        onclick="changeQuantity('${item.productId}', 1)">
                        +
                    </button>

                    <button
                        class="quantity-btn"
                        onclick="removeCartItem('${item.productId}')">
                        ×
                    </button>

                </div>

                <strong>
                    ${money(item.quantity * item.unitPrice)}
                </strong>

            </div>
        `).join("");
    }

    const count = $("cartCount");
    const subtotal = $("cartSubtotal");
    const discount = $("cartDiscount");
    const total = $("cartTotal");

    if (count) {
        count.textContent =
            cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    if (subtotal) {
        subtotal.textContent = money(cartSubtotal());
    }

    if (discount) {
        discount.textContent = money(currentDiscount());
    }

    if (total) {
        total.textContent = money(cartTotal());
    }
}

window.changeQuantity = function(id, amount) {
    changeCartQuantity(id, amount);
};

window.removeCartItem = function(id) {
    removeFromCart(id);
};

/* =========================================================
   FINALISATION VENTE
   ========================================================= */

function openSaleCheckout() {
    if (!cart.length) {
        toast("Ajoutez au moins un produit.", "warning");
        return;
    }

    updateCheckoutSummary();

    const received = $("saleReceived");

    if (received) {
        received.value = cartTotal();
    }

    calculateChange();

    openModal("saleModal");
}

function updateCheckoutSummary() {
    const subtotal = cartSubtotal();
    const discount = currentDiscount();
    const total = Math.max(0, subtotal - discount);

    if ($("checkoutSubtotal")) {
        $("checkoutSubtotal").textContent = money(subtotal);
    }

    if ($("checkoutDiscount")) {
        $("checkoutDiscount").textContent = money(discount);
    }

    if ($("checkoutTotal")) {
        $("checkoutTotal").textContent = money(total);
    }
}

function calculateChange() {
    const total = cartTotal();
    const received = number($("saleReceived")?.value);

    const change = Math.max(0, received - total);

    if ($("checkoutChange")) {
        $("checkoutChange").textContent = money(change);
    }
}

function saveSale(event) {
    event.preventDefault();

    if (!cart.length) {
        toast("Le panier est vide.", "error");
        return;
    }

    const subtotal = cartSubtotal();
    const discount = currentDiscount();

    if (discount > subtotal) {
        toast("La remise ne peut pas dépasser le sous-total.", "error");
        return;
    }

    const total = subtotal - discount;
    const payment = $("salePayment").value || "Espèces";
    const received = number($("saleReceived").value);

    if (received < total) {
        toast("Le montant reçu est insuffisant.", "error");
        return;
    }

    for (const item of cart) {
        const product = productById(item.productId);

        if (!product) {
            toast(`Produit introuvable : ${item.name}`, "error");
            return;
        }

        if (number(product.stock) < item.quantity) {
            toast(`Stock insuffisant pour ${product.name}.`, "error");
            return;
        }
    }

    const customerId = $("saleCustomer")?.value || "";

    const customer =
        state.customers.find(c => c.id === customerId);

    const sale = {
        id: uid("VTE"),
        reference: "VTE-" + Date.now(),
        date: new Date().toISOString(),
        dateKey: todayKey(),

        customerId,
        customerName: customer ? customer.name : "Client comptant",

        items: cart.map(item => ({
            ...item,
            total: item.quantity * item.unitPrice
        })),

        subtotal,
        discount,
        total,
        payment,

        received,
        change: received - total
    };

    cart.forEach(item => {
        const product = productById(item.productId);

        product.stock =
            number(product.stock) - item.quantity;
    });

    state.sales.push(sale);

    state.cashMovements.push({
        id: uid("MVT"),
        date: sale.date,
        type: "sale",
        label: `Vente ${sale.reference}`,
        amountIn: total,
        amountOut: 0,
        payment
    });

    saveState();

    cart = [];

    $("saleForm").reset();

    closeModal("saleModal");

    renderAll();

    toast(
        `Vente ${sale.reference} enregistrée : ${money(total)}`
    );
}

/* =========================================================
   CLIENTS
   ========================================================= */

function renderCustomerOptions() {
    const select = $("saleCustomer");

    if (!select) return;

    const current = select.value;

    select.innerHTML =
        `<option value="">Client comptant</option>` +
        state.customers.map(customer => `
            <option value="${customer.id}">
                ${escapeHTML(customer.name)}
            </option>
        `).join("");

    select.value = current;
}

function openCustomerModal(id = null) {
    editingCustomerId = id;

    $("customerForm")?.reset();

    if (id) {
        const customer =
            state.customers.find(c => c.id === id);

        if (!customer) return;

        $("customerName").value = customer.name || "";
        $("customerPhone").value = customer.phone || "";
        $("customerAddress").value = customer.address || "";
        $("customerNotes").value = customer.notes || "";
    }

    openModal("customerModal");
}

function saveCustomer(event) {
    event.preventDefault();

    const name = $("customerName").value.trim();

    if (!name) {
        toast("Le nom du client est obligatoire.", "error");
        return;
    }

    const data = {
        name,
        phone: $("customerPhone").value.trim(),
        address: $("customerAddress").value.trim(),
        notes: $("customerNotes").value.trim()
    };

    if (editingCustomerId) {
        const customer =
            state.customers.find(c => c.id === editingCustomerId);

        if (customer) {
            Object.assign(customer, data);
        }
    } else {
        state.customers.push({
            id: uid("CLI"),
            ...data,
            createdAt: new Date().toISOString()
        });
    }

    saveState();
    closeModal("customerModal");
    renderAll();

    toast("Client enregistré.");
}

function deleteCustomer(id) {
    if (!confirm("Supprimer ce client ?")) return;

    state.customers =
        state.customers.filter(c => c.id !== id);

    saveState();
    renderAll();

    toast("Client supprimé.");
}

function renderCustomers() {
    const table = $("customersTable");

    if (!table) return;

    const search =
        ($("customerSearch")?.value || "").toLowerCase();

    const customers = state.customers.filter(customer =>
        customer.name.toLowerCase().includes(search) ||
        (customer.phone || "").toLowerCase().includes(search)
    );

    table.innerHTML = customers.length
        ? customers.map(customer => `
            <tr>
                <td>${escapeHTML(customer.name)}</td>
                <td>${escapeHTML(customer.phone || "-")}</td>
                <td>${escapeHTML(customer.address || "-")}</td>
                <td>
                    ${state.sales.filter(
                        s => s.customerId === customer.id
                    ).length}
                </td>
                <td>
                    <button
                        class="table-action-btn delete"
                        onclick="removeCustomer('${customer.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="5" class="empty-state">
                    Aucun client.
                </td>
            </tr>
        `;
}

window.removeCustomer = function(id) {
    deleteCustomer(id);
};

/* =========================================================
   FOURNISSEURS
   ========================================================= */

function openSupplierModal(id = null) {
    editingSupplierId = id;

    $("supplierForm")?.reset();

    if (id) {
        const supplier =
            state.suppliers.find(s => s.id === id);

        if (!supplier) return;

        $("supplierName").value = supplier.name || "";
        $("supplierContact").value = supplier.contact || "";
        $("supplierPhone").value = supplier.phone || "";
        $("supplierEmail").value = supplier.email || "";
        $("supplierAddress").value = supplier.address || "";
    }

    openModal("supplierModal");
}

function saveSupplier(event) {
    event.preventDefault();

    const name = $("supplierName").value.trim();

    if (!name) {
        toast("Le nom du fournisseur est obligatoire.", "error");
        return;
    }

    const data = {
        name,
        contact: $("supplierContact").value.trim(),
        phone: $("supplierPhone").value.trim(),
        email: $("supplierEmail").value.trim(),
        address: $("supplierAddress").value.trim()
    };

    if (editingSupplierId) {
        const supplier =
            state.suppliers.find(s => s.id === editingSupplierId);

        if (supplier) Object.assign(supplier, data);
    } else {
        state.suppliers.push({
            id: uid("FOU"),
            ...data,
            createdAt: new Date().toISOString()
        });
    }

    saveState();
    closeModal("supplierModal");
    renderAll();

    toast("Fournisseur enregistré.");
}

function deleteSupplier(id) {
    if (!confirm("Supprimer ce fournisseur ?")) return;

    state.suppliers =
        state.suppliers.filter(s => s.id !== id);

    saveState();
    renderAll();

    toast("Fournisseur supprimé.");
}

function renderSuppliers() {
    const table = $("suppliersTable");

    if (!table) return;

    const search =
        ($("supplierSearch")?.value || "").toLowerCase();

    const suppliers = state.suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(search) ||
        (supplier.phone || "").toLowerCase().includes(search)
    );

    table.innerHTML = suppliers.length
        ? suppliers.map(supplier => `
            <tr>
                <td>${escapeHTML(supplier.name)}</td>
                <td>${escapeHTML(supplier.contact || "-")}</td>
                <td>${escapeHTML(supplier.phone || "-")}</td>
                <td>${escapeHTML(supplier.email || "-")}</td>
                <td>${escapeHTML(supplier.address || "-")}</td>
                <td>
                    <button
                        class="table-action-btn delete"
                        onclick="removeSupplier('${supplier.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="6" class="empty-state">
                    Aucun fournisseur.
                </td>
            </tr>
        `;
}

window.removeSupplier = function(id) {
    deleteSupplier(id);
};

/* =========================================================
   ACHATS
   ========================================================= */

function renderPurchaseOptions() {
    const select = $("purchaseProduct");

    if (!select) return;

    select.innerHTML =
        `<option value="">-- Choisir un produit --</option>` +
        state.products.map(product => `
            <option value="${product.id}">
                ${escapeHTML(product.name)}
            </option>
        `).join("");
}

function updatePurchasePrice() {
    const product =
        productById($("purchaseProduct")?.value);

    if (!product) return;

    $("purchaseUnitPrice").value =
        number(product.purchasePrice);

    calculatePurchaseTotal();
}

function calculatePurchaseTotal() {
    const quantity =
        number($("purchaseQuantity")?.value);

    const price =
        number($("purchaseUnitPrice")?.value);

    const total = quantity * price;

    if ($("purchaseTotal")) {
        $("purchaseTotal").textContent = money(total);
    }
}

function savePurchase(event) {
    event.preventDefault();

    const productId = $("purchaseProduct").value;
    const quantity = number($("purchaseQuantity").value);
    const unitPrice = number($("purchaseUnitPrice").value);

    if (!productId) {
        toast("Choisissez un produit.", "error");
        return;
    }

    if (quantity <= 0) {
        toast("La quantité doit être supérieure à zéro.", "error");
        return;
    }

    const product = productById(productId);

    if (!product) return;

    const purchase = {
        id: uid("ACH"),
        reference:
            $("purchaseReference").value.trim() ||
            "ACH-" + Date.now(),

        productId,
        productName: product.name,

        supplierId: $("purchaseSupplier").value,
        supplierName:
            supplierById($("purchaseSupplier").value)?.name || "",

        quantity,
        unitPrice,

        total: quantity * unitPrice,

        date:
            $("purchaseDate").value
                ? new Date(
                    $("purchaseDate").value + "T12:00:00"
                ).toISOString()
                : new Date().toISOString(),

        dateKey:
            $("purchaseDate").value ||
            todayKey()
    };

    product.stock =
        number(product.stock) + quantity;

    state.purchases.push(purchase);

    saveState();

    closeModal("purchaseModal");

    $("purchaseForm").reset();

    renderAll();

    toast("Achat enregistré et stock mis à jour.");
}

function deletePurchase(id) {
    const purchase =
        state.purchases.find(p => p.id === id);

    if (!purchase) return;

    if (!confirm("Supprimer cet achat ?")) return;

    const product = productById(purchase.productId);

    if (product) {
        product.stock =
            Math.max(
                0,
                number(product.stock) - number(purchase.quantity)
            );
    }

    state.purchases =
        state.purchases.filter(p => p.id !== id);

    saveState();
    renderAll();

    toast("Achat supprimé.");
}

function renderPurchases() {
    const table = $("purchasesTable");

    if (!table) return;

    const purchases =
        [...state.purchases].sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        );

    table.innerHTML = purchases.length
        ? purchases.map(purchase => `
            <tr>
                <td>${escapeHTML(purchase.reference)}</td>
                <td>${escapeHTML(purchase.productName)}</td>
                <td>${escapeHTML(purchase.supplierName || "-")}</td>
                <td>${purchase.quantity}</td>
                <td>${money(purchase.unitPrice)}</td>
                <td>${money(purchase.total)}</td>
                <td>${formatDate(purchase.date)}</td>
                <td>
                    <button
                        class="table-action-btn delete"
                        onclick="removePurchase('${purchase.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="8" class="empty-state">
                    Aucun achat.
                </td>
            </tr>
        `;
}

window.removePurchase = function(id) {
    deletePurchase(id);
};

/* =========================================================
   DEPENSES
   ========================================================= */

function saveExpense(event) {
    event.preventDefault();

    const label = $("expenseLabel").value.trim();
    const amount = number($("expenseAmount").value);

    if (!label) {
        toast("Le libellé est obligatoire.", "error");
        return;
    }

    if (amount <= 0) {
        toast("Le montant doit être supérieur à zéro.", "error");
        return;
    }

    const date =
        $("expenseDate").value || todayKey();

    const expense = {
        id: uid("DEP"),
        label,
        category: $("expenseCategory").value,
        amount,
        payment: $("expensePayment").value || "Espèces",
        date:
            new Date(date + "T12:00:00").toISOString(),
        dateKey: date,
        note: $("expenseNote").value.trim()
    };

    state.expenses.push(expense);

    state.cashMovements.push({
        id: uid("MVT"),
        date: expense.date,
        type: "expense",
        label: expense.label,
        amountIn: 0,
        amountOut: expense.amount,
        payment: expense.payment
    });

    saveState();

    closeModal("expenseModal");

    $("expenseForm").reset();

    renderAll();

    toast("Dépense enregistrée.");
}

function deleteExpense(id) {
    if (!confirm("Supprimer cette dépense ?")) return;

    state.expenses =
        state.expenses.filter(e => e.id !== id);

    saveState();
    renderAll();

    toast("Dépense supprimée.");
}

function renderExpenses() {
    const table = $("expensesTable");

    if (!table) return;

    const expenses =
        [...state.expenses].sort(
            (a, b) =>
                new Date(b.date) - new Date(a.date)
        );

    table.innerHTML = expenses.length
        ? expenses.map(expense => `
            <tr>
                <td>${formatDate(expense.date)}</td>
                <td>${escapeHTML(expense.label)}</td>
                <td>${escapeHTML(expense.category || "-")}</td>
                <td>${escapeHTML(expense.payment)}</td>
                <td>${money(expense.amount)}</td>
                <td>${escapeHTML(expense.note || "-")}</td>
                <td>
                    <button
                        class="table-action-btn delete"
                        onclick="removeExpense('${expense.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="7" class="empty-state">
                    Aucune dépense.
                </td>
            </tr>
        `;
}

window.removeExpense = function(id) {
    deleteExpense(id);
};

/* =========================================================
   VENTES - TABLEAU
   ========================================================= */

function renderSales() {
    const table = $("salesTable");

    if (!table) return;

    const dateFilter =
        $("salesDateFilter")?.value || "";

    const paymentFilter =
        $("salesPaymentFilter")?.value || "";

    let sales = [...state.sales];

    if (dateFilter) {
        sales = sales.filter(
            sale => sale.dateKey === dateFilter
        );
    }

    if (paymentFilter) {
        sales = sales.filter(
            sale => sale.payment === paymentFilter
        );
    }

    sales.sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    table.innerHTML = sales.length
        ? sales.map(sale => `
            <tr>
                <td>${escapeHTML(sale.reference)}</td>

                <td>${formatDateTime(sale.date)}</td>

                <td>
                    ${escapeHTML(
                        sale.customerName || "Client comptant"
                    )}
                </td>

                <td>
                    ${sale.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                    )}
                </td>

                <td>${money(sale.total)}</td>

                <td>
                    <span class="badge badge-info">
                        ${escapeHTML(sale.payment)}
                    </span>
                </td>

                <td>
                    <button
                        class="table-action-btn delete"
                        onclick="removeSale('${sale.id}')">
                        Annuler
                    </button>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="7" class="empty-state">
                    Aucune vente.
                </td>
            </tr>
        `;
}

function deleteSale(id) {
    const sale = state.sales.find(s => s.id === id);

    if (!sale) return;

    if (!confirm(
        "Annuler cette vente ? Le stock sera restauré."
    )) return;

    sale.items.forEach(item => {
        const product = productById(item.productId);

        if (product) {
            product.stock =
                number(product.stock) + number(item.quantity);
        }
    });

    state.sales =
        state.sales.filter(s => s.id !== id);

    state.cashMovements =
        state.cashMovements.filter(
            movement =>
                movement.label !== `Vente ${sale.reference}`
        );

    saveState();

    renderAll();

    toast("Vente annulée et stock restauré.");
}

window.removeSale = function(id) {
    deleteSale(id);
};

/* =========================================================
   CAISSE
   ========================================================= */

function getSessionSales() {
    if (!state.cashSession) return [];

    const start =
        new Date(state.cashSession.openedAt).getTime();

    return state.sales.filter(
        sale => new Date(sale.date).getTime() >= start
    );
}

function getSessionExpenses() {
    if (!state.cashSession) return [];

    const start =
        new Date(state.cashSession.openedAt).getTime();

    return state.expenses.filter(
        expense => new Date(expense.date).getTime() >= start
    );
}

function cashTotals() {
    if (!state.cashSession) {
        return {
            opening: 0,
            in: 0,
            out: 0,
            physical: 0,
            electronic: 0,
            balance: 0
        };
    }

    const opening =
        number(state.cashSession.openingAmount);

    const sales = getSessionSales();

    const expenses = getSessionExpenses();

    let physical = 0;
    let electronic = 0;

    sales.forEach(sale => {
        if (sale.payment === "Espèces") {
            physical += number(sale.total);
        } else {
            electronic += number(sale.total);
        }
    });

    expenses.forEach(expense => {
        if (expense.payment === "Espèces") {
            physical -= number(expense.amount);
        } else {
            electronic -= number(expense.amount);
        }
    });

    const inTotal =
        sales.reduce(
            (sum, sale) => sum + number(sale.total),
            0
        );

    const outTotal =
        expenses.reduce(
            (sum, expense) => sum + number(expense.amount),
            0
        );

    return {
        opening,
        in: inTotal,
        out: outTotal,
        physical: opening + physical,
        electronic,
        balance: opening + inTotal - outTotal
    };
}

function openCashModal() {
    if (state.cashSession) {
        closeCash();
        return;
    }

    $("cashModalTitle").textContent = "Ouverture de caisse";

    $("cashForm").reset();

    openModal("cashModal");
}

function saveCashOpening(event) {
    event.preventDefault();

    if (state.cashSession) {
        toast("La caisse est déjà ouverte.", "warning");
        return;
    }

    const amount = number($("cashOpeningAmount").value);

    if (amount < 0) {
        toast("Montant invalide.", "error");
        return;
    }

    const now = new Date().toISOString();

    state.cashSession = {
        id: uid("CAISSE"),
        openedAt: now,
        openingAmount: amount,
        note: $("cashNote").value.trim()
    };

    state.cashMovements.push({
        id: uid("MVT"),
        date: now,
        type: "opening",
        label: "Ouverture de caisse",
        amountIn: amount,
        amountOut: 0,
        payment: "Espèces"
    });

    saveState();

    closeModal("cashModal");

    renderAll();

    toast("Caisse ouverte avec succès.");
}

function closeCash() {
    if (!state.cashSession) {
        openCashModal();
        return;
    }

    const totals = cashTotals();

    const confirmed = confirm(
        `Fermer la caisse ?\n\n` +
        `Solde : ${money(totals.balance)}`
    );

    if (!confirmed) return;

    const now = new Date().toISOString();

    state.cashMovements.push({
        id: uid("MVT"),
        date: now,
        type: "closing",
        label: "Clôture de caisse",
        amountIn: 0,
        amountOut: totals.balance,
        payment: "Espèces"
    });

    state.cashSession = null;

    saveState();

    renderAll();

    toast("Caisse clôturée.");
}

function renderCash() {
    const totals = cashTotals();

    if ($("cashBalance")) {
        $("cashBalance").textContent = money(totals.balance);
    }

    if ($("cashOpening")) {
        $("cashOpening").textContent = money(totals.opening);
    }

    if ($("cashIn")) {
        $("cashIn").textContent = money(totals.in);
    }

    if ($("cashOut")) {
        $("cashOut").textContent = money(totals.out);
    }

    const status = $("cashSessionStatus");
    const action = $("cashMainAction");

    if (state.cashSession) {
        if (status) {
            status.innerHTML =
                `<span class="badge badge-success">
                    Caisse ouverte
                </span>`;
        }

        if (action) {
            action.textContent = "Fermer la caisse";
        }
    } else {
        if (status) {
            status.innerHTML =
                `<span class="badge badge-danger">
                    Caisse fermée
                </span>`;
        }

        if (action) {
            action.textContent = "Ouvrir la caisse";
        }
    }

    renderCashTable();
}

function renderCashTable() {
    const table = $("cashTable");

    if (!table) return;

    let movements = [...state.cashMovements];

    if (state.cashSession) {
        const start =
            new Date(state.cashSession.openedAt).getTime();

        movements = movements.filter(
            m => new Date(m.date).getTime() >= start
        );
    }

    movements.sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    table.innerHTML = movements.length
        ? movements.slice(0, 100).map(movement => `
            <tr>
                <td>${formatDateTime(movement.date)}</td>
                <td>${escapeHTML(movement.label)}</td>
                <td>${escapeHTML(movement.payment || "-")}</td>
                <td>${money(movement.amountIn)}</td>
                <td>${money(movement.amountOut)}</td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="5" class="empty-state">
                    Aucun mouvement.
                </td>
            </tr>
        `;
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function salesForDate(date) {
    return state.sales.filter(
        sale => sale.dateKey === date
    );
}

function expensesForDate(date) {
    return state.expenses.filter(
        expense => expense.dateKey === date
    );
}

function calculateSaleMargin(sale) {
    return sale.items.reduce(
        (total, item) =>
            total +
            (
                number(item.unitPrice) -
                number(item.purchasePrice)
            ) * number(item.quantity),
        0
    );
}

function dashboardData() {
    const today = todayKey();

    const sales = salesForDate(today);
    const expenses = expensesForDate(today);

    const revenue =
        sales.reduce(
            (sum, sale) => sum + number(sale.total),
            0
        );

    const expenseTotal =
        expenses.reduce(
            (sum, expense) => sum + number(expense.amount),
            0
        );

    const grossMargin =
        sales.reduce(
            (sum, sale) => sum + calculateSaleMargin(sale),
            0
        );

    const profit =
        grossMargin - expenseTotal;

    return {
        revenue,
        sales: sales.length,
        expenses: expenseTotal,
        profit
    };
}

function renderDashboard() {
    const data = dashboardData();

    if ($("dashboardRevenue")) {
        $("dashboardRevenue").textContent =
            money(data.revenue);
    }

    if ($("dashboardSales")) {
        $("dashboardSales").textContent =
            data.sales;
    }

    if ($("dashboardExpenses")) {
        $("dashboardExpenses").textContent =
            money(data.expenses);
    }

    if ($("dashboardProfit")) {
        $("dashboardProfit").textContent =
            money(data.profit);
    }

    const totals = cashTotals();

    if ($("dashboardCash")) {
        $("dashboardCash").textContent =
            money(totals.balance);
    }

    if ($("dashboardCashPhysical")) {
        $("dashboardCashPhysical").textContent =
            money(totals.physical);
    }

    if ($("dashboardCashElectronic")) {
        $("dashboardCashElectronic").textContent =
            money(totals.electronic);
    }

    if ($("cashStatusBadge")) {
        $("cashStatusBadge").innerHTML =
            state.cashSession
                ? `<span class="badge badge-success">Ouverte</span>`
                : `<span class="badge badge-danger">Fermée</span>`;
    }

    renderDashboardAlerts();
    renderRecentSales();
}

function getAlerts() {
    const alerts = [];

    state.products.forEach(product => {
        if (number(product.stock) <= 0) {
            alerts.push({
                type: "danger",
                title: "Rupture de stock",
                text: `${product.name} est en rupture.`
            });
        } else if (
            number(product.stock) <= number(product.alertStock)
        ) {
            alerts.push({
                type: "warning",
                title: "Stock faible",
                text:
                    `${product.name} : ` +
                    `${product.stock} unité(s) restante(s).`
            });
        }

        if (isExpired(product.expiry)) {
            alerts.push({
                type: "danger",
                title: "Produit expiré",
                text:
                    `${product.name} a dépassé sa date d'expiration.`
            });
        } else if (isExpiringSoon(product.expiry)) {
            alerts.push({
                type: "warning",
                title: "Expiration prochaine",
                text:
                    `${product.name} expire bientôt.`
            });
        }
    });

    return alerts;
}

function renderDashboardAlerts() {
    const container = $("dashboardAlerts");

    if (!container) return;

    const alerts = getAlerts();

    if ($("alertCount")) {
        $("alertCount").textContent = alerts.length;
    }

    const notificationCount =
        $("notificationCount");

    if (notificationCount) {
        notificationCount.textContent = alerts.length;
    }

    container.innerHTML = alerts.length
        ? alerts.slice(0, 10).map(alert => `
            <div class="alert-item ${alert.type}">

                <div class="alert-item-icon">
                    ${alert.type === "danger" ? "⚠️" : "🔔"}
                </div>

                <div class="alert-item-info">
                    <strong>${escapeHTML(alert.title)}</strong>
                    <span>${escapeHTML(alert.text)}</span>
                </div>

            </div>
        `).join("")
        : `
            <div class="empty-state">
                <div>✅</div>
                Aucune alerte actuellement.
            </div>
        `;
}

function renderRecentSales() {
    const table = $("recentSalesTable");

    if (!table) return;

    const sales =
        [...state.sales]
            .sort(
                (a, b) =>
                    new Date(b.date) - new Date(a.date)
            )
            .slice(0, 8);

    table.innerHTML = sales.length
        ? sales.map(sale => `
            <tr>
                <td>${escapeHTML(sale.reference)}</td>
                <td>${formatDateTime(sale.date)}</td>
                <td>
                    ${escapeHTML(
                        sale.customerName || "Client comptant"
                    )}
                </td>
                <td>${money(sale.total)}</td>
                <td>${escapeHTML(sale.payment)}</td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="5" class="empty-state">
                    Aucune vente aujourd'hui.
                </td>
            </tr>
        `;
}

/* =========================================================
   RAPPORTS
   ========================================================= */

function reportSalesData() {
    const start =
        $("reportStartDate")?.value || todayKey();

    const end =
        $("reportEndDate")?.value || todayKey();

    const sales = state.sales.filter(
        sale =>
            sale.dateKey >= start &&
            sale.dateKey <= end
    );

    const expenses = state.expenses.filter(
        expense =>
            expense.dateKey >= start &&
            expense.dateKey <= end
    );

    return {
        sales,
        expenses,
        start,
        end
    };
}

function generateReport() {
    const data = reportSalesData();

    const revenue =
        data.sales.reduce(
            (sum, sale) => sum + number(sale.total),
            0
        );

    const expenses =
        data.expenses.reduce(
            (sum, expense) => sum + number(expense.amount),
            0
        );

    const margin =
        data.sales.reduce(
            (sum, sale) => sum + calculateSaleMargin(sale),
            0
        );

    const profit = margin - expenses;

    if ($("reportRevenue")) {
        $("reportRevenue").textContent = money(revenue);
    }

    if ($("reportExpenses")) {
        $("reportExpenses").textContent = money(expenses);
    }

    if ($("reportProfit")) {
        $("reportProfit").textContent = money(profit);
    }

    if ($("reportSales")) {
        $("reportSales").textContent = data.sales.length;
    }

    renderTopProducts(data.sales);
}

function renderTopProducts(sales) {
    const table = $("topProductsTable");

    if (!table) return;

    const products = {};

    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!products[item.productId]) {
                products[item.productId] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }

            products[item.productId].quantity +=
                number(item.quantity);

            products[item.productId].revenue +=
                number(item.quantity) *
                number(item.unitPrice);
        });
    });

    const list =
        Object.values(products)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

    table.innerHTML = list.length
        ? list.map(product => `
            <tr>
                <td>${escapeHTML(product.name)}</td>
                <td>${product.quantity}</td>
                <td>${money(product.revenue)}</td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="3" class="empty-state">
                    Aucun résultat.
                </td>
            </tr>
        `;
}

/* =========================================================
   INITIALISATION
   ========================================================= */

function setupDates() {
    const today = todayKey();

    if ($("salesDateFilter")) {
        $("salesDateFilter").value = "";
    }

    if ($("purchaseDate")) {
        $("purchaseDate").value = today;
    }

    if ($("expenseDate")) {
        $("expenseDate").value = today;
    }

    if ($("reportStartDate")) {
        $("reportStartDate").value = today;
    }

    if ($("reportEndDate")) {
        $("reportEndDate").value = today;
    }
}

function setupEvents() {

    /* Navigation */
    setupNavigation();

    /* Modales */
    setupModals();

    /* Produit */
    $("productForm")?.addEventListener(
        "submit",
        saveProduct
    );

    $("addProductBtn")?.addEventListener(
        "click",
        () => openProductModal()
    );

    $("productSearch")?.addEventListener(
        "input",
        renderProducts
    );

    $("productCategoryFilter")?.addEventListener(
        "change",
        renderProducts
    );

    $("stockFilter")?.addEventListener(
        "change",
        renderProducts
    );

    /* Vente */
    $("saleProductSearch")?.addEventListener(
        "input",
        renderSaleProducts
    );

    $("checkoutBtn")?.addEventListener(
        "click",
        openSaleCheckout
    );

    $("saleForm")?.addEventListener(
        "submit",
        saveSale
    );

    $("saleDiscount")?.addEventListener(
        "input",
        () => {
            updateCheckoutSummary();
            calculateChange();
            renderCart();
        }
    );

    $("saleReceived")?.addEventListener(
        "input",
        calculateChange
    );

    $("salesDateFilter")?.addEventListener(
        "change",
        renderSales
    );

    $("salesPaymentFilter")?.addEventListener(
        "change",
        renderSales
    );

    /* Client */
    $("customerForm")?.addEventListener(
        "submit",
        saveCustomer
    );

    $("addCustomerBtn")?.addEventListener(
        "click",
        () => openCustomerModal()
    );

    $("customerSearch")?.addEventListener(
        "input",
        renderCustomers
    );

    /* Fournisseur */
    $("supplierForm")?.addEventListener(
        "submit",
        saveSupplier
    );

    $("addSupplierBtn")?.addEventListener(
        "click",
        () => openSupplierModal()
    );

    $("supplierSearch")?.addEventListener(
        "input",
        renderSuppliers
    );

    /* Achat */
    $("purchaseForm")?.addEventListener(
        "submit",
        savePurchase
    );

    $("addPurchaseBtn")?.addEventListener(
        "click",
        () => {
            $("purchaseForm")?.reset();

            if ($("purchaseDate")) {
                $("purchaseDate").value = todayKey();
            }

            renderPurchaseOptions();

            openModal("purchaseModal");
        }
    );

    $("purchaseProduct")?.addEventListener(
        "change",
        updatePurchasePrice
    );

    $("purchaseQuantity")?.addEventListener(
        "input",
        calculatePurchaseTotal
    );

    $("purchaseUnitPrice")?.addEventListener(
        "input",
        calculatePurchaseTotal
    );

    /* Dépenses */
    $("expenseForm")?.addEventListener(
        "submit",
        saveExpense
    );

    $("addExpenseBtn")?.addEventListener(
        "click",
        () => {
            $("expenseForm")?.reset();

            if ($("expenseDate")) {
                $("expenseDate").value = todayKey();
            }

            openModal("expenseModal");
        }
    );

    /* Caisse */
    $("cashMainAction")?.addEventListener(
        "click",
        openCashModal
    );

    $("cashForm")?.addEventListener(
        "submit",
        saveCashOpening
    );

    /* Rapports */
    $("generateReportBtn")?.addEventListener(
        "click",
        generateReport
    );

    $("printReportBtn")?.addEventListener(
        "click",
        () => window.print()
    );
}

/* =========================================================
   RENDU GLOBAL
   ========================================================= */

function renderAll() {

    renderSupplierOptions();

    renderCustomerOptions();

    renderPurchaseOptions();

    renderProducts();

    renderSaleProducts();

    renderCart();

    renderSales();

    renderPurchases();

    renderCustomers();

    renderSuppliers();

    renderExpenses();

    renderCash();

    renderDashboard();

    generateReport();
}

/* =========================================================
   DÉMARRAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupDates();

    setupEvents();

    renderAll();

    const loadingScreen =
        $("loadingScreen");

    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add("hidden");
        }, 500);
    }

    console.log(
        "PHARMACIE BADU - Application démarrée."
    );
});
