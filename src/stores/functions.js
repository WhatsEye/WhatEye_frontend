import { goto } from '$app/navigation';
import { writable } from 'svelte/store';

export const newLocation = writable({})
export const errorLocation = writable("")

export const locationsStore = writable([]);
export const notificationsStore = writable([]);



export const baseurl = "http://127.0.0.1:8000/api"
// export const baseurl = "/api"
export const forceHome = ()=>{
  let accessToken = localStorage.getItem("access") || sessionStorage.getItem("access");
    if (accessToken!=null) {
      goto('/family');
    }
}

export const forceLogin = ()=>{
  let accessToken = localStorage.getItem("access") || sessionStorage.getItem("access");
    if (accessToken==null) {
      goto('/login');
    }
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
