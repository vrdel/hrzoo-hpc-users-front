let gpuResource = {
  "label": "GPU",
  "value": "GPU"
}
let cpuResource = {
  "label": "CPU",
  "value": "CPU"
}

let bigMemResource = {
  "label": "BIGMEM",
  "value": "BIGMEM"
}

let cloudResource = {
  "label": "CLOUD",
  "value": "CLOUD"
}

let cloudBigMemResource = {
  "label": "CLOUD-BIGMEM",
  "value": "CLOUD-BIGMEM"
}

let cloudGpuResource = {
  "label": "CLOUD-GPU",
  "value": "CLOUD-GPU"
}

let padobranResource = {
  "label": "PADOBRAN",
  "value": "PADOBRAN"
}

let penkalaResource = {
  "label": "PENKALA",
  "value": "PENKALA"
}

let jupyterResource = {
  "label": "JUPYTER",
  "value": "JUPYTER"
}

export const ResourceTypesToSelect = [
  bigMemResource,
  cloudBigMemResource,
  cloudGpuResource,
  cloudResource,
  cpuResource,
  gpuResource,
  jupyterResource,
  padobranResource,
]

export const ResourceTypesToSelectAdmin = [
  bigMemResource,
  cloudBigMemResource,
  cloudGpuResource,
  cloudResource,
  cpuResource,
  gpuResource,
  jupyterResource,
  padobranResource,
  penkalaResource
]
