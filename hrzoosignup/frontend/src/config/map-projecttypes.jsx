import React from 'react';
import { useIntl } from 'react-intl'


export function TypeString(type_name) {
  const intl = useIntl();

  let type2string = {
    'research-croris':
    intl.formatMessage({
      defaultMessage: "Istraživački{br}projekt",
      description: "project-type-research",
    },{br: <br/>}),
    'research-institutional':
    intl.formatMessage({
      defaultMessage: "Institucijski{br}projekt",
      description: "project-type-instit"
    }, {br: <br/>}),
    'thesis': intl.formatMessage({
      defaultMessage: "Izrada{br}rada",
      description: "project-type-thesis"
    }, {br: <br/>}),
    'practical': intl.formatMessage({
      defaultMessage: "Praktična{br}nastava",
      description: "project-type-practical"
    }, {br: <br/>}),
    'internal': intl.formatMessage({
      defaultMessage: "Interni{br}projekt",
      description: "project-type-internal"
    }, {br: <br/>}),
    'srce-workshop': intl.formatMessage({
      defaultMessage: "Srce{br}radionica",
      description: "project-type-workshop"
    }, {br: <br/>}),
  }

  return type2string[type_name]
}


export function TypeColor(type_name) {
  let type2string = {
    'research-croris': "bg-success",
    'research-institutional': "bg-danger",
    'srce-workshop': "bg-dark",
    'thesis': "bg-primary",
    'practical': "bg-warning text-dark",
    'internal': "bg-info text-dark",
  }

  return type2string[type_name]
}
