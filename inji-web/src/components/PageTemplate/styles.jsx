/*Navbar*/
import styled from "@emotion/styled";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {Grid, Link} from "@mui/material";
import Button from "@mui/material/Button";

export const InjiNavbar = styled(AppBar)`
    box-shadow: 0 1px 5px #0000000D;
  background-color: #325778; 
    position: static;
`;

export const StyledToolbar = styled(Toolbar)`
    // max-width: 1140px;
    margin: auto;
    height: 80px;
`;

export const StyledGridItem = styled(Grid)`
    display: flex;
    align-items: center;
`
export const DownloadButton = styled(Button)`
    color: white;
    background: transparent linear-gradient(180deg, #F59B4B 0%, #E86E04 100%) 0% 0% no-repeat padding-box;
    border-radius: 8px;
    width: 144px;
    height: 44px;
`;

export const StyledLink = styled(Link)`
    
    color: black;
    
    font: normal normal 600 14px/17px Inter;
    text-transform: none;
    text-decoration: none;
`;
export const NavButton = styled(Button)`
    margin-right: 10px;
    padding:10px;
    background: linear-gradient(180deg, #FFB75E 0%, #ED8F03 100%);
    color: white;
    &:hover {
        background: linear-gradient(180deg, #ED8F03 0%, #FFB75E 100%);
    }
        
`;

