# Pharmacie-Badu
Logiciel de gestion pharmacie Badu
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0f766e">
  <title>PHARMACIE BADU — Gestion commerciale</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>

<header class="topbar">
  <div>
    <h1>💊 PHARMACIE BADU</h1>
    <p>Gestion commerciale</p>
  </div>
  <div class="date" id="currentDate"></div>
</header>

<div class="app">

  <aside class="sidebar">
    <button class="nav active" data-page="dashboard">📊 Tableau de bord</button>
    <button class="nav" data-page="sales">🛒 Ventes</button>
    <button class="nav" data-page="products">💊 Produits & Stock</button>
    <button class="nav" data-page="purchases">📦 Achats</button>
    <button class="nav" data-page="customers">👥 Clients</button>
    <button class="nav" data-page="suppliers">🏢 Fournisseurs</button>
    <button class="nav" data-page="expenses">💸 Dépenses</button>
    <button class="nav" data-page="cash">💰 Caisse</button>
    <button class="nav" data-page="reports">📈 Rapports</button>
  </aside>

  <main class="content">

    <!-- DASHBOARD -->
    <section id="dashboard" class="page active-page">
      <div class="page-title">
        <div>
          <h2>Tableau de bord</h2>
          <p>Vue générale de PHARMACIE BADU</p>
        </div>
        <button class="primary" onclick="showPage('sales')">＋ Nouvelle vente</button>
      </div>

      <div class="cards">
        <div class="card">
          <span>💰 CA du jour</span>
          <strong id="dashboardSales">0 GNF</strong>
        </div>

        <div class="card">
          <span>💸 Dépenses</span>
          <strong id="dashboardExpenses">0 GNF</strong>
        </div>

        <div class="card">
          <span>📈 Bénéfice</span>
          <strong id="dashboardProfit">0 GNF</strong>
        </div>

        <div class="card">
          <span>🛒 Ventes</span>
          <strong id="dashboardOrders">0</strong>
        </div>
      </div>

      <div class="grid-2">

        <div class="panel">
          <div class="panel-head">
            <h3>⚠️ Alertes stock</h3>
          </div>
          <div id="stockAlerts"></div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <h3>⏰ Expirations</h3>
          </div>
          <div id="expiryAlerts"></div>
        </div>

      </div>

      <div class="panel">
        <div class="panel-head">
          <h3>Dernières ventes</h3>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Qté</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody id="recentSales"></tbody>
          </table>
        </div>
      </div>
    </section>


    <!-- VENTES -->
    <section id="sales" class="page">

      <div class="page-title">
        <div>
          <h2>🛒 Ventes</h2>
          <p>Enregistrer une nouvelle vente</p>
        </div>
      </div>

      <div class="grid-2">

        <div class="panel">
          <h3>Nouvelle vente</h3>

          <label>Produit</label>
          <select id="saleProduct"></select>

          <label>Quantité</label>
          <input type="number" id="saleQuantity" value="1" min="1">

          <label>Client</label>
          <input type="text" id="saleCustomer" placeholder="Nom du client">

          <label>Mode de paiement</label>
          <select id="salePayment">
            <option>Espèces</option>
            <option>Orange Money</option>
            <option>MTN Mobile Money</option>
            <option>Virement</option>
          </select>

          <div class="sale-total">
            Total :
            <strong id="saleTotal">0 GNF</strong>
          </div>

          <button class="primary full" onclick="addSale()">
            Enregistrer la vente
          </button>
        </div>

        <div class="panel">
          <h3>Historique des ventes</h3>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Client</th>
                  <th>Qté</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="salesTable"></tbody>
            </table>
          </div>
        </div>

      </div>
    </section>


    <!-- PRODUITS -->
    <section id="products" class="page">

      <div class="page-title">
        <div>
          <h2>💊 Produits & Stock</h2>
          <p>Gestion des médicaments et produits</p>
        </div>

        <button class="primary" onclick="openModal('productModal')">
          ＋ Ajouter produit
        </button>
      </div>

      <div class="search-box">
        <input
          type="text"
          id="productSearch"
          placeholder="🔎 Rechercher un produit..."
          oninput="renderProducts()">
      </div>

      <div class="panel">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Stock</th>
                <th>Prix achat</th>
                <th>Prix vente</th>
                <th>Expiration</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="productsTable"></tbody>
          </table>
        </div>
      </div>

    </section>


    <!-- ACHATS -->
    <section id="purchases" class="page">

      <div class="page-title">
        <div>
          <h2>📦 Achats</h2>
          <p>Entrées de marchandises</p>
        </div>

        <button class="primary" onclick="openModal('purchaseModal')">
          ＋ Enregistrer un achat
        </button>
      </div>

      <div class="panel">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Montant</th>
                <th>Fournisseur</th>
              </tr>
            </thead>
            <tbody id="purchasesTable"></tbody>
          </table>
        </div>
      </div>

    </section>


    <!-- CLIENTS -->
    <section id="customers" class="page">

      <div class="page-title">
        <div>
          <h2>👥 Clients</h2>
          <p>Gestion de la clientèle</p>
        </div>

        <button class="primary" onclick="openModal('customerModal')">
          ＋ Ajouter client
        </button>
      </div>

      <div class="panel">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Total achats</th>
              </tr>
            </thead>
            <tbody id="customersTable"></tbody>
          </table>
        </div>
      </div>

    </section>


    <!-- FOURNISSEURS -->
    <section id="suppliers" class="page">

      <div class="page-title">
        <div>
          <h2>🏢 Fournisseurs</h2>
          <p>Gestion des fournisseurs</p>
        </div>

        <button class="primary" onclick="openModal('supplierModal')">
          ＋ Ajouter fournisseur
        </button>
      </div>

      <div class="panel">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Contact</th>
                <th>Téléphone</th>
                <th>Adresse</th>
              </tr>
            </thead>
            <tbody id="suppliersTable"></tbody>
          </table>
        </div>
      </div>

    </section>


    <!-- DEPENSES -->
    <section id="expenses" class="page">

      <div class="page-title">
        <div>
          <h2>💸 Dépenses</h2>
          <p>Suivi des dépenses de la pharmacie</p>
        </div>

        <button class="primary" onclick="openModal('expenseModal')">
          ＋ Ajouter dépense
        </button>
      </div>

      <div class="panel">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Motif</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody id="expensesTable"></tbody>
          </table>
        </div>
      </div>

    </section>


    <!-- CAISSE -->
    <section id="cash" class="page">

      <div class="page-title">
        <div>
          <h2>💰 Caisse</h2>
          <p>Situation financière</p>
        </div>

        <button class="primary" onclick="closeCash()">
          🔒 Clôturer la caisse
        </button>
      </div>

      <div class="cards">

        <div class="card">
          <span>Ouverture</span>
          <strong id="cashOpening">0 GNF</strong>
        </div>

        <div class="card">
          <span>Entrées</span>
          <strong id="cashIncome">0 GNF</strong>
        </div>

        <div class="card">
          <span>Sorties</span>
          <strong id="cashExpenses">0 GNF</strong>
        </div>

        <div class="card">
          <span>Solde</span>
          <strong id="cashBalance">0 GNF</strong>
        </div>

      </div>

      <div class="panel">
        <h3>Ouverture de caisse</h3>

        <div class="form-row">
          <input
            type="number"
            id="cashOpeningInput"
            placeholder="Montant d'ouverture">

          <button class="primary" onclick="openCash()">
            Ouvrir la caisse
          </button>
        </div>
      </div>

    </section>


    <!-- RAPPORTS -->
    <section id="reports" class="page">

      <div class="page-title">
        <div>
          <h2>📈 Rapports</h2>
          <p>Analyse de l'activité</p>
        </div>

        <button class="primary" onclick="window.print()">
          🖨️ Imprimer
        </button>
      </div>

      <div class="cards">
        <div class="card">
          <span>CA total</span>
          <strong id="reportSales">0 GNF</strong>
        </div>

        <div class="card">
          <span>Dépenses</span>
          <strong id="reportExpenses">0 GNF</strong>
        </div>

        <div class="card">
          <span>Bénéfice</span>
          <strong id="reportProfit">0 GNF</strong>
        </div>

        <div class="card">
          <span>Produits</span>
          <strong id="reportProducts">0</strong>
        </div>
      </div>

      <div class="panel">
        <h3>Résumé commercial</h3>

        <div id="reportSummary"></div>
      </div>

    </section>

  </main>
</div>


<!-- MODAL PRODUIT -->
<div class="modal" id="productModal">
  <div class="modal-box">
    <button class="close" onclick="closeModal('productModal')">×</button>

    <h2>Ajouter un produit</h2>

    <input id="productName" placeholder="Nom du produit">

    <input id="productCategory" placeholder="Catégorie">

    <input id="productStock" type="number" placeholder="Stock">

    <input id="productPurchase" type="number" placeholder="Prix d'achat">

    <input id="productPrice" type="number" placeholder="Prix de vente">

    <input id="productAlert" type="number" placeholder="Seuil d'alerte" value="5">

    <label>Date d'expiration</label>
    <input id="productExpiry" type="date">

    <input id="productLot" placeholder="Numéro de lot">

    <button class="primary full" onclick="addProduct()">
      Enregistrer
    </button>
  </div>
</div>


<!-- MODAL ACHAT -->
<div class="modal" id="purchaseModal">
  <div class="modal-box">
    <button class="close" onclick="closeModal('purchaseModal')">×</button>

    <h2>Enregistrer un achat</h2>

    <select id="purchaseProduct"></select>

    <input
      id="purchaseQuantity"
      type="number"
      min="1"
      value="1"
      placeholder="Quantité">

    <input
      id="purchaseAmount"
      type="number"
      placeholder="Montant total">

    <input
      id="purchaseSupplier"
      placeholder="Fournisseur">

    <button class="primary full" onclick="addPurchase()">
      Enregistrer l'achat
    </button>
  </div>
</div>


<!-- MODAL CLIENT -->
<div class="modal" id="customerModal">
  <div class="modal-box">
    <button class="close" onclick="closeModal('customerModal')">×</button>

    <h2>Ajouter un client</h2>

    <input id="customerName" placeholder="Nom du client">
    <input id="customerPhone" placeholder="Téléphone">
    <input id="customerAddress" placeholder="Adresse">

    <button class="primary full" onclick="addCustomer()">
      Enregistrer
    </button>
  </div>
</div>


<!-- MODAL FOURNISSEUR -->
<div class="modal" id="supplierModal">
  <div class="modal-box">
    <button class="close" onclick="closeModal('supplierModal')">×</button>

    <h2>Ajouter un fournisseur</h2>

    <input id="supplierName" placeholder="Nom / entreprise">
    <input id="supplierContact" placeholder="Personne à contacter">
    <input id="supplierPhone" placeholder="Téléphone">
    <input id="supplierAddress" placeholder="Adresse">

    <button class="primary full" onclick="addSupplier()">
      Enregistrer
    </button>
  </div>
</div>


<!-- MODAL DEPENSE -->
<div class="modal" id="expenseModal">
  <div class="modal-box">
    <button class="close" onclick="closeModal('expenseModal')">×</button>

    <h2>Ajouter une dépense</h2>

    <input id="expenseReason" placeholder="Motif de la dépense">

    <input
      id="expenseAmount"
      type="number"
      placeholder="Montant">

    <button class="primary full" onclick="addExpense()">
      Enregistrer
    </button>
  </div>
</div>


<div id="toast"></div>

<script src="app.js"></script>

</body>
</html>
