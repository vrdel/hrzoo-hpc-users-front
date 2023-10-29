import React from 'react';
import { toast } from 'react-toastify'


export function copyToClipboard(e, key, msgOk, msgFail, idPrefix) {
  if (window.isSecureContext) {
    navigator.clipboard.writeText(key);
    e.target.focus();
    toast.success(
      <span className="font-monospace text-dark">
        { msgOk }
      </span>
      , {
      toastId: `${idPrefix}-copy-clipboard`,
      autoClose: 2500,
      delay: 500
    })
  }
  else {
    toast.error(
      <span className="font-monospace text-dark">
        { msgFail }
      </span>
      , {
      toastId: `${idPrefix}-copy-clipboard`,
      autoClose: 2500,
      delay: 500
    })
  }
}
