import React from 'react';

import { Modal, Button } from "react-bootstrap";
import FormModal from './FormModel';

class SwitchHeuristicButton extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            showModal : false,
            currentHeuristic : this.props.selectedHeuristic,    // heuristic with which the current paper is filled
            selectedHeuristic : null                            // new heuristic chosen inside the modal
        }
    }

    componentWillReceiveProps(props) {
        this.setState({currentHeuristic : this.props.selectedHeuristic})
    }
    
    showModalHandler = (event) =>{
        this.setState({ showModal:true });
    }
    
    hideModalHandler = (event) =>{
        this.setState({ showModal:false });
    }

    render (){
        const heuristics = ["h1", "h2", "h3", "h4", "h5"]
        const {currentHeuristic, selectedHeuristic} = this.state

        const ps = heuristics.map(heuristic => {
            if (heuristic === currentHeuristic) {return ""}
            else
            {
                return (
                    <div
                        onClick={() => this.setState({selectedHeuristic: heuristic})}
                        style={{cursor: 'pointer'}}
                    >
                        <input
                            type="radio"
                            name="heu"
                            value={heuristic}
                            checked={selectedHeuristic === heuristic}        
                            readOnly={true}
                            style={{marginRight: "5px"}}
                        />
                        {heuristic}
                    </div>
                    )
            }  
        })
        
        return(
            <div>
                <div>
                    <Button variant="info" onClick={this.showModalHandler}> Switch Heuristics </Button>
                </div>
                <Modal
                    show={this.state.showModal}
                    size="md"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                        Switch Heuristics
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Note that you will lose any changes you made if you switch heuristics
                        <hr/>
                        Select heuristic:
                        {ps}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" onClick={this.hideModalHandler}>Close</Button>
                        <Button variant="info" onClick={() => {this.props.handleHeuristicClick(selectedHeuristic);this.hideModalHandler()}}>Submit</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default SwitchHeuristicButton;