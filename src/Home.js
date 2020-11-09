import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from "./components/NavigationBar";
import { Row, Col, Container, Button } from "react-bootstrap";
import h1_new from "./images/h1_new.png";
import h2_new from "./images/h2_new.png";
import h3_new from "./images/h3_new.png";
import h4_new from "./images/h4_new.png";

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
                        <Col md="4">
                            <img src="/img/US.png" width="240" height="210" />
                            <p className="mt-4" >
                                <Button href="/first" variant="outline-danger">Start with Loading User Stories</Button>{' '}
                            </p>
                        </Col>
                        <Col md="4">
                            <img src="/img/tool.png" width="240" height="210" />
                            <p className="mt-4" >
                                <Button href="/playground" variant="outline-danger">Start with a Blank Page</Button>{' '}
                            </p>
                        </Col>
                        <Col md="4">
                        <p style={{ marginBottom: '5px', color: '#a93312', fontSize: 22 }}> 
                                <b>You can; </b>
                            </p>
                            <ul>
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
                                    <Capital>E</Capital>xport the model as PNG or JPEG to use in your paper or customer presentation,                                </li>
                                <li>
                                    <Capital>R</Capital>eposition elements(actors, boundaries, goals
                                    and relationships).
                                </li>
                            </ul>
                        </Col>
                    </Row>  
                    <Row>
                        <Col md="4">
                            <p style={{ fontSize: 16, fontFamily: 'Verdana' }}>
                            Upload a <em>User Story</em> file to create a goal model 
                            automatically with this goal model builder tool using different heuristics.
                            </p>                          
                        </Col>
                        <Col md="4">
                            <p>
                                Or start with a blank page to create your own goal models.
                            </p>                       
                        </Col>
                    </Row>
                    <Row>
                        <Col md="4">
                            <h2>Heuristic 1: Grouping Action Verbs</h2>
                            It searches for the common action verb in different user stories for the same role.
                            Below example shows that they have common action which is <em>view</em> for <em>user</em>.
                            The generated parent node is <em>view operations conducted</em>.
                            Child nodes consist of action object and passive voice of action verb.
                            
                        </Col>
                        <Col md="4">
                            <h2>Heuristic 2: Grouping Action Objects</h2>
                            It searches for the common action object in different user stories for the same role.
                            Tiny goal model below shows that they have <em>recycling center</em> as a common object.
                            Intermediate parent node includes <em>recycling center operations done</em>.
                            Child nodes consists of action object and passive voice of action verb.               
                        </Col>
                        <Col md="4">
                            <h2>Heuristic 3: Getting Rid of Roles</h2>
                            It builds a goal model without having any actor and actor boundaries.
                            It checks action object to group the given user stories.
                            Below example shows that <em>data of the company</em> is common action object.
                            Goal model has passive voice of action verb and role for child nodes.              
                        </Col>
                    </Row>
                    <Row>
                        <Col md="4">
                            <img src={h1_new} width="240" height="210" />
                        </Col>
                        <Col md="4">
                            <img src={h2_new} width="240" height="210" />
                        </Col>
                        <Col md="4">
                            <img src={h3_new} width="240" height="210" />
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default Home;