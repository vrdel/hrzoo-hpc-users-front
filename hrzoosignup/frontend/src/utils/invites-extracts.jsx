export function extractUsers(projectUsers, role) {
  let users = projectUsers.filter(user => (
    user['role']['name'] === role
  ))

  return users
}


export function extractEmails(email) {
  const emails = email.split(';')

  if (emails.length > 0)
    return emails.join(', ')
  else
    return email
}


export function emailInInvites(emails, invites) {
  let single_emails = emails.split(';')
  single_emails = single_emails.map(e => e.trim())

  for (var email of single_emails)
    if (invites.indexOf(email) !== -1)
      return true

  return false
}
