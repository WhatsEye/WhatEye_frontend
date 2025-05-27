<script>
	import { goto } from '$app/navigation';
	import { familyStore, baseurl } from './../../../stores/functions.js';
  import { onMount } from 'svelte';
  import PwdModal from '$lib/components/PwdModal.svelte';

  let showModal = false;
  let message = ''
  let formMessage = '';
  let isLoading  = false
  // Form fields
  let id = '';
  let name = '';
  let about = '';
  let photoFile = null;
  let photoPreview = 'https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo';

  let errors = {};
  let btn;

  // Fetch family profile data on mount
  onMount(async () => {
        if(!$familyStore.id)
          goto("/family")
        id = $familyStore.id;
        name = $familyStore.name || '';
        about = $familyStore.about || '';
        photoPreview = $familyStore.photo || photoPreview;     
  });

  function validateField(fieldName) {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        newErrors.name = /^[a-zA-Z\s'-]+$/u.test(name) ? '' : 'Format incorrect (lettres, espaces, apostrophes)';
        break;
      case 'about':
        newErrors.about = about.length <= 500 ? '' : 'La description ne doit pas dépasser 500 caractères';
        break;
    }
    errors = newErrors;
  }

  function validateForm() {
    errors = {};
    validateField('name');
    validateField('about');

    let finalErrors = {};
    for (const key in errors) {
      if (errors[key]) {
        finalErrors[key] = errors[key];
      }
    }
    errors = finalErrors;
    return Object.keys(errors).length === 0;
  }

  async function handleFormSubmitAttempt() {
    formMessage = '';
    message = '';
    if (!validateForm()) {
      formMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      return;
    }
    openConfirmModal();
  }

  function triggerSubmit() {
    btn?.click();
  }

  function handlePhotoChange(event) {
    const file = event.target.files[0];
    if (file) {
      photoFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  function openConfirmModal() {
    message = '';
    showModal = true;
  }

  async function handlePasswordConfirm(event) {
    const password = event.detail.password;
    message = 'Vérification du mot de passe...';

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password) {
      showModal = false;
      message = 'Mot de passe confirmé! Enregistrement des modifications...';
      await submitActualFormChanges();
    } else {
      message = 'Échec de la vérification du mot de passe.';
    }
  }

  async function submitActualFormChanges() {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");
    const formData = new FormData();
    formData.append('name', name);
    formData.append('about', about);
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      const response = await fetch(`${baseurl}/accounts/profile/family/`, {
        method: 'PATCH', // Use PATCH or PUT based on your API
        body: formData,
        headers: {
        Authorization: `Bearer ${access}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        familyStore.set({
          id: data.id,
          photo: data.photo || photoPreview,
          name: data.name,
          about: data.about
        });
        message = 'Profil familial mis à jour avec succès!';
        formMessage = '';
      } else {
        message = 'Erreur lors de la mise à jour du profil familial.';
        formMessage = 'Veuillez réessayer.';
      }
    } catch (error) {
      message = 'Erreur réseau. Veuillez réessayer.';
      console.error('Submit error:', error);
    }
  }

  function handleModalCancel() {
    message = 'Modification annulée.';
    showModal = false;
  }
</script>

<svelte:head>
  <title>WHATSEYE | Modifier le Profil Familial</title>
 <link rel="stylesheet" href="/styles/dashboard.css" />
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
                    Modifier le Profil Familial</div>
                </div>
                  </h5>
                <div class="divider row"></div>
                    
                   {#if message}
              <div class="alert {message.includes('succès') ? 'alert-success' : 'alert-error'}" role="alert" aria-live="assertive">
                {message}
                </div>
              {/if}
                <form on:submit|preventDefault={handleSubmit}>
                  <div class="text-center mb-3">
                    <div class="pp-display mx-auto mb-3">
                      <img src={photoPreview} alt="Family profile pic" class="border border-4">
                    </div>
                    <label for="ppImg" class="text-primary" style="cursor: pointer;">
                      Changer la photo de profil
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
                    <input
                      type="text"
                      class="form-control {errors.name ? 'is-invalid' : name ? 'is-valid' : ''}"
                      placeholder="Nom de la famille"
                      bind:value={name}
                      on:input={() => validateForm()}
                    />
                    {#if errors.name}
                      <em class="error invalid-feedback">{errors.name}</em>
                    {/if}
                  </div>

                  <div class="mb-3">
                    <textarea
                      class="form-control {errors.about ? 'is-invalid' : about ? 'is-valid' : ''}"
                      placeholder="À propos de la famille"
                      bind:value={about}
                      rows="4"
                      on:input={() => validateForm()}
                    ></textarea>
                    {#if errors.about}
                      <em class="error invalid-feedback">{errors.about}</em>
                    {/if}
                  </div>

                
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

                <div class="divider row mt-3"></div>
               
              </div>
            </div>
          </div>
        </div>
      </div>
    


<PwdModal
  bind:show={showModal}
  on:confirm={handlePasswordConfirm}
  on:cancel={handleModalCancel}
/>

<style>
  .error {
    font-size: 0.8rem;
    color: red;
  }
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
</style>