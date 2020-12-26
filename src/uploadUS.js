/* eslint-disable */
import React, { Component, useCallback } from "react";
import { useHistory } from 'react-router-dom';
import NavigationBar from "./components/NavigationBar";
import { Row, Col, Container, Button, Modal } from "react-bootstrap";
import axios, { post } from "axios";

class ReactUSUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      value: "",
      uploadedObject: {},
      isReady: false,
      showWarning: false,
      linkRendered: false,
      banner1Css: { color: "#FFF", backgroundColor: "green" },
    };
    this.attemptFormSubmit = this.attemptFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
    this.setValue = this.setValue.bind(this)
  }
  attemptFormSubmit(e) {
    if (this.state.value=="" || this.state.file==null) {
      this.setState({showWarning: true})
      return false
    }

    this.fileUpload(this.state.file).then((response) => {
        if (response) {
          this.setState({ uploadedObject: response.data , isReady: true })
          return true
        }
      //console.log(response.data);
    });
    return false
  }
  onChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  setValue(newValue) {
    this.setState({value: newValue});
  }

  fileUpload(file, e) {
    const url = "http://localhost:5000/upload";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("value", this.state.value);
    const config = {
      headers: {
        "content-type": "application/json",
      },
    };
    return post(url, formData, config);
  }
    
    /*
    
    passData() {
        <button
            class="button-large pure-button"
            type="submit"
            name="submitButton"
            onPress={this.passData}
          >
        <Route path="/playground" component={() => <Search name={this.state.rslt} />} /> 
    }*/
 
  render() {
    const HeuristicChoiceComponents = HeuristicChoiceData.map(item => <HeuristicChoice 
      key = {item.alt}
      {...item}
      selectedValue={this.state.value}
      setValue={this.setValue}
    />)

    return (
      <div>
        <NavigationBar page="home"/>
        <form align="center">
        <Container className="mt-5">
          <Row>
            <Col md="12">
                <h2 className="text-center">Upload your user story set .txt format.</h2>
                <hr/>
                <p>
                Expected format:{" "}
                    <q>
                        As a <strong>role</strong>, I want <strong>action</strong> so that{" "}
                        <strong>benefit</strong>.
                    </q> 
                </p>
            </Col>
          </Row>
        </Container>
        
        <p align="center">
          <label>
            <b>File Upload: </b>
          </label>
          <input type="file" name="file" onChange={this.onChange} />
        </p>

        <p align="center">
          Select a model type to generate your customized goal model.
        </p>

        <p align="center">Select a heuristic type.</p>
        <Container className="mt-5">
          <Row>
            <Col md="6">
              {HeuristicChoiceComponents[0]}
            </Col>
            <Col md="6">
              {HeuristicChoiceComponents[1]}
            </Col>
          </Row> 
          <Row> 
            <Col md="6">
              {HeuristicChoiceComponents[2]}
            </Col>
            <Col md="6">
              {HeuristicChoiceComponents[3]}
            </Col>            
          </Row>
        </Container>
      </form>
      <div align="center">
        <CreateModelButton
          pathname="/playground"
          goalModel={this.state.uploadedObject}
          attemptFormSubmit={this.attemptFormSubmit}
        />{' '}
      </div>
      <Modal
        show={this.state.showWarning}
        onHide={() => {this.setState({showWarning: false})}}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Unselected Options
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.value==""?
          "You must choose a heuristic to proceed":
          "You must upload a file to proceed"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => {
            this.setState({showWarning: false})
          }}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
}

function CreateModelButton(props) {
  const history = useHistory()
  const handleClick = useCallback(() => 
    {
      if (props.attemptFormSubmit()) {
        history.push({pathname: props.pathname, goalModel: props.goalModel})
      }
    }
  )

  return (
    <Button as="input" type="submit" onClick={handleClick} value="Create Model" readOnly={true}/>
  )
}

function HeuristicChoice(props) {
  return (
    <div
      onClick={() => props.setValue(props.value)}
      style={{cursor: 'pointer'}}
    >
      <img src={props.src} alt={props.alt} {...props.imageShape} />
      <p>
        <input
          type="radio"
          name="heu"
          value={props.value}
          checked={props.selectedValue === props.value}
          readOnly={true}
        />
        <label
          className="label-style"
          style={{cursor: 'pointer'}}
        >
            {props.text}
        </label>
      </p>
    </div>
  )
}

import h1_new from "./images/h1_new.png";
import h2_new from "./images/h2_new.png";
import h3_new from "./images/h3_new.png";
import h4_new from "./images/h4_new.png";

const HeuristicChoiceData = [
  {
    alt: "Role-Action",
    value: "h1",
    text: "Grouped Action Verbs",
    src: h1_new,
    imageShape: {width: 240, height:210}
  },
  {
    alt: "Role-Topic",
    value: "h2",
    text: "Grouped Action Object",
    src: h2_new,
    imageShape: {width: 220, height:200}    
  },
  {
    alt: "Role",
    value:"h3",
    text: "Without Role Boundary",
    src: h3_new,
    imageShape: {width: 260, height:200}
  },
  {
    alt: "Role-Benefit",
    value: "h4",
    text: "Grouped Benefit",
    src: h4_new,
    imageShape: {width: 220, height:200}
  }
]

export default ReactUSUpload;