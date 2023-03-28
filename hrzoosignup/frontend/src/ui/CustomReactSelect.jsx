import React from 'react';
import Select, { components } from 'react-select';


const CustomDropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <svg
        height='10'
        width='10'
        viewBox='0 0 4 5'
        aria-hidden="true"
        focusable="false"
        style={{
          display: 'inline-block',
          fill: 'currentColor',
          lineHeight: 1,
          stroke: 'currentColor',
          strokeWidth: 0,
        }}
      >
        <path fill='#343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/>
      </svg>
    </components.DropdownIndicator>
  )
}

const DropdownIndicator = ({ ...props }) => {
  if (props.isDisabled)
    return null

  else return (
    <CustomDropdownIndicator {...props} />
  )
}


export const CustomReactSelect = ({ forwardedRef=undefined, ...props}) => {
  const customStyles = {
    control: (provided,  state) => ({
      ...provided,
      margin: props.inputgroup ? '-1px' : 0,
      backgroundColor: props.isDisabled ? '#e9ecef' : '#fff',
      overflow: 'visible',
      borderRadius: props.inputgroup ? '0 .25rem .25rem 0' : '.25rem',
      fontWeight: 400,
      backgroundClip: 'padding-box',
      textShadow: 'none',
      textAlign: 'start',
      textIndent: 0,
      borderColor: props.error ? '#dc3545' : props.isnew ? '#198754' : props.ismissing ? '#0d6efd' : state.selectProps.menuIsOpen ? '#66afe9' : '#ced4da',
      transition: 'border-color .15s ease-in-out, box-shadow .15s ease-in-out',
      boxShadow: state.selectProps.menuIsOpen ? '0 0 0 .2rem rgba(0, 123, 255, .25)' : 'none',
      ':focus': {
        outline: 0,
      }
    }),
    option: (provided) => ({
      ...provided,
      padding: '.25rem 1.5rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      clear: 'both',
      color: '#16181b',
      backgroundColor: 'transparent',
      ':hover:not(:active)': {
        color: '#fff',
        backgroundColor: '#4a90d9'
      },
      ':active': {
        color: '#fff',
        backgroundColor: '#5a6268'
      },
      ':focus': {
        outline: '5px auto -webkit-focus-ring-color',
      },
    }),
    multiValue: (provided) => props.isDisabled ? { ...provided, backgroundColor: '#c4ccd4' } : provided,
    multiValueRemove: (provided) => props.isDisabled ? { ...provided, display: 'none' } : provided
  }

  if (props.label)
    return (
      <>
        <label id='aria-label' htmlFor='select'>{`${props.label}`}</label>
        <Select
          {...props}
          inputId='select'
          ref={ forwardedRef ? forwardedRef : null }
          components={{IndicatorSeparator: null, DropdownIndicator}}
          styles={customStyles}
        />
      </>
    )


  return (
    <Select
      {...props}
      ref={ forwardedRef ? forwardedRef : null }
      components={{IndicatorSeparator: null, DropdownIndicator}}
      styles={customStyles}
    />
  )
}
