/* eslint-disable */
import React, { Component } from "react";
import h1_new from "./images/h1_new.png";
import h2_new from "./images/h2_new.png";
import h3_new from "./images/h3_new.png";
import h4_new from "./images/h4_new.png";
import { Link } from 'react-router-dom';
import NavigationBar from "./components/NavigationBar";
import { Row, Col, Container, Button } from "react-bootstrap";
import axios, { post } from "axios";

class ReactUSUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      value: "",
      uploadedObject: {},
      isReady: false,
      banner1Css: { color: "#FFF", backgroundColor: "green" },
    };
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fileUpload = this.fileUpload.bind(this);
  }
  onFormSubmit(e) {
    e.preventDefault(); // Stop form submit
    this.fileUpload(this.state.file).then((response) => {
        if (response) {
              this.setState({ uploadedObject: response.data , isReady: true });
        }
      //console.log(response.data);
    });
  }
  onChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
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
                <img src={h1_new} alt="Role-Action" width="240" height="210" />
                <p>
                <input
              type="radio"
              name="heu"
              value="h1"
              checked={this.state.value === "h1"}
              onChange={this.handleChange}
            />
            <label className="label-style"> Grouped Action Verbs</label>
            </p>
              </Col>
              <Col md="6">
                <img src={h2_new} alt="Role-Topic" width="220" height="200" />
                <p>
                <input
              type="radio"
              name="heu"
              value="h2"
              checked={this.state.value === "h2"}
              onChange={this.handleChange}
            />
            <label className="label-style"> Grouped Action Object</label>
            </p>
              </Col>
            </Row> 
            <Row> 
              <Col md="6">
               <img src={h3_new} alt="Role" width="260" height="200" />
               <p>
               <input
              type="radio"
              name="heu"
              value="h3"
              checked={this.state.value === "h3"}
              onChange={this.handleChange}
            />
            <label className="label-style"> Without Role Boundary</label>
            </p>
              </Col>
              <Col md="6">
                <img src={h4_new} alt="Role-Benefit" width="220" height="200" />
                <p>
                <input
              type="radio"
              name="heu"
              value="h4"
              checked={this.state.value === "h4"}
              onChange={this.handleChange}
            />
            <label className="label-style"> Grouped Benefit</label>
            </p>
              </Col>            
          </Row>
          </Container>
          </form>
        <div align="center">
        <Button as="input" type="submit" onClick={this.onFormSubmit} value="Create JSON" />{' '}

      {this.state.isReady && (
      <Link class="link-large"
             to={{ 
 pathname: "/playground", 
 goalModel: this.state.uploadedObject
}}>
 Upload
</Link>)}
        </div>
      </div>
    );
  }
}

export default ReactUSUpload;