import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { fetchCroRIS } from '../../api/croris';


const ResearchProjectRequest = () => {
  const {status, data, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  if (status ==='success' && data['status']['code'] === 200)
  return (
    <>
      <div>
        { JSON.stringify(data) }
      </div>
    </>
  )
};

export default ResearchProjectRequest;
