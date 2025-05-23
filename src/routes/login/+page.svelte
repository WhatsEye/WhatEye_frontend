<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { baseurl, forceHome} from '../../stores/functions';
  
  
  onMount(()=>{
    forceHome()
  })

  let username = "";
  let password = "";
  let message = "";
  let submitButton;
  let rememberMe = false;
  let isLoading = false;
  let errors = {};

  function triggerSubmit() {
    submitButton?.click();
  }

  function validateForm() {
    errors = {};

    if (!username) errors.username = "Ce champ est obligatoire";
    if (!password) errors.password = "Ce champ est obligatoire";

    return Object.keys(errors).length === 0;
  }

  function validateField(name) {
    switch (name) {
      case "username":
        errors.username = username ? "" : "Ce champ est obligatoire";
        break;
      case "password":
        errors.password = password ? "" : "Ce champ est obligatoire";
        break;
    }
  }

  async function handleLogin() {
    if (!validateForm()) return;
    isLoading = true
    try {
      const res = await fetch(`${baseurl}/accounts/token/parent/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        isLoading = false
        if (rememberMe) {
          localStorage.setItem("access", data.access);
        } else {
          sessionStorage.setItem("access", data.access);
        }
        localStorage.setItem("refresh", data.refresh);
        goto('/family');
      } else {
        message = "Échec de la connexion.";
        isLoading = false
      }
    } catch (err) {
      message = "Erreur de connexion au serveur.";
      isLoading = false
    }
    setTimeout(()=>{message=""}, 3000)
  }
</script>

<svelte:head>
  <title>WHATSEYE | Connexion</title>
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
                  <div class="fs-2 fw-bold mb-3 text-center">Connexion à WHATSEYE</div>
                </h5>
                <div class="divider row"></div>
                <form on:submit|preventDefault={handleLogin} novalidate>
                  <div class="col">
                    <div class="position-relative mb-3">
                      <input
                        bind:value={username}
                        name="username"
                        placeholder="Nom d'utilisateur"
                        type="text"
                        class="form-control {errors.username ? 'is-invalid' : ''}"
                        on:blur={() => validateField('username')}
                      />
                      {#if errors.username}
                        <em class="error invalid-feedback">{errors.username}</em>
                      {/if}
                    </div>
                  </div>

                  <div class="col">
                    <div class="position-relative mb-3">
                      <input
                        bind:value={password}
                        name="password"
                        placeholder="Mot de passe"
                        type="password"
                        class="form-control {errors.password ? 'is-invalid' : ''}"
                        on:blur={() => validateField('password')}
                      />
                      {#if errors.password}
                        <em class="error invalid-feedback">{errors.password}</em>
                      {/if}
                    </div>
                  </div>
                  <div class="mt-3 position-relative form-check">
                    <input 
                      bind:checked={rememberMe} 
                      name="check" 
                      id="rmmbr" 
                      type="checkbox" 
                      class="form-check-input"
                    >
                    <label for="rmmbr" class="form-label form-check-label">
                      Ce souvenir de moi
                    </label>
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
                  disabled={isLoading}
                >
                  {isLoading ? "Traitement..." : "Se connecter"}
                </button>

                <div class="divider row"></div>
                <div class="mt-3"> 
                  <a href="/register" class="text-primary">Créer un compte</a> |
                  <a href="/forgot-password" class="text-primary">Mot de passe oublié ?</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
