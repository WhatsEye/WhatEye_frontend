import { error } from '@sveltejs/kit';
import { validate } from 'uuid';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { fid, code } = params;

  // Validate UUID
  if (!validate(fid)) {
    throw error(400, 'Invalid Family ID. Must be a valid UUID.');
  }

  // Validate code (basic example, adjust as needed)
  if (!code || typeof code !== 'string' || code.length === 0) {
    throw error(400, 'Invalid code. Must be a non-empty string.');
  }

  // Return the parameters to the page
  return {
    fid,
    code
  };
}