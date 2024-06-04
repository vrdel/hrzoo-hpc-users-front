let naturalFields = [
  "Matematika", "Fizika", "Geologija", "Kemija",
  "Biologija", "Geofizika", "Interdisciplinarne prirodne znanosti"
]

let techFields = [
  "Arhitektura i urbanizam", "Brodogradnja",
  "Elektrotehnika", "Geodezija", "Građevinarstvo", "Grafička tehnologija",
  "Kemijsko inženjerstvo", "Metalurgija", "Računarstvo", "Rudarstvo, nafta i geološko inženjerstvo",
  "Strojarstvo", "Tehnologija prometa i transporta", "Tekstilna tehnologija",
  "Zrakoplovstvo, raketna i svemirska tehnika", "Temeljne tehničke znanosti",
  "Interdisciplinarne tehničke znanosti"
]

let bioMedFields = [
  "Temeljne medicinske znanosti", "Kliničke medicinske znanosti",
  "Javno zdravstvo i zdravstvena zaštita",
  "Veterinarska medicina", "Dentalna medicina", "Farmacija"
]

let bioTechFields = [
  "Poljoprivreda (agronomija)", "Šumarstvo", "Drvna tehnologija",
  "Biotehnologija", "Prehrambena tehnologija", "Nutricionizam",
  "Interdisciplinarne biotehničke znanosti"
]

let socialFields = [
  "Ekonomija", "Pravo", "Politologija",
  "Informacijske i komunikacijske znanosti",
  "Sociologija", "Psihologija", "Pedagogija",
  "Edukacijsko-rehabilitacijske znanosti",
  "Logopedija", "Kineziologija", "Demografija",
  "Socijalne djelatnosti", "Sigurnosne i obrambene znanosti",
  "Interdisciplinarne društvene znanosti"
]

let humanitiesFields = [
  "Filozofija", "Teologija", "Filologija", "Povijest", "Povijest umjetnosti",
  "Znanost o umjetnosti", "Arheologija", "Etnologija i antropologija",
  "Religijske znanosti (interdisciplinarno polje)", "Interdisciplinarne humanističke znanosti"
]



export function buildListScientificDomain(intl) {
  let prirodne_znanosti = intl.formatMessage({
    defaultMessage: "PRIRODNE ZNANOSTI",
    description: "science-domain-map-1"
  })
  let tehnicke_znanosti = intl.formatMessage({
    defaultMessage: "TEHNIČKE ZNANOSTI",
    description: "science-domain-map-2"
  })
  let biomedicina_zdravstvo = intl.formatMessage({
    defaultMessage: "BIOMEDICINA I ZDRAVSTVO",
    description: "science-domain-map-3"
  })
  let biotehnicke_znanosti = intl.formatMessage({
    defaultMessage: "BIOTEHNIČKE ZNANOSTI",
    description: "science-domain-map-4"
  })
  let drustvene_znanosti = intl.formatMessage({
    defaultMessage: "DRUŠTVENE ZNANOSTI",
    description: "science-domain-map-5"
  })
  let humanisticke_znanosti = intl.formatMessage({
    defaultMessage: "HUMANISTIČKE ZNANOSTI",
    description: "science-domain-map-6"
  })

  const listScientificDomain = [
    [prirodne_znanosti],
    [tehnicke_znanosti],
    [biomedicina_zdravstvo],
    [biotehnicke_znanosti],
    [drustvene_znanosti],
    [humanisticke_znanosti],
  //  "UMJETNIČKO PODRUČJE", "INTERDISCIPLINARNA PODRUČJA ZNANOSTI",
  //  "INTERDISCIPLINARNA PODRUČJA UMJETNOSTI"
  ]

  return listScientificDomain

}

export function buildMapDomainsToFields(intl, selectedDomain) {
  let prirodne_znanosti = intl.formatMessage({
    defaultMessage: "PRIRODNE ZNANOSTI",
    description: "science-domain-map-1"
  })
  let tehnicke_znanosti = intl.formatMessage({
    defaultMessage: "TEHNIČKE ZNANOSTI",
    description: "science-domain-map-2"
  })
  let biomedicina_zdravstvo = intl.formatMessage({
    defaultMessage: "BIOMEDICINA I ZDRAVSTVO",
    description: "science-domain-map-3"
  })
  let biotehnicke_znanosti = intl.formatMessage({
    defaultMessage: "BIOTEHNIČKE ZNANOSTI",
    description: "science-domain-map-4"
  })
  let drustvene_znanosti = intl.formatMessage({
    defaultMessage: "DRUŠTVENE ZNANOSTI",
    description: "science-domain-map-5"
  })
  let humanisticke_znanosti = intl.formatMessage({
    defaultMessage: "HUMANISTIČKE ZNANOSTI",
    description: "science-domain-map-6"
  })

  const mapDomainsToFields = {
    [prirodne_znanosti]: naturalFields,
    [tehnicke_znanosti]: techFields,
    [biomedicina_zdravstvo]: bioMedFields,
    [biotehnicke_znanosti]: bioTechFields,
    [drustvene_znanosti]: socialFields,
    [humanisticke_znanosti]: humanitiesFields,
  //  "UMJETNIČKO PODRUČJE": [],
  //  "INTERDISCIPLINARNA PODRUČJA ZNANOSTI": [],
  //  "INTERDISCIPLINARNA PODRUČJA UMJETNOSTI": [],
  }

  return mapDomainsToFields[selectedDomain]
}
