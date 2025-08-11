import React from "react";
import {
  Button,
  ButtonGroup,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage } from 'react-intl';


const ButtonGroupActiveInactive = ({activeList, urls}) => {
  let navigate = useNavigate()

  return (
    <ButtonGroup size="sm">
      <Button className="mt-1 mb-1 mr-3" color="light"
        active={ activeList }
        onClick={ () => { navigate(urls.active) } }>
        <FontAwesomeIcon icon={ faCheck } />{' '}
        <FormattedMessage
          defaultMessage="Aktivni"
          description="userlist-button-active"
        />
      </Button>
      <Button className="ml-1 mt-1 mb-1" color="light"
        active={ !activeList }
        onClick={ () => { navigate(urls.inactive) } }>
        <FontAwesomeIcon icon={ faXmark } />{' '}
        <FormattedMessage
          defaultMessage="Neaktivni"
          description="userlist-button-inactive"
        />
      </Button>
    </ButtonGroup>
  )
}


export default ButtonGroupActiveInactive
