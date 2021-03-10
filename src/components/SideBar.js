import React from "react";

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "react-bootstrap";

import  htmlToImage from 'html-to-image';
import  download  from 'downloadjs';
import ImportDataModal from "./ImportDataModal";
class SideBar extends React.Component{

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
                <div style={{height: '100px', borderTop: '1px solid #a1a1a1', borderBottom: '1px solid #a1a1a1'}}>
                    <p className="text-center" style={{ marginTop: '8%', fontSize: '22px' }}>
                        {boxItems}
                    </p>
                </div>
            )
        })

        const { getGraphScale, setGraphScale} = this.props
        return(
            <div style={{
                width: '100%',
                backgroundColor: '#e1e1e1',
                paddingTop: '20px',
                height: '100%',
                overflowY: 'auto',
                boxShadow: '4px 2px 5px 0px #a1a1a1',
                paddingBottom: '150px'
            }}>
                <p className="text-dark mb-4 text-center" style={{ fontSize: '20px', fontWeight: 'bold' }}> 
                    Toolbox 
                </p>
                {SideBarBoxDivs}
                <div>
                    <ImportDataModal setUploadedObject={this.props.setUploadedObject} /> 
                </div>
                <div className="text-center mt-4">
                    Zoom
                    <Button variant="info" style={{marginLeft: "2px"}} onClick={() => setGraphScale(getGraphScale() + 0.1)}>In</Button>
                    <Button variant="info" style={{marginLeft: "2px"}} onClick={() => setGraphScale(getGraphScale() - 0.1)}>Out</Button>
                </div>
            </div>
        );
    }
}

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