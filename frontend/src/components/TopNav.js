import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";

import Web3Auth from './Web3Auth';

function TopNav() {

    return (
        <Navbar collapseOnSelect bg="light" expand="md" className="mb-3">
            <Navbar.Brand href="/" className="font-weight-bold text-muted">
                1xion
            </Navbar.Brand>
            <Web3Auth />
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Nav activeKey={window.location.pathname}>
                    <LinkContainer to="/">
                        <Nav.Link>Public</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/private">
                        <Nav.Link>Private</Nav.Link>
                    </LinkContainer>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default TopNav;
