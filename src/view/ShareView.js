import React from 'react';
import { Button, Container, Col, Row } from 'react-bootstrap';
import ViewPoint from '../component/ViewPoint';
import DataService from '../service/DataService';

class ShareView extends React.Component{

    constructor(props) {
        super(props);
     
        this.state = {
          points: [],        
          background: '',
          darkMode: this.props.location.search === '?dark',
          canEdit: false
        };

        this.service = new DataService();
    }

    componentDidMount() {
        try {
            this.service.view(
                window.atob(this.props.match.params.id),
                (data) => {
                    if(data && data.id){                    
                        this.setState({id: data.id, background: data.background, points: data.points}, () => {
                        });                    
                    }else{
                        console.debug('Loading file error, please try again...');
                    }                   
                },
                (error) => {
                    console.debug('Loading file error, please try again...1');
                }
            );            
        }catch{
            console.debug('Loading file error, please try again...2');
        }        
    }

    handleClick = () => {
        this.props.history.push("/#"+this.props.match.params.id);
    }

    render() {
        return (
            <Container fluid style={{height: '100%'}}>
                <div onMouseEnter={() => {this.setState({canEdit : true})}} onMouseLeave={() => {this.setState({canEdit : false})}} id="container-view" className="container" style={{ backgroundImage: this.state.background, backgroundColor : this.state.darkMode ? 'rgb(60,60,60)' : '' }}>             
                    {this.state.points.map(item => (
                    <ViewPoint id={item.id} key={item.id} data={item} />
                    ))}
                    <Row>
                        <Col md="10"></Col>
                        <Col md="2">
                            <Button 
                                variant="outline-primary" 
                                className={this.state.canEdit ? '' : 'd-none'} 
                                block 
                                size="lg" 
                                onClick={this.handleClick}>
                                    <i className="fa fa-edit"></i> Edit
                                </Button>
                        </Col>    
                    </Row>                     
                </div>
            </Container>)
    }
}


export default ShareView;