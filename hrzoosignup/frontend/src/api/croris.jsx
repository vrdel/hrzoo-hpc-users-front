import { url_api_prefix } from '../config/general';

export async function fetchCroRIS()
{
  let err_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/croris-info/`)
    if (response.ok)
      return response.json()
    else
      return false
  } catch (err) {
    err_msg = `${err} in fetch ${url_api_prefix}/api/v1/internal/croris-info/`
  }

  if (err_msg)
    throw Error(err_msg)
}

