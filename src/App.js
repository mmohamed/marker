import './App.css';
import Panel from './Panel'
import Point from './Point'
import { Toast  } from 'react-bootstrap';
import React from 'react';

class PointData {
  constructor(id, title, content, logo, links, x, y, isSelected){
      this.id = id;
      this.title = title || '';
      this.content = content || '';
      this.logo = logo;
      this.links = links || [];
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
      error: null
    };

    this.histories = [];
    this.panel = React.createRef();
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
        this.panel.current.handleSelectPoint(this.state.current);
      });
    }    
  }

  addHistory = () => {
    this.histories.push({points: this.state.points, ai: this.state.ai, current: this.state.current});
    try{
      localStorage.setItem('history', JSON.stringify(this.histories));    
      localStorage.setItem('history-background', this.state.background);
    }catch (error){
      this.setToastMessage("Background is over size, please use one less 2Mb !");
    }    
  }

  clearHistory = () => {
    this.histories = [];
    localStorage.removeItem('history');
    localStorage.removeItem('history-background');
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
          current = points[idx];
        }
      }
      // load data into panel
      this.panel.current.handleSelectPoint(current);
      return {
        points: points,
        ai: state.ai,
        current: current
      };
    }, this.addHistory);
  }

  onMove = (id, x, y) => {
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
      const points = state.points.concat(new PointData(state.ai));
      const ai = state.ai+1;
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
          this.panel.current.handleSelectPoint(null);
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
          <Panel addPoint={this.addPoint} savePoint={this.savePoint} deletePoint={this.deletePoint} clear={this.clear} updateBackground={this.updateBackground} ref={this.panel} />  
        </div>        
      </>
    )
  }
}

export default App;
