import React from 'react';
import { CustomReactSelect } from '../ui/CustomReactSelect.jsx';


const NewRequest = () => {
  return (
    <div>
      <CustomReactSelect
        label="Testing Select"
        onChange={ e => {}}
        options={[
          {
            label: 'foo',
            value: '1'
          },
          {
            label: 'bar',
            value: '2'
          }
        ]}
        value={'2'}
      />
      Novi zahtjev
    </div>
  )
};

export default NewRequest;
