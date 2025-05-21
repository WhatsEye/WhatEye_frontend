<script>
  import { goto } from "$app/navigation";
  import { baseurl } from "../../stores/functions";

  let input = "";
  let message = "";
  let errors = {};
  let isLoading = false;
  let submitButton;

  // Trigger form submission
  function triggerSubmit() {
    submitButton?.click();
  }

  // Validate phone number
  function isPhoneNumber(value) {
    // Allow optional spaces, dashes, or parentheses
    const cleaned = value.replace(/[\s()-]/g, "");
    return /^\+\d{6,15}$/.test(cleaned);
  }

  // Validate email
  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Validate form before submission
  function validateForm() {
    errors = {};
    const isPhone = isPhoneNumber(input);
    const isValidEmail = isEmail(input);
    const isUsername = input.trim().length > 0 && !isPhone && !isValidEmail;

    if (!isPhone && !isValidEmail && !isUsername) {
      errors.input = "Insérer un nom d'utilisateur, une adresse e-mail ou un numéro de téléphone valide (commence par '+' suivi de 6 à 15 chiffres)";
    }
    return Object.keys(errors).length === 0;
  }

  // Validate input field on blur
  function validateField() {
    errors.input = isPhoneNumber(input) || isEmail(input) || (input.trim().length > 0)
      ? ""
      : "Insérer un nom d'utilisateur, une adresse e-mail ou un numéro de téléphone valide (commence par '+' suivi de 6 à 15 chiffres)";
  }

  // Handle form submission
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    isLoading = true
    const isPhone = isPhoneNumber(input);
    let payload = {};
    let url = "/accounts/reset_password/";

    if (isPhone) {
      // Clean phone number for server
      payload = { number: input.replace(/[\s()-]/g, "") };
      url = "/accounts/reset_password_phone/";
    } else {
      payload = { username_email: input };
    }


    try {
      const res = await fetch(`${baseurl}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if(data.status==200){
          localStorage.setItem("resetInput", data.username)
          goto("forgot-password/pin")
        }else{
           if (data?.error?.non_field_errors[0].includes("No user with this email or username")) {
            errors.input = "La adresse e-mail ou le nom d'utilisateur n'existe pas";
          }
          if (data?.error?.number.includes("Enter a valid phone number.")) {
            errors.input = "Le numéro de téléphone saisi n'est pas valide.";
          } 
        }
      } else {
        console.error("Server error:", data);
        if( data.detail)
            message = "Aucun parent ne correspond à cette requête."
        //message = data.detail || "Échec de l'envoi du code.";
        // TODO: ask for a resend
      }
    } catch (err) {
      console.error("Fetch error:", err);
      //message = "Erreur de connexion au serveur.";
      message = "Aucun parent ne correspond à cette requête."
    }
    isLoading = false
    setTimeout(()=>{message=""},3000)
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
                  <span>Entrez votre nom d'utilisateur, adresse e-mail ou numéro de téléphone pour recevoir un code</span>
                </h5>
                <div class="divider row"></div>
                <form on:submit|preventDefault={handleSubmit} novalidate>
                  <div class="col">
                    <div class="position-relative mb-3">
                      <input
                        bind:value={input}
                        placeholder="Nom d'utilisateur, e-mail ou N° de téléphone (+123...)"
                        type="text"
                        class="form-control {errors.input ? 'is-invalid' : input ? 'is-valid' : ''}"
                        on:blur={validateField}
                      />
                      {#if errors.input}
                        <em class="error invalid-feedback">{errors.input}</em>
                      {/if}
                    </div>
                  </div>

                  {#if message}
                    <p class="text-danger mt-2">{message}</p>
                  {/if}
                  <!-- Hidden submit button -->
                  <button type="submit" aria-label="Send_code" class="hidden" bind:this={submitButton}></button>
                </form>
              </div>
              <div class="modal-footer d-block text-center">
                <button
                  type="button"
                  on:click={triggerSubmit}
                  class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg"
                >
                {isLoading ? "Traitement..." : "Envoyer le code"}
                </button>
                <div class="divider row"></div>
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