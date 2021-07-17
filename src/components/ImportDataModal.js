import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Form, Button } from "react-bootstrap";
import FormModal from './FormModel';

/**
 * Modal for importing data in JSON format
 */
class ImportDataModal extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            showModal : false
        }
    }
    
    showModalHandler = (event) =>{
        this.setState({ showModal:true });
    }
    
    hideModalHandler = (event) =>{
        this.setState({ showModal:false });
    }

    render (){
        const { fileInputLabel } = this.state;
        return(
            <div>
                <div>
                    <Button variant="info" onClick={this.showModalHandler}> Import Data </Button>
                </div>
                <FormModal  show={this.state.showModal} 
                            onHide={this.hideModalHandler} 
                            setUploadedObject={this.props.setUploadedObject} ></FormModal>
            </div>
        );
    }
}

export default ImportDataModal;