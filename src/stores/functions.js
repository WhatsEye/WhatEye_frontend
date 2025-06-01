import { goto } from '$app/navigation';
import { writable } from 'svelte/store';

export const allowDash = writable(false)

export const newLocation = writable({})
export const errorLocation = writable("")

export const contactsStore = writable([]);
export const contactsChatStore = writable([]);
export const filesStore = writable([]);
export const fileUriBase64Store = writable("");
export const filesArrivedStore = writable(false);
export const fileUriArrivedStore = writable(false);
export const contactsChatArrivedStore = writable(false);
export const contactsArrivedStore = writable(false);
export const contactBlockedArrivedStore = writable(false);
export const pinChangedStore = writable(false);
export const lockChangedStore = writable(false);

export const num_notif = writable({});
export const num_vo_calls = writable({});
export const num_vd_calls = writable({});


export const locationsStore = writable([]);
export const notificationsStore = writable([]);



//edit

export const familyStore = writable({})




export const baseurl = "https://127.0.0.1:443/api"
//export const baseurl = "http://192.168.89.116:443/api"
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
export const checkPath = ()=>{
  allowDash.subscribe((data)=>{
    if (!data) {
      goto('/family');
    }
  })
    
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
