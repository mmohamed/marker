import '../App.css';
import Panel from '../component/editor/Panel'
import Point from '../component/Point'
import Notification from '../component/common/Notification';
import React from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import PointData from '../data/PointData';
import HistoryService from '../service/HistoryService';

class MainView extends React.Component {

  constructor(props) {
    super(props);
 
    this.state = {
      points: [], 
      ai: 1,
      current: null,
      background: '',
      canUndo: false,
      canRedo: false
    };
    
    this.panel = React.createRef();  
    this.errorViewer = React.createRef(); 
    this.infoViewer = React.createRef(); 

    this.historyService = new HistoryService(localStorage);
  }

  UNDO_KEY = 90;
  REDO_KEY = 89;
  SAVE_KEY = 83;

  handleKeyDown = (event) => {     
    if (event.ctrlKey || event.metaKey) {
      switch (String.fromCharCode(event.which).toLowerCase()) {
      case 's':
          event.preventDefault();
          this.panel.current.handleExecuteSave();
          break;
      case 'z':
          event.preventDefault();
          this.undo();
          break;
      case 'y':
          event.preventDefault();
          this.redo();
          break;
      default:
        break;
      }
    }
  }

  componentDidMount() {
    let last = this.historyService.load();
    if(last){
      this.setState(last, () => {
        this.panel.current.handleSelectPoint(this.getPointById(this.state.current));
        this.updateUndoRedoAbility();
      });
    }
    if(this.historyService.getBackground()){
      this.setState({background: this.historyService.getBackground()});
    }    
    document.addEventListener('keydown', this.handleKeyDown);    
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  get = () => {
    return {ai: this.state.ai, background: this.state.background, points: this.state.points, current: this.state.current}
  }

  load = (background , ai , points) => {
    this.clear(() => {
      this.setState({
        ai: ai, points: points, current: '', background: background
      }, this.addHistory);
    });      
  }

  undo = () => {
    let history = this.historyService.undo();
    if(!history){
      return;
    }    
    // clear for deleteing point and recreating 
    this.setState({points: []}, () => {
      this.setState({ points: history.points, ai: history.ai, current: history.current }, () => {
        this.panel.current.handleSelectPoint(this.getPointById(this.state.current));
        this.updateUndoRedoAbility();
      });
    });
  }

  redo = () => {
    let history = this.historyService.redo();
    if(!history){
      return;
    } 
    // clear for deleteing point and recreating 
    this.setState({points: []}, () => {
      this.setState({ points: history.points, ai: history.ai, current: history.current }, () => {
        this.panel.current.handleSelectPoint(this.getPointById(this.state.current));
        this.updateUndoRedoAbility();
      });
    });
  }

  addHistory = () => {         
    // add history
    this.historyService.add(this.state.points, this.state.ai, this.state.current);          
    if(!this.historyService.save()){
      this.onError("Background is over size, please use one less 2Mb !");
    }
    this.updateUndoRedoAbility(); 
  }

  addHistoryBackground = () => {
    this.historyService.setBackground(this.state.background)    ;
    if(!this.historyService.save()){
      this.onError("Background is over size, please use one less 2Mb !");
    }
  }

  clearHistory = () => {
    this.historyService.clear();
    this.updateUndoRedoAbility();
  }

  updateUndoRedoAbility = () => {    
    this.setState({canUndo : this.historyService.canUndo(), canRedo: this.historyService.canRedo()}, () => {
      this.panel.current.setCanUndo(this.historyService.canUndo());
      this.panel.current.setCanRedo(this.historyService.canRedo());
    });
  }

  clear = (callback) => {
    this.setState({
      points: [], 
      ai: 1,
      current: null,
      background: 'none',
      error: null
    }, () => {
      this.clearHistory();
      this.panel.current.handleSelectPoint();
      if(callback && typeof callback === 'function'){
        callback();
      }
    });   
  }

  onClick = (id) => {
    this.setState( state => {
      let points = state.points.concat([]);
      let current = new PointData();
      for(let idx in points){
        points[idx].isSelected = points[idx].id === id;
        if(points[idx].isSelected){
          current = this.getPointById(points[idx].id);
        }
      }
      // load data into panel
      this.panel.current.handleSelectPoint(current);
      return {
        points: points,
        ai: state.ai,
        current: current.id
      };
    }, this.addHistory);
  }

  getPointById = (id) => {
    for(let idx in this.state.points){
      if(this.state.points[idx].id === id){
        return this.state.points[idx];
      }
    }
    return null;
  }

  onMove = (id, x, y) => {
    let point = this.getPointById(id); 
    if(point && point.x === x && point.y === y){
      return;
    }
    this.setState( state => {
      let points = state.points.concat([]);     
      for(let idx in points){
        if(points[idx].id === id){         
          points[idx].x = x;
          points[idx].y = y;
        }
      }    
      return {
        points: points
      };
    }, this.addHistory);
  }

  addPoint = () => {
    this.setState( state => {
      let points = state.points.concat(new PointData(state.ai));
      let ai = state.ai+1;
      return {
        points: points,
        ai: ai
      };
    }, this.addHistory);
  }

  deletePoint = () => {
    this.setState( state => {
      let points = state.points.concat([]);      
      for(let idx in points){
        if(points[idx].isSelected){
          points.splice(idx, 1);
          this.panel.current.handleSelectPoint();
          break;
        }
      }
      return {
        points: points,
        ai: state.ai,
        current: null
      };
    }, this.addHistory);
  }

  updateBackground = (image) => {
    this.setState({background: "url("+image+")"}, this.addHistoryBackground);    
  }

  savePoint = (newData) => {
    this.setState( state => {
      let points = state.points.concat([]);
      for(let idx in points){
        if(points[idx].id === newData.id){
          points[idx].title = newData.title;
          points[idx].content = newData.content;
          points[idx].logo = newData.logo;
          points[idx].links = newData.links;
        }
      }
      return {
        points: points,
        ai: state.ai
      };
    }, this.addHistory);
  }

  onError = (message) => {
    this.errorViewer.current.setMessage(message);
  }

  onSuccess = (message) => {
    this.infoViewer.current.setMessage(message);
  }

  render() {
    return (
      <>    

        <Notification type='Alert' title='Application important message !' priority={true} ref={this.errorViewer} />
        <Notification type='New' title='' ref={this.infoViewer} />

        <Container fluid style={{height: '100%'}}>

          <Row style={{height: '100%'}}>
            <Col md={9} className='editor'>
              <div id="container" className="container" style={{ backgroundImage: this.state.background }}>             
                {this.state.points.map(item => (
                  <Point id={item.id} key={item.id} onClick={this.onClick} data={item} onMove={this.onMove} />
                ))}                      
              </div>
            </Col>

            <Col md={3} className='panel'>      
              <Panel 
                addPoint={this.addPoint} 
                savePoint={this.savePoint} 
                deletePoint={this.deletePoint} 
                clear={this.clear} 
                updateBackground={this.updateBackground} 
                load={this.load}
                undo={this.undo}
                redo={this.redo}
                get={this.get}
                onError={this.onError}
                onSuccess={this.onSuccess}
              ref={this.panel} />            
            </Col>
          </Row>        
        </Container>
      </>
    )
  }
}

export default MainView;
