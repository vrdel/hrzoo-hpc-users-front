import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
}
from 'reactstrap';
import {FormattedMessage} from 'react-intl';


export const ProjectExtend = ({isOpen, toggle, project, onYes}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>{project}</ModalHeader>
    <ModalBody>
      Foobar
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={() => {
        onYes();
        toggle();
      }}>
        <FormattedMessage defaultMessage="Da" description="modal-buttonyes" />
      </Button>{' '}
      <Button color="secondary" onClick={toggle}>
        <FormattedMessage defaultMessage="Ne" description="modal-buttonno" />
      </Button>
    </ModalFooter>
  </Modal>
)

export default ProjectExtend
