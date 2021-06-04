import PointData from "./PointData";

class HistoryData{

    points: Array<PointData>;
    ai: number;
    current: number|null;

    constructor(points: Array<PointData>, ai = 1, current = 0){
        this.points = points;
        this.ai = ai;
        this.current = current;
    }

    static fromJSON(json : any): HistoryData { 
        if(typeof json !== 'object'){
            return new HistoryData([]);
        }
        // build points
        let pointsData: Array<PointData> = [];
        
        for(let pointIdx in json.points){
            let parsedPoint = PointData.fromJSON(json.points[pointIdx]);
            if(parsedPoint){
                pointsData.push(parsedPoint);
            }   
        }
        // get history
        return new HistoryData(
            pointsData,
            json.ai,
            json.current
        );
    }
}

export default HistoryData;