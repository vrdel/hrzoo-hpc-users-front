import { url_api_prefix } from 'Config/general';


export async function fetchUsersInactive() {
	let error_msg = ""

	try {
		let response = await fetch(`${url_api_prefix}/api/v1/internal/inactive-users/`)

		if (response.ok) {
			return await response.json()
		} else {
			try {
				await response.json()
				error_msg = `${response.status} ${response.statusText} in GET`
			} catch (err1) {
				error_msg = `${response.status} ${response.statusText} in GET`
			}
		}
	} catch(err) {
		error_msg = `${err} in GET`
	}

	if (error_msg)
		throw new Error(`Error fetching users data: ${error_msg}`)
}


export async function fetchUsers() {
	let error_msg = ""

	try {
		let response = await fetch(`${url_api_prefix}/api/v1/internal/active-users/`)

		if (response.ok) {
			return await response.json()
		} else {
			try {
				await response.json()
				error_msg = `${response.status} ${response.statusText} in GET`
			} catch (err1) {
				error_msg = `${response.status} ${response.statusText} in GET`
			}
		}
	} catch(err) {
		error_msg = `${err} in GET`
	}

	if (error_msg)
		throw new Error(`Error fetching users data: ${error_msg}`)
}


export async function fetchSpecificUser(username) {
	let error_msg = ""

	try {
		let response = await fetch(`${url_api_prefix}/api/v1/internal/users/${username}`)

		if (response.ok) {
			return await response.json()
		} else {
			try {
				await response.json()
				error_msg = `${response.status} ${response.statusText} in GET`
			} catch (err1) {
				error_msg = `${response.status} ${response.statusText} in GET`
			}
		}
	} catch(err) {
		error_msg = `${err} in GET`
	}

	if (error_msg)
		throw new Error(`Error fetching users data: ${error_msg}`)
}


export async function fetchOpsUsers() {
	let error_msg = ""

	try {
		let response = await fetch(`${url_api_prefix}/api/v1/internal/ops-users/`)

		if (response.ok) {
			return await response.json()
		} else {
			try {
				await response.json()
				error_msg = `${response.status} ${response.statusText} in GET`
			} catch (err1) {
				error_msg = `${response.status} ${response.statusText} in GET`
			}
		}
	} catch(err) {
		error_msg = `${err} in GET`
	}

	if (error_msg)
		throw new Error(`Error fetching users data: ${error_msg}`)
}
