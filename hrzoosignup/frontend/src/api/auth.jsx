import { url_api_prefix } from '../config/general';


export async function isActiveSession() {
  let response = await fetch(`${url_api_prefix}/api/v1/sessionactive`)

  if (response.ok)
    return response.json()
  else
    return false
}


export async function doLogout(csrftoken) {
  let response = await fetch(`${url_api_prefix}/auth/logout/`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
      'Referer': 'same-origin'
    }})
}


export async function doUserPassLogin(username, password)
{
  let response = await fetch(`${url_api_prefix}/auth/login/`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'same-origin'
    },
    body: JSON.stringify({
      'username': username,
      'password': password
    })
  })

  return isActiveSession()
}
