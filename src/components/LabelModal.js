import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Form, Button, Input } from "react-bootstrap";

class LabelModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            label: this.props.label 
        }
    }
    componentWillReceiveProps = newProps => {
        //When the label is too short, there will be white spaces around it. (See processLabel method in playground.js)
        //Used the regex expression to remove white spaces.
        if(newProps.label) this.setState({ label: newProps.label.replace(/^\s+|\s+$|\s+(?=\s)/g, "") });
    }
    onSubmit = event =>{
        event.preventDefault();
        const { label } = this.state;
        if(label.length >= 1){
            this.props.onLabelChange(this.state.label);
            this.props.onHide();
        }
    }
    onLabelChange = (e) =>{
        const {value} = e.target;
        this.setState({label:value});        
    }
  
    render(){
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
                    Edit label
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.onSubmit} id="label-form">
                        <Form.Group>
                            <Form.Control type="text" 
                                        value={this.state.label}
                                        onChange={this.onLabelChange} 
                                        isValid={this.state.label.length >= 1}
                                        isInvalid={this.state.label.length < 1} />
                            <Form.Control.Feedback type="invalid">
                                Actor label should be at least 1 character.
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={this.props.onHide}>Close</Button>
                    <Button variant="info" type="submit" form="label-form">OK</Button>
                </Modal.Footer>
                </Modal>
        );
    }

}

export default LabelModal;