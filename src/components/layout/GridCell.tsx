import styled from "styled-components";

export default styled.div<{ $row: number; $col: number | string; }> `
    grid-row: ${props => props.$row};
    grid-column: ${props => props.$col};
`;
