import React from 'react';
import Draggable from 'react-draggable';
import classNames from "classnames";
import { OverlayTrigger } from 'react-bootstrap';
import Tooltip from './Tooltip';
import PropTypes from 'prop-types';

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
        if(event.detail === 2){
            this.setState({
                show: true
            });
        }else{
            this.props.onClick(this.props.id);
        }
    }

    handleDrop = (event) => {
        if (!(event instanceof MouseEvent)){
            // valid event
            return;
        }
        let newX = event.layerX-event.offsetX;
        let newY = event.layerY-event.offsetY;
        if(Math.abs(newX-this.state.x) < 5 && Math.abs(newY-this.state.y) < 5){
            // ignore it, probably click move
            return;
        }
        this.props.onMove(this.props.id, newX, newY);       
        this.setState({
            x: newX, 
            y: newY
        });
    }

    handleMove = (event) => {
        this.handleOnMouseLeave();
    }

    handleOnMouseEnter = (event) => {
        if(this.props.showOnHover){
            this.setState({
                show: true
            });
        }
    }

    handleOnMouseLeave = (event) => {
        this.setState({
            show: false
        });
    }

    render(){
        let popover = (<Tooltip                 
                id={this.state.data.id}
                title={this.state.data.title}
                logo={this.state.data.logo}
                content={this.state.data.content}
                links={this.state.data.links}
            />       
        );
        return(                      
            <Draggable bounds="parent" onStop={this.handleDrop} onStart={this.handleMove} position={{x: this.state.x, y: this.state.y}}>                 
                <div onMouseEnter={this.handleOnMouseEnter} onMouseLeave={this.handleOnMouseLeave} onClick={this.handleClick} className={classNames("point", {selected: this.props.data.isSelected})}>
                    <OverlayTrigger trigger="" placement="auto" overlay={popover} show={this.state.show}><div>{this.props.id}</div></OverlayTrigger>
                </div>               
            </Draggable>         
        )
    }
}

Point.propTypes = {
    data : PropTypes.exact({
        x: PropTypes.number, 
        y: PropTypes.number, 
        title: PropTypes.string, 
        logo: PropTypes.string, 
        content: PropTypes.string, 
        id: PropTypes.number.isRequired,
        isSelected: PropTypes.bool,
        links: PropTypes.arrayOf(PropTypes.exact({
            label: PropTypes.string, 
            url: PropTypes.string
        }))
    }).isRequired,
    onClick: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    id: PropTypes.number.isRequired,
    showOnHover: PropTypes.bool
};

Point.defaultProps = {
    data: {
        x: 0, y: 0, title: '', logo: '', content: '', id: 0, links: []
    },
    showOnHover : false
};

export default Point;