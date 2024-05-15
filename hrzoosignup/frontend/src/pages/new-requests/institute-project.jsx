import React from 'react'
import { GeneralRequest } from 'Pages/new-requests/general';
import { useIntl } from 'react-intl'
import * as yup from "yup";


function intlSchemaResolve(intl) {
  let schemaInstituteResolve = yup.object().shape({
    requestName: yup.string().required(
      intl.formatMessage({
        defaultMessage: "Obvezno",
        description: 'schema-mandatory'
      })
    ),
    requestExplain: yup.string().required(
      intl.formatMessage({
        defaultMessage: "Obvezno",
        description: 'schema-mandatory'
      })
    ),
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
    startDate: yup.date().required(
      intl.formatMessage({
        defaultMessage: "Obvezno",
        description: 'schema-mandatory'
      })
    ),
    scientificSoftware: yup.array().min(0).of(yup.object()),
    scientificSoftwareExtra: yup.string(),
    scientificSoftwareHelp: yup.boolean(),
    requestResourceType: yup.array().of(yup.object()),
    HPCnSlotsCPU: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(6656, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 6656
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnSlotsGPU: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(80, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 80
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnSlotsRAM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(4000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 4000
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnRAM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(4000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 4000
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnTempGB: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(580000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '580TB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnDiskGB: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(2000000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '2PB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnVM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(100, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 100
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnSlotsCPU: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(1000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 1000
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnRAM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(2000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '2TB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnRAMVM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(2000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '2TB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnFastDiskGB: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(500, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '500GB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnDiskGB: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(10000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '10TB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnIPs: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(10, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 10
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  });

  return schemaInstituteResolve
}


const InstituteRequest = () => {
  const intl = useIntl()

  return (
    <GeneralRequest
      projectType="research-institutional"
      schemaResolve={intlSchemaResolve(intl)}
    />
  )
}


export default InstituteRequest;
