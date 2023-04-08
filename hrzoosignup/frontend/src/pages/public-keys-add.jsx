import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import {
  Col,
  Row,
  Table,
  Collapse,
  Button,
  InputGroup,
  InputGroupText,
  Placeholder
} from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSshKeys, deleteSshKey } from '../api/sshkeys';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faArrowDown,
  faKey,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/content.css';
import ModalAreYouSure from '../components/ModalAreYouSure';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const NewPublicKey = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row>
        <Col>
          foobar
        </Col>
      </Row>
    </>
  )
}

export default NewPublicKey;
