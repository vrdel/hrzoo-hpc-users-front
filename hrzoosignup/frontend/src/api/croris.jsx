import { url_api_prefix } from 'Config/general';


export async function fetchCroRISUser(target_oib)
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/croris-info/${target_oib}`)

    if (response.ok)
      return response.json()

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
    throw new Error(`Error fetching data from CroRIS: ${error_msg}`)
}


export async function fetchCroRISMe()
{
  let error_msg = ''

  try {
    let response = await fetch(`${url_api_prefix}/api/v1/internal/croris-info/`)

    if (response.ok)
      return response.json()

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
    throw new Error(`Error fetching data from CroRIS: ${error_msg}`)
}
