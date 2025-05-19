import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
}
from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
} from '@fortawesome/free-solid-svg-icons';
import {FormattedMessage} from 'react-intl';


export const ProjectExtend = ({isOpen, toggle, project, onYes}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered={true} size="lg">
      <ModalHeader toggle={toggle} className="text-bg-warning">
        <FormattedMessage
          defaultMessage="Zahtjev za produljenjem projekta"
          description="projectextend-title"
        />{' '}
        {project}
      </ModalHeader>
      <ModalBody>
      </ModalBody>
      <ModalFooter className="justify-content-center">
        <Button color="success" onClick={() => {
          onYes();
          toggle();
        }}>
          <FontAwesomeIcon icon={faFile}/>{' '}
          <FormattedMessage
            defaultMessage="Podnesi"
            description="projectextend-buttonyes"
          />
        </Button>{' '}
      </ModalFooter>
    </Modal>
  )
}

export default ProjectExtend
