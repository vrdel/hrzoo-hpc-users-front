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


export const ModalAreYouSure = ({isOpen, toggle, title, msg, onYes}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>{title}</ModalHeader>
    <ModalBody>
      {msg}
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

export default ModalAreYouSure
