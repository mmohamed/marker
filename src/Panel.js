import 'bootstrap/dist/css/bootstrap.min.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import React from 'react';
import { Form, Button, Row, Col, InputGroup, Tabs, Tab } from 'react-bootstrap';

class Panel extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            id: '' ,
            title: '', 
            logo: '',
            content: '',
            links: [{label: '', url: ''}, {label: '', url: ''}, {label: '', url: ''}],
            background: '',            
            canUndo: false,
            canRedo: false
        };

        this.handleNewPoint = this.handleNewPoint.bind(this);
        this.handleDeletePoint = this.handleDeletePoint.bind(this);
        this.handleSelectPoint = this.handleSelectPoint.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleClear = this.handleClear.bind(this);
        this.handleConfirmClear = this.handleConfirmClear.bind(this);
    }

    setCanUndo = (status) => {
        this.setState({canUndo: status});
    }

    setCanRedo = (status) => {
        this.setState({canRedo: status});
    }
    
    handleInputChange = (event) => {       
        let target = event.target;
        let value = target.type === 'checkbox' ? target.checked : target.value;
        let name = target.name;
        var regex = new RegExp('link\\[([0-9]+)\\]\\.(\\w+)', 'gm');
        var result = regex.exec(name);
        if(result != null){
            let originalValue = value;
            value = this.state.links.concat([]);
            value[result[1]][result[2]] = originalValue;   
            name = 'links';         
        }
        this.setState({
          [name]: value
        }, () => {
            this.props.savePoint(this.state);
        });        
    }

    handleNewPoint = (event) => {
        event.preventDefault();
        this.props.addPoint();        
    }

    handleDeletePoint = (event) => {
        event.preventDefault();
        this.props.deletePoint();        
    }

    handleClear = (event) => {
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h1>Are you sure?</h1>
                        <p>You want to delete all points and background ?</p>
                        <button onClick={onClose}>No</button>
                        <button
                        onClick={() => {
                            this.handleConfirmClear();
                            onClose();
                        }}
                        >
                        Yes, Delete it!
                        </button>
                    </div>
                );
            }
        });               
    }

    handleConfirmClear = () => {
        this.props.clear(); 
    }

    handleSelectPoint = (pointData) => {
        this.setState({
            id: pointData ? pointData.id : '', 
            title: pointData ? pointData.title : '', 
            logo: pointData ? pointData.logo : '',
            content: pointData ? pointData.content : '',
            links: pointData && pointData.links.length > 0 ? pointData.links : [{label: '', url: ''}, {label: '', url: ''}, {label: '', url: ''}]
        });
    }

    handleExport = () => {
        alert('export');
    }

    handleUndo = () => {
        if(this.state.canUndo){
            this.props.undo();
        }        
    }

    handleRedo = () => {
        if(this.state.canRedo){
            this.props.redo();
        }
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
                
                <Form>
                    <Form.Row>
                        <Col><Button disabled={!this.state.canUndo} variant="outline-light" block size="sm" onClick={this.handleUndo}><i className="fa fa-undo"></i> Undo</Button></Col>
                        <Col><Button disabled={!this.state.canRedo} variant="outline-light" block size="sm" onClick={this.handleRedo}><i className="fa fa-rotate-right"></i> Redo</Button></Col>
                    </Form.Row>
                    <hr/>
                    <Form.Row style={{marginBottom: 5}}>
                        <Col><Button variant="primary" block size="sm" onClick={this.handleNewPoint}><i className="fa fa-plus-square"></i> New point</Button></Col>
                        <Col><Button variant="warning" block size="sm" onClick={this.handleDeletePoint}><i className="fa fa-minus-square"></i> Delete point</Button></Col>
                    </Form.Row>
                    <Form.Row>
                    </Form.Row>
                    <Form.Row>
                        <Col><Button variant="danger" block size="sm" onClick={this.handleClear}><i className="fa fa-trash"></i> Clear all</Button></Col>
                        <Col><Button variant="success" block size="sm" onClick={this.handleExport}><i className="fa fa-share-square"></i> export</Button></Col>
                    </Form.Row>
                </Form>
                
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
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="logo">
                        <Form.Label column sm="2">Logo</Form.Label>
                        <Col sm="10">
                            <Form.Control type="text" placeholder="Logo" name="logo" value={this.state.logo} onChange={this.handleInputChange}/>
                            <Form.Text>
                                Logo public path or base64.
                            </Form.Text>
                        </Col>
                    </Form.Group>
                    
                    <Form.Group controlId="content">
                        <Form.Label>Content</Form.Label>
                        <Form.Control as="textarea" rows={3} name="content" value={this.state.content} onChange={this.handleInputChange} />
                    </Form.Group>
                    
                    <Tabs defaultActiveKey="Link#1" variant="pills">                        
                        {this.state.links.map((link, i) => {
                            return (
                                <Tab key={i} style={{marginTop: 10}} eventKey={"Link#"+ (i+1)} title={"Link #" + (i+1) }>
                                    <Form.Group controlId={"link["+ i +"]#label"}>
                                        <Form.Control type="text" placeholder="Link text" name={"link["+ i + "].label"} value={link.label} onChange={this.handleInputChange}/>
                                    </Form.Group>
                                    <Form.Group controlId={"link["+ i +"]#url"}>
                                        <Form.Control type="text" placeholder="Link URL" name={"link["+ i + "].url"} value={link.url} onChange={this.handleInputChange}/>
                                    </Form.Group>
                                </Tab>
                            )
                        })}
                    </Tabs>                   
                </Form>

            </>
        )
    }
}

export default Panel;