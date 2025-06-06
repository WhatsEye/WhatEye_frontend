import { validate } from 'uuid';

   /** @type {import('@sveltejs/kit').ParamMatcher} */
   export function match(value) {
     return validate(value);
   }
