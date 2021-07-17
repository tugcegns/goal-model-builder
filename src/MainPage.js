import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from "./components/NavigationBar";
import SideBar from "./components/SideBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col } from "react-bootstrap";
import Playground from './components/Playground';
import axios, { post } from "axios";

/**
 * Playground page
 */
class MainPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            uploadedObject: {},
            jsonExportClicked: false,
            selectedTool: null,
            file: null,
            selectedHeuristic: "No",
            graphScale: 1
        }
    }

    /**
   * Sends the file and the heuristic choice to the backend
   * @param {string} heuristic ID of the new heuristic
   * @returns response from the backend
     */
    fileUpload = (heuristic, e) => {
        const url = "http://localhost:5000/upload";
        const formData = new FormData();
        formData.append("file", this.state.file);
        formData.append("value", heuristic);
        const config = {
          headers: {
            "content-type": "application/json",
          },
        };
        return post(url, formData, config);
    }

    /**
     * Sends the file and the selected heuristic to backend. If there is a response;
     * sets the data contained in the response as the new model, which will be drawn immedietly
     * @param {string} heuristic ID of the new heuristic
     */
    handleHeuristicClick = (heuristic) => 
    {
        this.fileUpload(heuristic).then((response) => {
            if (response) {
                this.setState({
                    uploadedObject: response.data,
                    selectedHeuristic: heuristic
                })
            }
        });
    }

    componentWillMount() {
        debugger
        //const { data } = 
        this.setState({
             uploadedObject: this.props.location.goalModel,
             selectedHeuristic: this.props.location.selectedHeuristic || "Hello",
             file: this.props.location.file
        })
        console.log("dataaa:", this.state.uploadedObject)
    }
    
    /**
     * Updates the selected tool
     * @param {string} type Type of the selected tool
     */
    handleToolClick = type => {
        this.setState({ selectedTool: type });
    }

    /**
     * Sets the new data as the model
     * @param {*} uploadedObject data of the new model to draw
     */
    setUploadedObject = uploadedObject => {
        this.setState({ uploadedObject });
    }

    /**
     * Sets the scale of the graph. Used to implement zoom in/out
     * @param {float} newScale New graph scale 
     */
    setGraphScale = (newScale) => {
        this.setState({ graphScale: newScale });
    }

    /**
     * Get the current graph scale. Used to implement zoom in/out 
     * @returns Current graph scale
     */
    getGraphScale = () => {
        return this.state.graphScale
    }

    /**
     * Download the JSON data representing the current model
     * @param {*} flag 
     */
    handleJSONExport = flag => {
        this.setState({ jsonExportClicked: flag })
    }

    download = (filename, text) => {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    }

    
    exportJSON = graphObject => {
        this.download("goal-model.json", JSON.stringify(graphObject));
    }

    render (){
        debugger
        const { uploadedObject, jsonExportClicked, selectedTool } = this.state;
        return(
            <div style={{overflow: "hidden", width:"100%", height:"100%"}}>
                <NavigationBar page="playground"/>
                <Row style={{overflow: "hidden", width:"100%", height:"90vh", margin: "0"}}>
                    <Col md="2" style={{overflow: "hidden", height: "100%", paddingLeft: "0"}}>
                        <SideBar setUploadedObject={this.setUploadedObject}
                                 handleToolClick={this.handleToolClick}
                                 selectedTool={selectedTool}
                                 setGraphScale={this.setGraphScale}
                                 getGraphScale={this.getGraphScale}
                                 
                                 selectedHeuristic={this.state.selectedHeuristic}
                                 handleHeuristicClick={this.handleHeuristicClick}
                                 handleJSONExport={this.handleJSONExport}
                                 />
                    </Col>
                    <Col md="10" style={{padding: "0", height: "100%", overflow: "scroll"}}>
                        <Playground uploadedObject={uploadedObject} 
                                    setUploadedObject={this.setUploadedObject}
                                    jsonExportClicked={jsonExportClicked} 
                                    exportJSON={this.exportJSON}
                                    selectedTool={selectedTool}
                                    handleToolClick={this.handleToolClick}
                                    handleJSONExport={this.handleJSONExport}
                                    getGraphScale={this.getGraphScale}
                                    selectedHeuristic={this.state.selectedHeuristic}/>
                    </Col>
                </Row>
                
            </div>
        );
    }
}

export default MainPage;