import React from 'react';

import { Modal, Button } from "react-bootstrap";
import FormModal from './FormModel';
import { HeuristicsData } from '../heuristics';

/**
 * Button for showing the switch heuristics modal
 */
class SwitchHeuristicButton extends React.Component{
    constructor(props) {
        super(props);
        /**
         * @property {boolean} showModel whether the modal heuristic selection is shown
         * @property {string} currentHeuristic heuristic used to create the model currently drawn on the paper
         * @property {string} selectedHeuristic heuristic chosen in the heuristic selection modal
         */
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
        const {currentHeuristic, selectedHeuristic} = this.state

        const ps = HeuristicsData.map(heuristicData => {
            if (heuristicData.value === currentHeuristic) {return ""}
            else
            {
                return (
                    <div
                        onClick={() => this.setState({selectedHeuristic: heuristicData.value})}
                        style={{cursor: 'pointer'}}
                    >
                        <input
                            type="radio"
                            name="heu"
                            value={heuristicData.value}    
                            checked={selectedHeuristic === heuristicData.value}        
                            readOnly={true}
                            style={{marginRight: "5px"}}
                        />
                        {heuristicData.value + ": " + heuristicData.text}
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