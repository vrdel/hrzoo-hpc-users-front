import React from "react";
import {
  Button,
} from "reactstrap";


export const MiniButton = ({onClick, childClassName='', children}) => (
  <Button
    className={`d-flex align-items-center justify-content-center ms-1 ps-1 pe-1 pt-1 pb-1 mt-0 ${childClassName}`}
    onClick={onClick}
    color="light">
    {children}
  </Button>
)
