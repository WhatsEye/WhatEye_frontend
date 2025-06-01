<script>
	import { familyStore } from './../../stores/functions.js';
	import { profileId, setLogedIn } from './../../stores/accounts/auth.js';
	import { beforeUpdate, onMount } from 'svelte';
	import Parent from '$lib/components/Parent.svelte';
	import Child from '$lib/components/Child.svelte';
	import { baseurl, forceLogin } from '../../stores/functions';
	import Family from '$lib/components/Family.svelte';
	import { websocketStore } from '../../stores/websockets';

	let showParentModal = false;
	let showChildLoginModal = false;
	let showChildRegisterModal = false;
	let parentEmail = '';
	let emailError = '';
	let isSubmitting = false;
	let inviteSuccess = false;
	let parentQr = ''; // Parent QR for child login
	let familyQr = ''; // Family QR for child registration
	let isLoading = false;

	let family = {};
	let parents = [];
	let children = [];
	let childIds = [];

	// Fetch family data
	onMount(async () => {
		forceLogin();
		setLogedIn();
		isLoading = true;
		localStorage.removeItem("ActiveChild");
		let access = localStorage.getItem("access") || sessionStorage.getItem("access");
		const config = {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${access}`
			}
		};
		try {
			const res = await fetch(`${baseurl}/accounts/profile/family/`, config);
			const data = await res.json();
			if (res.ok){
				isLoading = false;
			}
			family = {
				id: data.id,
				photo: data.photo,
				name: data.name,
				about: data.about,
				qr_image: data.qr_image
			};
			familyStore.set(family)
			familyQr = data.qr_image;

			// Extract and format parent data
			const parentList = [data.father, data.mother].filter(p => p && p.id);
			parents = parentList.map(p => ({
				id: p.id,
				photo: p.photo,
				username: p.username,
				full_name: p.full_name,
				qr_image: p.qr_image,
        		gender: p.gender
				
			}));
			parentQr = parents
				.filter(p => p.id === $profileId)
				.map(p => p.qr_image)[0] || '';

			// Extract and format child data
			children = data.kids.map(k => ({
				id: k.id,
				photo: k.photo,
				username: k.username,
				full_name: k.full_name,
				gender: k.gender,
				phone_locked : k.phone_locked ,
				num_unread_notifications: k.num_unread_notifications,
				num_unread_voice_calls: k.num_unread_voice_calls,
				num_unread_video_calls: k.num_unread_video_calls
			}));
			childIds = data.kids.map(kid => kid.id);
			websocketStore.initializeWebSockets(childIds);
		} catch (error) {
			console.error('Error fetching family data:', error);
		}
	});

	// Validate email in real-time
	function validateEmail() {
		if (!parentEmail) {
    		emailError = 'L\'email est requis.';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
    		emailError = 'Veuillez entrer une adresse email valide.';
		} else {
			emailError = '';
		}
	}

	// Handle parent invitation
	async function inviteParent() {
		validateEmail();
		if (emailError) return;

		isSubmitting = true;
		inviteSuccess = false;
		let access = localStorage.getItem("access") || sessionStorage.getItem("access");
		const config = {
			method: 'GET',
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${access}`
			},
		};
		try {
			const res = await fetch(`${baseurl}/accounts/invitation/parent/${parentEmail}`, config);
			if (res.ok) {
				inviteSuccess = true;
				setTimeout(() => {
					parentEmail = '';
					isSubmitting = false;
					inviteSuccess = false;
					showParentModal = false;
				}, 1500); // Close modal after success animation
			} else {
				const errorData = await res.json();
				emailError = errorData.message || 'Failed to send invitation.';
				isSubmitting = false;
			}
		} catch (error) {
			console.error('Erreur lors de l\'invitation du parent:', error);
			emailError = 'Une erreur est survenue lors de l\'envoi de l\'invitation.';
			isSubmitting = false;
		}
	}
</script>


<svelte:head>
	<title>Famille</title>
  <link rel="stylesheet" href="/styles/dashboard.css" />
  <link rel="stylesheet" href="/styles/tailwind.min.css" />
  </svelte:head>

<div class="tabs-animation md:mx-32 app-container app-theme-white body-tabs-shadow py-4">
	 {#if isLoading}    
            <div class="loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            Chargement ...
          </div>
		  {:else}
	<div class="container mx-auto app-container">
		<div class="tabs-animation app-container">
			<Family {family} />

			<!-- Parent component with data -->
			<Parent {parents} />

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
			<button
				class="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center transition duration-300 transform hover:scale-105"
				on:click={() => showParentModal = true}
			>
				<i class="pe-7s-add-user mr-2 text-lg"></i> Inviter un parent
			</button>
			<button
				class="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center transition duration-300 transform hover:scale-105"
				on:click={() => showChildRegisterModal = true}
			>
				Inscription de l'enfant
			</button>
			<button
				class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center transition duration-300 transform hover:scale-105"
				on:click={() => showChildLoginModal = true}
			>
				Connexion enfant
			</button>
			</div>

		<div class=" bg-gray-50 rounded-lg shadow-md">
			<h3 class="mt-4 ml-4 text-3xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2 uppercase tracking-wide">
				Enfants
			</h3>
			<Child {children} />
		</div>

			<!-- Child component with data -->
			

			<!-- Parent Invitation Modal -->
			{#if showParentModal}
			
			<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div class="bg-white rounded-xl p-6 max-w-md w-full transform transition-all duration-300 scale-0 animate-scale-in">
					<h5 class="text-xl font-bold text-gray-800 mb-4">Inviter un parent</h5>
					<div class="relative">
					<input
						type="email"
						placeholder="Entrer l'adresse email"
						bind:value={parentEmail}
						on:input={validateEmail}
						class="w-full p-3 border {emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
					/>
					{#if emailError}
						<p class="text-red-500 text-sm mt-1">{emailError}</p>
					{/if}
					</div>
					<div class="flex justify-end mt-4">
					<button
						class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg mr-2 transition duration-200"
						on:click={() => showParentModal = false}
					>
						Annuler
					</button>
					<button
						class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-200"
						on:click={inviteParent}
						disabled={isSubmitting || emailError}
					>
						{#if isSubmitting}
						<svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"></path>
						</svg>
						Envoi...
						{:else if inviteSuccess}
						<svg class="h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
						</svg>
						Envoyé !
						{:else}
						Envoyer l'invitation
						{/if}
					</button>
					</div>
				</div>
				</div>
			{/if}

			<!-- Child Login QR Modal -->
			{#if showChildLoginModal}
				<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-xl p-6 max-w-md w-full text-center transform transition-all duration-300 scale-0 animate-scale-in">
				<h5 class="text-xl font-bold text-blue-600 mb-4">Scannez le QR pour la connexion enfant</h5>
				<p class="mb-4 text-gray-700">Veuillez noter : ce code QR est valable pour un seul usage. Après l'avoir scanné, il ne sera plus valide.</p>
				{#if parentQr}
				<div class="p-4 bg-blue-50 rounded-lg shadow-inner">
					<img src={parentQr} alt="Code QR Parent" class="mx-auto my-3 max-w-xs" />
				</div>
				<p class="text-gray-600 mt-2">Scannez ce code QR pour vous connecter en tant qu'enfant.</p>
				{:else}
				<p class="text-red-500">Aucun code QR disponible pour ce parent.</p>
				{/if}
				<button
				class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg mt-4 transition duration-200"
				on:click={() => showChildLoginModal = false}
				>
				Fermer
				</button>
			</div>
			</div>
			{/if}

			<!-- Child Registration QR Modal -->
			{#if showChildRegisterModal}
				<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div class="bg-white rounded-xl p-6 max-w-md w-full text-center transform transition-all duration-300 scale-0 animate-scale-in">
				<h5 class="text-xl font-bold text-yellow-600 mb-4">Scannez le QR pour inscrire un enfant</h5>
				<p class="text-gray-700 mb-4">Veuillez noter : ce code QR est valable pour un seul usage. Après l'avoir scanné, il ne sera plus valide.</p>
				{#if familyQr}
				<div class="p-4 bg-yellow-50 rounded-lg shadow-inner">
					<img src={familyQr} alt="Code QR familial" class="mx-auto my-3 max-w-xs" />
				</div>
				<p class="text-gray-600 mt-2">Scannez ce code QR pour inscrire un nouvel enfant.</p>
				{:else}
				<p class="text-red-500">Aucun code QR disponible pour l'inscription familiale.</p>
				{/if}
				<button
				class="btn bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg mt-4 transition duration-200"
				on:click={() => showChildRegisterModal = false}
				>
				Fermer
				</button>
			</div>
			</div>
			{/if}
		</div>
	</div>
	{/if}
</div>

<style>
	@keyframes scale-in {
		0% {
			transform: scale(0);
		}
		100% {
			transform: scale(1);
		}
	}
	.animate-scale-in {
		animation: scale-in 0.3s ease-out forwards;
	}
</style>