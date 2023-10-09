import React, { useContext, useState } from 'react'
import { GeneralRequest } from './general';
import * as yup from "yup";


const schemaInstituteResolve = yup.object().shape({
  requestName: yup.string().required("Obvezno"),
  requestExplain: yup.string().required("Obvezno"),
  scientificDomain: yup.array().of(yup.object().shape(
    {
      name: yup.object().shape({
            'label': yup.string().required(),
            'value': yup.string().required()
          }),
      percent: yup.number().positive().lessThan(101).required("0-100"),
      scientificfields: yup.array().of(yup.object().shape(
        {
          name: yup.object().shape({
            'label': yup.string().required(),
            'value': yup.string().required()
          }),
          percent: yup.number().positive().lessThan(101).required("0-100")
        }
      ))
    }
  )).required(),
  startDate: yup.date().required("Obvezno"),
  scientificSoftware: yup.array().min(0).of(yup.object()),
  scientificSoftwareExtra: yup.string(),
  scientificSoftwareHelp: yup.boolean(),
  requestResourceType: yup.array().of(yup.object()),
  HPCnSlotsCPU: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(6656, "Broj ne može biti veći od 6656")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnSlotsGPU: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(80, "Broj ne može biti veći od 80")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnSlotsRAM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(80, "Broj ne može biti veći od 4000")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnRAM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(4000, "Broj ne može biti veći od 4000")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnTempGB: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(580000, "Broj ne može biti veći od 580TB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnDiskGB: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(2000000, "Broj ne može biti veći od 2PB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnVM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(100, "Broj ne može biti veći od 100")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnSlotsCPU: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(1000, "Broj ne može biti veći od 1000")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnRAM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(2000, "Broj ne može biti veći od 2TB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnRAMVM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(2000, "Broj ne može biti veći od 2TB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnFastDiskGB: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(500, "Broj ne može biti veći od 500GB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnDiskGB: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(10000, "Broj ne može biti veći od 10TB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnIPs: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(10, "Broj ne može biti veći od 10")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
});


const InstituteRequest = () =>
  <GeneralRequest projectType="research-institutional" schemaResolve={schemaInstituteResolve}/>;


export default InstituteRequest;
