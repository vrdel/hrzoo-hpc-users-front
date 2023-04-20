import React from 'react';

export function TypeString(type_name) {
  let type2string = {
    'research-croris': <>Istraživački<br/>projekt</>,
    'thesis': <>Izrada<br/>rada</>,
    'practical': <>Praktična<br/>nastava</>,
  }

  return type2string[type_name]
}

export function TypeColor(type_name) {
  let type2string = {
    'research-croris': "bg-success",
    'thesis': "bg-primary",
    'practical': "bg-warning text-dark",
  }

  return type2string[type_name]
}
