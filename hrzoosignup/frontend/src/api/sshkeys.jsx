import { url_api_prefix } from '../config/general';
import Cookies from 'universal-cookie';


export async function deleteSshKey(name)
{
  let cookies = new Cookies();

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/keys/`, {
      method: 'DELETE',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': cookies.get('csrftoken'),
        'Referer': 'same-origin'
      },
      body: name && JSON.stringify({
        'name': name
      })
    })
    if (response.ok)
      return response.json()
  } catch (err) {
    throw new Error(`Error delete SSH Key: ${err.message}`)
  }
}


export async function fetchSshKeys()
{
  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/keys/`)
    if (response.ok)
      return response.json()
  } catch (err) {
    throw new Error(`Error fetching SSHKeys data: ${err.message}`)
  }
}
