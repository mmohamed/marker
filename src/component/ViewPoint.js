import React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import Tooltip from './Tooltip';
import PropTypes from 'prop-types';

class ViewPoint extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            x: props.data.x,
            y: props.data.y,
            data: props.data,
            show: false
        };

        this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this);
        this.handleOnMouseLeave = this.handleOnMouseLeave.bind(this);
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
        let popover = (<Tooltip 
            view={true}
            id={this.state.data.id}
            title={this.state.data.title}
            logo={this.state.data.logo}
            content={this.state.data.content}
            links={this.state.data.links}
        />       
        );
        return(                                          
            <div 
                onMouseEnter={this.handleOnMouseEnter} 
                onMouseLeave={this.handleOnMouseLeave} 
                className={'point view'} 
                style={{transform: 'translate('+this.state.x+'px, '+this.state.y+'px)'}}
                >
                <OverlayTrigger trigger="" placement="auto" overlay={popover} show={this.state.show}><div> </div></OverlayTrigger>
            </div>                                   
        )
    }
}

ViewPoint.propTypes = {
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
    }).isRequired
};

ViewPoint.defaultProps = {
    data: {
        x: 0, y: 0, title: '', logo: '', content: '', id: 0, links: []
    }
};

export default ViewPoint;