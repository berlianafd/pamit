export function renderLogin() {

  return `

<div class="login-page">

    <div class="login-card">

        <h2>Login</h2>

        <p>Silakan masuk menggunakan akun Anda.</p>

        <input
            id="nip"
            placeholder="NIP">

        <input
            id="password"
            type="password"
            placeholder="Password">

        <button id="btnLogin">

            Masuk

        </button>

    </div>

</div>

  `;
}