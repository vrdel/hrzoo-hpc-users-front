import React from "react";
import {
  Button,
} from "reactstrap";


export const MiniButton = ({onClick, children}) => (
  <Button
    className="d-flex align-items-center justify-content-center ms-1 ps-1 pe-1 pt-1 pb-1 mt-0"
    onClick={onClick}
    color="light">
    {children}
  </Button>
)
