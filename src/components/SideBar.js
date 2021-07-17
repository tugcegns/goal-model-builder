import React from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Tabs, Tab } from "react-bootstrap";

import  htmlToImage from 'html-to-image';
import  download  from 'downloadjs';
import ImportDataModal from "./ImportDataModal";
import SwitchHeuristicButton from "./SwitchHeuristicButton";
import Chronometer from "./Chronometer"

const boxStyle = {borderTop: '2px solid #a1a1a1', textAlign: 'center', padding: '8%'}

/**
 * Sidebar component of the Playground page
 */
class SideBar extends React.Component{

    /**
     * Downloads the current model in jpeg format
     */
    handleJPEGExport = () => {
        htmlToImage.toJpeg(document.getElementById('playground'), 
        {   
            quality: 0.95, 
            backgroundColor: 'white', 
            style: { padding: '30px' }
        })
        .then(function (dataUrl) {
            var link = document.createElement('a');
            link.download = 'goal-model.jpeg';
            link.href = dataUrl;
            link.click();
        });
    }
    
    /**
     * Downloads the current model in png format
     */
    handlePNGExport = () => {
        htmlToImage.toPng(document.getElementById('playground'))
        .then(function (dataUrl) {
              download(dataUrl, 'goal-model.png');
        });
    }

    render(){ 
        const { selectedTool } = this.props;
        const selectedBorder = {border: '3px dashed #555555', padding: '5px', cursor: 'pointer'}
        
        const SideBarBoxDivs = SideBarItemData.map(boxData => {
            const boxItems = boxData.map(item => <img
                    {...item}
                    style={ selectedTool === item.alt ? {...selectedBorder, ...item.style} : { cursor: 'pointer', ...item.style}}
                    onClick={(e) => this.props.handleToolClick(item.alt)}
                    />)
            return (
                <div style={boxStyle}>
                    <p className="text-center" style={{ fontSize: '22px', margin:'0px' }}>
                        {boxItems}
                    </p>
                </div>
            )
        })

        const { getGraphScale, setGraphScale, selectedHeuristic } = this.props
        return(
            <div style={{
                width: '100%',
                backgroundColor: '#e1e1e1',
                paddingTop: '20px',
                height: '100%',
                boxShadow: '4px 2px 5px 0px #a1a1a1',
                position:'relative',
                overflowY: 'auto',
            }}>
                <Tabs defaultActiveKey="toolbox" id="uncontrolled-tab-exam">
                    <Tab eventKey="toolbox" title="Toolbox">
                        {SideBarBoxDivs}
                    </Tab>
                    <Tab eventKey="data" title="Data">
                        
                        <div style={boxStyle}>
                            <ImportDataModal setUploadedObject={this.props.setUploadedObject} /> 
                        </div>
                        <div style={boxStyle}>
                            Export as<br></br>
                            <Button variant="info" style={{marginLeft: "2px"}} onClick={this.handlePNGExport}>PNG </Button>
                            <Button variant="info" style={{marginLeft: "2px"}} onClick={this.handleJPEGExport}>JPEG </Button>
                            <Button variant="info" style={{marginLeft: "2px"}} onClick={(e) => this.props.handleJSONExport(true)}>JSON </Button>
                        </div>
                        {selectedHeuristic==="Hello" || <div style={boxStyle}><SwitchHeuristicButton selectedHeuristic={selectedHeuristic} handleHeuristicClick={this.props.handleHeuristicClick}/></div>}
                    </Tab>
                </Tabs>
                <div style={boxStyle}>
                    Zoom
                    <Button variant="info" style={{marginLeft: "2px"}} onClick={() => setGraphScale(getGraphScale() + 0.1)}>In</Button>
                    <Button variant="info" style={{marginLeft: "2px"}} onClick={() => setGraphScale(getGraphScale() - 0.1)}>Out</Button>
                </div>

                <div style={{height:'15%', position:'absolute', bottom:0, width: '100%'}}>
                    <div style={boxStyle}>
                        <Chronometer/>
                    </div>
                </div>
            </div>
        );
    }
}

/**
 * Array of objects representing the items in playground {@Link SideBar}.
 * Properties other than the ones below can be added.
 * @property {string} src pointing to the address of the item image,
 * @property {string} alt alternative of the item image but also the name of the item
 */
const SideBarItemData = [
    [
        {
            src: "/img/boundary.png", 
            width: "64",
            height: "64",
            alt:"boundary"
        },
    ],
    [
        {
            src: "/img/role.png",
            width: "64",
            height: "64", 
            alt: "role"
        }
    ],
    [
        {
            src: "/img/goal.png",
            height: "64",
            alt: "goal"
        }
    ],
    [
        {
            src: "/img/and.png",
            height: "64",
            alt: "and",
            style: {marginRight: '15%'}
        },
        {
            src: "/img/or.png",
            height: "64",
            alt: "or"
        }
    ]
]

export default SideBar;