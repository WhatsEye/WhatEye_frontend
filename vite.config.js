import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		https: {
			key: './key.pem', // Relative path to the key file
			cert: './cert.pem' // Relative path to the certificate file
		},
		host: 'localhost'
	}
});