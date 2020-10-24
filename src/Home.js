import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from "./components/NavigationBar";
import { Row, Col, Container, Button } from "react-bootstrap";

class Capital extends React.Component{
    render(){
        return(
            <span style={{ fontSize: 22, color: '#a93312' }}>
                {this.props.children}
            </span>
        );
    }
}

class Home extends React.Component{
    render(){
        return(
            <div>
                <NavigationBar page="home"/>
                <Container className="mt-5">
                    <Row>
                        <Col md="12">
                            <h2 className="text-center">Welcome to Integrating Goal Models</h2>
                            <hr/>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col md={{ offset: 2, span: 8 }}>
                            <p style={{ fontSize: 16, fontFamily: 'Verdana' }} >
                            This application enables you to modify the
                            goal model that you upload as a JSON file. 
                            </p>
                            <p style={{ marginBottom: '5px', color: '#a93312', fontSize: 22 }}> 
                                <b>You can; </b>
                            </p>
                            <ul>
                                <li>
                                    <Capital>U</Capital>pload a JSON file to create a model automatically,
                                </li>
                                <li>
                                    <Capital>A</Capital>dd a new actor, boundary, goal or relationship between goals,
                                </li>
                                <li>
                                    <Capital>R</Capital>ename the label of an actor or a goal with a double click,
                                </li>
                                <li>
                                    <Capital>D</Capital>elete elements from the model,
                                </li>
                                <li>
                                    <Capital>E</Capital>xport the goal model in JSON format 
                                    after completing your work,
                                </li>
                                <li>
                                    <Capital>I</Capital>mport the JSON data that you exported before and continue modifying,
                                </li>
                                <li>
                                    <Capital>E</Capital>xport the model as PNG or JPEG to use in your paper or customer presentation,                                </li>
                                <li>
                                    <Capital>R</Capital>eposition elements(actors, boundaries, goals
                                    and relationships).
                                </li>
                            </ul>
                            <p className="text-center mt-4" >
                                <Button href="/first" variant="outline-danger">Let's Start</Button>{' '}
                            </p>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Home;