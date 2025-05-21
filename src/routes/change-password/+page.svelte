<script>
  import { goto } from "$app/navigation";
  import { baseurl } from "../../stores/functions";

  let password = "";
  let password1 = "";
  let errors = {};
  let message = "";
  let isLoading = false;

  // Custom validation function using your logic
  function validateForm() {
    errors = {};

    switch ("password") {
      case "password":
        errors.password = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password)
          ? ""
          : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial # ? ! @ $ % ^ & * -";
        break;
    }

    switch ("password1") {
      case "password1":
        errors.password1 = password === password1
          ? ""
          : "Les mots de passe ne correspondent pas";
        break;
    }

    return Object.values(errors).every((err) => !err);
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    const rid = localStorage.getItem("rid");
    isLoading = true;
    const payload = {
      password,
      password_confirm: password1
    };

    try {
      const res = await fetch(`${baseurl}/accounts/reset_password/change/${rid}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.status=200){
            localStorage.removeItem("rid")
            goto("/login");
        }
        
      } else {
        message = "La réinitialisation du mot de passe a échoué.";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message = "Erreur de connexion au serveur.";
    } finally {
        isLoading = false
        setTimeout(()=>{message=""},3000)
    }
  }
</script>

<svelte:head>
  <title>WHATSEYE | Nouveau mot de passe</title>
  <link rel="stylesheet" href="/styles/reg.css" />
</svelte:head>

<div class="app-container app-theme-white body-tabs-shadow">
  <div class="app-container">
    <div class="h-100 bg-custom">
      <div class="d-flex h-100 justify-content-center align-items-center">
        <div class="mx-auto app-login-box col-md-8">
          <div class="modal-dialog w-100">
            <div class="modal-content">
              <div class="modal-body">
                <h5 class="modal-title">
                  <div class="fs-2 fw-bold mb-3 text-center">Nouveau mot de passe</div>
                  <span>Entrez un nouveau mot de passe sécurisé</span>
                </h5>
                <div class="divider row"></div>

                <form on:submit|preventDefault={handleSubmit}>
                  <div class="mb-3">
                    <input
                      type="password"
                      class="form-control {errors.password ? 'is-invalid' : password ? 'is-valid' : ''}"
                      placeholder="Nouveau mot de passe"
                      bind:value={password}
                    />
                    {#if errors.password}
                      <em class="error invalid-feedback">{errors.password}</em>
                    {/if}
                  </div>

                  <div class="mb-3">
                    <input
                      type="password"
                      class="form-control {errors.password1 ? 'is-invalid' : password1 ? 'is-valid' : ''}"
                      placeholder="Confirmer le mot de passe"
                      bind:value={password1}
                    />
                    {#if errors.password1}
                      <em class="error invalid-feedback">{errors.password1}</em>
                    {/if}
                  </div>

                  {#if message}
                    <p class="text-danger text-center">{message}</p>
                  {/if}

                  <button
                    type="submit"
                    class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? "Traitement..." : "Changer le mot de passe"}
                  </button>
                </form>

                <div class="divider row mt-3"></div>
                <div class="text-center">
                  <a href="/login" class="text-primary">Retour à la connexion</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .error {
    font-size: 0.8rem;
    color: red;
  }
</style>
