import React, { Component } from 'react';
import { Modal, Button, ListGroup, Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

class FileList extends Component {

    constructor(props) {
        super(props);

        this.state = { 
            show: false,
            files: []
        };        

        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleLoad = this.handleLoad.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleClose = () => this.setState({show: false});
    handleShow = () => this.setState({show: true});
    handleLoad = (data) => this.setState({files : data.concat([])});

    handleDelete = (file) => {
        if(this.props.onDelete){
            this.props.onDelete(file)
        }
    }

    handleOpen = (file) => {
        if(this.props.onOpen){
            this.props.onOpen(file)
        }
    }

    render() {
        return (
            <Modal show={this.state.show} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Your Workspace</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ListGroup variant="flush" style={{maxHeight: '300px', overflow: 'auto'}}>
                        {this.state.files.map((file) => {
                            return (<ListGroup.Item key={file.id}>                                
                                <Row>
                                    <Col md="8"><span>{file.name}</span></Col>
                                    <Col md="2"><Button variant="outline-primary" block size="sm" onClick={() => this.handleOpen(file)}><i className="fa fa-folder-open"></i></Button></Col>
                                    <Col md="2"><Button variant="outline-danger" block size="sm" onClick={() => this.handleDelete(file)}><i className="fa fa-trash"></i></Button></Col>                                
                                </Row>
                            </ListGroup.Item>)
                        })}
                    </ListGroup>
                </Modal.Body>
                
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

FileList.propTypes = {
    onDelete: PropTypes.func,
    onOpen: PropTypes.func
}

export default FileList;