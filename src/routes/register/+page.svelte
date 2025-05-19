<script>
  let username = "";
  let phone_number = "";
  let gender = "";
  let birthday = "";
  let password = "";
  let password1 = "";
  let acceptTerms = false;
  let message = "";
  let submitButton;
  function triggerSubmit() {
    submitButton?.click();
  }
  let errors = {};

  function validateForm(){
    errors = {};

    if(!username) errors.username = "Ce champ est obligatoire";
    if(!/^0[1-9][0-9]{8}/.test(phone_number)) errors.phone_number = "Insérer un numéro correcte";
    if(!gender) errors.gender = "Ce champ est obligatoire";
    if(!birthday) errors.birthday = "Inserer votre date de naissance";
    if(!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password))  errors.password = "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial #  ?  !  @  $  %  ^  &  *  -";
    if(password !== password1) errors.password1 = "Les mot de passe ne correspondent pas";
    if (!acceptTerms) errors.acceptTerms = "Vous devez accepter les conditions.";
    return Object.keys(errors).length === 0;
  }

  function validateField(fieldName) {
    switch (fieldName) {
      case "username":
        errors.username = username ? "" : "Ce champ est obligatoire";
        break;

      case "phone_number":
        errors.phone_number = /^0[1-9][0-9]{8}$/.test(phone_number) ? "" : "Insérer un numéro correcte";
        break;

      case "gender":
        errors.gender = gender ? "" : "Ce champ est obligatoire";
        break;

      case "birthday":
        errors.birthday = birthday ? "" : "Inserer votre date de naissance";
        break;

      case "password":
        errors.password = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(password) ? "" : "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial #  ?  !  @  $  %  ^  &  *  -";
        break;

      case "password1":
        errors.password1 = password === password1 ? "" : "Les mot de passe ne correspondent pas";
        break;

      case "acceptTerms":
        errors.acceptTerms = acceptTerms ? "" : "Vous devez accepter les conditions.";
        break;
    }
  }


  // TODO: family ID
  const fid = "YOUR_FID";

  async function handleRegister() {
    if (!validateForm()) return;

    const payload = {
      username,
      phone_number: { phone_number },
      password,
      password1,
      gender,
      birthday
    };

    try {
      const res = await fetch(`/api/accounts/register/parent/${fid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      message = res.ok ? "Compte créé avec succès !" : data.detail || JSON.stringify(data);
    } catch (err) {
      message = "L'inscription a échoué. Veuillez réessayer.";
    }
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
                            <div class="modal-body">
                                <h5 class="modal-title">
                                    <div class="fs-2 fw-bold mb-3 text-center">Créer un compte WHATSEYE</div>
                                    <span>Cela ne prends que
                                        <span class="text-success">quelques secondes</span>
                                    </span>
                                </h5>
                                <div class="divider row"></div>
                                <form on:submit|preventDefault={handleRegister} novalidate>
                                    <div>
                                        <div class="col">
                                            <div class="position-relative mb-3">
                                                <input bind:value={username} 
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
                                                  placeholder="n° de téléphone" 
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
                                    <div class="divider row"></div>
                                    <h6 class="mb-3">
                                      Vous possedez déja un compte?
                                        <a href="/login" class="text-primary">Se connecter</a> |
                                        <a href="/forgot-password" class="text-primary">Recuperer mot de passe</a>
                                    </h6>
                                    {#if message}
                                        <p class="text-danger mt-2">{message}</p>
                                    {/if}
                                    <!-- svelte-ignore a11y_consider_explicit_label -->
                                    <button type="submit" class="hidden" bind:this={submitButton}></button>
                                </form>
                            </div>
                            <div class="modal-footer d-block text-center">
                                <button type="button" on:click={triggerSubmit} class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg">Créer votre compte</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
