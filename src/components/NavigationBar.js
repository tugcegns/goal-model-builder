import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav } from "react-bootstrap";

class NavigationBar extends React.Component{
    
    render (){

        const { page } = this.props;

        return(
            <Navbar bg="dark" variant="dark" style={{ minHeight: '80px', height: "10vh" }}>
            
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Navbar.Brand style={{ fontSize: '30px', fontWeight: 'bold' }}>Goal Model Builder</Navbar.Brand>
                    <Nav className="mr-auto">
                        <Nav.Link active={page === "home"} href="/">
                            Home
                        </Nav.Link>
                        <Nav.Link active={page === "playground"} href="/playground">
                            App
                        </Nav.Link>
                    </Nav>
                    </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default NavigationBar;