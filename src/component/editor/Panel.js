import 'bootstrap/dist/css/bootstrap.min.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import React from 'react';
import { Form, Button, Row, Col, InputGroup, Tabs, Tab, Modal, Overlay, Tooltip } from 'react-bootstrap';
import copy from 'copy-to-clipboard';
import User from './User'
import FileList from './FileList'
import PropTypes from 'prop-types';
import DataService from '../../service/DataService';
import LinkData from '../../data/LinkData';

class Panel extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            id: '' ,
            title: '', 
            logo: '',
            content: '',
            links: [new LinkData(), new LinkData(), new LinkData()],
            background: '',            
            canUndo: false,
            canRedo: false,
            canSave: false,
            currentFile: null,
            showSave: false,
            filename: '',
            cantExport: true,
            exportDone: false
        };

        this.handleNewPoint = this.handleNewPoint.bind(this);
        this.handleDeletePoint = this.handleDeletePoint.bind(this);
        this.handleSelectPoint = this.handleSelectPoint.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleClear = this.handleClear.bind(this);
        this.handleConfirmClear = this.handleConfirmClear.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleUserLoad = this.handleUserLoad.bind(this);

        this.pointForm = React.createRef(); 
        this.openModal = React.createRef();
        this.user = React.createRef();
        this.export = React.createRef();

        this.service = new DataService();
    }

    handleSave = () => {
        if(!this.state.canSave){
            return;
        }
        this.setState({showSave: true})
    }

    handleCancelSave = () => {
        this.setState({showSave: false, filename : this.state.currentFile ? this.state.currentFile.name : ''});
    }

    handleExecuteSave = async () => {
        if(this.state.filename === ''){
            return this.handleSave();
        }        

        let content = this.props.get();
        content['name'] =  this.state.filename;
        
        let token = await this.user.current.getToken();
        
        this.service.save(
            token,
            this.user.current.getUID(),
            content,
            this.state.currentFile ? this.state.currentFile.id : null,
            (data) => {
                if(data.status){
                    this.setState({currentFile: {id: data.message, name: this.state.filename}, cantExport: false }, () => {
                        this.handleCancelSave();
                        this.handleUserLoad(null, null, true);
                    });                    
                    this.user.current.setCurrentFilename(this.state.filename);
                    this.user.current.setCurrentFileSavedAt(new Date());
                    window.location.hash = window.btoa(data.message);  
                    this.props.onSuccess('File "'+this.state.filename+'" saved...');
                }else{
                    this.props.onError('Saving file error, please try again...');
                }    
            },
            (error) => {
                this.props.onError('Saving file error, please try again...');
            }
        );
    }

    handleDeleteFile = async (file) => {        
        if(!file || !file.id){
            return;
        }       

        let token = await this.user.current.getToken();

        this.service.delete(
            token,
            this.user.current.getUID(),
            file.id,
            (data) => {
                if(data.status){
                    if(this.state.currentFile.id === file.id){
                        this.setState({currentFile: null, filename: '', cantExport: true}, () => {
                            this.user.current.setCurrentFilename(null);
                            this.user.current.setCurrentFileSavedAt(null);
                            this.props.clear(() => {
                                window.location.hash = '';   
                            }); 
                        });
                        this.handleUserLoad();
                    }
                }else{
                    this.props.onError('Deleting file error, please try again...');
                }  
            },
            (error) => {
                this.props.onError('Deleting file error, please try again...');
            }
        );    
    }

    handleOpenFile = async (file) => {
        if(!file || !file.id){
            return;
        }
        let token = await this.user.current.getToken();

        this.service.get(
            token,
            this.user.current.getUID(),
            file.id,
            (data) => {
                if(data && this.props.load){    
                    this.props.load(data.background, data.ai, data.points);                    
                    this.setState({currentFile: {id: data.id, name: data.name}, filename: data.name, cantExport: false}, () => {
                        this.user.current.setCurrentFilename(this.state.filename);                        
                        this.user.current.setCurrentFileSavedAt(new Date(data.saved_at));                        
                    });
                    this.openModal.current.handleClose();
                    window.location.hash = window.btoa(file.id);
                    this.props.onSuccess('File "'+data.name+'" load :)');
                }else{
                    this.props.onError('Loading file error, please try again...');
                }    
            },
            (error) => {
                this.props.onError('Loading file error, please try again...');
            }
        );
    }

    handleOpen = async () => {
        this.openModal.current.handleShow();
    }

    handleUserLoad = async (userdata, token, ignoreHash) => {
        token = token ? token : await this.user.current.getToken();
        this.service.list(
            token,
            userdata ? userdata.uid : this.user.current.getUID(),
            (data) => {
                this.openModal.current.handleLoad(data);
                if(!ignoreHash && window.location.hash){
                    this.handleOpenFile({id:  window.atob(window.location.hash.substring(1))});
                }
            },
            (error) => {
                this.props.onError('Loading file list error, please try again...');
            }
        );
       
        this.setState({
            canOpen: true,
            canSave: true
        });
    }

    handleUserLogout = () => {
        this.handleConfirmClear();
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
        window.location.hash = '';  
        this.props.clear(() => {
            this.setState({currentFile: null, filename: '', cantExport: true}, () => {
                this.user.current.setCurrentFilename(null);
                this.user.current.setCurrentFileSavedAt(null);
            });             
        }); 
    }

    handleSelectPoint = (pointData) => {
        this.setState({
            id: pointData ? pointData.id : '', 
            title: pointData ? pointData.title : '', 
            logo: pointData ? pointData.logo : '',
            content: pointData ? pointData.content : '',
            links: pointData && pointData.links.length > 0 ? pointData.links : [new LinkData(), new LinkData(), new LinkData()]
        });
    }

    handleExport = () => {        
        copy(window.location.href.replace('#', 'share/'));
        this.setState({exportDone: true});
        setTimeout(() => {
            this.setState({exportDone: false});
        }, 3000);
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
                <FileList ref={this.openModal} onDelete={this.handleDeleteFile} onOpen={this.handleOpenFile} />                

                <User ref={this.user} onLoaded={this.handleUserLoad} onLogout={this.handleUserLogout}/>
                <hr/>
                
                <Form>
                    <Form.Row>
                        <Col><Button disabled={!this.state.canOpen} variant="outline-light" block size="sm" onClick={this.handleOpen}><i className="fa fa-folder-open"></i> Open</Button></Col>
                        <Col><Button disabled={!this.state.canSave} variant="outline-light" block size="sm" onClick={this.handleSave}><i className="fa fa-floppy-o"></i> Save</Button></Col>
                        <Col><Button disabled={!this.state.canUndo} variant="outline-light" block size="sm" onClick={this.handleUndo}><i className="fa fa-undo"></i> Undo</Button></Col>
                        <Col><Button disabled={!this.state.canRedo} variant="outline-light" block size="sm" onClick={this.handleRedo}><i className="fa fa-rotate-right"></i> Redo</Button></Col>
                    </Form.Row>
                    <Form.Row style={{marginTop: 10}}>
                        <Col><Button variant="primary" block size="sm" onClick={this.handleNewPoint}><i className="fa fa-plus-square"></i> New</Button></Col>
                        <Col><Button variant="warning" block size="sm" onClick={this.handleDeletePoint}><i className="fa fa-minus-square"></i> Delete</Button></Col>
                        <Col><Button variant="danger" block size="sm" onClick={this.handleClear}><i className="fa fa-trash"></i> Clear</Button></Col>
                        <Col>
                            <Button disabled={this.state.cantExport} ref={this.export} variant="success" block size="sm" onClick={this.handleExport}><i className="fa fa-share-square"></i> Export</Button>
                            <Overlay target={this.export.current} show={this.state.exportDone} placement="left">
                                <Tooltip>Schema URL copied to your clipboard</Tooltip>
                            </Overlay>
                        </Col>
                    </Form.Row>
                </Form>
                <hr/>
                
                <Form>
                    <Form.File onChange={e => this.handleBackgroundLoading(e)} id="background" label="Background image" custom/>
                </Form>
                <hr/>

                <Form ref={this.pointForm} className={this.state.id !== '' ? '' : 'd-none'}>
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

                <Modal show={this.state.showSave} onHide={this.handleCancelSave}>
                    <Modal.Header closeButton>
                        <Modal.Title>Saving...</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Control type="text" placeholder="File name" name="filename" value={this.state.filename} onChange={this.handleInputChange}/>
                        </Form>    
                    </Modal.Body>                    
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.handleExecuteSave}>Save</Button>
                        <Button variant="secondary" onClick={this.handleCancelSave}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

Panel.propTypes = {
    get: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    updateBackground: PropTypes.func.isRequired,
    undo: PropTypes.func.isRequired,
    redo: PropTypes.func.isRequired,
    clear: PropTypes.func.isRequired,    
    savePoint: PropTypes.func.isRequired,
    addPoint: PropTypes.func.isRequired,
    deletePoint: PropTypes.func.isRequired,
    load: PropTypes.func
}

export default Panel;