import { url_api_prefix } from '../config/general';

export async function fetchCroRIS()
{
  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/croris-info/`)
    if (response.ok) {
      return response.json()
    }
  } catch (err) {
    throw new Error(err)
  }
}

