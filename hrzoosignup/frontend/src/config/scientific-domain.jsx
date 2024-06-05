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
    prirodne_znanosti,
    tehnicke_znanosti,
    biomedicina_zdravstvo,
    biotehnicke_znanosti,
    drustvene_znanosti,
    humanisticke_znanosti,
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

  let naturalFields = [
    intl.formatMessage({
      defaultMessage: "Matematika",
      description: "science-field-1"
    }),
    intl.formatMessage({
      defaultMessage: "Fizika",
      description: "science-field-2"
    }),
    intl.formatMessage({
      defaultMessage: "Geologija",
      description: "science-field-3"
    }),
    intl.formatMessage({
      defaultMessage: "Kemija",
      description: "science-field-4"
    }),
    intl.formatMessage({
      defaultMessage: "Biologija",
      description: "science-field-5"
    }),
    intl.formatMessage({
      defaultMessage: "Geofizika",
      description: "science-field-6"
    }),
    intl.formatMessage({
      defaultMessage: "Interdisciplinarne prirodne znanosti",
      description: "science-field-7"
    })
  ]

  let techFields = [
    intl.formatMessage({
      defaultMessage: "Arhitektura i urbanizam",
      description: "science-field-8"
    }),
    intl.formatMessage({
      defaultMessage: "Brodogradnja",
      description: "science-field-9"
    }),
    intl.formatMessage({
      defaultMessage: "Elektrotehnika",
      description: "science-field-10"
    }),
    intl.formatMessage({
      defaultMessage: "Geodezija",
      description: "science-field-11"
    }),
    intl.formatMessage({
      defaultMessage: "Građevinarstvo",
      description: "science-field-12"
    }),
    intl.formatMessage({
      defaultMessage: "Grafička tehnologija",
      description: "science-field-13"
    }),
    intl.formatMessage({
      defaultMessage: "Kemijsko inženjerstvo",
      description: "science-field-14"
    }),
    intl.formatMessage({
      defaultMessage: "Metalurgija",
      description: "science-field-15"
    }),
    intl.formatMessage({
      defaultMessage: "Računarstvo",
      description: "science-field-16"
    }),
    intl.formatMessage({
      defaultMessage: "Rudarstvo, nafta i geološko inženjerstvo",
      description: "science-field-17"
    }),
    intl.formatMessage({
      defaultMessage: "Strojarstvo",
      description: "science-field-18"
    }),
    intl.formatMessage({
      defaultMessage: "Tehnologija prometa i transporta",
      description: "science-field-19"
    }),
    intl.formatMessage({
      defaultMessage: "Tekstilna tehnologija",
      description: "science-field-20"
    }),
    intl.formatMessage({
      defaultMessage: "Zrakoplovstvo, raketna i svemirska tehnika",
      description: "science-field-21"
    }),
    intl.formatMessage({
      defaultMessage: "Temeljne tehničke znanosti",
      description: "science-field-22"
    }),
    intl.formatMessage({
      defaultMessage: "Interdisciplinarne tehničke znanosti",
      description: "science-field-23"
    })
  ]

  let bioMedFields = [
    intl.formatMessage({
      defaultMessage: "Temeljne medicinske znanosti",
      description: "science-field-24"
    }),
    intl.formatMessage({
      defaultMessage: "Kliničke medicinske znanosti",
      description: "science-field-25"
    }),
    intl.formatMessage({
      defaultMessage: "Javno zdravstvo i zdravstvena zaštita",
      description: "science-field-26"
    }),
    intl.formatMessage({
      defaultMessage: "Veterinarska medicina",
      description: "science-field-27"
    }),
    intl.formatMessage({
      defaultMessage: "Dentalna medicina",
      description: "science-field-28"
    }),
    intl.formatMessage({
      defaultMessage: "Farmacija",
      description: "science-field-29"
    })
  ]

  let bioTechFields = [
    intl.formatMessage({
      defaultMessage: "Poljoprivreda (agronomija)",
      description: "science-field-30"
    }),
    intl.formatMessage({
      defaultMessage: "Šumarstvo",
      description: "science-field-31"
    }),
    intl.formatMessage({
      defaultMessage: "Drvna tehnologija",
      description: "science-field-32"
    }),
    intl.formatMessage({
      defaultMessage: "Biotehnologija",
      description: "science-field-33"
    }),
    intl.formatMessage({
      defaultMessage: "Prehrambena tehnologija",
      description: "science-field-34"
    }),
    intl.formatMessage({
      defaultMessage: "Nutricionizam",
      description: "science-field-35"
    }),
    intl.formatMessage({
      defaultMessage: "Interdisciplinarne biotehničke znanosti",
      description: "science-field-36"
    })
  ]

  let socialFields = [
    intl.formatMessage({
      defaultMessage: "Ekonomija",
      description: "science-field-37"
    }),
    intl.formatMessage({
      defaultMessage: "Pravo",
      description: "science-field-38"
    }),
    intl.formatMessage({
      defaultMessage: "Politologija",
      description: "science-field-39"
    }),
    intl.formatMessage({
      defaultMessage: "Informacijske i komunikacijske znanosti",
      description: "science-field-40"
    }),
    intl.formatMessage({
      defaultMessage: "Sociologija",
      description: "science-field-41"
    }),
    intl.formatMessage({
      defaultMessage: "Psihologija",
      description: "science-field-42"
    }),
    intl.formatMessage({
      defaultMessage: "Pedagogija",
      description: "science-field-43"
    }),
    intl.formatMessage({
      defaultMessage: "Edukacijsko-rehabilitacijske znanosti",
      description: "science-field-44"
    }),
    intl.formatMessage({
      defaultMessage: "Logopedija",
      description: "science-field-45"
    }),
    intl.formatMessage({
      defaultMessage: "Kineziologija",
      description: "science-field-46"
    }),
    intl.formatMessage({
      defaultMessage: "Demografija",
      description: "science-field-47"
    }),
    intl.formatMessage({
      defaultMessage: "Socijalne djelatnosti",
      description: "science-field-48"
    }),
    intl.formatMessage({
      defaultMessage: "Sigurnosne i obrambene znanosti",
      description: "science-field-49"
    }),
    intl.formatMessage({
      defaultMessage: "Interdisciplinarne društvene znanosti",
      description: "science-field-50"
    })
  ]

  let humanitiesFields = [
    intl.formatMessage({
      defaultMessage: "Filozofija",
      description: "science-field-51"
    }),
    intl.formatMessage({
      defaultMessage: "Teologija",
      description: "science-field-52"
    }),
    intl.formatMessage({
      defaultMessage: "Filologija",
      description: "science-field-53"
    }),
    intl.formatMessage({
      defaultMessage: "Povijest",
      description: "science-field-54"
    }),
    intl.formatMessage({
      defaultMessage: "Povijest umjetnosti",
      description: "science-field-55"
    }),
    intl.formatMessage({
      defaultMessage: "Znanost o umjetnosti",
      description: "science-field-56"
    }),
    intl.formatMessage({
      defaultMessage: "Arheologija",
      description: "science-field-57"
    }),
    intl.formatMessage({
      defaultMessage: "Etnologija i antropologija",
      description: "science-field-58"
    }),
    intl.formatMessage({
      defaultMessage: "Religijske znanosti (interdisciplinarno polje)",
      description: "science-field-59"
    }),
    intl.formatMessage({
      defaultMessage: "Interdisciplinarne humanističke znanosti",
      description: "science-field-60"
    })
  ]

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
