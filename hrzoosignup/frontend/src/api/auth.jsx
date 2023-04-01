import Cookies from 'universal-cookie';
import { url_api_prefix } from '../config/general';


async function isActiveSession() {
  let response = await fetch(`${url_api_prefix}/api/v1/sessionactive`)

  if (response.ok)
    return response.json()
  else
    return false
}


//export async function doLogout(history, onLogout) {
export async function doLogout(onLogout) {
  let cookies = new Cookies();

  let response = await fetch(`${url_api_prefix}/auth/logout/`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': cookies.get('csrftoken'),
      'Referer': 'same-origin'
    }})

  onLogout()

  //cookies.remove('alertDismiss')
  //history.push('/ui/proxy')

  if (response.ok)
    setTimeout(() => {
    }, 50)
}


export async function doUserPassLogin(username, password)
{
  let cookies = new Cookies();

  let response = await fetch(`${url_api_prefix}/auth/login/`, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': cookies.get('csrftoken'),
      'Referer': 'same-origin'
    },
    body: JSON.stringify({
      'username': username,
      'password': password
    })
  })

  return isActiveSession()
}
