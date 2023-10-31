import { url_api_prefix } from '../config/general';


export async function addInvite(data, csrftoken)
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/invites/`, {
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
    throw new Error(`Error creating invite: ${error_msg}`)
}


export async function fetchMyInvites()
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/invites-sent/`)

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
    throw new Error(`Error fetching My Invites data: ${error_msg}`)
}


export async function fetchInvite(inviteKey)
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/invites/${inviteKey}`)

    if (response.ok)
      return await response.json()

    if (!response.ok) {
      try {
        await response.text().then(text => {throw new Error(text)})
      }
      catch (err1) {
        error_msg = `${err1.message}`
      }
    }

  }
  catch (err) {
    error_msg = `${err} in GET`;
  }

  if (error_msg)
    throw new Error(`Error fetching Invite data: ${error_msg}`)
}


export async function delInvite(data, csrftoken)
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/invites-sent/`, {
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
    throw new Error(`Error removing invitation: ${error_msg}`)
}
