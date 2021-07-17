/* eslint-disable */
import React, { Component, useCallback } from "react";
import { useHistory } from 'react-router-dom';
import { withRouter } from 'react-router-dom'; 
import NavigationBar from "./components/NavigationBar";
import { Row, Col, Container, Button, Modal, Form } from "react-bootstrap";
import axios, { post } from "axios";
import { HeuristicsData } from "./heuristics";

/**
 * User story upload page
 */
class ReactUSUpload extends React.Component {
  constructor(props) {
    super(props);
    /**
     * @property {file} file file uploaded by the user
     * @property {string} fileInputLabel placeholder string for the file upload button
     * @property {string} value heuristic value ('h1', 'h2'...)
     * @property {*} uploadedObject data representing the model to be drawn
     * @property {boolean} showWarning whether the warning modal is shown
     * @property {string} warningText text shown when the warning modal is visible 
     */
    this.state = {
      file: null,
      fileInputLabel: 'Select Your Goal Model Data',
      value: "",
      uploadedObject: {},
      showWarning: false,
      warningText: "Placeholder Text",
      banner1Css: { color: "#FFF", backgroundColor: "green" },
    };
    this.attemptFormSubmit = this.attemptFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
    this.setValue = this.setValue.bind(this)
    this.getHeuristicChoiceElement = this.getHeuristicChoiceElement.bind(this)
  }

  /**
   * Call when the "Create Model" submit button is pressed.
   * Sends the uploaded file and the heuristic selection to the backend.
   * If a response is received, opens the /playground page with the model generated in the backend. 
   * Shows a warning if a heuristic is not selected or a file is not uploaded.
   * @param {Event} e 
   * @returns True if the backend sends a response back
   */
  attemptFormSubmit(e) {
    if (this.state.value=="") {
      this.setState({showWarning: true, warningText:"You must select a heuristic to proceed"})
      return false
    } else if (this.state.file==null) {
      this.setState({showWarning: true, warningText:"You must choose a file to proceed"})
      return false
    }

    this.fileUpload(this.state.file).then((response) => {
        if (response) {
          this.props.history.push({pathname: "/playground", goalModel: response.data, selectedHeuristic: this.state.value, file: this.state.file})
          return true
        }
    });
    
    //this.setState({showWarning: true, warningText:"Model creation failed."})
    //return false
  }

  /**
   * Call when a new file is selected with the file selection form.
   * Sets the state to show the name of the selected file on the file selection form.
   * @param {Event} e File selection event 
   */
  onChange(e) {
    this.setState({
      file: e.target.files[0],
      fileInputLabel: e.target.files[0].name,
    });
  }

  /**
   * Call when a heuristic is selected
   * @param {string} newValue Heuristic value ('h1', 'h2'...)
   */
  setValue(newValue) {
    this.setState({value: newValue});    
  }

  /**
   * Call to send the file and the heuristic choice to the backend
   * @param {*} file 
   * @param {*} e 
   * @returns response from the backend which is a JSON string representing the elements to be drawn
   */
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

  /**
   * Get the heuristic choice element.
   * @param {Object} itemData Heuristic choice data item 
   * @returns Heuristic choice element
   */
  getHeuristicChoiceElement(itemData) {
    return (<div
      onClick = {() => this.setValue(itemData.value)}
      style   = {{cursor:'pointer'}}>
        <img src={itemData.src} alt={itemData.alt} {...itemData.imageShape} />
        <p>
          <input
            type = 'radio'
            name = 'heu'
            value = {itemData.value}
            checked = {itemData.value === this.state.value}
            readOnly = {true}
            style = {{marginRight: "5px"}}
          />
          <label
            className='label-style'
            style={{cursor: 'pointer'}}
          >
            {itemData.text}
          </label>
        </p>
    
    </div>) 
}
 
  render() {
    var counter = 0
    const numberOfHeuristics = HeuristicsData.length
    const getCol = (md, component) => <Col md={md}>{component}</Col>
    const HeuristicElements = HeuristicsData.map(item => this.getHeuristicChoiceElement(item))
    var HeuristicRows = []
    while (counter < numberOfHeuristics) {
      if (counter + 2 <= numberOfHeuristics) {
        HeuristicRows.push(
          <Row>
            {getCol(6, HeuristicElements[counter])}
            {getCol(6, HeuristicElements[counter+1])}
          </Row>)
        counter += 2
      }
      else {
        HeuristicRows.push(
          <Row>
            {getCol(12, HeuristicElements[counter])}
          </Row>
        )
        counter += 1
      }
    }

    const { fileInputLabel } = this.state;
    return (
      <div>
        <NavigationBar page="home"/>
        <form align="center">
        <Container className="mt-5">
          <Row>
            <Col md="12">
                <h2 className="text-center">Upload your user story set in .txt format</h2>
                <hr/>
                <p>There must be a single sentence in each line.</p>
                <p>
                Expected sentence format:{" "}
                    <q>
                        As a <strong>role</strong>, I want <strong>action</strong> so that{" "}
                        <strong>benefit</strong>.
                    </q> 
                </p>
            </Col>
          </Row>
          <p align="center">
          <Form style={{width:"50%", margin:'auto'}}>
            <Form.File id="formcheck-api-custom" custom>
              <Form.File.Input accept=".txt" ref={this.fileInput} 
                  onChange={this.onChange} />
              <Form.File.Label data-browse=". . .">
                { fileInputLabel } 
              </Form.File.Label>
              <Form.Control.Feedback type="valid">If you submit it, your model will be updated!</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid"> {this.props.parseErrorMessage} </Form.Control.Feedback>
            </Form.File>
          </Form> 
          </p>
        </Container>

        <p align="center">
          Select a model type to generate your customized goal model.
        </p>

        <p align="center">Select a heuristic type.</p>
        <Container className="mt-5">
          {HeuristicRows}
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
            Unable to Create Model
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.warningText}
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
  const handleClick = useCallback(() => 
    {
      props.attemptFormSubmit()
      
    }
  )

  return (
    <Button as="input" type="submit" onClick={handleClick} value="Create Model" readOnly={true}/>
  )
}

export default withRouter(ReactUSUpload);