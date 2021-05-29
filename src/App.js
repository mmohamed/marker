import './App.css';
import Panel from './Panel'
import Point from './Point'
import { Toast  } from 'react-bootstrap';
import React from 'react';

class PointData {
  constructor(id, title, content, logo, links, x, y, isSelected){
      this.id = id || '';
      this.title = title || '';
      this.content = content || '';
      this.logo = logo || '';
      this.links = links || [{label: '', url: ''}, {label: '', url: ''}, {label: '', url: ''}];
      this.x = x || 0;
      this.y = y || 0;
      this.isSelected = isSelected || false;
  }
}

class App extends React.Component {

  constructor(props) {
    super(props);
 
    this.state = {
      points: [], 
      ai: 1,
      current: null,
      background: '',
      error: null,
      canUndo: false,
      canRedo: false
    };

    this.histories = [{points: [], ai: 1, current: null, background: ''}];
    this.historiesIndex = 0;
    this.panel = React.createRef();  
  }

  UNDO_KEY = 90;
  REDO_KEY = 89;

  handleKeyDown = (event) => {    
    switch(event.keyCode) {
        case this.UNDO_KEY:   
          this.undo();           
          break;
        case this.REDO_KEY:              
          this.redo();
          break;
        default: 
          break;
    }
  }

  componentDidMount() {
    let saved = localStorage.getItem('history');
    if(saved){
      this.histories = JSON.parse(saved);
    }
    let restore = this.histories[this.histories.length-1];
    let savedBackground = localStorage.getItem('history-background');
    if(savedBackground){
      this.setState({background: savedBackground});
    }
    if(restore){
      this.setState(restore, () => {
        this.historiesIndex = this.histories.length-1;
        this.panel.current.handleSelectPoint(this.getPointById(this.state.current));
        this.updateUndoRedoAbility();
      });
    }        
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  undo = () => {
    if(this.historiesIndex === 0){
      return;
    }    
    this.historiesIndex = this.historiesIndex - 1;
    // clear for deleteing point and recreating 
    this.setState({points: []}, () => {
      let selectedHitory = this.histories[this.historiesIndex];
      let newState = { points: JSON.parse(JSON.stringify(selectedHitory.points)), 
        ai: selectedHitory.ai, 
        current: selectedHitory.current };
      this.setState(newState, () => {
        this.panel.current.handleSelectPoint(this.getPointById(this.state.current));
        this.updateUndoRedoAbility();
      });
    });
  }

  redo = () => {
    if(this.historiesIndex === this.histories.length-1){
      return;
    }
    this.historiesIndex = this.historiesIndex + 1;
    // clear for deleteing point and recreating 
    this.setState({points: []}, () => {
      let selectedHitory = this.histories[this.historiesIndex];
      let newState = { points: JSON.parse(JSON.stringify(selectedHitory.points)), 
        ai: selectedHitory.ai, 
        current: selectedHitory.current };
      this.setState(newState, () => {
        this.panel.current.handleSelectPoint(this.getPointById(this.state.current));
        this.updateUndoRedoAbility();
      });
    });
  }

  addHistory = () => {    
    // not on top histories
    if(this.historiesIndex !== this.histories.length-1){ 
      let historiesCopy = [];  
      for(let idx = 0; idx < this.historiesIndex+1; idx++){
        historiesCopy.push(JSON.parse(JSON.stringify(this.histories[idx])));
      }
      this.histories = historiesCopy;      
    }    
    // copy points
    let points = JSON.parse(JSON.stringify(this.state.points));  
    this.histories.push({points: points, ai: this.state.ai, current: this.state.current});
    this.historiesIndex = this.histories.length-1;    
    this.updateUndoRedoAbility();
    try{
      localStorage.setItem('history', JSON.stringify(this.histories));    
      localStorage.setItem('history-background', this.state.background);
    }catch (error){
      this.setToastMessage("Background is over size, please use one less 2Mb !");
    }  
  }

  clearHistory = () => {
    this.histories = [{points: [], ai: 1, current: null, background: ''}];
    this.historiesIndex = 0;
    this.updateUndoRedoAbility();
    localStorage.removeItem('history');
    localStorage.removeItem('history-background');
  }

  updateUndoRedoAbility = () => {    
    this.setState({canUndo : this.historiesIndex > 0, canRedo: this.historiesIndex < this.histories.length-1}, () => {
      this.panel.current.setCanUndo(this.historiesIndex > 0);
      this.panel.current.setCanRedo(this.historiesIndex < this.histories.length-1);
    });
  }

  clear = () => {
    this.setState({
      points: [], 
      ai: 1,
      current: null,
      background: 'none',
      error: null
    }, () => {
      this.clearHistory();
      this.panel.current.handleSelectPoint(new PointData());
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
          this.panel.current.handleSelectPoint(new PointData());
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
    this.setState({background: "url("+image+")"}, this.addHistory);    
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

  setToastMessage = (message) => {
    this.setState({error: message});
  }

  render() {
    return (
      <>
        <Toast style={{position: 'absolute', bottom: '30px', left: '30px'}}  onClose={() => this.setToastMessage(null)} show={this.state.error != null} delay={10000} autohide>
          <Toast.Header>
            <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt=""/>
            <strong className="mr-auto">Alert</strong>
            <small>Application important message !</small>
          </Toast.Header>
          <Toast.Body>{this.state.error}</Toast.Body>
        </Toast>

        <div id="container" className="container" style={{ backgroundImage: this.state.background }}>             
          {this.state.points.map(item => (
            <Point id={item.id} key={item.id} isSelected={item.isSelected} onClick={this.onClick} data={item} onMove={this.onMove} />
          ))}                      
        </div>
         
        <div className="panel">
          <Panel 
            addPoint={this.addPoint} 
            savePoint={this.savePoint} 
            deletePoint={this.deletePoint} 
            clear={this.clear} 
            updateBackground={this.updateBackground} 
            undo={this.undo}
            redo={this.redo}
          ref={this.panel} />  
        </div>        
      </>
    )
  }
}

export default App;
