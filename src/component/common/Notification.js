import React from 'react';
import { Toast, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

class Notification extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            message: null
        };
    }

    setMessage = (message) => {
        this.setState({message: message});
    }

    render(){
        return(                      
            <Toast 
                style={{position: 'absolute', bottom: '30px', left: '30px', zIndex: '999', minWidth: '300px'}}  
                onClose={() => this.setMessage(null)} 
                show={this.state.message != null} 
                delay={3000} autohide>
                <Toast.Header closeButton={false}>
                    <Badge pill variant={this.props.priority ? "danger" : "primary"}>
                        <i className="fa fa-flag"></i>
                        <strong style={{marginLeft: '5px'}} className="me-auto">{this.props.type}</strong>   
                    </Badge>                 
                    <small>{this.props.title}</small>
                </Toast.Header>
                <Toast.Body>{this.state.message}</Toast.Body>
            </Toast>      
        );
    }
}

Notification.propTypes = {
    type: PropTypes.string,
    title: PropTypes.string,
    priority: PropTypes.bool
};

Notification.defaultProps = {
    type: 'Notification',
    title: 'New application message !',
    priority: false
};

export default Notification;