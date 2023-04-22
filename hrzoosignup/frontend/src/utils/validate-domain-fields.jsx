import React from 'react';
import { toast } from 'react-toastify'


function validateDomainAndFields(onYesCallArg) {
  let sumDomains = 0
  let nameDomains = new Array()
  let nameFields = new Array()
  let sumAllFields = new Array()

  for (var e of onYesCallArg['science_field']) {
    sumDomains += parseInt(e['percent'])
    nameDomains.push(e['name']['value'])
    let sumFields = 0
    for (var f of e['scientificfields']) {
      sumFields += parseInt(f['percent'])
      nameFields.push(f['name']['value'])
    }
    sumAllFields.push(sumFields)
  }

  let err_msg = new Array()
  if (sumDomains !== 100)
    err_msg.push('Udjeli znanstvenih područja zajedno moraju biti 100%. ')

  let sumFields100 = false
  for (var sum of sumAllFields)
    if (sum !== 100)
      sumFields100 = true
  if (sumFields100)
    err_msg.push('Udjeli znanstvenih polja zajedno u znanstvenom području moraju biti 100%. ')

  let sfs = new Set(nameFields)
  if (sfs.size < nameFields.length)
    err_msg.push('Neka znanstvena polja se pojavljuju više puta. ')

  let sds = new Set(nameDomains)
  if (sds.size < nameDomains.length)
    err_msg.push('Neka znanstvena područja se pojavljuju više puta. ')

  if (err_msg.length > 0) {
    toast.error(
      <span className="font-monospace text-dark">
        Zahtjev nije bilo moguće podnijeti - validacija znanstvenih područja i polja neuspješna<br/><br/>
        { err_msg }
      </span>, {
        autoClose: false,
        toastId: 'researchproj-fail-add',
      }
    )
      return false
  }
  return true
}

export default validateDomainAndFields
