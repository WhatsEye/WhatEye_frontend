import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { baseurl } from "./../functions";
import { writable } from "svelte/store";
import { goto } from "$app/navigation";


export let profileId = writable('');
export let username = writable('');
export let usershortinfo = writable({
    id: null,
    username: null,
    photo: null,
});
export let userinfo = writable({});
export let userUrl = writable('');
export let loaded = writable(false);

export const config = { headers: { "Content-Type": "application/json", Authorization: "" } }



export const setLogedIn = async () => {
    const access = localStorage.getItem("access")
    
    const token = jwtDecode(access)
    profileId.set(token['id'])
    // localStorage.setItem("pid", token['pid'])
    config.headers.Authorization = `Bearer ${access}`
    const refreshToken = localStorage.getItem('refresh');
    updateToken(refreshToken)
}

export const clearData = async () => {
    await localStorage.removeItem("access");
    await localStorage.removeItem("refresh");
    config.headers.Authorization = "";
}

export const setLogedOut = async () => {
    clearData()
    goto("/");
}

export const updateToken = async (refresh) => {
    await axios.post(`${baseurl}/accounts/token/refresh/`, { 'refresh': refresh }).then(res => {
        localStorage.setItem("access", res.data.access)
        localStorage.setItem("refresh", res.data.refresh)
        config.headers.Authorization = `Bearer ${res.data.access}`
    }).catch(err => {
        setLogedOut();
    })
}
