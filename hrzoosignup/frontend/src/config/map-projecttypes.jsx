import React from 'react';


export function TypeString(type_name) {
  let type2string = {
    'research-croris': <>Istraživački<br/>projekt</>,
    'research-institutional': <>Institucijski<br/>projekt</>,
    'thesis': <>Izrada<br/>rada</>,
    'practical': <>Praktična<br/>nastava</>,
    'internal': <>Interni<br/>projekt</>,
    'srce-workshop': <>Srce<br/>radionica</>,
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
