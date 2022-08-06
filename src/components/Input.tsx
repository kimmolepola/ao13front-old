import { ChangeEventHandler } from 'react';
import styled from 'styled-components';
import theme from '../theme.js';

const StyledInput = styled.input<{ error: string | undefined }>`
  ${theme.basicInput}
  height: 30px;
  margin: ${theme.margins.basic};
  ${(props) => props.error && 'border-color: red;'}
  padding-left: 6px;
  box-shadow: ${theme.shadow};
  border: ${theme.borders.basic};
  border-radius: ${theme.borderRadius};
  :focus {
    border-color: ${theme.colors.bgStrong};
    outline: none;
  }
  :hover:not(:focus) {
    border-color: ${theme.colors.bgMedium};
  }
  ::placeholder {
    /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: lightgrey;
    opacity: 1; /* Firefox */
  }
  ::-ms-input-placeholder {
    /* Microsoft Edge */
    color: lightgrey;
  }
`;

const Input = ({
  autoCapitalize,
  error,
  onChange,
  value,
  placeholder,
  type,
}: {
  autoCapitalize?: string,
  error?: string,
  onChange: ChangeEventHandler<HTMLInputElement>,
  value: string | undefined,
  placeholder?: string,
  type?: string
}) => (
  <StyledInput
    autoCapitalize={autoCapitalize}
    error={error}
    onChange={onChange}
    value={value}
    placeholder={placeholder}
    type={type}
  />
);

export default Input;
