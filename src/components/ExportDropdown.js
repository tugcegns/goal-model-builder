import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { NavDropdown } from "react-bootstrap";
import  htmlToImage from 'html-to-image';
import  download  from 'downloadjs';
class ExportDropdown extends React.Component{
    
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
    handlePNGExport = () => {
        htmlToImage.toPng(document.getElementById('playground'))
        .then(function (dataUrl) {
              download(dataUrl, 'goal-model.png');
        });
    }   
    render(){
        return(

            <NavDropdown title="Export" alignRight >
                <NavDropdown.Item onClick={this.handlePNGExport} >as PNG </NavDropdown.Item>
                <NavDropdown.Item onClick={this.handleJPEGExport}>as JPEG</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={(e) => this.props.handleJSONExport(true)}>as JSON</NavDropdown.Item>
            </NavDropdown>
        );
    }
}

export default ExportDropdown; 