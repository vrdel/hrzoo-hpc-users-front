import { url_api_prefix } from '../config/general';
import Cookies from 'universal-cookie';


export async function deleteSshKey(name)
{
  let cookies = new Cookies()
  let error_msg = ''

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

    if (!response.ok) {
      try {
        await response.json();
        error_msg = `${response.status} ${response.statusText} in DELETE`
      }
      catch (err1) {
        error_msg = `${response.status} ${response.statusText} in DELETE`
      }

    }
  }
  catch (err) {
    error_msg = `${err} in DELETE`;
  }

  if (error_msg)
    throw new Error(`Error delete SSH Key: ${error_msg}`)
}


export async function fetchSshKeys()
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/keys/`)

    if (response.ok)
      return await response.json()

    if (!response.ok) {
      try {
        await response.json();
        error_msg = `${response.status} ${response.statusText} in GET`
      }
      catch (err1) {
        error_msg = `${response.status} ${response.statusText} in GET`
      }
    }

  }
  catch (err) {
    error_msg = `${err} in GET`;
  }

  if (error_msg)
    throw new Error(`Error fetching SSHKeys data: ${error_msg}`)
}
