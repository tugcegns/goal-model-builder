import React from 'react';

import { Modal, Button } from "react-bootstrap";
import FormModal from './FormModel';

/**
 * Button for showing the switch heuristics modal
 */
class SwitchHeuristicButton extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            showModal : false,
            currentHeuristic : this.props.selectedHeuristic,    // heuristic with which the current paper is filled
            selectedHeuristic : null                            // new heuristic chosen inside the modal
        }
    }

    /**
     * Updates the heuristic used to create the last modal.
     * This heuristic is hidden when the modal is shown.
     * @param {{selectedHeuristic:string}} props 
     */
    componentWillReceiveProps(props) {
        this.setState({currentHeuristic : this.props.selectedHeuristic})
    }
    
    /**
     * Shows switch heuristics modal
     * @param {*} event 
     */
    showModalHandler = (event) =>{
        this.setState({ showModal:true });
    }
    
    /**
     * Hides switch heuristics modal
     * @param {*} event 
     */
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
                var text = ""
                if (heuristic == "h1") text = "H1: Grouped Action Verbs"
                else if (heuristic == "h2") text = "H2: Grouped Action Object"
                else if (heuristic == "h3") text = "H3: Without Role Boundary"
                else if (heuristic == "h4") text = "H4: Grouped Benefit"
                else if (heuristic == "h5") text = "H5: Benefit Without Role Boundary"
                else text = "ERROR: heuristic is not defined."

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
                        {text}
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
                    onHide={this.hideModalHandler}
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