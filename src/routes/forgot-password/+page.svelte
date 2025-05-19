<script>
  let phone_number = "";
  let message = "";
  let errors = {};
  let submitButton;

  function triggerSubmit() {
    submitButton?.click();
  }

  function validateForm() {
    errors = {};
    if (!/^0[1-9][0-9]{8}$/.test(phone_number)) {
      errors.phone_number = "Insérer un numéro valide";
    }
    return Object.keys(errors).length === 0;
  }

  function validateField() {
    errors.phone_number = /^0[1-9][0-9]{8}$/.test(phone_number)
      ? ""
      : "Insérer un numéro valide";
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      const res = await fetch("/api/accounts/reset-password/phone/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number })
      });

      const data = await res.json();
      if (res.ok) {
        message = "Un code a été envoyé à votre numéro.";
        //TODO: redirect to changepwd
      } else {
        message = data.detail || "Échec de l'envoi du code.";
        //TODO: ask for a resend
      }
    } catch (err) {
      message = "Erreur de connexion au serveur.";
    }
  }
</script>

<svelte:head>
  <title>WHATSEYE | Mot de passe oublié</title>
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
                  <div class="fs-2 fw-bold mb-3 text-center">Mot de passe oublié</div>
                  <span>Entrez votre numéro de téléphone pour recevoir un code</span>
                </h5>
                <div class="divider row"></div>
                <form on:submit|preventDefault={handleSubmit} novalidate>
                  <div class="col">
                    <div class="position-relative mb-3">
                      <input
                        bind:value={phone_number}
                        placeholder="N° de téléphone"
                        type="tel"
                        class="form-control {errors.phone_number ? 'is-invalid' : phone_number ? 'is-valid' : ''}"
                        on:blur={validateField}
                      />
                      {#if errors.phone_number}
                        <em class="error invalid-feedback">{errors.phone_number}</em>
                      {/if}
                    </div>
                  </div>

                  {#if message}
                    <p class="text-danger mt-2">{message}</p>
                  {/if}
                  <!-- svelte-ignore a11y_consider_explicit_label -->
                  <button type="submit" class="hidden" bind:this={submitButton}></button>
                </form>
              </div>
              <div class="modal-footer d-block text-center">
                <button
                  type="button"
                  on:click={triggerSubmit}
                  class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg"
                >
                  Envoyer le code
                </button>
                <div class="mt-3">
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
