import React from 'react';
import Draggable from 'react-draggable';
import classNames from "classnames";
import { Popover, OverlayTrigger, Image } from 'react-bootstrap';

class Point extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            x: props.data.x,
            y: props.data.y,
            data: props.data,
            show: false
        };

        this.handleClick = this.handleClick.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this);
        this.handleOnMouseLeave = this.handleOnMouseLeave.bind(this);
    }

    handleClick = (event) => {        
        this.props.onClick(this.props.id);
    }

    handleDrop = (event) => {
        this.props.onMove(this.props.id, event.layerX-event.offsetX, event.layerY-event.offsetY);
        this.setState({
            x: event.layerX-event.offsetX, 
            y: event.layerY-event.offsetY
        });
    }

    handleMove = (event) => {
        this.handleOnMouseLeave();
    }

    handleOnMouseEnter = (event) => {
        this.setState({
            show: true
        });
    }

    handleOnMouseLeave = (event) => {
        this.setState({
            show: false
        });
    }

    render(){
        let popover = (
        <Popover>
            <Popover.Title as="h3">{this.state.data.title ? this.state.data.title : 'No title for #'+this.state.data.id}</Popover.Title>
            <Popover.Content>
                {this.state.data.logo !== '' && 
                    <div>
                        <Image style={{mawWidth: 180, maxHeight: 180}} src={this.state.data.logo} fluid />
                    </div>
                }  
                <hr/>
                {this.state.data.content ? this.state.data.content : 'No content for #'+this.state.data.id}
                <hr/>
                <ul>
                {this.state.data.links.map((link, i) => {
                    if(link.url !== '' && link.label !== ''){
                        return (<li id={"link-view" + i}><a rel="noreferrer" target="_blank" href={link.url}>{link.label}</a></li>)
                    }
                    return '';
                })}
                </ul>
            </Popover.Content>
        </Popover>
        );
        return(                      
            <Draggable bounds="parent" onStop={this.handleDrop} onStart={this.handleMove} position={{x: this.state.x, y: this.state.y}}>                 
                <div onMouseEnter={this.handleOnMouseEnter} onMouseLeave={this.handleOnMouseLeave} onClick={this.handleClick} className={classNames("point", {selected: this.props.isSelected})}>
                    <OverlayTrigger trigger="" placement="auto" overlay={popover} show={this.state.show}><div>{this.props.id}</div></OverlayTrigger>
                </div>               
            </Draggable>         
        )
    }
}

export default Point;