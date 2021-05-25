import React from 'react';
import Draggable from 'react-draggable';
import classNames from "classnames";
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';

class Point extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            x: props.data.x,
            y: props.data.y,
            data: props.data
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
    }

    handleClick = (event) => {        
        this.props.onClick(this.props.id);
    }

    handleDrop = (event) => {
        console.debug(event);
        this.props.onMove(this.props.id, event.layerX-event.offsetX, event.layerY-event.offsetY);
    }

    render(){
        let title = this.state.data.title ? this.state.data.title : 'No title for #'+this.state.data.id;
        let content = this.state.data.content ? this.state.data.content : 'No content for #'+this.state.data.id;
        let popover = (
        <Popover>
            <Popover.Title as="h3">{title}</Popover.Title>
            <Popover.Content>{content}</Popover.Content>
        </Popover>
        );
        return(                      
            <Draggable bounds="parent" onStop={this.handleDrop} defaultPosition={{x: this.state.x, y: this.state.y}}>                 
                <div onClick={this.handleClick} className={classNames("point", {selected: this.props.isSelected})}>
                    <OverlayTrigger trigger="hover" placement="right" overlay={popover}><div>{this.props.id}</div></OverlayTrigger>
                </div>               
            </Draggable>         
        )
    }
}

export default Point;