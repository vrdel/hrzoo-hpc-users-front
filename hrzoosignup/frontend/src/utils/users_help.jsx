export function extractLeaderName(projectUsers, retString=undefined) {
  let target = projectUsers.filter(user => (
    user['role']['name'] === 'lead'
  ))
  target = target[0]

  if (retString)
    return target.user.first_name + ' ' + target.user.last_name
  else
    return target
}


const sortByFirstName = (a, b) => {
  let x = a.user.first_name.toLowerCase()
  let y = b.user.first_name.toLowerCase()

  if (x > y) return 1;
  if (x < y) return -1;
  return 0;
}


export const extractCollaborators = (projectUsers, retString=undefined) => {
  let target = projectUsers.filter(user => user["role"]["name"] === "collaborator")

  if (target.length > 0)
    target = target.sort(sortByFirstName)

  if (retString)
    return target.map((tar) => `${tar.user.first_name} ${tar.user.last_name}`)

  else
    return target
}
