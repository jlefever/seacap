import React from "react";
import styled from "styled-components";

interface LayoutProps
{
    children: React.ReactNode;
}

const StyledRootDiv = styled.div`
    display: flex;
    min-height: 100vh;
    flex-direction: column;
`;

const StyledMain = styled.main`
    flex: 1;
`;

const Layout = ({ children }: LayoutProps) =>
(
    <StyledRootDiv>
        <div className="ui inverted menu">
            <div className="ui container">
                <a href="#" className="header item">SEA Captain</a>
                <a href="#" className="header item">Home</a>
                {/* <div className="ui simple dropdown item">
                    <MyIcon name="laptop code" />
                    <span>Projects</span>
                    <MyIcon name="dropdown" />
                    <div className="menu">
                        <a className="item" href="#">DeltaSpike</a>
                        <a className="item" href="#">Flume</a>
                    </div>
                </div> */}
            </div>
        </div>
        <StyledMain>
            {children}
        </StyledMain>
        <footer className="ui fixed inverted vertical footer segment">
            <div className="ui center aligned container">
                <div className="ui horizontal inverted small divided link list">
                    <a className="item" href="#">Site Map</a>
                    <a className="item" href="#">Contact Us</a>
                    <a className="item" href="#">Terms and Conditions</a>
                    <a className="item" href="#">Privacy Policy</a>
                </div>
            </div>
        </footer>
    </StyledRootDiv>
);

export default Layout;