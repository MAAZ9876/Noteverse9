import React, { useState } from "react";
import {
  NavbarContainer,
  LeftContainer,
  RightContainer,
  NavbarExtendedContainer,
  NavbarInnerContainer,
  NavbarLinkContainer,
  NavbarLink,
  Logo,
  OpenLinksButton,
  NavbarLinkExtended,
} from "./Navbar.style";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Home,
  Chat,
  AccountCircle,
  Close,
} from "@material-ui/icons";

function Navbar() {
  const [extendNavbar, setExtendNavbar] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);

  const closeMenu = () => setExtendNavbar(false);

  return (
    <NavbarContainer extendNavbar={extendNavbar}>
      <NavbarInnerContainer>
        <LeftContainer>
          <Link
            to="/"
            onClick={closeMenu}
            style={{ textDecoration: "none" }}
          >
            <Logo>NoteVerse</Logo>
          </Link>
        </LeftContainer>

        <RightContainer>
          <NavbarLinkContainer>
            <NavbarLink to="/">Home</NavbarLink>

            <NavbarLink to="/searchuser">Chat</NavbarLink>

            {currentUser && (
              <NavbarLink to={`/profile/${currentUser._id}`}>
                Profile
              </NavbarLink>
            )}

            <OpenLinksButton
              type="button"
              aria-label={extendNavbar ? "Close menu" : "Open menu"}
              onClick={() => setExtendNavbar((current) => !current)}
            >
              {extendNavbar ? <Close /> : "☰"}
            </OpenLinksButton>
          </NavbarLinkContainer>
        </RightContainer>
      </NavbarInnerContainer>

      {extendNavbar && (
        <NavbarExtendedContainer>
          <NavbarLinkExtended to="/" onClick={closeMenu}>
            <Home style={{ marginRight: 8, verticalAlign: "middle" }} />
            Home
          </NavbarLinkExtended>

          <NavbarLinkExtended to="/searchuser" onClick={closeMenu}>
            <Chat style={{ marginRight: 8, verticalAlign: "middle" }} />
            Chat with users
          </NavbarLinkExtended>

          {currentUser ? (
            <NavbarLinkExtended
              to={`/profile/${currentUser._id}`}
              onClick={closeMenu}
            >
              <AccountCircle
                style={{ marginRight: 8, verticalAlign: "middle" }}
              />
              My Profile
            </NavbarLinkExtended>
          ) : (
            <>
              <NavbarLinkExtended to="/login" onClick={closeMenu}>
                Sign In
              </NavbarLinkExtended>

              <NavbarLinkExtended to="/register" onClick={closeMenu}>
                Register
              </NavbarLinkExtended>
            </>
          )}
        </NavbarExtendedContainer>
      )}
    </NavbarContainer>
  );
}

export default Navbar;