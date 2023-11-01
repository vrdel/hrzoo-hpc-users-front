import { url_api_prefix } from '../config/general';


export async function removeUserFromProject(projectId, data, csrftoken)
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/users-projects/${projectId}`, {
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

    return response
  }
  catch (err) {
    error_msg = `${err} in POST`;
  }

  if (error_msg)
    throw new Error(`Error removing users from project: ${error_msg}`)
}


export async function addUserToInternalProject(projectId, data, csrftoken)
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/users-intprojects/${projectId}`, {
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

    return response
  }
  catch (err) {
    error_msg = `${err} in POST`;
  }

  if (error_msg)
    throw new Error(`Error adding users to project: ${error_msg}`)
}
