import { url_api_prefix } from '../config/general';


export async function fetchScienceSoftware()
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/science-software/`)

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
    throw new Error(`Error fetching Science Software data: ${error_msg}`)
}


export async function addScienceSoftware(data, csrftoken)
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/science-software/`, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
        'Referer': 'same-origin'
      },
      body: data && JSON.stringify(data)
    })

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
    throw new Error(`Error changing science software list: ${error_msg}`)
}


export async function deleteScienceSoftware(data, csrftoken)
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/science-software/${data.index}`, {
      method: 'DELETE',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
        'Referer': 'same-origin'
      },
      body: data && JSON.stringify(data)
    })

    if (!response.ok) {
      try {
        let json = await response.json();
        error_msg = `${response.status} ${response.statusText} in DELETE: ${json?.status?.message}`
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
    throw new Error(`Error deleting science software: ${error_msg}`)
}
