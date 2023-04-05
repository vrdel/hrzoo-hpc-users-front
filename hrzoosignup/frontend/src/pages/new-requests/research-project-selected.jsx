import React from 'react';
import { useParams } from 'react-router-dom';

const ResearchProjectRequestSelected = () => {
  const { projId } = useParams()

  console.log('VRDEL DEBUG', projId)

  return (
    <>
      <div>
        selected
      </div>
    </>
  )
};

export default ResearchProjectRequestSelected;

