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


