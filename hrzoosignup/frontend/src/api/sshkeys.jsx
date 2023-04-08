import { url_api_prefix } from '../config/general';

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
