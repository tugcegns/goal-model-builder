import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Form, Button } from "react-bootstrap";
import FormContent from './FormContent';

class FormModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            fileContent: "",
            parseErrorMessage: ""
        }
    }
    onFileChange = fileContent => {
        this.setState({ fileContent });
    }
    onSubmit = () =>{
        try {
            let uploadedObject = JSON.parse(this.state.fileContent);
            this.props.setUploadedObject(uploadedObject);
            
            for(var key in uploadedObject){
                console.log(key + ": " + uploadedObject[key]);
            }

            this.props.onHide();
        }catch (error) {
            this.setState({ 
                parseErrorMessage: "The file you are trying to upload has a badly formatted JSON string." 
            });
        }
    }
  
    render(){
        const formContent = <FormContent/>
        //const modal = this.props.showModal ? <div>{formContent}</div> : null;
        if(!this.props.show) return null;
        return(
            <Modal
                {...this.props}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                centered
                >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                    Select Your JSON File
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormContent onFileChange={this.onFileChange} parseErrorMessage={this.state.parseErrorMessage} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.props.onHide}>Close</Button>
                    <Button variant="info" onClick={this.onSubmit}>Submit</Button>
                </Modal.Footer>
                </Modal>
        );
    }

}

export default FormModal;