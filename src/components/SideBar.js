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
        return(
            <div style={{
                width: '100%',
                backgroundColor: '#e1e1e1',
                paddingTop: '20px',
                height: '100%',
                boxShadow: '4px 2px 5px 0px #a1a1a1',
                paddingBottom: '150px'
            }}>
                <p className="text-dark mb-4 text-center" style={{ fontSize: '20px', fontWeight: 'bold' }}> 
                    Toolbox 
                </p>
                <div style={{ 
                    height: '100px', 
                    borderTop: '1px solid #a1a1a1', 
                    borderBottom: '1px solid #a1a1a1'
                }}>
                <p className="text-center" style={{ marginTop: '8%', fontSize: '22px' }}>
                    <img src="/img/boundary.png" 
                    width="64" 
                    height="64" 
                    alt="boundary"
                    style={ selectedTool === "boundary" ? {...selectedBorder} : { cursor: 'pointer' }}
                    onClick={(e) => this.props.handleToolClick('boundary')} />
                </p>
                </div>
                <div style={{ 
                        height: '100px', 
                        borderTop: '1px solid #a1a1a1', 
                        borderBottom: '1px solid #a1a1a1'
                    }}>
                    <p className="text-center" style={{ marginTop: '8%', fontSize: '22px' }}>
                        <img src="/img/role.png" 
                             width="64" 
                             height="64" 
                             alt="role"
                             style={ selectedTool === "role" ? {...selectedBorder} : { cursor: 'pointer' }}
                             onClick={(e) => this.props.handleToolClick('role')} />
                    </p>
                </div>

                <div style={{ 
                    height: '100px', 
                    borderTop: '1px solid #e1e1e1', 
                    borderBottom: '1px solid #a1a1a1'
                }}>
                    <p className="text-center" style={{ marginTop: '8%', fontSize: '22px' }}>
                        <img src="/img/goal.png" 
                             height="64"
                             alt="goal"
                             style={ selectedTool === "goal" ? {...selectedBorder} : { cursor: 'pointer' }}
                             onClick={(e) => this.props.handleToolClick('goal')} />
                    </p>
                </div>
                
               {/* 
                <div style={{ 
                    height: '100px', 
                    borderTop: '1px solid #e1e1e1', 
                    borderBottom: '1px solid #a1a1a1'
                }}>
                    <p className="text-center" style={{ marginTop: '12%', fontSize: '22px' }}>
                        Task
                    </p>
                </div>
                */}

                <div style={{ 
                    height: '100px', 
                    borderTop: '1px solid #e1e1e1', 
                    borderBottom: '1px solid #a1a1a1'
                }}>
                    <p className="text-center" style={{ marginTop: '8%', fontSize: '22px' }}>

                        <img src="/img/and.png" 
                            height="64"
                            alt="and"
                            style={ selectedTool === "and" ? {...selectedBorder, marginRight: '15%'} : { cursor: 'pointer', marginRight: '15%' }}
                            onClick={(e) => this.props.handleToolClick('and')} />

                        <img src="/img/or.png" 
                            height="64"
                            alt="or"
                            style={ selectedTool === "or" ? {...selectedBorder} : { cursor: 'pointer' }}
                            onClick={(e) => this.props.handleToolClick('or')} />
                    </p>
                </div>
                <div>
                    <ImportDataModal setUploadedObject={this.props.setUploadedObject} /> 
                </div>
            </div>
        );
    }
}

export default SideBar;