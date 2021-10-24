import Link from "next/link";
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

const StyledMenuDiv = styled.div`
    &&& {
        margin-bottom: 0px;
        border-radius: 0px;
    }
`;

const StyledMain = styled.main`
    flex: 1;
`;

const Layout = ({ children }: LayoutProps) =>
(
    <StyledRootDiv>
        <StyledMenuDiv className="ui inverted menu">
            <div className="ui container">
                <Link href="/"><a className="header item">SEA Captain</a></Link>
                {/* <Link href="/"><a className="header item">Home</a></Link> */}
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
        </StyledMenuDiv>
        <StyledMain>
            {children}
        </StyledMain>
        <footer className="ui fixed inverted vertical footer segment">
            <div className="ui center aligned container">
                <div className="ui horizontal inverted small divided link list">
                    <Link href="/"><a className="item">Site Map</a></Link>
                    <Link href="/"><a className="item">Contact Us</a></Link>
                    <Link href="/"><a className="item">Terms and Conditions</a></Link>
                    <Link href="/"><a className="item">Privacy Policy</a></Link>
                </div>
            </div>
        </footer>
    </StyledRootDiv>
);

export default Layout;