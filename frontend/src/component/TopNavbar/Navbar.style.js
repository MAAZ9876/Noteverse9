
import styled from "styled-components";
import { Link } from "react-router-dom";

export const NavbarContainer = styled.nav`
  width: 100%;
  height: ${(props) => (props.extendNavbar ? "100vh" : "60px")};
  background: #ffffff;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e8edf5;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
  position: relative;
  z-index: 100;
  overflow-x: hidden;
  transition: height 0.25s ease;

  @media (min-width: 700px) {
    height: 60px;
  }
`;

export const LeftContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding-left: 16px;
`;

export const RightContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
`;

export const NavbarInnerContainer = styled.div`
  width: 100%;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const NavbarLinkContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const NavbarLink = styled(Link)`
  color: #475569;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  padding: 9px 14px;
  border-radius: 10px;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    color: #1d4ed8;
    background: #eff6ff;
  }

  @media (max-width: 700px) {
    display: none;
  }
`;

export const NavbarLinkExtended = styled(Link)`
  display: block;
  width: 100%;
  box-sizing: border-box;
  color: #334155;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  margin: 4px 0;
  padding: 13px 16px;
  border-radius: 12px;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    color: #1d4ed8;
    background: #eff6ff;
  }
`;

export const Logo = styled.h2`
  margin: 0;
  max-width: 180px;
  color: #1d4ed8;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.8px;
  white-space: nowrap;
  cursor: pointer;

  &::after {
    content: ".";
    color: #60a5fa;
  }
`;

export const OpenLinksButton = styled.button`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  color: #2563eb;
  font-size: 27px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
  }

  &:focus-visible {
    outline: 3px solid #93c5fd;
    outline-offset: 2px;
  }

  @media (min-width: 700px) {
    display: none;
  }
`;

export const NavbarExtendedContainer = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  align-items: stretch;
  padding: 12px 16px 24px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  overflow-y: auto;

  @media (min-width: 700px) {
    display: none;
  }
`;
