import React from 'react';
import ReactDOM from "react-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { dia, shapes, g, V } from 'jointjs';
import * as $ from 'jquery';
import * as _ from 'lodash';

class Playground extends React.Component{

    constructor(props) {
        super(props);
        this.graph = new dia.Graph({ /* attributes of the graph */ }, { cellNamespace: shapes }); //önce boş bir graph oluşturuyoruz.
    }
    componentDidMount(){
    
        this.paper = new dia.Paper({ // Paper oluşturuyoruz çalışma sheeti gibi 
            el: ReactDOM.findDOMNode(this.refs.playground),  //html' e koyarken hangi elemente atadığımızı belirtiyoruz.
            cellViewNamespace: shapes,
            width: 1500,
            height: 1500,
            gridSize: 1,
            model: this.graph  // yukarda oluşturduğumuz graphı buna atıyoruz.
        });
        
        //new dia.Paper({ el: $('#paper-parent-expand'), width: 650, height: 250, gridSize: 1, model: graph });
    /*
        var r1 = new shapes.basic.Rect({
            position: { x: 20, y: 20 },
            size: { width: 250, height: 150 },
        });
        r1.attr({
            rect: { fill: '#2C3E50', rx: 25, ry: 25, 'stroke-width': 1, stroke: 'black', 'strokeDasharray': 2 },
            text: {
                text: 'my label', fill: '#3498DB',
                'font-size': 18, 'font-weight': 'bold', 'font-variant': 'small-caps', 'text-transform': 'capitalize'
            }
        });
        */

       var polygon = new shapes.standard.Polygon();
       polygon.resize(100, 100);
       polygon.position(200, 210);
       polygon.attr('root/tabindex', 5);
       polygon.attr('root/title', 'joint.shapes.standard.Polygon');
       polygon.attr('label/text', 'Polygon');
       polygon.attr('body/fill', '#30d0c6');
       polygon.attr('body/fillOpacity', 0.5);
       polygon.attr('body/refPoints', '0,10 10,0 20,10 10,20');
       polygon.addTo(this.graph);
       
       var diamond = new shapes.basic.Path({
        size: { width: 150, height: 70 },
        position: { x: 140, y: 125 },
        attrs: {
            path: { d: 'M 50 0 L 0 20 0 80 50 100 100 80 100 20 z', transform: 'rotate(90)'},
            
            text: {text: 'TASK' }
        }
    });
       //var rotatedLine = V.transformLine(diamond, V.createSVGMatrix().rotate(45));
       diamond.addTo(this.graph);

        var r2 = new shapes.basic.Circle({
            position: { x: 40, y: 25 },
            size: { width: 50, height: 40 },
            attrs: { rect: { fill: '#F1C40F' }, text: { text: 'Child' }}
        });
        var r3 = new shapes.basic.Circle({
            position: { x: 110, y: 60 },
            size: { width: 50, height: 40 },
            attrs: { rect: { fill: '#9B59B6' }, text: { text: 'Child' }}
        });
        var r1 = new shapes.standard.Ellipse();
        r1.resize(250, 150);
        r1.position(20, 20);
        r1.attr('root/tabindex', 3);
        r1.attr('root/title', 'joint.shapes.standard.Ellipse');
        r1.attr('body/fill', '#30d0c6');
        r1.attr('body/fillOpacity', 0.5);
        r1.attr('strokeDasharray', 2 );
        r1.attr('label/text', 'role');
        r1.addTo(this.graph);

        r1.embed(r2);
        r1.embed(r3);
        this.graph.addCells([r1, r2, r3]);
        this.graph.on('change:size', function(cell, newPosition, opt) {
    
            if (opt.skipParentHandler) return;
    
            if (cell.get('Embeds') && cell.get('Embeds').length) {
                // If we're manipulating a parent element, let's store
                // it's original size to a special property so that
                // we can shrink the parent element back while manipulating
                // its children.
                cell.set('originalSize', cell.get('size'));
            }
        });
    
        this.graph.on('change:position', function(cell, newPosition, opt) {
    
            if (opt.skipParentHandler) return;
    
            if (cell.get('Embeds') && cell.get('Embeds').length) {
                // If we're manipulating a parent element, let's store
                // it's original position to a special property so that
                // we can shrink the parent element back while manipulating
                // its children.
                cell.set('originalPosition', cell.get('Position'));
            }
    
            var parentId = cell.get('Parent');
            if (!parentId) return;
    
            var parent = this.graph.getCell(parentId);
            if (!parent.get('originalPosition')) parent.set('originalPosition', parent.get('Position'));
            if (!parent.get('originalSize')) parent.set('originalSize', parent.get('Size')); 
           
            var originalPosition = parent.get('originalPosition');
            var originalSize = parent.get('originalSize');
    
            var newX = originalPosition.x;
            var newY = originalPosition.y;
            var newCornerX = originalPosition.x + originalSize.width;
            var newCornerY = originalPosition.y + originalSize.height;
    
            _.each(parent.getEmbeddedCells(), function(Child) {
    
                var childBbox = Child.getBBox();
    
                if (childBbox.x < newX) { newX = childBbox.x; }
                if (childBbox.y < newY) { newY = childBbox.y; }
                if (childBbox.corner().x > newCornerX) { newCornerX = childBbox.corner().x; }
                if (childBbox.corner().y > newCornerY) { newCornerY = childBbox.corner().y; }
            
                return;
            });
    
            // Note that we also pass a flag so that we know we shouldn't adjust the
            // `originalPosition` and `originalSize` in our handlers as a reaction
            // on the following `set()` call.
            parent.set({
                position: { x: newX, y: newY },
                size: { width: newCornerX - newX, height: newCornerY - newY }
            }, 
            { skipParentHandler: true });

        });


        /**    var r1 = new shapes.basic.Rect({
            position: { x: 20, y: 20 },
            size: { width: 250, height: 150 },
        });
        r1.attr({
            rect: { fill: '#2C3E50', rx: 25, ry: 25, 'stroke-width': 1, stroke: 'black', 'strokeDasharray': 2 },
            text: {
                text: 'my label', fill: '#3498DB',
                'font-size': 18, 'font-weight': 'bold', 'font-variant': 'small-caps', 'text-transform': 'capitalize'
            }
        });

        var r2 = new shapes.basic.Rect({
            position: { x: 40, y: 25 },
            size: { width: 50, height: 40 },
            attrs: { rect: { fill: '#F1C40F' }, text: { text: 'Child' }}
        });
        var r3 = new shapes.basic.Rect({
            position: { x: 110, y: 60 },
            size: { width: 50, height: 40 },
            attrs: { rect: { fill: '#9B59B6' }, text: { text: 'Child' }}
        });
    
        r1.embed(r2);
        r1.embed(r3);
        this.graph.addCells([r1, r2, r3]);
        this.graph.on('change:size', function(cell, newPosition, opt) {
    
            if (opt.skipParentHandler) return;
    
            if (cell.get('Embeds') && cell.get('Embeds').length) {
                // If we're manipulating a parent element, let's store
                // it's original size to a special property so that
                // we can shrink the parent element back while manipulating
                // its children.
                cell.set('originalSize', cell.get('size'));
            }
        });
    
        this.graph.on('change:position', function(cell, newPosition, opt) {
    
            if (opt.skipParentHandler) return;
    
            if (cell.get('Embeds') && cell.get('Embeds').length) {
                // If we're manipulating a parent element, let's store
                // it's original position to a special property so that
                // we can shrink the parent element back while manipulating
                // its children.
                cell.set('originalPosition', cell.get('Position'));
            }
    
            var parentId = cell.get('Parent');
            if (!parentId) return;
    
            var parent = this.graph.getCell(parentId);
            if (!parent.get('originalPosition')) parent.set('originalPosition', parent.get('Position'));
            if (!parent.get('originalSize')) parent.set('originalSize', parent.get('Size')); 
           
            var originalPosition = parent.get('originalPosition');
            var originalSize = parent.get('originalSize');
    
            var newX = originalPosition.x;
            var newY = originalPosition.y;
            var newCornerX = originalPosition.x + originalSize.width;
            var newCornerY = originalPosition.y + originalSize.height;
    
            _.each(parent.getEmbeddedCells(), function(Child) {
    
                var childBbox = Child.getBBox();
    
                if (childBbox.x < newX) { newX = childBbox.x; }
                if (childBbox.y < newY) { newY = childBbox.y; }
                if (childBbox.corner().x > newCornerX) { newCornerX = childBbox.corner().x; }
                if (childBbox.corner().y > newCornerY) { newCornerY = childBbox.corner().y; }
            
                return;
            });
    
            // Note that we also pass a flag so that we know we shouldn't adjust the
            // `originalPosition` and `originalSize` in our handlers as a reaction
            // on the following `set()` call.
            parent.set({
                position: { x: newX, y: newY },
                size: { width: newCornerX - newX, height: newCornerY - newY }
            }, 
            { skipParentHandler: true });

        }); */

}  

   


    componentWillReceiveProps(newProps) {
        const { uploadedObject, jsonExportClicked, exportJSON } = newProps;
        if(jsonExportClicked) exportJSON(this.graph.toJSON());
        if(uploadedObject.cells) this.graph.fromJSON(uploadedObject);
    }


    render(){
        return(
            <div ref="playground" id="playground">
            </div>
        );
    }

}
export default Playground;