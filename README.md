# Pharmacie-Badu
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
  >

  <meta
    name="description"
    content="PHARMACIE BADU - Application de gestion commerciale"
  >

  <meta name="theme-color" content="#0f766e">

  <title>PHARMACIE BADU</title>

  <link rel="stylesheet" href="style.css">
</head>

<body>

  <!-- ============================= -->
  <!-- ÉCRAN DE CHARGEMENT -->
  <!-- ============================= -->

  <div id="loadingScreen" class="loading-screen">
    <div class="loading-logo">PB</div>
    <h2>PHARMACIE BADU</h2>
    <p>Chargement de l'application...</p>
  </div>


  <!-- ============================= -->
  <!-- APPLICATION -->
  <!-- ============================= -->

  <div id="app" class="app-container hidden">

    <!-- ============================= -->
    <!-- SIDEBAR -->
    <!-- ============================= -->

    <aside class="sidebar" id="sidebar">

      <div class="brand">

        <div class="brand-logo">
          PB
        </div>

        <div class="brand-text">
          <strong>PHARMACIE</strong>
          <span>BADU</span>
        </div>

      </div>


      <div class="pharmacy-status">
        <span class="status-dot"></span>
        <span>Application active</span>
      </div>


      <nav class="sidebar-menu">

        <button
          class="menu-item active"
          data-section="dashboard"
        >
          <span class="menu-icon">🏠</span>
          <span>Tableau de bord</span>
        </button>


        <button
          class="menu-item"
          data-section="sales"
        >
          <span class="menu-icon">🛒</span>
          <span>Ventes</span>
        </button>


        <button
          class="menu-item"
          data-section="products"
        >
          <span class="menu-icon">📦</span>
          <span>Produits & Stock</span>
        </button>


        <button
          class="menu-item"
          data-section="purchases"
        >
          <span class="menu-icon">🚚</span>
          <span>Achats</span>
        </button>


        <button
          class="menu-item"
          data-section="customers"
        >
          <span class="menu-icon">👥</span>
          <span>Clients</span>
        </button>


        <button
          class="menu-item"
          data-section="suppliers"
        >
          <span class="menu-icon">🏢</span>
          <span>Fournisseurs</span>
        </button>


        <button
          class="menu-item"
          data-section="expenses"
        >
          <span class="menu-icon">💸</span>
          <span>Dépenses</span>
        </button>


        <button
          class="menu-item"
          data-section="cash"
        >
          <span class="menu-icon">💰</span>
          <span>Caisse</span>
        </button>


        <button
          class="menu-item"
          data-section="reports"
        >
          <span class="menu-icon">📊</span>
          <span>Rapports</span>
        </button>

      </nav>


      <div class="sidebar-footer">

        <div class="user-mini">

          <div class="user-avatar">
            A
          </div>

          <div>
            <strong>Administrateur</strong>
            <small>Pharmacie Badu</small>
          </div>

        </div>

      </div>

    </aside>


    <!-- ============================= -->
    <!-- CONTENU PRINCIPAL -->
    <!-- ============================= -->

    <main class="main-content">


      <!-- ============================= -->
      <!-- HEADER -->
      <!-- ============================= -->

      <header class="topbar">

        <button
          id="mobileMenuBtn"
          class="mobile-menu-btn"
          type="button"
        >
          ☰
        </button>


        <div class="page-title">

          <h1 id="pageTitle">
            Tableau de bord
          </h1>

          <p id="currentDate">
            -
          </p>

        </div>


        <div class="topbar-actions">

          <button
            id="notificationBtn"
            class="icon-btn"
            type="button"
            title="Notifications"
          >
            🔔
            <span
              id="notificationBadge"
              class="notification-badge hidden"
            >
              0
            </span>
          </button>


          <button
            id="quickSaleBtn"
            class="primary-btn"
            type="button"
          >
            + Nouvelle vente
          </button>

        </div>

      </header>


      <!-- ====================================================== -->
      <!-- TABLEAU DE BORD -->
      <!-- ====================================================== -->

      <section
        id="dashboard"
        class="content-section active"
      >

        <div class="welcome-card">

          <div>

            <span class="welcome-label">
              BIENVENUE
            </span>

            <h2>
              PHARMACIE BADU
            </h2>

            <p>
              Gérez facilement vos ventes, votre stock,
              votre caisse et vos achats.
            </p>

          </div>

          <div class="welcome-icon">
            💊
          </div>

        </div>


        <!-- STATISTIQUES -->

        <div class="stats-grid">


          <div class="stat-card">

            <div class="stat-icon revenue">
              💰
            </div>

            <div class="stat-content">

              <span>
                Chiffre d'affaires
              </span>

              <strong id="dashboardRevenue">
                0 GNF
              </strong>

              <small>
                Aujourd'hui
              </small>

            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon sales">
              🛒
            </div>

            <div class="stat-content">

              <span>
                Ventes
              </span>

              <strong id="dashboardSales">
                0
              </strong>

              <small>
                Aujourd'hui
              </small>

            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon expenses">
              💸
            </div>

            <div class="stat-content">

              <span>
                Dépenses
              </span>

              <strong id="dashboardExpenses">
                0 GNF
              </strong>

              <small>
                Aujourd'hui
              </small>

            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon profit">
              📈
            </div>

            <div class="stat-content">

              <span>
                Bénéfice estimé
              </span>

              <strong id="dashboardProfit">
                0 GNF
              </strong>

              <small>
                Aujourd'hui
              </small>

            </div>

          </div>

        </div>


        <!-- DEUX COLONNES -->

        <div class="dashboard-grid">


          <!-- CAISSE -->

          <div class="panel">

            <div class="panel-header">

              <div>
                <h3>💰 État de la caisse</h3>
                <p>Situation actuelle</p>
              </div>

              <span
                id="cashStatusBadge"
                class="badge badge-warning"
              >
                Fermée
              </span>

            </div>


            <div class="cash-summary">

              <div class="cash-main">

                <span>
                  Solde actuel
                </span>

                <strong id="dashboardCash">
                  0 GNF
                </strong>

              </div>


              <div class="cash-details">

                <div>
                  <span>Espèces</span>
                  <strong id="dashboardCashPhysical">
                    0 GNF
                  </strong>
                </div>

                <div>
                  <span>Électronique</span>
                  <strong id="dashboardCashElectronic">
                    0 GNF
                  </strong>
                </div>

              </div>

            </div>


            <button
              id="openCashFromDashboard"
              class="secondary-btn full-width"
              type="button"
            >
              Ouvrir la caisse
            </button>

          </div>


          <!-- ALERTES -->

          <div class="panel">

            <div class="panel-header">

              <div>
                <h3>⚠️ Alertes</h3>
                <p>Stock et produits</p>
              </div>

              <span
                id="alertCount"
                class="badge badge-danger"
              >
                0
              </span>

            </div>


            <div
              id="dashboardAlerts"
              class="alerts-list"
            >

              <div class="empty-state">
                <div>✅</div>
                <p>
                  Aucune alerte pour le moment.
                </p>
              </div>

            </div>

          </div>

        </div>


        <!-- VENTES RÉCENTES -->

        <div class="panel">

          <div class="panel-header">

            <div>
              <h3>🧾 Ventes récentes</h3>
              <p>Dernières transactions</p>
            </div>

            <button
              class="text-btn"
              data-section-link="sales"
              type="button"
            >
              Voir tout →
            </button>

          </div>


          <div class="table-container">

            <table>

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Paiement</th>
                  <th>Statut</th>
                </tr>

              </thead>

              <tbody id="recentSalesTable">

                <tr>
                  <td
                    colspan="6"
                    class="empty-table"
                  >
                    Aucune vente enregistrée.
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>


      <!-- ====================================================== -->
      <!-- VENTES -->
      <!-- ====================================================== -->

      <section
        id="sales"
        class="content-section"
      >

        <div class="section-header">

          <div>

            <h2>
              Ventes
            </h2>

            <p>
              Enregistrez et suivez les ventes de la pharmacie.
            </p>

          </div>

          <button
            id="newSaleBtn"
            class="primary-btn"
            type="button"
          >
            + Nouvelle vente
          </button>

        </div>


        <!-- PANIER -->

        <div class="sale-layout">


          <div class="panel sale-products">

            <div class="panel-header">

              <div>
                <h3>
                  Produits
                </h3>

                <p>
                  Sélectionnez les produits à vendre
                </p>

              </div>

            </div>


            <div class="search-box">

              <span>🔎</span>

              <input
                type="text"
                id="saleProductSearch"
                placeholder="Rechercher un médicament..."
              >

            </div>


            <div
              id="saleProductsGrid"
              class="products-grid"
            >

              <!-- Produits générés automatiquement -->

            </div>

          </div>


          <!-- PANIER -->

          <div class="panel sale-cart">

            <div class="panel-header">

              <div>
                <h3>
                  🛒 Panier
                </h3>

                <p>
                  Produits sélectionnés
                </p>
              </div>

              <span
                id="cartCount"
                class="badge badge-primary"
              >
                0
              </span>

            </div>


            <div
              id="cartItems"
              class="cart-items"
            >

              <div class="empty-state">

                <div>
                  🛒
                </div>

                <p>
                  Aucun produit dans le panier.
                </p>

              </div>

            </div>


            <div class="cart-summary">

              <div class="summary-line">

                <span>
                  Sous-total
                </span>

                <strong id="cartSubtotal">
                  0 GNF
                </strong>

              </div>


              <div class="summary-line">

                <span>
                  Remise
                </span>

                <strong id="cartDiscount">
                  0 GNF
                </strong>

              </div>


              <div class="summary-total">

                <span>
                  TOTAL
                </span>

                <strong id="cartTotal">
                  0 GNF
                </strong>

              </div>


              <button
                id="checkoutBtn"
                class="primary-btn full-width"
                type="button"
              >
                Valider la vente
              </button>

            </div>

          </div>

        </div>


        <!-- HISTORIQUE -->

        <div class="panel">

          <div class="panel-header">

            <div>
              <h3>
                Historique des ventes
              </h3>

              <p>
                Toutes les ventes enregistrées
              </p>
            </div>


            <div class="filters">

              <input
                type="date"
                id="salesDateFilter"
              >

              <select id="salesPaymentFilter">

                <option value="">
                  Tous les paiements
                </option>

                <option value="Espèces">
                  Espèces
                </option>

                <option value="Orange Money">
                  Orange Money
                </option>

                <option value="MTN Money">
                  MTN Money
                </option>

                <option value="Wave">
                  Wave
                </option>

                <option value="Carte">
                  Carte
                </option>

              </select>

            </div>

          </div>


          <div class="table-container">

            <table>

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Articles</th>
                  <th>Total</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody id="salesTable">

                <tr>
                  <td
                    colspan="7"
                    class="empty-table"
                  >
                    Aucune vente.
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>


      <!-- ====================================================== -->
      <!-- PRODUITS & STOCK -->
      <!-- ====================================================== -->

      <section
        id="products"
        class="content-section"
      >

        <div class="section-header">

          <div>

            <h2>
              Produits & Stock
            </h2>

            <p>
              Gérez les médicaments et les niveaux de stock.
            </p>

          </div>

          <button
            id="addProductBtn"
            class="primary-btn"
            type="button"
          >
            + Ajouter un produit
          </button>

        </div>


        <div class="stats-grid mini-stats">


          <div class="mini-stat">

            <span class="mini-icon">
              📦
            </span>

            <div>

              <strong id="totalProducts">
                0
              </strong>

              <span>
                Produits
              </span>

            </div>

          </div>


          <div class="mini-stat">

            <span class="mini-icon warning">
              ⚠️
            </span>

            <div>

              <strong id="lowStockProducts">
                0
              </strong>

              <span>
                Stock faible
              </span>

            </div>

          </div>


          <div class="mini-stat">

            <span class="mini-icon danger">
              ⏰
            </span>

            <div>

              <strong id="expiredProducts">
                0
              </strong>

              <span>
                Expirés
              </span>

            </div>

          </div>


          <div class="mini-stat">

            <span class="mini-icon info">
              📅
            </span>

            <div>

              <strong id="expiringProducts">
                0
              </strong>

              <span>
                Bientôt expirés
              </span>

            </div>

          </div>

        </div>


        <div class="panel">

          <div class="panel-header">

            <div class="search-box">

              <span>🔎</span>

              <input
                type="text"
                id="productSearch"
                placeholder="Rechercher un produit..."
              >

            </div>


            <div class="filters">

              <select id="productCategoryFilter">

                <option value="">
                  Toutes les catégories
                </option>

                <option value="Médicaments">
                  Médicaments
                </option>

                <option value="Antibiotiques">
                  Antibiotiques
                </option>

                <option value="Antalgiques">
                  Antalgiques
                </option>

                <option value="Sirop">
                  Sirop
                </option>

                <option value="Vitamines">
                  Vitamines
                </option>

                <option value="Matériel médical">
                  Matériel médical
                </option>

                <option value="Autres">
                  Autres
                </option>

              </select>


              <select id="stockFilter">

                <option value="">
                  Tous les stocks
                </option>

                <option value="low">
                  Stock faible
                </option>

                <option value="expired">
                  Expirés
                </option>

                <option value="expiring">
                  Bientôt expirés
                </option>

              </select>

            </div>

          </div>


          <div class="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Produit
                  </th>

                  <th>
                    Catégorie
                  </th>

                  <th>
                    Prix achat
                  </th>

                  <th>
                    Prix vente
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Expiration
                  </th>

                  <th>
                    Lot
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody id="productsTable">

                <tr>

                  <td
                    colspan="8"
                    class="empty-table"
                  >
                    Aucun produit enregistré.

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>


      <!-- ====================================================== -->
      <!-- ACHATS -->
      <!-- ====================================================== -->

      <section
        id="purchases"
        class="content-section"
      >

        <div class="section-header">

          <div>

            <h2>
              Achats
            </h2>

            <p>
              Enregistrez les approvisionnements de la pharmacie.
            </p>

          </div>

          <button
            id="addPurchaseBtn"
            class="primary-btn"
            type="button"
          >
            + Nouvel achat
          </button>

        </div>


        <div class="panel">

          <div class="panel-header">

            <div>

              <h3>
                Historique des achats
              </h3>

              <p>
                Approvisionnements enregistrés
              </p>

            </div>

          </div>


          <div class="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Référence
                  </th>

                  <th>
                    Fournisseur
                  </th>

                  <th>
                    Produit
                  </th>

                  <th>
                    Quantité
                  </th>

                  <th>
                    Montant
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody id="purchasesTable">

                <tr>

                  <td
                    colspan="7"
                    class="empty-table"
                  >
                    Aucun achat enregistré.
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>


      <!-- ====================================================== -->
      <!-- CLIENTS -->
      <!-- ====================================================== -->

      <section
        id="customers"
        class="content-section"
      >

        <div class="section-header">

          <div>

            <h2>
              Clients
            </h2>

            <p>
              Gérez les informations de vos clients.
            </p>

          </div>

          <button
            id="addCustomerBtn"
            class="primary-btn"
            type="button"
          >
            + Ajouter un client
          </button>

        </div>


        <div class="panel">

          <div class="panel-header">

            <div class="search-box">

              <span>🔎</span>

              <input
                type="text"
                id="customerSearch"
                placeholder="Rechercher un client..."
              >

            </div>

          </div>


          <div class="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Nom
                  </th>

                  <th>
                    Téléphone
                  </th>

                  <th>
                    Adresse
                  </th>

                  <th>
                    Nombre de ventes
                  </th>

                  <th>
                    Total achats
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody id="customersTable">

                <tr>

                  <td
                    colspan="6"
                    class="empty-table"
                  >
                    Aucun client enregistré.
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>


      <!-- ====================================================== -->
      <!-- FOURNISSEURS -->
      <!-- ====================================================== -->

      <section
        id="suppliers"
        class="content-section"
      >

        <div class="section-header">

          <div>

            <h2>
              Fournisseurs
            </h2>

            <p>
              Gérez vos fournisseurs et partenaires.
            </p>

          </div>

          <button
            id="addSupplierBtn"
            class="primary-btn"
            type="button"
          >
            + Ajouter un fournisseur
          </button>

        </div>


        <div class="panel">

          <div class="panel-header">

            <div class="search-box">

              <span>🔎</span>

              <input
                type="text"
                id="supplierSearch"
                placeholder="Rechercher un fournisseur..."
              >

            </div>

          </div>


          <div class="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Fournisseur
                  </th>

                  <th>
                    Contact
                  </th>

                  <th>
                    Téléphone
                  </th>

                  <th>
                    Adresse
                  </th>

                  <th>
                    Total achats
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody id="suppliersTable">

                <tr>

                  <td
                    colspan="6"
                    class="empty-table"
                  >
                    Aucun fournisseur enregistré.
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>


      <!-- ====================================================== -->
      <!-- DÉPENSES -->
      <!-- ====================================================== -->

      <section
        id="expenses"
        class="content-section"
      >

        <div class="section-header">

          <div>

            <h2>
              Dépenses
            </h2>

            <p>
              Suivez les dépenses de la pharmacie.
            </p>

          </div>

          <button
            id="addExpenseBtn"
            class="primary-btn"
            type="button"
          >
            + Ajouter une dépense
          </button>

        </div>


        <div class="panel">

          <div class="panel-header">

            <
