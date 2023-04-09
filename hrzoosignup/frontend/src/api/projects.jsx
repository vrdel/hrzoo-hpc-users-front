import { url_api_prefix } from '../config/general';
import Cookies from 'universal-cookie';

export async function addResearchProject(data)
{
  let cookies = new Cookies()
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/projects-research/`, {
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
      body: data && JSON.stringify(data)
    })

    if (response.ok)
      return await response.json()

    if (!response.ok) {
      try {
        let json = await response.json();
        error_msg = `${response.status} ${response.statusText} in POST: ${json?.status?.message}`
      }
      catch (err1) {
        error_msg = `${response.status} ${response.statusText} in POST`
      }

    }
  }
  catch (err) {
    error_msg = `${err} in POST`;
  }

  if (error_msg)
    throw new Error(`Error adding research project: ${error_msg}`)
}
