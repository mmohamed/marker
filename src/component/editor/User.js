import React, { Component } from 'react';
import { Row, Col, Spinner, Button } from 'react-bootstrap';
import Keycloak from 'keycloak-js';
import PropTypes from 'prop-types';
import { confirmAlert } from 'react-confirm-alert';
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

class User extends Component {

    constructor(props) {
        super(props);

        this.state = { 
            keycloak: null, 
            authenticated: false,
            username: '',
            uid: '',
            currentFileSavedAt: null,
            currentFilename: 'not saved yet ...'
        };   

        TimeAgo.addLocale(en);    
        
        this.getToken = this.getToken.bind(this);
    }

    componentDidMount() {
        const keycloak = Keycloak({
            url: process.env.REACT_APP_KEYCLOAK_URL,
            realm: process.env.REACT_APP_KEYCLOAK_REALM,
            clientId: process.env.REACT_APP_KEYCLOAK_APP
        });

        keycloak.init({onLoad: 'login-required'}).then(authenticated => {
            this.setState({ keycloak: keycloak, authenticated: authenticated });
            
            this.state.keycloak.loadUserInfo().then(userInfo => {
                this.setState({ username: userInfo.preferred_username, uid: userInfo.sub});
                // on load event
                if(typeof this.props.onLoaded === 'function'){
                    this.props.onLoaded({ username: userInfo.preferred_username, uid: userInfo.sub}, keycloak.token);
                }                
            });
        });
    }

    getToken() {
        if(!this.state.keycloak.isTokenExpired()){
            return this.state.keycloak.token;
        }
        let kc = this.state.keycloak;
        let that = this;
        return kc.updateToken(30).then(function(){
            that.setState({keycloak : kc});
            return kc.token;
        }).catch(function(e) {
            return null;
        });
    }

    getUID() {
        return this.state.uid;
    }
    
    setCurrentFilename(currentFilename) {
        if(!currentFilename){
            currentFilename = 'not saved yet ...';
        }
        this.setState({currentFilename: currentFilename});
    }

    setCurrentFileSavedAt(currentFileSavedAt) {
        this.setState({currentFileSavedAt: currentFileSavedAt});
    }

    handleLogout = (event) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h1>Are you sure to logout?</h1>
                        <button onClick={onClose}>No</button>
                        <button
                        onClick={() => {
                            this.handleLogoutClear();
                            onClose();
                        }}
                        >
                        Yes
                        </button>
                    </div>
                );
            }
        });               
    }

    handleLogoutClear = () => {
        if(typeof this.props.onLogout === 'function'){
            this.props.onLogout();                        
        }
        this.state.keycloak.logout();
    }

    render() {
        let timing = this.state.currentFileSavedAt ? (<> - <ReactTimeAgo date={this.state.currentFileSavedAt} locale="en" /></>) : null;
        if(this.state.keycloak) {
            if(this.state.authenticated) return (
                <Row>
                    <Col md={2}>
                        <Button 
                            variant="primary" 
                            className="btn-circle btn-md" 
                            style={{fontSize: '15px', fontWeight: 'bold'}} 
                            onClick={ () => this.handleLogout() }
                        >{this.state.username.substr(0, 2).toUpperCase()}</Button>
                    </Col>
                    <Col md={10} style={{ lineHeight: '25px'}}>
                        Welcome {this.state.username} 
                        <div style={{fontSize: '10px', opacity: '0.7'}}>{this.state.currentFilename}{timing}</div> 
                    </Col>
                </Row>
            ); else return (<div>Unable to authenticate!</div>)
        }
        
        return (
            <Row>
                <Col md={2}>
                    <Spinner animation="border" variant="primary" />
                </Col>
                <Col md={10} style={{ lineHeight: '32px'}}>
                    <span >Initializing Keycloak..</span>
                </Col>
            </Row>
        );
    }
}

User.propTypes = {
    onLoaded: PropTypes.func,
    onLogout: PropTypes.func
}

export default User;