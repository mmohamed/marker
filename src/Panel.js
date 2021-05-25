import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Form, Button, Row, Col, InputGroup  } from 'react-bootstrap';

class Panel extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            id: '' ,
            title: '', 
            logo: '',
            content: '',
            background: ''
        };

        this.handleNewPoint = this.handleNewPoint.bind(this);
        this.handleDeletePoint = this.handleDeletePoint.bind(this);
        this.handleSelectPoint = this.handleSelectPoint.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleClear = this.handleClear.bind(this);
    }
    
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
          [name]: value
        }, () => {
            this.props.savePoint(this.state);
        });
        
    }

    handleNewPoint(event) {
        event.preventDefault();
        this.props.addPoint();        
    }

    handleDeletePoint(event) {
        event.preventDefault();
        this.props.deletePoint();        
    }

    handleClear(event) {
        event.preventDefault();
        this.props.clear();        
    }

    handleSelectPoint(pointData) {
        this.setState({
            id: pointData ? pointData.id : '', 
            title: pointData ? pointData.title : '', 
            logo: pointData ? pointData.logo : '',
            content: pointData ? pointData.content : ''
        });
    }

    handleBackgroundLoading = async (event) => {
        let file = event.target.files[0];
        let base64 = await this.convertBase64(file);        
        this.props.updateBackground(base64);
        event.target.value = null;
    }

    convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
                resolve(fileReader.result);
            }
            fileReader.onerror = (error) => {
                reject(error);
            }
        });
    }

    render(){
        return(
            <>  
                <Form>
                    <Form.File onChange={e => this.handleBackgroundLoading(e)} id="background" label="Background image" custom/>
                </Form>
                <hr/>
                
                <Button variant="primary" type="button" onClick={this.handleNewPoint}>New point</Button>
                <Button variant="warning" type="button" onClick={this.handleDeletePoint}>Delete point</Button>                
                <Button variant="danger" type="button" onClick={this.handleClear}>Clear all</Button> 
                <hr/>

                <Form>
                    <Form.Group as={Row} controlId="id">
                        <Form.Label column sm="2">ID</Form.Label>
                        <Col sm="10">
                            <InputGroup>
                                <InputGroup.Prepend>
                                    <InputGroup.Text>#</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control type="text" readOnly value={this.state.id} name="id" />
                            </InputGroup>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="title">
                        <Form.Label column sm="2">Title</Form.Label>
                        <Col sm="10">
                            <Form.Control type="text" placeholder="Title" name="title" value={this.state.title} onChange={this.handleInputChange}/>
                            <Form.Text className="text-muted">
                                We'll never share your email with anyone else.
                            </Form.Text>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="logo">
                        <Form.Label column sm="2">Logo</Form.Label>
                        <Col sm="10">
                            <Form.Control type="text" placeholder="Logo" name="logo" value={this.state.logo} onChange={this.handleInputChange}/>
                            <Form.Text className="text-muted">
                                Logo public path or base64.
                            </Form.Text>
                        </Col>
                    </Form.Group>
                    
                    <Form.Group controlId="content">
                        <Form.Label>Content</Form.Label>
                        <Form.Control as="textarea" rows={3} name="content" onChange={this.handleInputChange} />
                    </Form.Group>

                    <Form.Group controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Check me out" onChange={this.handleInputChange} />
                    </Form.Group>                    
                </Form>

            </>
        )
    }
}

export default Panel;