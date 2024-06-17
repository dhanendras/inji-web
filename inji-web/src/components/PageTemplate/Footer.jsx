import React from 'react';
import styled from "@emotion/styled";
import {Typography} from "@mui/material";



const FooterLayout = styled.div`
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    justify-content: center;
    height: 40px;
   background-color: #325778; 
    box-shadow: 0 -1px 5px #0000000D;
    display: flex;
  
`;

const CopyrightsContent = styled.div`
    font-size: 15px;
    line-height: 16px;
    font-family: Inter;
    align-self: center;
   color: white;
`

function Footer(props) {
    return (
        <FooterLayout>
            <CopyrightsContent>
                © 2024 Inji. All rights reserved.
            </CopyrightsContent>
        </FooterLayout>
    );
}

export default Footer;