export function renderLayout(
  nama,
  menuHtml
) {

  return `

  
  <div class="layout">

    <aside class="sidebar">

      <div class="sidebar-header">

        <h2>PAMIT</h2>
        <H4>Portal Administrasi Mobilitas dan Izin Terpadu</H4>

        <small>
          Dispendukcapil
          Kab. Malang
        </small>

      </div>

      ${menuHtml}

    </aside>

    <main class="main">

      <header class="header">

    <button id="toggleSidebar" class="toggle-sidebar">

        ☰

    </button>

    <div class="header-user">

        Halo,
        <strong>${nama}</strong>

    </div>

</header>

      <section id="content">

      </section>

    </main>

  </div>

  `;

}