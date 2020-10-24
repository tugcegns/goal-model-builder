import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Form  } from "react-bootstrap";

class FormContent extends React.Component{
    constructor(props) {
        super(props);
        this.fileInput = React.createRef();
        this.state = {
            fileInputLabel: 'Select Your Goal Model Data',
            fileSelected: false
        }
    }
    handleFileRead = e => {
        this.props.onFileChange(this.fileReader.result);
    }
    onFileChange = event => {
        if(this.fileInput.current && this.fileInput.current.files[0]){
            this.setState({ 
                fileInputLabel: this.fileInput.current.files[0].name,
                fileSelected: true
             });
            this.fileReader = new FileReader();
            this.fileReader.onloadend = this.handleFileRead;
            this.fileReader.readAsText(event.target.files[0]);
        }
    }
    
    render (){
        const { fileInputLabel } = this.state;
        return(
            <Form>
                <Form.File id="formcheck-api-custom" custom>
                    <Form.File.Input isInvalid={this.props.parseErrorMessage} 
                                     isValid={this.state.fileSelected && !this.props.parseErrorMessage} 
                                     accept=".json" ref={this.fileInput} 
                                     onChange={this.onFileChange} />
                    <Form.File.Label data-browse=". . .">
                        { fileInputLabel } 
                    </Form.File.Label>
                    <Form.Control.Feedback type="valid">If you submit it, your model will be updated!</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid"> {this.props.parseErrorMessage} </Form.Control.Feedback>
                </Form.File>
            </Form> 
        );
    }
}
export default FormContent;