<script>
  import { baseurl, formatDate, forceHome } from "../../stores/functions";
  import { goto } from '$app/navigation'; 
  import { onMount, beforeUpdate } from "svelte";
  
  onMount(()=>{
    forceHome()
  })
  let step = 1;
  let fid = "";

  // Family step data
  let family_name = "";
  let about = "";
  let familyErrors = {};
  let familyMessage = "";
  let submitFamilyButton;
  let isLoading = false;
  let touched = { family_name: false, about: false };

  // Parent registration data
  let username = "";
  let phone_number = "";
  let gender = "";
  let birthday = "";
  let password = "";
  let password1 = "";
  let acceptTerms = false;
  let message = "";
  let submitButton;
  let errors = {};

  function triggerSubmit() {
    submitButton?.click();
  }

  function triggerFamilySubmit() {
    submitFamilyButton?.click();
  }

  function validateFamilyForm() {
    familyErrors = {};
    if (!family_name) familyErrors.family_name = "Nom requis";
    if (!about) familyErrors.about = "Description requise";
    return Object.keys(familyErrors).length === 0;
  }

  // Optional: Validate individual fields on blur only if touched
  function validateFamilyField(fieldName) {
    if (!touched[fieldName]) return;
    switch (fieldName) {
      case "family_name":
        familyErrors.family_name = family_name ? "" : "Nom requis";
        break;
      case "about":
        familyErrors.about = about ? "" : "Description requise";
        break;
    }
  }

  function validateForm() {
    errors = {};
    if (!username) errors.username = "Ce champ est obligatoire";
    if (!phone_number) errors.phone_number = "Insérer un numéro correcte";
    if (!gender) errors.gender = "Ce champ est obligatoire";
    if (!birthday) errors.birthday = "Inserer votre date de naissance";
    if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password)) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial # ? ! @ $ % ^ & * -";
    }
    if (password !== password1) errors.password1 = "Les mot de passe ne correspondent pas";
    if (!acceptTerms) errors.acceptTerms = "Vous devez accepter les conditions.";
    return Object.keys(errors).length === 0;
  }

  function validateField(fieldName) {
    switch (fieldName) {
      case "username":
        errors.username = username ? "" : "Ce champ est obligatoire";
        break;
      // case "phone_number":
      //   errors.phone_number = /^0[1-9][0-9]{8}$/.test(phone_number) ? "" : "Insérer un numéro correcte";
      //   break;
      case "gender":
        errors.gender = gender ? "" : "Ce champ est obligatoire";
        break;
      case "birthday":
        errors.birthday = birthday ? "" : "Inserer votre date de naissance";
        break;
      case "password":
        errors.password = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password) ? "" : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial # ? ! @ $ % ^ & * -";
        break;
      case "password1":
        errors.password1 = password === password1 ? "" : "Les mot de passe ne correspondent pas";
        break;
      case "acceptTerms":
        errors.acceptTerms = acceptTerms ? "" : "Vous devez accepter les conditions.";
        break;
    }
  }

  async function handleFamilySubmit() {
    if (!validateFamilyForm()) return;
    isLoading = true
    try {
      const res = await fetch(`${baseurl}/accounts/register/family/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: family_name, about })
      });
      const data = await res.json();
      isLoading = false
      if (res.ok) {
        fid = data.id;
        step = 2;
      } else {
        familyMessage = "Erreur lors de la création.";
      }
    } catch (err) {
      isLoading = false
      familyMessage = "Erreur réseau.";
    }
    setTimeout(()=>{familyMessage=""}, 3000)
  }

  async function handleRegister() {
    if (!validateForm()) return;
    isLoading = true
    const payload = {
      username,
      phone_number: { phone_number },
      password,
      password1,
      gender,
      birthday
    };

    try {
      const res = await fetch(`${baseurl}/accounts/register/parent/${fid}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      isLoading = false
        // Handle specific error cases
        if (res.ok) {
          localStorage.setItem("access", data.access);                
          localStorage.setItem("refresh", data.refresh);
          goto('/family');
        } else{
          errors = {};
        if (data.username) {
          if (data.username.includes("This field may not be blank.")) {
            errors.username = "Ce champ est obligatoire";
          } else if (data.username.includes("A user with that username already exists.")) {
            errors.username = "Un utilisateur avec ce nom d'utilisateur existe déjà.";
          }
        }
        if (data.phone_number?.phone_number) {
          if (data.phone_number.phone_number.includes("This field may not be blank.")) {
            errors.phone_number = "Ce champ est obligatoire";
          } else if (data.phone_number.phone_number.includes("The phone number entered is not valid.")) {
            errors.phone_number = "Le numéro de téléphone saisi n'est pas valide.";
          } else if (data.phone_number.phone_number.includes("parent with this phone number already exists.")) {
            errors.phone_number = "Un parent avec ce numéro de téléphone existe déjà.";
          }
        }
        if (data.error === "already exist a father in this family") {
          message = "Il existe déjà un père dans cette famille.";
          return;
        }
        if (data.error === "already exist a mother in this family") {
          message = "Il existe déjà une mère dans cette famille.";
          return;
        }
        message = Object.keys(errors).length > 0 ? "Veuillez corriger les erreurs dans le formulaire." : data.detail || "Échec d'inscription";
        }
    } catch (err) {
      isLoading = false
      message = "Erreur lors de l'envoi du formulaire.";
    }
    setTimeout(()=>{message=""}, 3000)
  }
</script>

<svelte:head>
  <title>WHATSEYE | Inscription</title>
  <link rel="stylesheet" href="/styles/reg.css">
</svelte:head>

<div class="app-container app-theme-white body-tabs-shadow">
  <div class="app-container">
    <div class="h-100 bg-custom">
      <div class="d-flex h-100 justify-content-center align-items-center">
        <div class="mx-auto app-login-box col-md-8">
          <div class="modal-dialog w-100">
            <div class="modal-content">
              {#if step === 1}
                <div class="modal-body">
                  <h5 class="modal-title">
                    <div class="fs-2 fw-bold mb-3 text-center">Créer une Famille</div>
                    <span>Cela ne prend que
                      <span class="text-success">quelques secondes</span>
                    </span>
                  </h5>
                  <div class="divider row"></div>
                  <form on:submit|preventDefault={handleFamilySubmit} novalidate>
                    <div class="col">
                      <div class="position-relative mb-3">
                        <input
                          bind:value={family_name}
                          name="family_name"
                          placeholder="Nom de la famille"
                          type="text"
                          class="form-control {familyErrors.family_name ? 'is-invalid' : family_name ? 'is-valid' : ''}"
                          on:blur={() => { touched.family_name = true; validateFamilyField('family_name'); }}
                          on:input={() => { touched.family_name = true; }}
                        />
                        {#if familyErrors.family_name}
                          <em class="error invalid-feedback">{familyErrors.family_name}</em>
                        {/if}
                      </div>
                    </div>
                    <div class="col">
                      <div class="position-relative mb-3">
                        <textarea
                          bind:value={about}
                          name="about"
                          placeholder="À propos de la famille"
                          class="form-control {familyErrors.about ? 'is-invalid' : about ? 'is-valid' : ''}"
                          on:blur={() => { touched.about = true; validateFamilyField('about'); }}
                          on:input={() => { touched.about = true; }}
                        ></textarea>
                        {#if familyErrors.about}
                          <em class="error invalid-feedback">{familyErrors.about}</em>
                        {/if}
                      </div>
                    </div>
                    {#if familyMessage}
                      <p class="text-danger mt-2">{familyMessage}</p>
                    {/if}
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button type="submit" class="hidden" bind:this={submitFamilyButton}></button>
                  </form>
                </div>
                <div class="modal-footer d-block text-center">
                  <button 
                  type="button" 
                  on:click={triggerFamilySubmit}
                  class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg"
                  disabled={isLoading}>
                    {isLoading ? "Traitement..." : "Continuer"}
                  </button>
                  <div class="divider row"></div>
                  <div class="mt-3">
                    Vous possedez déja un compte? <br/>
                    <a href="/login" class="text-primary">Se connecter</a> |
                    <a href="/forgot-password" class="text-primary">Recuperer le mot de passe</a>
                  </div>
                </div>  
              {/if}

              {#if step === 2}
                <div class="modal-body">
                  <h5 class="modal-title">
                    <div class="fs-2 fw-bold mb-3 text-center">Créer un compte WHATSEYE</div>
                    <span>Cela ne prend que
                      <span class="text-success">quelques secondes</span>
                    </span>
                  </h5>
                  <div class="divider row"></div>
                  <form on:submit|preventDefault={handleRegister} novalidate>
                    <div>
                      <div class="col">
                        <div class="position-relative mb-3">
                          <input
                            bind:value={username}
                            name="username"
                            placeholder="nom d'utilisateur"
                            type="text"
                            class="form-control {errors.username ? 'is-invalid' : username ? 'is-valid' : ''}"
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
                            bind:value={phone_number}
                            name="phone"
                            placeholder="n° de téléphone (ex: +123456789)"
                            type="tel"
                            class="form-control {errors.phone_number ? 'is-invalid' : phone_number ? 'is-valid' : ''}"
                            on:blur={() => validateField('phone_number')}
                          />
                          {#if errors.phone_number}
                            <em class="error invalid-feedback">{errors.phone_number}</em>
                          {/if}
                        </div>
                      </div>
                      <div class="col-md-12">
                        <div class="position-relative mb-3">
                          <select
                            bind:value={gender}
                            class="form-control {errors.gender ? 'is-invalid' : gender ? 'is-valid' : ''}"
                            on:change={() => validateField('gender')}
                            on:blur={() => validateField('gender')}
                          >
                            <option value="" disabled selected>genre</option>
                            <option value="M">Homme</option>
                            <option value="F">Femme</option>
                          </select>
                          {#if errors.gender}
                            <em class="error invalid-feedback">{errors.gender}</em>
                          {/if}
                        </div>
                      </div>
                      <div class="col">
                        <div class="position-relative mb-3">
                          <input
                            bind:value={birthday}
                            name="birthday"
                            placeholder="date de naissance"
                            type="date"
                            class="form-control {errors.birthday ? 'is-invalid' : birthday ? 'is-valid' : ''}"
                            on:blur={() => validateField('birthday')}
                            on:change={() => validateField('birthday')}
                          />
                          {#if errors.birthday}
                            <em class="error invalid-feedback">{errors.birthday}</em>
                          {/if}
                        </div>
                      </div>
                      <div class="col">
                        <div class="position-relative mb-3">
                          <input
                            bind:value={password}
                            name="password"
                            placeholder="mot de passe"
                            type="password"
                            class="form-control {errors.password ? 'is-invalid' : password ? 'is-valid' : ''}"
                            on:input={() => validateField('password')}
                          />
                          {#if errors.password}
                            <em class="error invalid-feedback">{errors.password}</em>
                          {/if}
                        </div>
                      </div>
                      <div class="col">
                        <div class="position-relative mb-3">
                          <input
                            bind:value={password1}
                            name="passwordrep"
                            placeholder="confirmer votre mot de passe"
                            type="password"
                            class="form-control {errors.password1 ? 'is-invalid' : password1 && password === password1 ? 'is-valid' : ''}"
                            on:input={() => validateField('password1')}
                            on:blur={() => validateField('password1')}
                          />
                          {#if errors.password1}
                            <em class="error invalid-feedback">{errors.password1}</em>
                          {/if}
                        </div>
                      </div>
                    </div>
                    <div class="mt-3 position-relative form-check">
                      <input
                        bind:checked={acceptTerms}
                        name="check"
                        id="accTerms"
                        type="checkbox"
                        class="form-check-input {errors.acceptTerms ? 'is-invalid' : acceptTerms ? 'is-valid' : ''}"
                        on:change={() => validateField('acceptTerms')}
                      >
                      <label for="accTerms" class="form-label form-check-label">
                        Accepter nos
                        <a href="/terms&conditions" target="_blank">Termes & Conditions</a>.
                      </label>
                      {#if errors.acceptTerms}
                        <em class="error invalid-feedback">{errors.acceptTerms}</em>
                      {/if}
                    </div>
                    {#if message}
                      <p class="text-danger mt-2">{message}</p>
                    {/if}
                    <!-- svelte-ignore a11y_consider_explicit_label -->
                    <button type="submit" class="hidden" bind:this={submitButton}></button>
                  </form>
                </div>
                <div class="modal-footer d-block text-center">
                  <button type="button" on:click={triggerSubmit} class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg">
                    {isLoading ? "Traitement..." : "Créer votre compte"}
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>