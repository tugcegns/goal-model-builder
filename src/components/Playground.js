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

    //https://resources.jointjs.com/tutorial/hierarchy
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

      const graphScale = this.props.getGraphScale()

      var checkChild = (child) => {
        var elementView = this.paper.findViewByModel(child);
        var childBbox = elementView.getBBox();                
    
        if (childBbox.x/graphScale < newX) { newX = childBbox.x/graphScale; }
        if (childBbox.y/graphScale < newY) { newY = childBbox.y/graphScale; }
        if (childBbox.corner().x/graphScale > newCornerX) { newCornerX = childBbox.corner().x/graphScale; }
        if (childBbox.corner().y/graphScale > newCornerY) { newCornerY = childBbox.corner().y/graphScale; }
      };

      parent.getEmbeddedCells().forEach(checkChild)
      //checkChild(cell)
    
      // Note that we also pass a flag so that we know we shouldn't adjust the
      // `originalPosition` and `originalSize` in our handlers as a reaction
      // on the following `set()` call.
      parent.set({
        position: { x: newX, y: newY },
        size: { width: newCornerX - newX, height: newCornerY - newY }
        }, { skipParentHandler: true });
    });

    //Called when a role, goal or line is clicked
    this.paper.on('cell:pointerclick', cellView => {
      //console.log(cellView.findBySelector('c')[0]['r'].baseVal.value)
      this.resetSelectedCell();
      const { selectedTool } = this.props;
      if(selectedTool !== null && selectedTool !== 'and' && selectedTool !== 'or') return;

      var currentCell = cellView.model;

      currentCell.attr('body/stroke', '#fa1234')
      currentCell.attr('r/stroke', '#fa1234')
      currentCell.attr('line/stroke', '#fa1234')
            
      this.setState({ selectedCell: currentCell });
    });
        
    //Called when a role or goal is clicked
    this.paper.on('element:pointerclick', (elementView, eventObject, eventX, eventY) => { 
      const { selectedTool } = this.props;

      var currentElement = elementView.model;

      if (selectedTool === "goal" && currentElement.get('type') == 'node.role') {
        const goal = this.createGoal("Goal", eventX, eventY);
        currentElement.embed(goal);
        this.graph.addCell(goal);
        this.props.handleToolClick(null);
      } else if ((selectedTool === 'and' || selectedTool === 'or') && currentElement.get('type') === 'node.goal') {
        var { source } = this.state;

        if (source) {
          const sourceID = source.get('id');
          const targetID = currentElement.get('id');

          const sourceGoal = this.graph.getCell(sourceID);
          const cLinks = this.graph.getConnectedLinks(sourceGoal);
            
          for (var i in cLinks) {
            if (cLinks[i].get('source').id == targetID || cLinks[i].get('target').id == targetID) {
              this.setState({source: currentElement});
              return;
            }              
          }
          if (targetID === sourceID) return;
          const link = this.createLink(sourceID, targetID, selectedTool);
          const role = this.graph.getCell(currentElement.get('parent'));
          role.embed(link);
          this.graph.addCell(link);
          this.resetSelectedCell();
          this.setState({ source: null });
          this.props.handleToolClick(null);
        } else {
          this.setState({source: currentElement});
        }
      } else {
        this.setState({source: null});
      }
            
    });
    this.paper.on('element:pointerdblclick', elementView => {
      this.resetSelectedCell();
      const currentElement = elementView.model;
      const label = currentElement.attr('label').text;
      if (label !== "")
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

      if (selectedTool !== "role" && selectedTool !== "boundary" ) return;
      this.createRole("Actor", 0, {x: eventX, y: eventY}, selectedTool == 'boundary');
      this.props.handleToolClick(null);      
    });

    
    this.offsetX = 150; //PARAMETER: space between role containers
    this.offsetY = 150;
    this.maxSize = 0;

    this.CustomRoleElement = dia.Element.define('node.role', {
      attrs: {        
        r: { //goal container
          strokeWidth :  2,
          stroke: '#111111',
          fill:  'rgba(222,222,222,0.7)',
          fillOpacity : 0.5,
          strokeDasharray: 5,
          strokeDashoffset: 2.5,
          /*
          refRx: '10%',
          refRy: '10%',
          */
        },
        label: { //for the role text
          /*
          refX: 10,
          refY: 10,
          */
          textVerticalAnchor: 'middle',
          textAnchor: 'middle',
          fill: '#333333',
          'font-weight': 'bold',
        },
        c: { //for the role name
          strokeWidth :  1,
          stroke: '#111111',
          fill:  '#cffdd4',
        },
      }
    }, {
      markup: [{
        tagName: 'rect',
        selector: 'r'
      },{
        tagName: 'circle',
        selector: 'c'
      },{
        tagName: 'text',
        selector: 'label'
      }]
    })

    /*
    #
    #For future reference 
    #
    */
    this.CustomGoalElement = dia.Element.define('node.goal', {
      attrs: {
        label: {
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          fontSize: 14,
        },
        r: {
          strokeWidth: 1,
          stroke: '#000000',
          fill: '#cffdd4',
        },
        outline: {
          ref: 'label',
          refX: 0,
          refY: 0,
          refWidth: '100%',
          refHeight: '100%',
          strokeWidth: 0, //PARAMETER: Make outline visible by setting strokeWidth to 1, make it invisible by setting it to 0
          stroke: '#000000',
          strokeDasharray: '5 5',
          strokeDashoffset: 2.5,
          fill: 'none'
        }
      }
    }, {
      markup: [{
        tagName: 'rect',
        selector: 'r'
      }, {
        tagName: 'text',
        selector: 'label'
      }, {
        tagName: 'rect',
        selector: 'outline'
      }]
    });
    /*
    this.CustomRole = dia.Element.define('node.role', {
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
    */

    this.CustomLinkAnd = dia.Link.define('AndRefinementLink', {
      attrs: {
        line: {
          connection: true,
          fill: 'none',
          stroke: 'black',
          'stroke-width': 2,
          'targetMarker': {
            'd': 'm 10,-6 l 0,12',
            fill: 'none',
            'stroke-width': 1.2,
            'type': 'path',
          }
        },
        'connection-wrap': {
          connection: true,
          fill: 'none',
          stroke: 'transparent',
          'stroke-linecap': 'round',
          'stroke-width': 20
        }
      }
    }, {
      markup: [
        {
          className: 'c-connection-wrap',
          selector: 'connection-wrap',
          tagName: 'path'
        },
        {
          selector: 'line',
          tagName: 'path'
        }]
    });

    this.CustomLinkOr = dia.Link.define('OrRefinementLink', {
      attrs: {
        line: {
          connection: true,
          fill: 'none',
          stroke: 'black',
          'stroke-width': 1,
          'targetMarker': {
            'd': 'm 12,-6 l -12,6 12,6 z',
            fill: 'black',
            'stroke-width': 1.2,
            'type': 'path',
          }
        },
        'connection-wrap': {
          connection: true,
          fill: 'none',
          stroke: 'transparent',
          'stroke-linecap': 'round',
          'stroke-width': 20
        }
      }
    }, {
      markup: [
        {
          className: 'c-connection-wrap',
          selector: 'connection-wrap',
          tagName: 'path'
        },
        {
          selector: 'line',
          tagName: 'path'
        }
      ]
    });

    shapes.node = {};
    shapes.node.role = this.CustomRole;

    document.addEventListener("keydown", this.onKeyDown, false);

    window.onbeforeunload = function() {
      return "";
    }.bind(this);

    if(this.props.uploadedObject !== undefined && this.props.uploadedObject.cells) {
      this.graph.fromJSON(this.props.uploadedObject);
      this.props.setUploadedObject(undefined);
    } else if (this.props.uploadedObject !== undefined) {
      this.createGraph(this.props.uploadedObject);
      this.props.setUploadedObject(undefined);
    }
  }

  resetSelectedCell = () => {
    const { selectedCell } = this.state;
    if(selectedCell){
      selectedCell.attr('body/stroke', '#000000')
      selectedCell.attr('c/stroke', '#000000')
      selectedCell.attr('r/stroke', '#000000')
      selectedCell.attr('line/stroke', '#31a2e7')
      this.setState({ selectedCell: null })
    }
  }

  createRole = (label, goalCount, coordinates, isBoundary) => {
        /*
        var role = new this.CustomRole();
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
        */

    var role = new this.CustomRoleElement();
    role.attr({       
      r: {
          refWidth: '100%',
          refHeight: '100%',
          refRx: 0.1,
          refRy: 0.1,
      },
      label: {
          ref:'r',
          refX: '3%', //PARAMETER: adjust the offset of the role circle (and the label)
          refY: '3%',
          fontSize: this.getRoleLabelFontSize(label),
          text: isBoundary?"":this.processLabel(label, 'node.role'),
      },
      c: {
          ref: 'label',
          refX: '50%',
          refY: '50%',
          refRCircumscribed: '60%',   //PARAMETER: adjust size of the role circle
      },
    })

    let size = (goalCount-1) * 15 + 300;

    if(size > this.maxSize) {
      this.maxSize = size;
    }

    const paperSize = this.paper.getComputedSize();

    role.resize(size,size);        
    if (this.offsetX >= paperSize.width - size - 50) {
      this.offsetX = 100;
      this.offsetY += (this.maxSize * 1.4);
      if (this.offsetY > paperSize.height) {
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
        /*
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
        */
    var element = new this.CustomGoalElement();
    element.attr({
      label: { //textWrap element can be used instead. textWrap automatically places new line element
        text: this.processLabel(label, 'node.goal'),
        'font-weight': 'bold',
      },
      r: {
          refRx: 0.2,
          refRy: 0.8,
          ref: 'label',
          refX: '-10%',
          //x: -10, // additional x offset
          refY: '-5%',
          //y: -10, // additional y offset
          refWidth: '120%',
          refHeight: '110%',
        }
    });

    element.position(x, y);
    return element;
  }

  createLink = (sourceID, targetID, label)=> {
    debugger
    //var link = new shapes.standard.Link();
    var link = new this.CustomLinkAnd();

    link.prop('source', { id: targetID });
    link.prop('target', {id: sourceID });
    link.attr('root/title', 'joint.shapes.standard.Link');
    link.attr('line/stroke', '#31a2e7');
    //link.labels([{
    //    attrs: {
    //        text: {
    //            text: label.toUpperCase()
    //        }
    //    }
    //}]);
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

  computeSubgoalCoordinates = (r, n) => {
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
        /*

        var element = new this.CustomRoleElement();
        element.attr({
            c: {
                ref: 'label',
                refRCircumscribed: '60%',   //PARAMETER: adjust size of the role circle
                refCx: '0%',
                refCy: '0%'
            },
            label: {
                ref:'r',
                refX: '0%',
                refY: '0%',
                text: 'HASAN'
            },
            r: {
                refWidth: '100%',
                refHeight: '100%',
            }
        })

        element.position(300, 300);
        element.resize(400, 400);
        element.addTo(this.graph);

        */
       /*

       var element = new this.CustomGoalElement();
    element.attr({
    label: {
        text: 'Hello, World!'
    },
    r: {
        refRx: 0.1,
        refRy: 0.1,
        ref: 'label',
        refX: '-5%',
        //x: -10, // additional x offset
        refY: '-5%',
        //y: -10, // additional y offset
        refWidth: '110%',
        refHeight: '110%',
    }
    });

    element.position(300, 300);
    element.addTo(this.graph);
       */

    //PARAMETER: Offset of goals relative to upper left corner of the role container
    const goalOffset = {x:100, y:10}

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
      //roleSize is the size of the role circle. There must be a better way, I am unable to find
      const roleSize = role.get('size');
      const roleRadius = role.findView(this.paper).selectors.c.r.baseVal.value
      
      let parentGoalOffsets = {x: roleSize.width/10+roleRadius, y: roleSize.height/10+roleRadius/4 + goalOffset.y};
      let maxRadiusInRow = 0;
      //graphElements.push(role);
      for (var i in nodes){
        let node = nodes[i];

        var radius = 0
        var numberOfSubgoals = 0
        var hasSubgoals = false
        var children = null
        if( node.children && node.children.length != 0 ) {
          hasSubgoals = true
          children = node.children[0]
          numberOfSubgoals = children.label ? children.label.length : 0;
          radius = numberOfSubgoals * 20 + 50;
        }

        let parentGoalCoordinates = {
          x: role.get('position').x + parentGoalOffsets.x + radius/2,//Math.cos((2*numberOfSubgoals+1)*Math.PI), //PARAMETER: Offset of goals with respect to the role circle
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
        if (!hasSubgoals)continue

        if(children.type == 'goal'){
          if(radius > maxRadiusInRow) maxRadiusInRow = radius;
          var subgoalCoordinates;
          if(numberOfSubgoals > 0){
            subgoalCoordinates = this.computeSubgoalCoordinates(radius, numberOfSubgoals);
            parentGoalCoordinates.x += (radius*0.8) //
          }
          parentGoalOffsets.x += 100 + (radius*1.2); //PARAMETER: horizontal distance between goals
          if(parentGoalOffsets.x > (roleSize.width * 0.8)){ //row is filled
            parentGoalOffsets.x =  goalOffset.x;
            parentGoalOffsets.y += (50 + maxRadiusInRow);
            maxRadiusInRow = 0;
          }
                    
          for(var i in children.label){
            let childGoalCoordinates = {
              x: parentGoalCoordinates.x + subgoalCoordinates[i].x - (radius*0.8),
              y: parentGoalCoordinates.y - subgoalCoordinates[i].y
            }
            var subgoal = this.createGoal(children.label[i], childGoalCoordinates.x, childGoalCoordinates.y);
            debugger
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
      //console.log(paperSize);
            
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
    const graphScale = this.props.getGraphScale()
    this.paper.scale(graphScale, graphScale)
    this.paper.setDimensions(3000 * graphScale, 5000 * graphScale)
  }

  processLabel = (label, elementType) => {
    if (elementType == 'node.goal') {
      const   l = label.length
      //label is too short. Since we are drawing the goal container by
      //looking at the size of the label, container becomes too small.
      //Thus, we place white space around the label.
      if (l < 6) return " ".repeat(l)+label+" ".repeat(l)
      //label is not too small, we replace every two white space
      //https://levelup.gitconnected.com/advanced-regex-find-and-replace-every-second-instance-of-a-character-c7d97a31516a
      else return label.replace(/( [^ ]*) /g,'$1\n')
    } else if (elementType == 'node.role') {
      return label.replace(/ /g, "\n")
    } else {
      return "undefined element"
    }
  }

  getRoleLabelFontSize = (label) => {
    const labelWords = label.split(" ")
    var longestWordLength = 0
    for (const i in labelWords) {
      const word = labelWords[i]
      if (word.length > longestWordLength) {
        longestWordLength = word.length
      }
    }
    return 28 - labelWords.length - (longestWordLength<6?0:longestWordLength)
  }

  onLabelChange = newLabel => { //TODO create a function to process label string before setting it
    const {selectedElement} = this.state;
    const elementType = selectedElement.get('type')
    if(elementType === "standard.Link") {
      selectedElement.labels([{
        attrs: {
          text: {
            text: newLabel
          }
        }
      }]);
    }else {
      selectedElement.attr('label/text', this.processLabel(newLabel, elementType));
      if (elementType === "node.role") selectedElement.attr('label/fontSize', this.getRoleLabelFontSize(newLabel));
    } 
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