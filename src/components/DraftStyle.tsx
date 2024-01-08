import styled from "styled-components";
import { colors } from '../theme';

export default styled.div<{ $draft: boolean }> `
background-color: ${props => props.$draft ? colors.gray : colors.white};
`;
