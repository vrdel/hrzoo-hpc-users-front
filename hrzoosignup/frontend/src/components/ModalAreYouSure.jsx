import React from 'react';
import {
  Button,
  Modal,
}
from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';


export const ModalAreYouSure = ({isOpen, toggle, title, msg, onYes}) => (
  <Modal show={isOpen} onHide={toggle}>
    <Modal.Header closeButton>{title}</Modal.Header>
    <Modal.Body>
      {msg}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={() => {
        onYes();
        toggle();
      }}>
        <FormattedMessage defaultMessage="Da" description="modal-buttonyes" />
      </Button>{' '}
      <Button variant="secondary" onClick={toggle}>
        <FormattedMessage defaultMessage="Ne" description="modal-buttonno" />
      </Button>
    </Modal.Footer>
  </Modal>
)

export default ModalAreYouSure
