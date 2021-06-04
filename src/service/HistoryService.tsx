import HistoriesData from "../data/HistoriesData";
import HistoryData from "../data/HistoryData";
import PointData from "../data/PointData";


class HistoryService{

    historiesData: HistoriesData;
    storage: Storage;
    historiesIndex: number;

    constructor(storage: Storage){
        this.historiesData = HistoriesData.init();        
        this.historiesIndex = 0;  
        this.storage = storage;
    }

    load(): HistoryData|null{
        let saved = this.storage.getItem('history');        
        if(saved){
            this.historiesData = HistoriesData.fromJSON(JSON.parse(saved));
            this.historiesIndex = this.historiesData.get().length-1;
        }

        let savedBackground = this.storage.getItem('history-background');
        if(savedBackground){
            this.historiesData.setBackground(savedBackground)
        }
        
        if(this.historiesData.last() != null){
            return this.historiesData.last();
        }
        return null;   
    }

    getBackground(): string{
        return this.historiesData.getBackground();
    }

    setBackground(background: string): void{
        this.historiesData.setBackground(background);
    }

    undo(): HistoryData|null{
        if(!this.canUndo()){
            return null;
        }    
        this.historiesIndex = this.historiesIndex - 1;

        let selectedHitory = this.historiesData.byIdx(this.historiesIndex);
        return HistoryData.fromJSON(JSON.parse(JSON.stringify(selectedHitory)));                
    }

    redo(): HistoryData|null{
        if(!this.canRedo()){
            return null;
        }
        this.historiesIndex = this.historiesIndex + 1;
        
        let selectedHitory = this.historiesData.byIdx(this.historiesIndex);
        return HistoryData.fromJSON(JSON.parse(JSON.stringify(selectedHitory)));      
    }

    canUndo(): boolean{
        return this.historiesIndex > 0
    }

    canRedo(): boolean{
        return this.historiesIndex < this.historiesData.get().length-1
    }

    add(points: Array<PointData>, ai: number, current: number): void{
        // not on top histories
        if(this.historiesIndex !== this.historiesData.get().length-1){             
            let historiesCopy = new HistoriesData();  
            for(let idx = 0; idx < this.historiesIndex+1; idx++){
                let historyDataCopy: HistoryData = HistoryData.fromJSON(JSON.parse(JSON.stringify(this.historiesData.byIdx(idx))));
                historiesCopy.add(historyDataCopy);
            }
            this.historiesData = historiesCopy;      
        }   
        
        this.historiesData.add(new HistoryData(points, ai, current));
        this.historiesIndex = this.historiesData.get().length-1;
    }

    save(): boolean{
        try{
            localStorage.setItem('history', JSON.stringify(this.historiesData.get()));    
            localStorage.setItem('history-background', this.historiesData.getBackground());
        }catch (error){
            return false;
        }
        return true;
    }

    clear(): boolean{
        this.historiesData = HistoriesData.init();  
        this.historiesIndex = 0;
        try{
            localStorage.removeItem('history');
            localStorage.removeItem('history-background');
        }catch (error){
            return false;
        }
        return true;
    }
}

export default HistoryService;