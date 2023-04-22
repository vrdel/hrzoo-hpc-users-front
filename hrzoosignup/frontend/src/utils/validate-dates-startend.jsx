import React from 'react';
import { toast } from 'react-toastify'
import { compareAsc } from 'date-fns';


function validateRequestDates(start, end) {
  const result = compareAsc(start, end);

  if (result > 0) {
    toast.error(
      <span className="font-monospace text-dark">
        Zahtjev nije bilo moguće podnijeti - validacija datuma neuspješna<br/><br/>
      </span>, {
        autoClose: false,
        toastId: 'researchproj-fail-add-2',
      }
    )
      return false
  }
  return true
}

export default validateRequestDates
