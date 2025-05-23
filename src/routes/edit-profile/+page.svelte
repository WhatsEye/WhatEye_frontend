<script>
  import PwdModal from '$lib/components/PwdModal.svelte';

  let showModal = false;
  let appFeedbackMessage = ''; 

  
  let parent = {
    gender: "Male",
    username: "unchangeableUser", 
    phone_number: {
      phone_number: "0555123456" 
    },
    photo: "",
    birthday: "1990-01-01", 
    user: {
      firstname: "Test", 
      lastname: "Test", 
      email: "john.doe@example.com"
    }
  };

  let btn; 
  let name = parent.user.lastname;
  let fname = parent.user.firstname;
  let email = parent.user.email;
  let gender = parent.gender;
  let phone_number = parent.phone_number.phone_number;
  let birthday = parent.birthday;
  let photoFile = null;
  let photoPreview = parent.photo || "https://placehold.co/150x150/EFEFEF/AAAAAA&text=Photo";


  let errors = {};
  let formMessage = "";

  function validateField(fieldName) {
    
    const newErrors = { ...errors };

    switch (fieldName) {
      case "email":
        newErrors.email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) ? "" : "Format incorrect";
        break;
      case "name":
        newErrors.name = /^[a-zA-Z\s'-]+$/u.test(name) ? "" : "Format incorrect (lettres, espaces, apostrophes)";
        break;
      case "fname":
        newErrors.fname = /^[a-zA-Z\s'-]+$/u.test(fname) ? "" : "Format incorrect (lettres, espaces, apostrophes)";
        break;
    //   case "phone_number":
        // newErrors.phone_number = /^[0-9\s+()-]{8,}$/.test(phone_number) ? "" : "Numéro de téléphone incorrect";
        // break;
      case "birthday":
        newErrors.birthday = birthday ? "" : "Date de naissance requise";
        break;
    }
    errors = newErrors;
  }

  function validateForm() {
    errors = {}; 
    validateField("email");
    validateField("name");
    validateField("fname");
    validateField("phone_number");
    validateField("birthday");


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
    formMessage = "";
    appFeedbackMessage = "";
    if (!validateForm()) {
      formMessage = "Veuillez corriger les erreurs dans le formulaire.";
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
    appFeedbackMessage = '';
    showModal = true;
  }

  async function handlePasswordConfirm(event) {
    const password = event.detail.password;
    appFeedbackMessage = 'Vérification du mot de passe...';

    
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password) {
      showModal = false;
      appFeedbackMessage = 'Mot de passe confirmé! Enregistrement des modifications...';
      await submitActualFormChanges();
    } else {
      appFeedbackMessage = 'Échec de la vérification du mot de passe.';
    }
  }

  async function submitActualFormChanges() {
    
    console.log('Submitting profile changes:', {
      name,
      fname,
      email,
      phone_number,
      birthday,
      gender,
      photoFile: photoFile ? photoFile.name : 'No new photo'
    });

    // Simulate API call for profile update
    

    appFeedbackMessage = 'Profil mis à jour avec succès!';
    formMessage = "";

    formMessage = 'Erreur lors de la mise à jour du profil. Veuillez réessayer.';
    
  }


  function handleModalCancel() {
    appFeedbackMessage = 'Modification annulée.';
    showModal = false;
  }
</script>

<svelte:head>
  <title>WHATSEYE | Modifier le Profil</title>
  <link rel="stylesheet" href="https://cdn.linearicons.com/free/1.0.0/icon-font.min.css">
</svelte:head>

<div class="tab-content">
  <div class="main-card mb-3 card rounded-3 shadow-sm">
    <div class="card-header fs-5 fw-semibold">
      Modifier vos informations
    </div>
    <div class="card-body">
      <form on:submit|preventDefault={handleFormSubmitAttempt} novalidate>
        <div class="text-center mb-3">
          <div class="pp-display mx-auto mb-3">
            <img src={photoPreview} alt="{parent.username}'s profile pic" class="border border-4">
          </div>
          <label for="ppImg" class="text-info" style="cursor: pointer;">
            Changer la photo de profil &nbsp;
            <span class="lnr lnr-pencil"></span>
          </label>
          <input type="file" id="ppImg" class="d-none" accept="image/*" on:change={handlePhotoChange}>
          <p class="text-muted small mt-2">JPG, GIF ou PNG. Max 2MB.</p>
        </div>
        <div class="row divider mb-3"></div>
        <div class="row">
          <div class="col-md-6">
            <div class="position-relative mb-3">
              <label for="username" class="form-label">Username</label>
              <input id="username" value={parent.username} type="text" class="form-control" disabled>
            </div>
          </div>
          <div class="col-md-6">
            <div class="position-relative mb-3">
              <label for="email" class="form-label">E-mail</label>
              <input
                id="email"
                bind:value={email}
                type="email"
                class="form-control {errors.email ? 'is-invalid' : (email && !errors.email !== undefined) ? 'is-valid' : ''}"
                on:blur={() => validateField("email")}
                on:input={() => validateField("email")}>
              {#if errors.email}
                <em class="error invalid-feedback">{errors.email}</em>
              {/if}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="position-relative mb-3">
              <label for="name" class="form-label">Nom</label>
              <input
                id="name"
                bind:value={name}
                type="text"
                class="form-control {errors.name ? 'is-invalid' : (name && !errors.name !== undefined) ? 'is-valid' : ''}"
                on:blur={() => validateField("name")}
                on:input={() => validateField("name")}>
              {#if errors.name}
                <em class="error invalid-feedback">{errors.name}</em>
              {/if}
            </div>
          </div>
          <div class="col-md-6">
            <div class="position-relative mb-3">
              <label for="fname" class="form-label">Prénom</label>
              <input
                id="fname"
                bind:value={fname}
                type="text"
                class="form-control {errors.fname ? 'is-invalid' : (fname && !errors.fname !== undefined) ? 'is-valid' : ''}"
                on:blur={() => validateField("fname")}
                on:input={() => validateField("fname")}>
              {#if errors.fname}
                <em class="error invalid-feedback">{errors.fname}</em>
              {/if}
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="position-relative mb-3">
              <label for="phone" class="form-label">N° de téléphone</label>
              <input id="phone"
                bind:value={phone_number}
                type="tel"
                class="form-control {errors.phone_number ? 'is-invalid' : (phone_number && !errors.phone_number !== undefined) ? 'is-valid' : ''}"
                on:blur={() => validateField("phone_number")}
                on:input={() => validateField("phone_number")}>
              {#if errors.phone_number}
                <em class="error invalid-feedback">{errors.phone_number}</em>
              {/if}
            </div>
          </div>
          <div class="col-md-4 col-sm-9">
            <div class="position-relative mb-3">
              <label for="birthday" class="form-label">Date de naissance</label>
              <input
                id="birthday"
                bind:value={birthday}
                name="birthday"
                placeholder="date de naissance"
                type="date"
                class="form-control {errors.birthday ? 'is-invalid' : (birthday && !errors.birthday !== undefined) ? 'is-valid' : ''}"
                on:blur={() => validateField('birthday')}
                on:change={() => validateField('birthday')} />
              {#if errors.birthday}
                <em class="error invalid-feedback">{errors.birthday}</em>
              {/if}
            </div>
          </div>
          <div class="col-md-2 col-sm-3">
            <div class="position-relative mb-3">
              <label for="gender" class="form-label">Genre</label>
              <input id="gender" type="text" class="form-control" disabled bind:value={gender}>
            </div>
          </div>
        </div>
        {#if formMessage}
          <p class="text-danger mt-2 text-center">{formMessage}</p>
        {/if}
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="submit" class="d-none" bind:this={btn}></button>
      </form>
    </div>
    <div class="card-footer text-center d-block py-3">
      <button type="button" class="btn btn-wide btn-pill btn-custom" on:click={triggerSubmit}>
        Confirmer les modifications
      </button>
    </div>
  </div>
  {#if appFeedbackMessage}
    <p class="app-feedback {appFeedbackMessage.includes('succès') || appFeedbackMessage.includes('confirmé') ? 'success' : appFeedbackMessage.includes('Échec') || appFeedbackMessage.includes('annulée') ? 'error' : 'info'}">
      {appFeedbackMessage}
    </p>
  {/if}
</div>
<PwdModal
  bind:show={showModal}
  on:confirm={handlePasswordConfirm}
  on:cancel={handleModalCancel}
/>

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
    color: #fff;
    background-color: #20ba59;
    border-color: #1eae53;
  }
  .btn-check:focus + .btn-custom, .btn-custom:focus {
        color: #fff;
        background-color: #20ba59;
        border-color: #1eae53;
        box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
  }
  .btn-check:checked + .btn-custom,
  .btn-check:active + .btn-custom, .btn-custom:active, .btn-custom.active,
  .show > .btn-custom.dropdown-toggle {
      color: #fff;
      background-color: #1eae53;
      border-color: #1ba34d;
  }
  .btn-check:checked + .btn-custom:focus,
  .btn-check:active + .btn-custom:focus, .btn-custom:active:focus, .btn-custom.active:focus,
  .show > .btn-custom.dropdown-toggle:focus {
      box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5);
  }
  .btn-custom:disabled, .btn-custom.disabled {
      color: #fff;
      background-color: #25d366;
      border-color: #25d366;
  }

  .app-feedback {
    margin-top: 1.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 5px;
    font-size: 0.95rem;
    text-align: center;
    width: 100%;
    box-sizing: border-box;
  }
  .app-feedback.success {
    background-color: #d1e7dd; 
    color: #0f5132; 
    border: 1px solid #badbcc;
  }
  .app-feedback.error {
    background-color: #f8d7da; 
    color: #842029; 
    border: 1px solid #f5c2c7;
  }
  .app-feedback.info {
    background-color: #cff4fc; 
    color: #055160; 
    border: 1px solid #b6effb;
  }

</style>
