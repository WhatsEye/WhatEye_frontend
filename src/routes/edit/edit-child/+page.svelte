<script>
  import { goto } from '$app/navigation';
  import PwdModal from '$lib/components/PwdModal.svelte';
  import { onMount } from 'svelte';
  import { baseurl, pinChangedStore } from '../../../stores/functions';
  import { websocketStore } from '../../../stores/websockets';

  
  let showModal = false;
  let appFeedbackMessage = '';
  let activeTab = 'profile'; // Track active tab: 'profile' or 'password'

  let message = ''
  let formMessage = '';
  let isLoading  = false



   $: if ($pinChangedStore ) {
        isLoading = false;
        appFeedbackMessage = 'Le code PIN a été modifié avec succès';
        pinChangedStore.set(false);
        clearTimeout(feedbackTimeout); 
        setTimeout(() => (appFeedbackMessage = ''), 5000);
    }
  let feedbackTimeout;
  let name = ""
  let fname = ""
  let email = ""
  let phone_number = ""
  let birthday = "";
  let photoFile = null;
  let photoPreview = 'https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo';
  let password = '';
  let password_confirm = '';
  let pin = '';
  let pin_confirm = '';

  let errors = {};
  onMount(async ()=>{
    let childId = localStorage.getItem("ActiveChild");
		let access = localStorage.getItem("access") || sessionStorage.getItem("access");
		const config = {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${access}`
			}
		};
		try {
			const res = await fetch(`${baseurl}/accounts/profile/child/${childId}/`, config);
      const data = await res.json();
      name = data.user.last_name;
      fname = data.user.first_name;
      email = data.user.email;
      phone_number = data.phone_number;
      birthday = data.birthday;
      photoPreview = data.photo || 'https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo';
    }catch (error) {
			console.error('Error fetching family data:', error);
		}
  })
  function validateField(fieldName) {
    const newErrors = { ...errors };
    switch (fieldName) {
      case 'email':
        newErrors.email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
          ? ''
          : 'Format incorrect';
        break;
      case 'name':
        newErrors.name = /^[a-zA-Z\s'-]+$/u.test(name)
          ? ''
          : 'Format incorrect (lettres, espaces, apostrophes)';
        break;
      case 'fname':
        newErrors.fname = /^[a-zA-Z\s'-]+$/u.test(fname)
          ? ''
          : 'Format incorrect (lettres, espaces, apostrophes)';
        break;
      case 'phone_number':
        newErrors.phone_number = /^[0-9\s+()-]{8,}$/.test(phone_number)
          ? ''
          : 'Numéro de téléphone incorrect';
        break;
      case 'birthday':
        newErrors.birthday = birthday ? '' : 'Date de naissance requise';
        break;
      case 'password':
        newErrors.password = password.length >= 8 ? '' : 'Le mot de passe doit contenir au moins 8 caractères';
        if (password && password !== password_confirm) {
          newErrors.password_confirm = 'Les mots de passe ne correspondent pas';
        } else {
          newErrors.password_confirm = '';
        }
        break;
      case 'password_confirm':
        newErrors.password_confirm = password === password_confirm ? '' : 'Les mots de passe ne correspondent pas';
        break;
      case 'pin':
        newErrors.pin = /^\d{5}$/.test(pin) ? '' : 'Le PIN doit être composé de 4 chiffres';
        if (pin && pin !== pin_confirm) {
          newErrors.pin_confirm = 'Les PINs ne correspondent pas';
        } else {
          newErrors.pin_confirm = '';
        }
        break;
      case 'pin_confirm':
        newErrors.pin_confirm = pin === pin_confirm ? '' : 'Les PINs ne correspondent pas';
        break;
      case 'photo':
        if (photoFile) {
          if (photoFile.size > 2 * 1024 * 1024) {
            newErrors.photo = 'La photo ne doit pas dépasser 2MB.';
          } else if (!['image/jpeg', 'image/gif', 'image/png'].includes(photoFile.type)) {
            newErrors.photo = 'Seuls les formats JPG, GIF ou PNG sont acceptés.';
          } else {
            newErrors.photo = '';
          }
        }
        break;
    }
    errors = newErrors;
  }

  function validateProfileForm() {
    errors = {};
    validateField('email');
    validateField('name');
    validateField('fname');
    validateField('phone_number');
    validateField('birthday');
    validateField('photo');
    let finalErrors = {};
    for (const key in errors) {
      if (errors[key]) finalErrors[key] = errors[key];
    }
    errors = finalErrors;
    return Object.keys(errors).length === 0;
  }

  function validatePasswordForm() {
    errors = {};
    if (password) validateField('password');
    if (password_confirm) validateField('password_confirm');
    if (pin) validateField('pin');
    if (pin_confirm) validateField('pin_confirm');
    let finalErrors = {};
    for (const key in errors) {
      if (errors[key]) finalErrors[key] = errors[key];
    }
    errors = finalErrors;
    return Object.keys(errors).length === 0 || (!password && !pin);
  }

  async function handleFormSubmitAttempt() {
    formMessage = '';
    appFeedbackMessage = '';
    const isValid = activeTab === 'profile' ? validateProfileForm() : validatePasswordForm();
    if (!isValid) {
      formMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }
    openConfirmModal();
  }

  function handlePhotoChange(event) {
    const file = event.target.files[0];
    if (file) {
      photoFile = file;
      validateField('photo');
      if (!errors.photo) {
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  function openConfirmModal() {
    appFeedbackMessage = '';
    showModal = true;
  }

  async function handlePasswordConfirm(event) {
    const password = event.detail.password;
     let childId = localStorage.getItem("ActiveChild");
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    try {
    const response = await fetch(`${baseurl}/accounts/check-password/`, {
        method: 'POST', // Use PATCH or PUT based on your API
        body: JSON.stringify({ password }),
        headers: {
          "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
        }});

      if (response.ok) {
        const data = await response.json();
        if(data.is_correct){
            showModal = false;
            await submitActualFormChanges();
          } else {
      appFeedbackMessage = 'Échec de la vérification du mot de passe.';
      }
    }
     } catch (error) {
      message = 'Erreur réseau. Veuillez réessayer.';
    }
  }

  async function submitActualFormChanges() {
    let childId = localStorage.getItem("ActiveChild");
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");

    if (activeTab === 'profile') {
    
      const formData = new FormData();
      formData.append('user.email', email);
      formData.append('phone_number', phone_number);
      formData.append('birthday', birthday);
      formData.append('user.first_name', fname);
      formData.append('user.last_name', name);
      if (photoFile) {
        formData.append('photo', photoFile);
      }
       try {
      const response = await fetch(`${baseurl}/accounts/profile/child/${childId}/`, {
        method: 'PATCH', // Use PATCH or PUT based on your API
        body: formData,
        headers: {
        Authorization: `Bearer ${access}`,
        }});
        const data = await response.json();
        console.log(data)
        if (response.ok) {
        
        name = data.user.last_name;
        fname = data.user.first_name;
        email = data.user.email;
        phone_number = data.phone_number;
        birthday = data.birthday;
        photoPreview = data.photo || 'https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo';
        appFeedbackMessage = 'Profil mis à jour avec succès!';
        formMessage = '';
      }else{
         message = 'Erreur lors de la mise à jour du profil.';
        formMessage = 'Veuillez réessayer.';
      }
    } catch (error) {
      message = 'Erreur réseau. Veuillez réessayer.';
      console.error('Submit error:', error);
    }
    } else {


      if(password){
      const payload = {
          password,
          password_confirm
        };
      try {
        const res = await fetch(`${baseurl}/control/change-password/${childId}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json",Authorization: `Bearer ${access}` },
          body: JSON.stringify(payload),
        });

              const data = await res.json();
              if (res.ok) {
                if (data.status=200){
                  appFeedbackMessage = 'Mot de passe mis à jour avec succès!';
                }
              } else {
                appFeedbackMessage = "La réinitialisation du mot de passe a échoué.";
              }
            } catch (err) {
              console.error("Fetch error:", err);
              appFeedbackMessage = "Erreur de connexion au serveur.";
            } finally {
                isLoading = false
                
              password = '';
              password_confirm = '';
            }
      }
      if(pin){
        websocketStore.changePin(childId, pin)
        feedbackTimeout = setTimeout(()=>{
                    appFeedbackMessage = "La réinitialisation du PIN a échoué.";
                    setTimeout(()=>{appFeedbackMessage=''},3000)
        }, 15000)
      }     
      pin = '';
      pin_confirm = '';
    }
    formMessage = '';
    setTimeout(()=>{appFeedbackMessage=""},3000)

  }
  

  function handleModalCancel() {
    appFeedbackMessage = 'Modification annulée.';
    showModal = false;
  }

  function switchTab(tab) {
    activeTab = tab;
    errors = {};
    formMessage = '';
    appFeedbackMessage = '';
  }
</script>

<svelte:head>
  <title>WHATSEYE | Modifier le Profil</title>
  <link rel="stylesheet" href="/styles/dashboard.css" />
  <link rel="stylesheet" href="https://cdn.linearicons.com/free/1.0.0/icon-font.min.css" />
</svelte:head>

  <div class="container mt-5">
    <div class="h-100 bg-custom">
          <div class="container w-100">
            <div class="modal-content">
              <div class="modal-body">
                <h5 class="modal-title">
                  <div class="fs-2 fw-bold mb-3 text-center">  
                    <div class="modal-footer d-block text-center">

                    <i class="lnr  lnr-arrow-left" style="float: left; font-weight: 900;  cursor: pointer;" on:click={()=>{goto("/family")}}></i>
                Modifier le Profil
              </div>
            </h5>
            <div class="divider row"></div>
            {#if appFeedbackMessage}
              <div
                class="alert {appFeedbackMessage.includes('succès') ? 'alert-success' : 'alert-error'}"
                role="alert"
                aria-live="assertive"
              >
                {appFeedbackMessage}
              </div>
            {/if}
            <ul class="nav nav-tabs mb-3" role="tablist">
              <li class="nav-item">
                <button
                  class="nav-link {activeTab === 'profile' ? 'active' : ''}"
                  on:click={() => switchTab('profile')}
                  role="tab"
                  aria-selected={activeTab === 'profile'}
                >
                  Modifier le Profil
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link {activeTab === 'password' ? 'active' : ''}"
                  on:click={() => switchTab('password')}
                  role="tab"
                  aria-selected={activeTab === 'password'}
                >
                  Changer le Mot de Passe/PIN
                </button>
              </li>
            </ul>
            <div class="tab-content">
              {#if activeTab === 'profile'}
                <form on:submit|preventDefault={handleFormSubmitAttempt} novalidate>
                  <div class="text-center mb-3">
                    <div class="pp-display mx-auto mb-3">
                      <img src={photoPreview} alt="Photo de profil" class="border border-4" />
                    </div>
                    <label for="ppImg" class="text-primary" style="cursor: pointer;">
                      <span class="visually-hidden">Changer la photo de profil</span>
                      Changer la photo
                    </label>
                    <input
                      type="file"
                      id="ppImg"
                      class="d-none"
                      accept="image/*"
                      on:change={handlePhotoChange}
                    />
                    <p class="text-muted small mt-2">JPG, GIF ou PNG. Max 2MB.</p>
                    {#if errors.photo}
                      <em class="error invalid-feedback">{errors.photo}</em>
                    {/if}
                  </div>
                  <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input
                      id="email"
                      bind:value={email}
                      type="email"
                      class="form-control {errors.email ? 'is-invalid' : email ? 'is-valid' : ''}"
                      on:input={() => validateField('email')}
                    />
                    {#if errors.email}
                      <em class="error invalid-feedback">{errors.email}</em>
                    {/if}
                  </div>
                  <div class="mb-3">
                    <label for="name" class="form-label">Nom</label>
                    <input
                      id="name"
                      bind:value={name}
                      type="text"
                      class="form-control {errors.name ? 'is-invalid' : name ? 'is-valid' : ''}"
                      on:input={() => validateField('name')}
                    />
                    {#if errors.name}
                      <em class="error invalid-feedback">{errors.name}</em>
                    {/if}
                  </div>
                  <div class="mb-3">
                    <label for="fname" class="form-label">Prénom</label>
                    <input
                      id="fname"
                      bind:value={fname}
                      type="text"
                      class="form-control {errors.fname ? 'is-invalid' : fname ? 'is-valid' : ''}"
                      on:input={() => validateField('fname')}
                    />
                    {#if errors.fname}
                      <em class="error invalid-feedback">{errors.fname}</em>
                    {/if}
                  </div>
                  <div class="mb-3">
                    <label for="phone" class="form-label">N° de téléphone</label>
                    <input
                      id="phone"
                      bind:value={phone_number}
                      type="tel"
                      class="form-control {errors.phone_number ? 'is-invalid' : phone_number ? 'is-valid' : ''}"
                      on:input={() => validateField('phone_number')}
                    />
                    {#if errors.phone_number}
                      <em class="error invalid-feedback">{errors.phone_number}</em>
                    {/if}
                  </div>
                  <div class="mb-3">
                    <label for="birthday" class="form-label">Date de naissance</label>
                    <input
                      id="birthday"
                      bind:value={birthday}
                      type="date"
                      class="form-control {errors.birthday ? 'is-invalid' : birthday ? 'is-valid' : ''}"
                      on:input={() => validateField('birthday')}
                    />
                    {#if errors.birthday}
                      <em class="error invalid-feedback">{errors.birthday}</em>
                    {/if}
                  </div>
                  
                  {#if formMessage}
                    <p class="text-danger mt-2 text-center">{formMessage}</p>
                  {/if}
                      <div class="modal-footer d-block text-center">

                  <button
                    type="submit"
                    on:click={submitActualFormChanges}
                    class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Traitement...' : 'Confirmer les modifications'}
                  </button>
                  </div>
                </form>
              {:else}
                <form on:submit|preventDefault={handleFormSubmitAttempt} novalidate>
                  <div class="mb-3">
                    <label for="password" class="form-label">Nouveau mot de passe</label>
                    <input
                      id="password"
                      bind:value={password}
                      type="password"
                      class="form-control {errors.password ? 'is-invalid' : password ? 'is-valid' : ''}"
                      on:input={() => validateField('password')}
                    />
                    {#if errors.password}
                      <em class="error invalid-feedback">{errors.password}</em>
                    {/if}
                  </div>
                  <div class="mb-3">
                    <label for="password_confirm" class="form-label">Confirmer le mot de passe</label>
                    <input
                      id="password_confirm"
                      bind:value={password_confirm}
                      type="password"
                      class="form-control {errors.password_confirm ? 'is-invalid' : password_confirm ? 'is-valid' : ''}"
                      on:input={() => validateField('password_confirm')}
                    />
                    {#if errors.password_confirm}
                      <em class="error invalid-feedback">{errors.password_confirm}</em>
                    {/if}
                  </div>
                  <div class="mb-3">
                    <label for="pin" class="form-label">Nouveau PIN (5 chiffres)</label>
                    <input
                      id="pin"
                      bind:value={pin}
                      type="text"
                      maxlength="5"
                      class="form-control {errors.pin ? 'is-invalid' : pin ? 'is-valid' : ''}"
                      on:input={() => validateField('pin')}
                    />
                    {#if errors.pin}
                      <em class="error invalid-feedback">{errors.pin}</em>
                    {/if}
                  </div>
                  <div class="mb-3">
                    <label for="pin_confirm" class="form-label">Confirmer le PIN</label>
                    <input
                      id="pin_confirm"
                      bind:value={pin_confirm}
                      type="text"
                      maxlength="5"
                      class="form-control {errors.pin_confirm ? 'is-invalid' : pin_confirm ? 'is-valid' : ''}"
                      on:input={() => validateField('pin_confirm')}
                    />
                    {#if errors.pin_confirm}
                      <em class="error invalid-feedback">{errors.pin_confirm}</em>
                    {/if}
                  </div>
            
                  {#if formMessage}
                    <p class="text-danger mt-2 text-center">{formMessage}</p>
                  {/if}
                      <div class="modal-footer d-block text-center">

                  <button
                    type="submit"
                    class="btn-wide btn-pill btn-shadow btn-hover-shine btn btn-custom btn-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Traitement...' : 'Confirmer les modifications'}
                  </button>
                  </div>
                </form>
              {/if}
            </div>
            <div class="divider row mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

<PwdModal bind:show={showModal} on:confirm={handlePasswordConfirm} on:cancel={handleModalCancel} />

<style>
 
  .pp-display {
    width: 150px;
    height: 150px;
  }
  .pp-display img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  .btn-custom {
    color: #fff;
    background-color: #25d366;
    border-color: #25d366;
  }
  .btn-custom:hover {
    background-color: #20ba59;
    border-color: #1eae53;
  }
  .nav-tabs {
    border-bottom: 1px solid #dee2e6;
  }
  .nav-tabs .nav-link {
    color: #495057;
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  .nav-tabs .nav-link:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }
  .nav-tabs .nav-link.active {
    color: #25d366;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>