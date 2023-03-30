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


export const listScientificDomain = [
  "PRIRODNE ZNANOSTI", "TEHNIČKE ZNANOSTI", "BIOMEDICINA I ZDRAVSTVO",
  "BIOTEHNIČKE ZNANOSTI", "DRUŠTVENE ZNANOSTI", "HUMANISTIČKE ZNANOSTI",
//  "UMJETNIČKO PODRUČJE", "INTERDISCIPLINARNA PODRUČJA ZNANOSTI",
//  "INTERDISCIPLINARNA PODRUČJA UMJETNOSTI"
]

export const mapDomainsToFields = {
  "PRIRODNE ZNANOSTI": naturalFields,
  "TEHNIČKE ZNANOSTI": techFields,
  "BIOMEDICINA I ZDRAVSTVO": bioMedFields,
  "BIOTEHNIČKE ZNANOSTI": bioTechFields,
  "DRUŠTVENE ZNANOSTI": socialFields,
  "HUMANISTIČKE ZNANOSTI": humanitiesFields,
//  "UMJETNIČKO PODRUČJE": [],
//  "INTERDISCIPLINARNA PODRUČJA ZNANOSTI": [],
//  "INTERDISCIPLINARNA PODRUČJA UMJETNOSTI": [],
}
