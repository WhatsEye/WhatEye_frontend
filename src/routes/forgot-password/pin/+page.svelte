<script>
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { baseurl } from "../../../stores/functions";

  onMount(()=>{
    if(!localStorage.getItem("resetInput"))
        goto("../login")
  })
  let pin = ["", "", "", "", "", "", ""]; // 7-digit PIN
  let errors = {}; // erreurs pour chaque digit
  let succes = {}; // succès pour chaque digit
  let message = "";
  let inputRefs = [];
  let isLoading = false;


  // Vérifie si la valeur est un chiffre unique
  function isValidDigit(value) {
    return /^\d$/.test(value);
  }

  // Gère la saisie dans un champ
  function handleInput(index, event) {
    const value = event.target.value;
    if (value.length > 1) {
      pin[index] = value.slice(-1);
    } else {
      pin[index] = value;
    }

    // Efface erreur et succès lors de la saisie
    errors[index] = "";
    succes[index] = "";

    // Passer au champ suivant si valide
    if (isValidDigit(value) && index < 6) {
      inputRefs[index + 1]?.focus();
    }

    // Aller au champ précédent si effacement (backspace)
    if (value === "" && index > 0 && event.inputType === "deleteContentBackward") {
      inputRefs[index - 1]?.focus();
    }
  }

  // Valide le PIN
  function validatePin() {
    errors = {};
    let isValid = true;
    pin.forEach((digit, index) => {
      if (!isValidDigit(digit)) {
        errors[index] = " ";
        isValid = false;
        setTimeout(()=>{errors[index] = ""; message=""}, 3000)

      }
    });
    return isValid;
  }

  // Soumission du formulaire
  async function handleSubmit() {
    if (!validatePin()) {
      message = "Veuillez entrer un code PIN valide de 7 chiffres.";
      return;
    }

    const pinCode = pin.join("");
    const payload = { confirmation_code: pinCode };
    const url = "/accounts/reset_password/code/";

    try {
      const res = await fetch(`${baseurl}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        // Indiquer que chaque digit est correct
        if(data.status==200){
            for (let i = 0; i < pin.length; i++) {
            
            setTimeout(()=>{succes[i] = " ";}, i*40)
            setTimeout(()=>{succes[pin.length-i-1] = " ";}, i*40)
            }
            setTimeout(()=>{
                localStorage.setItem("rid", data.rid)
                localStorage.removeItem("resetInput")
                goto("../change-password");
            }, 1500)
        }
        // Naviguer vers la page suivante
        
      } else {
        // Indiquer erreur sur tous les digits
        for (let i = 0; i < pin.length; i++) {
          errors[i] = " ";
        setTimeout(()=>{errors[i] = ""; message=""}, 3000)

        }
        message = "Code incorrect.";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message = "Erreur de connexion au serveur.";
    }
    isLoading = false
    setTimeout(()=>{message=""},3000)
  }

  // Gestion du collage
  function handlePaste(event) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted.length >= 7) {
      pin = pasted.slice(0, 7).split("");
      // Valider le pin après collage
      validatePin();
      inputRefs[6]?.focus();
    }
    event.preventDefault();
  }

  // Renvoyer le code de reset
  async function resendCode() {
    const userInput = localStorage.getItem("resetInput") || "";
    if (!userInput) return;

    try {
      const res = await fetch(`${baseurl}/accounts/resend_reset_password/${userInput}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      // Vous pouvez ajouter une notification ici si besoin
    } catch (err) {
      console.error("Fetch error:", err);
      message = "Erreur de connexion au serveur.";
    }
  }
</script>

<svelte:head>
  <title>WHATSEYE | Vérification du code</title>
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
                  <div class="fs-2 fw-bold mb-3 text-center">Vérification du code</div>
                  <span>Entrez le code à 7 chiffres envoyé à votre téléphone ou e-mail</span>
                </h5>
                <div class="divider row"></div>
                <form on:submit|preventDefault={handleSubmit} novalidate>
                  <div class="d-flex justify-content-center gap-2 mb-3">
                    {#each pin as digit, index}
                      <div class="position-relative">
                      <input
                        bind:value={pin[index]}
                        on:input={(e) => handleInput(index, e)}
                        on:paste={index === 0 ? handlePaste : null}
                        type="text"
                        inputmode="numeric"
                        maxlength="1"
                        class={`form-control text-center ${succes[index] ? 'valid' : ''} ${errors[index] ? 'invalid' : ''}`}
                        style="width: 50px;"
                        bind:this={inputRefs[index]}
                        placeholder="-"
                        />
                      </div>
                    {/each}
                  </div>

                  {#if message}
                    <p class="text-danger mt-2 text-center">{message}</p>
                  {/if}
                </form>
              </div>
              <div class="modal-footer d-block text-center">
                <button
                  type="button"
                  on:click={handleSubmit}
                  class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg"
                >
                {isLoading ? "Traitement..." : "Vérifier le code"}
                </button>
                <div class="divider row"></div>
                <div class="mt-3">
                  <button
                    type="button"
                    on:click={resendCode}
                    class="btn btn-link text-primary"
                  >
                    Renvoyer le code
                  </button>
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
  .form-control {
    height: 50px;
    font-size: 1.5rem;
  }

  .invalid {
    border-color: red;
    box-shadow: 0 0 0 0.2rem rgba(255, 0, 0, 0.25);
  }

  .valid {
    border-color: green;
    box-shadow: 0 0 0 0.2rem rgba(0, 255, 0, 0.25);
  }

  .error {
    font-size: 0.8rem;
    color: red;
  }

  .succes {
    font-size: 0.8rem;
    color: green;
  }
</style>