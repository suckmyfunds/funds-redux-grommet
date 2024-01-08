import styled from "styled-components";

const Flex = styled.div<{$gap?: number}>`
    display: flex;
    gap: ${props => props.$gap || 0}px;
`
export default Flex

export const List = styled(Flex)`
    flex-direction: column;
    `