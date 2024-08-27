import { url_api_prefix } from '../config/general';


export async function fetchAccountingData()
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/accounting/records`)

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
    throw new Error(`Error fetching accounting data: ${error_msg}`)
}