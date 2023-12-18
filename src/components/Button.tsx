import styled from 'styled-components';

const Button = styled.button`
  padding: 5px;
  border-radius: 5px;
  border: none;
  background-color:  ${({ theme }) => theme.colors.blue};
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
`

export default Button
