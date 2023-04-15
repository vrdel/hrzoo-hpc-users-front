export function findTrueState(request_state) {
  let target = null

  for (var state in request_state)
    if (request_state[state] === true)
      target = state

  return target
}
