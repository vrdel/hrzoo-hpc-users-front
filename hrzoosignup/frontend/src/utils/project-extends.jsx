export function isExtended(projId, projectsExtends) {
  if (projectsExtends.length === 0)
    return false
  let isLastApproved = projectsExtends.filter(entry => entry.project === projId)
  if (isLastApproved.length === 0)
    return false
  isLastApproved = isLastApproved[isLastApproved.length - 1].approved
  let extendedProjIds = new Set(projectsExtends.map((entry) => {
    if (entry.approved)
      return entry.project
  }))
  if (extendedProjIds.has(projId))
    return true && isLastApproved
  else
    return false
}

export function lastExtension(projId, projectsExtends) {
  let extendedProjects = projectsExtends.filter((entry) => entry.project === projId && entry.approved)
  if (extendedProjects.length > 0)
    return extendedProjects[extendedProjects.length - 1].date_end
  else
    return false
}
