import HistoryData from "./HistoryData";

class HistoriesData{

    histories: Array<HistoryData>;
    background: string;

    constructor(histories?: Array<HistoryData>, background = ''){
        this.histories = histories || [];
        this.background = background;
    }

    add(history: HistoryData): number{
        let copiedInstance: HistoryData = HistoryData.fromJSON(JSON.parse(JSON.stringify(history)));        
        this.histories.push(copiedInstance);
        return this.histories.length;
    }

    last(): HistoryData|null{
        if(this.isEmpty()){
            return null;
        }
        return this.histories[this.histories.length-1]
    }

    isEmpty(): boolean{
        return this.histories.length === 0;
    }

    get(): Array<HistoryData>{
        return this.histories;
    }

    getBackground(): string{
        return this.background;
    }

    setBackground(background: string): void{
        this.background = background;
    }

    byIdx(idx: number){
        return this.histories[idx]
    }

    static init(): HistoriesData{
        let instance: HistoriesData = new HistoriesData();
        instance.add(new HistoryData([]));
        return instance;
    }

    static fromJSON(json : any, background?: string): HistoriesData { 
        if(typeof json != 'object'){
            return new HistoriesData();
        }
        // build histories
        let historiesData: HistoriesData = new HistoriesData();

        for(let historyIdx in json){
            let parsedHistory = HistoryData.fromJSON(json[historyIdx]);
            if(parsedHistory){
                historiesData.add(parsedHistory);
            }    
        }
        if(background){
            historiesData.setBackground(background);
        }        
        // get history      
        return historiesData;  
    }    
}

export default HistoriesData;