import styled from "styled-components";

export default styled.div<{ $cols: number; $rows: number; }> `
display: grid;
grid-template-columns: ${({ $cols }) => `repeat(${$cols}, 1fr)`};
grid-template-rows: ${({ $rows }) => `repeat(${$rows}, 1fr)`};
gap: 5px;
`;
