import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavigationBar from "./components/NavigationBar";
import SideBar from "./components/SideBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Row, Col } from "react-bootstrap";
import Playground from './components/Playground';


class MainPage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            uploadedObject: {},
            jsonExportClicked: false,
            selectedTool: null,
            graphScale: 1
        }
    }
    
    componentWillMount() {
        debugger
        //const { data } = 
        this.setState({
             uploadedObject: this.props.location.goalModel
        })
        console.log("dataaa:", this.state.uploadedObject)
    }
    
    handleToolClick = type => {
        this.setState({ selectedTool: type });
    }

    setUploadedObject = uploadedObject => {
        this.setState({ uploadedObject });
    }

    setGraphScale = (newScale) => {
        this.setState({ graphScale: newScale });
    }

    getGraphScale = () => {
        return this.state.graphScale
    }

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
            <div>
                <NavigationBar handleJSONExport={this.handleJSONExport} page="playground"/>
                <Row>
                    <Col md="2" style={{ overflow: 'auto' }}>
                        <SideBar setUploadedObject={this.setUploadedObject}
                                 handleToolClick={this.handleToolClick}
                                 selectedTool={selectedTool}
                                 setGraphScale={this.setGraphScale}
                                 getGraphScale={this.getGraphScale} />
                    </Col>
                    <Col md="10" style={{padding: "0", marginLeft: "-15px"}}>
                        <Playground uploadedObject={uploadedObject} 
                                    setUploadedObject={this.setUploadedObject}
                                    jsonExportClicked={jsonExportClicked} 
                                    exportJSON={this.exportJSON}
                                    selectedTool={selectedTool}
                                    handleToolClick={this.handleToolClick}
                                    handleJSONExport={this.handleJSONExport}
                                    getGraphScale={this.getGraphScale}/>
                    </Col>
                </Row>
                
            </div>
        );
    }
}

export default MainPage;