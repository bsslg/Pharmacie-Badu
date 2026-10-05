/* =========================================================
   PHARMACIE BADU - APP.JS
   Version complète
   ========================================================= */

"use strict";

const STORAGE_KEY = "PHARMACIE_BADU_V1";
const EXPIRING_DAYS = 30;

let state = loadState();
let cart = [];


/* =========================================================
   OUTILS
   ========================================================= */

const $ = (id) => document.getElementById(id);

function money(value) {
    return new Intl.NumberFormat("fr-FR").format(
        Number(value) || 0
    ) + " GNF";
}

function number(value) {
    return Number(value) || 0;
}

function today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function dateTime(value) {
    if (!value) return "-";

    const d = new Date(value);

    if (isNaN(d.getTime())) return value;

    return d.toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function uid(prefix = "ID") {
    return (
        prefix +
        "-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).substring(2, 7)
    ).toUpperCase();
}

function reference(prefix) {
    const d = new Date();
    return (
        prefix +
        "-" +
        d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, "0") +
        String(d.getDate()).padStart(2, "0") +
        "-" +
        Math.floor(Math.random() * 9000 + 1000)
    );
}


/* =========================================================
   DONNÉES
   ========================================================= */

function defaultState() {
    return {
        products: [],
        sales: [],
        purchases: [],
        customers: [],
        suppliers: [],
        expenses: [],
        cashSession: null,
        cashMovements: []
    };
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return defaultState();
        }

        const data = JSON.parse(saved);

        return {
            ...defaultState(),
            ...data,
            products: Array.isArray(data.products) ? data.products : [],
            sales: Array.isArray(data.sales) ? data.sales : [],
            purchases: Array.isArray(data.purchases) ? data.purchases : [],
            customers: Array.isArray(data.customers) ? data.customers : [],
            suppliers: Array.isArray(data.suppliers) ? data.suppliers : [],
            expenses: Array.isArray(data.expenses) ? data.expenses : [],
            cashMovements: Array.isArray(data.cashMovements)
                ? data.cashMovements
                : []
        };

    } catch (error) {
        console.error("Erreur chargement données :", error);
        return defaultState();
    }
}

function saveState() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );
    } catch (error) {
        console.error("Erreur sauvegarde :", error);
        toast("Impossible de sauvegarder les données.", "danger");
    }
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function toast(message, type = "success") {

    const container = $("toastContainer");

    if (!container) return;

    const div = document.createElement("div");

    div.className = `toast ${type}`;

    div.innerHTML = `
        <span>${type === "danger" ? "❌" : "✅"}</span>
        <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3500);
}


/* =========================================================
   NAVIGATION
   ========================================================= */

const pageTitles = {
    dashboard: "Tableau de bord",
    sales: "Ventes",
    products: "Produits & Stock",
    purchases: "Achats",
    customers: "Clients",
    suppliers: "Fournisseurs",
    expenses: "Dépenses",
    cash: "Caisse",
    reports: "Rapports"
};

function showSection(section) {

    document.querySelectorAll(".content-section")
        .forEach(el => {
            el.classList.remove("active");
        });

    const target = $(section);

    if (target) {
        target.classList.add("active");
    }

    document.querySelectorAll(".menu-item")
        .forEach(btn => {
            btn.classList.toggle(
                "active",
                btn.dataset.section === section
            );
        });

    if ($("pageTitle")) {
        $("pageTitle").textContent =
            pageTitles[section] || "PHARMACIE BADU";
    }

    document
        .querySelector(".sidebar")
        ?.classList.remove("mobile-open");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
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

function closeAllModals() {

    document.querySelectorAll(".modal")
        .forEach(modal => {
            modal.classList.add("hidden");
        });
}


/* =========================================================
   PRODUITS
   ========================================================= */

function getProduct(id) {
    return state.products.find(p => p.id === id);
}

function productStatus(product) {

    const stock = number(product.stock);
    const alertStock = number(product.alertStock);

    if (stock <= 0) {
        return {
            text: "Rupture",
            className: "badge-danger"
        };
    }

    if (product.expiry) {

        const expiry = new Date(product.expiry);
        const now = new Date(today());

        if (expiry < now) {
            return {
                text: "Expiré",
                className: "badge-danger"
            };
        }

        const limit = new Date(now);
        limit.setDate(
            limit.getDate() + EXPIRING_DAYS
        );

        if (expiry <= limit) {
            return {
                text: "Expire bientôt",
                className: "badge-warning"
            };
        }
    }

    if (stock <= alertStock) {
        return {
            text: "Stock faible",
            className: "badge-warning"
        };
    }

    return {
        text: "Disponible",
        className: "badge-success"
    };
}

function renderSupplierOptions() {

    const productSupplier = $("productSupplier");
    const purchaseSupplier = $("purchaseSupplier");

    const options = `
        <option value="">Aucun fournisseur</option>
        ${state.suppliers.map(s => `
            <option value="${s.id}">
                ${escapeHTML(s.name)}
            </option>
        `).join("")}
    `;

    if (productSupplier) {
        const current = productSupplier.value;
        productSupplier.innerHTML = options;
        productSupplier.value = current;
    }

    if (purchaseSupplier) {
        const current = purchaseSupplier.value;
        purchaseSupplier.innerHTML = options;
        purchaseSupplier.value = current;
    }
}

function renderProductSelect() {

    const select = $("purchaseProduct");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Sélectionner un produit
        </option>

        ${state.products.map(p => `
            <option value="${p.id}">
                ${escapeHTML(p.name)}
            </option>
        `).join("")}
    `;
}

function renderProducts() {

    const tbody = $("productsTable");

    if (!tbody) return;

    const search =
        ($("productSearch")?.value || "")
            .toLowerCase()
            .trim();

    const category =
        $("productCategoryFilter")?.value || "";

    const stockFilter =
        $("stockFilter")?.value || "";

    let products = state.products.filter(p => {

        const matchesSearch =
            !search ||
            p.name.toLowerCase().includes(search) ||
            String(p.lot || "")
                .toLowerCase()
                .includes(search);

        const matchesCategory =
            !category ||
            p.category === category;

        const status = productStatus(p);

        const matchesStock =
            !stockFilter ||
            (stockFilter === "low" &&
                number(p.stock) <= number(p.alertStock)) ||
            (stockFilter === "out" &&
                number(p.stock) <= 0) ||
            (stockFilter === "expired" &&
                status.text === "Expiré");

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStock
        );
    });

    if (!products.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    Aucun produit trouvé.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = products.map(p => {

        const status = productStatus(p);

        const supplier =
            state.suppliers.find(
                s => s.id === p.supplierId
            );

        return `
            <tr>

                <td>
                    <strong>
                        ${escapeHTML(p.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(p.category)}
                </td>

                <td>
                    ${money(p.purchasePrice)}
                </td>

                <td>
                    ${money(p.salePrice)}
                </td>

                <td>
                    <strong>
                        ${number(p.stock)}
                    </strong>
                </td>

                <td>
                    ${p.expiry || "-"}
                </td>

                <td>
                    ${escapeHTML(
                        supplier?.name || "-"
                    )}
                </td>

                <td>
                    <span class="badge ${status.className}">
                        ${status.text}
                    </span>
                </td>

                <td>

                    <div class="table-actions">

                        <button
                            class="table-action-btn"
                            onclick="editProduct('${p.id}')"
                            title="Modifier"
                        >
                            ✏️
                        </button>

                        <button
                            class="table-action-btn delete"
                            onclick="deleteProduct('${p.id}')"
                            title="Supprimer"
                        >
                            🗑️
                        </button>

                    </div>

                </td>

            </tr>
        `;

    }).join("");

    $("totalProducts").textContent =
        state.products.length;

    $("lowStockProducts").textContent =
        state.products.filter(
            p => number(p.stock) <= number(p.alertStock)
        ).length;

    $("expiredProducts").textContent =
        state.products.filter(
            p => productStatus(p).text === "Expiré"
        ).length;

    $("expiringProducts").textContent =
        state.products.filter(
            p => productStatus(p).text === "Expire bientôt"
        ).length;
}

function resetProductForm() {

    $("productForm")?.reset();

    $("productId").value = "";

    $("productPurchasePrice").value = 0;
    $("productSalePrice").value = 0;
    $("productStock").value = 0;
    $("productAlertStock").value = 5;

    if ($("productModalTitle")) {
        $("productModalTitle").textContent =
            "Nouveau produit";
    }
}

function editProduct(id) {

    const p = getProduct(id);

    if (!p) return;

    $("productId").value = p.id;
    $("productName").value = p.name;
    $("productCategory").value = p.category;
    $("productPurchasePrice").value = p.purchasePrice;
    $("productSalePrice").value = p.salePrice;
    $("productStock").value = p.stock;
    $("productAlertStock").value = p.alertStock;
    $("productExpiry").value = p.expiry || "";
    $("productLot").value = p.lot || "";
    $("productSupplier").value = p.supplierId || "";
    $("productDescription").value = p.description || "";

    $("productModalTitle").textContent =
        "Modifier le produit";

    openModal("productModal");
}

function deleteProduct(id) {

    const p = getProduct(id);

    if (!p) return;

    if (!confirm(
        `Supprimer "${p.name}" ?`
    )) return;

    state.products =
        state.products.filter(
            item => item.id !== id
        );

    saveState();
    renderAll();

    toast("Produit supprimé.");
}


/* =========================================================
   PRODUITS POUR VENTE
   ========================================================= */

function renderSaleProducts() {

    const grid = $("saleProductsGrid");

    if (!grid) return;

    const search =
        ($("saleProductSearch")?.value || "")
            .toLowerCase()
            .trim();

    const products = state.products.filter(p => {

        return (
            number(p.stock) > 0 &&
            (
                !search ||
                p.name.toLowerCase().includes(search) ||
                p.category.toLowerCase().includes(search)
            )
        );
    });

    if (!products.length) {

        grid.innerHTML = `
            <div class="empty-state">
                Aucun produit disponible.
            </div>
        `;

        return;
    }

    grid.innerHTML = products.map(p => {

        const inCart =
            cart.find(i => i.productId === p.id);

        return `
            <button
                type="button"
                class="product-sale-card ${inCart ? "selected" : ""}"
                onclick="addToCart('${p.id}')"
            >

                <div class="product-sale-card-icon">
                    💊
                </div>

                <strong>
                    ${escapeHTML(p.name)}
                </strong>

                <span class="product-sale-card-price">
                    ${money(p.salePrice)}
                </span>

                <small class="product-sale-card-stock">
                    Stock : ${number(p.stock)}
                </small>

            </button>
        `;

    }).join("");
}

function addToCart(id) {

    const product = getProduct(id);

    if (!product) return;

    if (number(product.stock) <= 0) {
        toast("Produit en rupture de stock.", "danger");
        return;
    }

    const existing =
        cart.find(i => i.productId === id);

    if (existing) {

        if (
            existing.quantity + 1 >
            number(product.stock)
        ) {
            toast("Stock insuffisant.", "danger");
            return;
        }

        existing.quantity++;

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
    renderSaleProducts();
}

function changeCartQuantity(id, delta) {

    const item =
        cart.find(i => i.productId === id);

    const product = getProduct(id);

    if (!item || !product) return;

    item.quantity += delta;

    if (item.quantity <= 0) {
        cart = cart.filter(
            i => i.productId !== id
        );
    }

    if (
        item.quantity >
        number(product.stock)
    ) {
        item.quantity = number(product.stock);

        toast("Stock maximum atteint.", "danger");
    }

    renderCart();
    renderSaleProducts();
}

function removeFromCart(id) {

    cart = cart.filter(
        i => i.productId !== id
    );

    renderCart();
    renderSaleProducts();
}

function cartSubtotal() {

    return cart.reduce(
        (total, item) =>
            total +
            number(item.quantity) *
            number(item.unitPrice),
        0
    );
}

function getDiscount() {

    return Math.min(
        number($("saleDiscount")?.value),
        cartSubtotal()
    );
}

function cartTotal() {

    return Math.max(
        0,
        cartSubtotal() - getDiscount()
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

        container.innerHTML =
            cart.map(item => `

                <div class="cart-item">

                    <div class="cart-item-info">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <small>
                            ${money(item.unitPrice)}
                        </small>

                    </div>

                    <div class="cart-item-controls">

                        <button
                            type="button"
                            class="quantity-btn"
                            onclick="changeCartQuantity('${item.productId}', -1)"
                        >
                            −
                        </button>

                        <span class="cart-item-quantity">
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            class="quantity-btn"
                            onclick="changeCartQuantity('${item.productId}', 1)"
                        >
                            +
                        </button>

                        <button
                            type="button"
                            class="quantity-btn"
                            onclick="removeFromCart('${item.productId}')"
                        >
                            🗑️
                        </button>

                    </div>

                </div>

            `).join("");
    }

    const subtotal = cartSubtotal();
    const discount = getDiscount();
    const total = subtotal - discount;

    $("cartCount").textContent =
        cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

    $("cartSubtotal").textContent =
        money(subtotal);

    $("cartDiscount").textContent =
        money(discount);

    $("cartTotal").textContent =
        money(total);

    updateCheckoutSummary();
}

function updateCheckoutSummary() {

    const subtotal = cartSubtotal();
    const discount = getDiscount();
    const total = subtotal - discount;
    const received =
        number($("saleReceived")?.value);

    if ($("checkoutSubtotal")) {
        $("checkoutSubtotal").textContent =
            money(subtotal);
    }

    if ($("checkoutDiscount")) {
        $("checkoutDiscount").textContent =
            money(discount);
    }

    if ($("checkoutTotal")) {
        $("checkoutTotal").textContent =
            money(total);
    }

    if ($("checkoutChange")) {
        $("checkoutChange").textContent =
            money(Math.max(0, received - total));
    }
}


/* =========================================================
   CLIENTS
   ========================================================= */

function renderCustomerOptions() {

    const select = $("saleCustomer");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Client comptoir
        </option>

        ${state.customers.map(c => `
            <option value="${c.id}">
                ${escapeHTML(c.name)}
            </option>
        `).join("")}
    `;
}

function renderCustomers() {

    const tbody = $("customersTable");

    if (!tbody) return;

    const search =
        ($("customerSearch")?.value || "")
            .toLowerCase()
            .trim();

    const customers =
        state.customers.filter(c => {

            return (
                !search ||
                c.name.toLowerCase().includes(search) ||
                String(c.phone || "")
                    .toLowerCase()
                    .includes(search)
            );
        });

    if (!customers.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Aucun client.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        customers.map(c => {

            const total =
                state.sales
                    .filter(s =>
                        s.customerId === c.id
                    )
                    .reduce(
                        (sum, s) =>
                            sum + number(s.total),
                        0
                    );

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(c.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(c.phone || "-")}
                    </td>

                    <td>
                        ${escapeHTML(c.address || "-")}
                    </td>

                    <td>
                        ${escapeHTML(c.notes || "-")}
                    </td>

                    <td>
                        ${money(total)}
                    </td>

                    <td>

                        <button
                            class="table-action-btn delete"
                            onclick="deleteCustomer('${c.id}')"
                        >
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}

function deleteCustomer(id) {

    if (!confirm("Supprimer ce client ?")) return;

    state.customers =
        state.customers.filter(
            c => c.id !== id
        );

    saveState();
    renderAll();

    toast("Client supprimé.");
}


/* =========================================================
   FOURNISSEURS
   ========================================================= */

function renderSuppliers() {

    const tbody = $("suppliersTable");

    if (!tbody) return;

    const search =
        ($("supplierSearch")?.value || "")
            .toLowerCase()
            .trim();

    const suppliers =
        state.suppliers.filter(s => {

            return (
                !search ||
                s.name.toLowerCase().includes(search) ||
                String(s.phone || "")
                    .toLowerCase()
                    .includes(search)
            );
        });

    if (!suppliers.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Aucun fournisseur.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        suppliers.map(s => `

            <tr>

                <td>
                    <strong>
                        ${escapeHTML(s.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(s.contact || "-")}
                </td>

                <td>
                    ${escapeHTML(s.phone || "-")}
                </td>

                <td>
                    ${escapeHTML(s.email || "-")}
                </td>

                <td>
                    ${escapeHTML(s.address || "-")}
                </td>

                <td>

                    <button
                        class="table-action-btn delete"
                        onclick="deleteSupplier('${s.id}')"
                    >
                        🗑️
                    </button>

                </td>

            </tr>

        `).join("");
}

function deleteSupplier(id) {

    if (!confirm("Supprimer ce fournisseur ?")) return;

    state.suppliers =
        state.suppliers.filter(
            s => s.id !== id
        );

    saveState();
    renderAll();

    toast("Fournisseur supprimé.");
}


/* =========================================================
   VENTES
   ========================================================= */

function renderSales() {

    const tbody = $("salesTable");

    if (!tbody) return;

    const dateFilter =
        $("salesDateFilter")?.value || "";

    const paymentFilter =
        $("salesPaymentFilter")?.value || "";

    const sales =
        [...state.sales]
            .filter(s =>
                !dateFilter ||
                s.dateKey === dateFilter
            )
            .filter(s =>
                !paymentFilter ||
                s.payment === paymentFilter
            )
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

    if (!sales.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    Aucune vente.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        sales.map(s => {

            const customer =
                s.customerName || "Client comptoir";

            const articles =
                s.items.reduce(
                    (sum, item) =>
                        sum + number(item.quantity),
                    0
                );

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(s.reference)}
                        </strong>
                    </td>

                    <td>
                        ${dateTime(s.date)}
                    </td>

                    <td>
                        ${escapeHTML(customer)}
                    </td>

                    <td>
                        ${articles}
                    </td>

                    <td>
                        ${money(s.subtotal)}
                    </td>

                    <td>
                        <strong>
                            ${money(s.total)}
                        </strong>
                    </td>

                    <td>
                        <span class="badge badge-info">
                            ${escapeHTML(s.payment)}
                        </span>
                    </td>

                    <td>

                        <button
                            class="table-action-btn delete"
                            onclick="deleteSale('${s.id}')"
                            title="Annuler la vente"
                        >
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}

function deleteSale(id) {

    const sale =
        state.sales.find(
            s => s.id === id
        );

    if (!sale) return;

    if (!confirm(
        "Annuler cette vente ? Le stock sera restauré."
    )) return;

    sale.items.forEach(item => {

        const product =
            getProduct(item.productId);

        if (product) {
            product.stock =
                number(product.stock) +
                number(item.quantity);
        }
    });

    state.sales =
        state.sales.filter(
            s => s.id !== id
        );

    state.cashMovements =
        state.cashMovements.filter(
            m => m.reference !== sale.reference
        );

    saveState();
    renderAll();

    toast("Vente annulée et stock restauré.");
}


/* =========================================================
   ACHATS
   ========================================================= */

function calculatePurchaseTotal() {

    const quantity =
        number($("purchaseQuantity")?.value);

    const price =
        number($("purchaseUnitPrice")?.value);

    if ($("purchaseTotal")) {
        $("purchaseTotal").textContent =
            money(quantity * price);
    }
}

function renderPurchases() {

    const tbody = $("purchasesTable");

    if (!tbody) return;

    const purchases =
        [...state.purchases]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

    if (!purchases.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    Aucun achat enregistré.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        purchases.map(p => {

            const product =
                getProduct(p.productId);

            const supplier =
                state.suppliers.find(
                    s => s.id === p.supplierId
                );

            return `
                <tr>

                    <td>
                        ${escapeHTML(p.reference)}
                    </td>

                    <td>
                        ${escapeHTML(
                            product?.name ||
                            p.productName ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            supplier?.name ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${p.quantity}
                    </td>

                    <td>
                        ${money(p.unitPrice)}
                    </td>

                    <td>
                        ${money(p.total)}
                    </td>

                    <td>
                        ${p.date}
                    </td>

                    <td>

                        <button
                            class="table-action-btn delete"
                            onclick="deletePurchase('${p.id}')"
                        >
                            🗑️
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}

function deletePurchase(id) {

    const purchase =
        state.purchases.find(
            p => p.id === id
        );

    if (!purchase) return;

    const product =
        getProduct(purchase.productId);

    if (!confirm(
        "Supprimer cet achat ? Le stock sera diminué."
    )) return;

    if (product) {

        if (
            number(product.stock) <
            number(purchase.quantity)
        ) {
            toast(
                "Impossible : le stock actuel est inférieur à la quantité achetée.",
                "danger"
            );
            return;
        }

        product.stock -=
            number(purchase.quantity);
    }

    state.purchases =
        state.purchases.filter(
            p => p.id !== id
        );

    saveState();
    renderAll();

    toast("Achat supprimé.");
}


/* =========================================================
   DEPENSES
   ========================================================= */

function renderExpenses() {

    const tbody = $("expensesTable");

    if (!tbody) return;

    const expenses =
        [...state.expenses]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

    if (!expenses.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Aucune dépense.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        expenses.map(e => `

            <tr>

                <td>
                    <strong>
                        ${escapeHTML(e.label)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(e.category)}
                </td>

                <td>
                    ${money(e.amount)}
                </td>

                <td>
                    ${escapeHTML(e.payment)}
                </td>

                <td>
                    ${e.dateKey}
                </td>

                <td>
                    ${escapeHTML(e.note || "-")}
                </td>

                <td>

                    <button
                        class="table-action-btn delete"
                        onclick="deleteExpense('${e.id}')"
                    >
                        🗑️
                    </button>

                </td>

            </tr>

        `).join("");
}

function deleteExpense(id) {

    if (!confirm("Supprimer cette dépense ?")) return;

    state.expenses =
        state.expenses.filter(
            e => e.id !== id
        );

    saveState();
    renderAll();

    toast("Dépense supprimée.");
}


/* =========================================================
   CAISSE
   ========================================================= */

function getSessionSales() {

    if (!state.cashSession) return [];

    const opened =
        new Date(state.cashSession.openedAt);

    return state.sales.filter(
        s => new Date(s.date) >= opened
    );
}

function getSessionExpenses() {

    if (!state.cashSession) return [];

    const opened =
        new Date(state.cashSession.openedAt);

    return state.expenses.filter(
        e => new Date(e.date) >= opened
    );
}

function cashValues() {

    if (!state.cashSession) {
        return {
            opening: 0,
            physical: 0,
            electronic: 0,
            in: 0,
            out: 0,
            balance: 0
        };
    }

    const opening =
        number(state.cashSession.openingAmount);

    const sales =
