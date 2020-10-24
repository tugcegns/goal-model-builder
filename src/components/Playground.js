import React from 'react';
import ReactDOM from "react-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { dia, shapes } from 'jointjs';
import { each } from 'underscore';
import LabelModal from '../components/LabelModal';


class Playground extends React.Component{

    constructor(props) {
        super(props);
        this.graph = new dia.Graph({ /* attributes of the graph */ }, { cellNamespace: shapes }); //önce boş bir graph oluşturuyoruz.
        this.state = {
            maxSize: 0,
            showLabelModal: false,
            source: null
        }
    }
    componentDidMount(){
        this.paper = new dia.Paper({ // Paper oluşturuyoruz çalışma sheeti gibi 
            el: ReactDOM.findDOMNode(this.refs.playground), //html' e koyarken hangi elemente atadığımızı belirtiyoruz.
            cellViewNamespace: shapes,
            width: 3000,
            height: 5000,
            model: this.graph // yukarda oluşturduğumuz graphı buna atıyoruz.
        });
        this.graph.on('change:size', (cell, newPosition, opt) => {

            if (opt.skipParentHandler) return;
    
            if (cell.get('embeds') && cell.get('embeds').length) {
                cell.set('originalSize', cell.get('size'));
            }
        });

        this.graph.on('change:position', (cell, newPosition, opt) => {

            if (opt.skipParentHandler) return;
    
            if (cell.get('embeds') && cell.get('embeds').length) {
                // If we're manipulating a parent element, let's store
                // it's original position to a special property so that
                // we can shrink the parent element back while manipulating
                // its children.
                cell.set('originalPosition', cell.get('position'));
            }
    
            var parentId = cell.get('parent');
            if (!parentId) return;
    
            var parent = this.graph.getCell(parentId);
    
            if (!parent.get('originalPosition')) parent.set('originalPosition', parent.get('position'));
            if (!parent.get('originalSize')) parent.set('originalSize', parent.get('size'));
    
            var originalPosition = parent.get('originalPosition');
            var originalSize = parent.get('originalSize');
    
            var newX = originalPosition.x;
            var newY = originalPosition.y;
            var newCornerX = originalPosition.x + originalSize.width;
            var newCornerY = originalPosition.y + originalSize.height;
    
            each(parent.getEmbeddedCells(), function(child) {
    
                var childBbox = child.getBBox();
    
                if (childBbox.x < newX) { newX = childBbox.x; }
                if (childBbox.y < newY) { newY = childBbox.y; }
                if (childBbox.corner().x > newCornerX) { newCornerX = childBbox.corner().x; }
                if (childBbox.corner().y > newCornerY) { newCornerY = childBbox.corner().y; }
            });
    
            // Note that we also pass a flag so that we know we shouldn't adjust the
            // `originalPosition` and `originalSize` in our handlers as a reaction
            // on the following `set()` call.
            parent.set({
                position: { x: newX, y: newY },
                size: { width: newCornerX - newX, height: newCornerY - newY }
            }, { skipParentHandler: true });
        });
        this.paper.on('cell:pointerclick', cellView => {
            this.resetSelectedCell();
            const { selectedTool } = this.props;
            if(selectedTool !== null && selectedTool !== 'and' && selectedTool !== 'or') return;

            var currentCell = cellView.model;

            currentCell.attr('body/stroke', '#fa1234')
            currentCell.attr('c/stroke', '#fa1234')
            currentCell.attr('e/stroke', '#fa1234')
            currentCell.attr('line/stroke', '#fa1234')
            
            this.setState({ selectedCell: currentCell });
            
        });
        
        this.paper.on('element:pointerclick', (elementView, eventObject, eventX, eventY) => {
        
            const { selectedTool } = this.props;

            var currentElement = elementView.model;

            if(selectedTool === "goal" && currentElement.get('type') == 'node.role'){
                const goal = this.createGoal("Goal", eventX - 50, eventY - 25);
                currentElement.embed(goal);
                this.graph.addCell(goal);
                this.props.handleToolClick(null);
            }else if((selectedTool === 'and' || selectedTool === 'or') && currentElement.get('type') === 'standard.Rectangle'){
                var { source } = this.state;

                if(source){
                    const sourceID = source.get('id');
                    const targetID = currentElement.get('id');

                    const sourceGoal = this.graph.getCell(sourceID);
                    const cLinks = this.graph.getConnectedLinks(sourceGoal);
            
                    for(var i in cLinks){
                        if
                        (
                            cLinks[i].get('source').id == targetID 
                            || 
                            cLinks[i].get('target').id == targetID
                        )
                        {
                            this.setState({source: currentElement});
                            return;
                        } 
                        
                    }
                    if(targetID === sourceID) return;
                    const x = (source.get('position').x + currentElement.get('position').x) / 2;
                    const y = (source.get('position').y + currentElement.get('position').y) / 2 - 50;
                    const link = this.createLink(sourceID, targetID, selectedTool, x, y);
                    const role = this.graph.getCell(currentElement.get('parent'));
                    role.embed(link);
                    this.graph.addCell(link);
                    this.resetSelectedCell();
                    this.setState({ source: null });
                    this.props.handleToolClick(null);
                }else{
                    this.setState({source: currentElement});
                }
            }else{
                this.setState({source: null});
            }
            
        });
        this.paper.on('element:pointerdblclick', elementView => {
            this.resetSelectedCell();
            const currentElement = elementView.model;
            const label = currentElement.attr('label').text;
            if(label !== "")
                this.setState({ showLabelModal:true, label, selectedElement: currentElement });
        });

        /* Link label edit
        this.paper.on('link:pointerdblclick', linkView => {
            const link = linkView.model;
            const label = link.get('labels')[0].attrs.text.text;
            this.setState({ showLabelModal:true, label, selectedElement: link });
        });
        */

        this.paper.on('blank:pointerclick', (eventObject, eventX, eventY) => {

            this.resetSelectedCell();

            const { selectedTool } = this.props;

            if(selectedTool !== "role" && selectedTool !== "boundary" ) return;

            this.createRole("Actor", 0, {x: eventX, y: eventY}, selectedTool == 'boundary');

            this.props.handleToolClick(null);
            
        });

        this.offsetX = 150;
        this.offsetY = 150;
        this.maxSize = 0;

        this.CustomElement = dia.Element.define('node.role', {
            attrs: {
                c:{
                    strokeWidth :  1,
                    stroke: '#111111',
                    fill:  '#cffdd4'
                    
                },
                e: {
                    strokeWidth :  2,
                    stroke: '#111111',
                    fill:  'rgba(222,222,222,0.7)',
                    fillOpacity : 0.5,
                    strokeDasharray: 5,
                    strokeDashoffset: 2.5
                },
                label:{
                    textVerticalAnchor: 'middle',
                    textAnchor: 'middle',
                    refX: '50%',
                    refY: '50%',
                    fontSize: 14,
                    fill: '#333333'
                }
                
            } 
        }, {
            markup: [{
                tagName: 'ellipse',
                selector: 'e'
            },{
                tagName: 'circle',
                selector: 'c'
            },{
                tagName: 'text',
                selector: 'label'
            }]
        });
        shapes.node = {};
        shapes.node.role = this.CustomElement;

        document.addEventListener("keydown", this.onKeyDown, false);

        window.onbeforeunload = function() {
            return "";
        }.bind(this);

        if(this.props.uploadedObject !== undefined && this.props.uploadedObject.cells) {
            this.graph.fromJSON(this.props.uploadedObject);
            this.props.setUploadedObject(undefined);
        }
        else if (this.props.uploadedObject !== undefined) {
            this.createGraph(this.props.uploadedObject);
            this.props.setUploadedObject(undefined);
        }

    }

    resetSelectedCell = () => {
        const { selectedCell } = this.state;
        if(selectedCell){
            selectedCell.attr('body/stroke', '#000000')
            selectedCell.attr('c/stroke', '#000000')
            selectedCell.attr('e/stroke', '#000000')
            selectedCell.attr('line/stroke', '#31a2e7')
            this.setState({ selectedCell: null })
        }
    }
    createRole = (label, goalCount, coordinates, isBoundary) => {
        var role = new this.CustomElement();
        if (isBoundary){
            role.attr({
                e: {
                    refRx: '65%',
                    refRy: '60%',
                    refCx: '25%',
                    refCy: '-25%',
                    refX: '25%',
                    refY: '75%',
                },
                c:{
                    ref:'e',
                    refCx: '0%',
                    refCy: '0%',
                    
                },
                label: {
                    text: "",
                    ref: 'c'
                }
            });
        } else {
            role.attr({
                e: {
                    refRx: '65%',
                    refRy: '60%',
                    refCx: '25%',
                    refCy: '-25%',
                    refX: '25%',
                    refY: '75%',
                },
                c:{
                    ref:'e',
                    refCx: '3%',
                    refCy: '10%',
                    refRCircumscribed: goalCount > 18 ? 0.05 : 0.09
                    
                },
                label: {
                    text: label.replace(/ /g, "\n"),
                    ref: 'c'
                }
            });
        }
        
        
        let size = (goalCount-1) * 40 + 350;
        
        
        if(size > this.maxSize) {
            this.maxSize = size;
        }

        const paperSize = this.paper.getComputedSize();

        role.resize(size,size);
        if(this.offsetX >= paperSize.width - size - 50){
            this.offsetX = 100;
            this.offsetY += (this.maxSize * 1.4);
            if(this.offsetY > paperSize.height){
                this.paper.setDimensions(paperSize.width, paperSize.height + (this.maxSize * 1.4) );
            }
            this.maxSize = size;
        }
        if(coordinates) role.position(coordinates.x, coordinates.y);
        else role.position(this.offsetX, this.offsetY);
        this.offsetX += (size * 1.4);
        role.addTo(this.graph);
        return role;
    }
    createGoal = (label, x, y) => {
        var rect = new shapes.standard.Rectangle();
        const width = label.length < 16 ? 120 : label.length * 7.5;
        rect.position(x, y);
        rect.resize(width, 80);
        rect.attr({
            body: {
                fill: '#cffdd4',
                rx: 40,
                ry: 40,
                strokeWidth: 2
            },
            label: {
                text: label ,
                fill: 'blue'
            }
        });
        return rect;
    }
    createLink = (sourceID, targetID, label, x, y)=> {
        
        var link = new shapes.standard.Link();
        
        link.prop('source', { id: sourceID });
        link.prop('target', {id: targetID });
        link.prop('vertices', [{x: x+100,y: y+100}])
        link.attr('root/title', 'joint.shapes.standard.Link');
        link.attr('line/stroke', '#31a2e7');
        link.labels([{
            attrs: {
                text: {
                    text: label.toUpperCase()
                }
            }
        }]);
        return link;
    }
    countChildren = nodes => {
        let roleChildrenCount = 0;
        for (var i in nodes){
            let node = nodes[i];
            if(node.type == 'goal') {
                roleChildrenCount++;
            }
            if( !node.children || node.children.length === 0 ) continue;
            
            let children = node.children[0];
            if(children.type == 'goal'){
                for(var i in children.label){
                    roleChildrenCount++;
                }
            }
        }
        return roleChildrenCount;
    }

    computeSubgoalCoordinates = n => {
        const r = n * 40 + 100;
        const startAngle = 180 / (2*n) + 180;
        const angleInterval = 180 / n;
        const pi = Math.PI;
        let coords = [];

        let angle = startAngle;
        for(var i = 0; i < n; i++){
            const q = angle * (pi / 180);
            const x = r * Math.cos(q);
            const y = r * Math.sin(q);

            coords.push({ x, y });

            angle += angleInterval;
        }

        return coords;
    }

    createGraph = uploadedObject => {
        for(var key in uploadedObject){
            var graphElements = [];
            let nodes = uploadedObject[key];
            const childrenCount = this.countChildren(nodes);
            var isBoundary = false;
            //if (nodes.length > 0 && nodes[0] == "null") {
            if (key === "null") {
                isBoundary = true;
            }
            const role = this.createRole(key, childrenCount, false,  isBoundary);
            const roleSize = role.get('size');

            let parentGoalOffsets = {x: roleSize.width / 3, y: 50};
            let maxRadiusInRow = 0;
            //graphElements.push(role);
            for (var i in nodes){
                let node = nodes[i];
                let parentGoalCoordinates = {
                    x: role.get('position').x + parentGoalOffsets.x,
                    y: role.get('position').y + parentGoalOffsets.y
                }
                if(node.type == 'goal') {
                    var goal = this.createGoal(
                        node.label, 
                        parentGoalCoordinates.x, 
                        parentGoalCoordinates.y
                        );
                    role.embed(goal);
                } // else createTask
                if( !node.children || node.children.length === 0 )continue;
                let children = node.children[0];
                if(children.type == 'goal'){
                    const numberOfSubgoals = children.label ? children.label.length : 0;
                    const radius = numberOfSubgoals * 40 + 100;
                    if(radius > maxRadiusInRow) maxRadiusInRow = radius;
                    var subgoalCoordinates;
                    if(numberOfSubgoals > 0){
                        subgoalCoordinates = this.computeSubgoalCoordinates(numberOfSubgoals);
                        parentGoalCoordinates.x += (radius*0.9)
                        
                    }
                    parentGoalOffsets.x += 225 + (radius*0.9);
                    if(parentGoalOffsets.x > (roleSize.width * 0.8)){
                        parentGoalOffsets.x =  0;
                        parentGoalOffsets.y += (125 + maxRadiusInRow);
                        maxRadiusInRow = 0;
                    }
                    
                    for(var i in children.label){
                        let childGoalCoordinates = {
                            x: parentGoalCoordinates.x + subgoalCoordinates[i].x - (radius*0.6),
                            y: parentGoalCoordinates.y - subgoalCoordinates[i].y
                        }
                        var subgoal = this.createGoal(children.label[i], childGoalCoordinates.x, childGoalCoordinates.y);
                        var link = this.createLink(
                            goal.id, 
                            subgoal.id, 
                            children.relationship, 
                            (childGoalCoordinates.x + parentGoalCoordinates.x) / 2 - (radius*0.6),
                            (childGoalCoordinates.y + parentGoalCoordinates.y) / 2 - 50
                        );
                        role.embed(subgoal);
                        role.embed(link);
                        graphElements.push([subgoal,link])
                    }
                }
                graphElements.push(goal);
            }
            this.graph.addCells(graphElements);
        
            const paperSize = this.paper.getComputedSize();
            console.log(paperSize);
            
        }
    }

    componentWillReceiveProps = newProps => {
        const { uploadedObject, jsonExportClicked, exportJSON, handleJSONExport, setUploadedObject, selectedTool  } = newProps;
        if(jsonExportClicked) {
            exportJSON(this.graph.toJSON());
            handleJSONExport(false);
        }
        if(uploadedObject !== undefined && uploadedObject.cells) {
            this.graph.fromJSON(uploadedObject);
            setUploadedObject(undefined);
        }
        else if (uploadedObject !== undefined) {
            this.createGraph(uploadedObject);
            this.props.setUploadedObject(undefined);
        }
        if(selectedTool) {
            this.resetSelectedCell();
        }
    }

    onLabelChange = newLabel => {
        const {selectedElement} = this.state;
        if(selectedElement.get('type') === "standard.Link") {
            selectedElement.labels([{
                attrs: {
                    text: {
                        text: newLabel
                    }
                }
            }]);
        }else selectedElement.attr('label/text', newLabel);
    }

    onKeyDown = event => {
        var keyId = event.keyCode;
        const { selectedCell } = this.state;
        if(keyId === 8 && selectedCell){
            this.graph.removeCells([selectedCell]);
            this.setState({ selectedCell: null })
        }
    }

    render(){
        return(
            <div ref="playground" 
                 id="playground">
                 <LabelModal show={this.state.showLabelModal} 
                             onHide={() => {this.setState({showLabelModal:false})}}
                             label={this.state.label}
                             onLabelChange={this.onLabelChange}  />
            </div>
        );
    }

}
export default Playground;