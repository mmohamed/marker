import LinkData from './LinkData';

class PointData {

    id: number;
    title: string;
    content: string;
    logo: string;
    links: Array<LinkData>;
    x: number;
    y: number;
    isSelected: boolean;
                
    constructor(id: number, title = '', content = '', logo = '', links?: Array<LinkData>|null, x = 0, y = 0, isSelected = false){
        this.id = id;
        this.title = title;
        this.content = content;
        this.logo = logo;       
        this.x = x;
        this.y = y;
        this.isSelected = isSelected;

        this.links = links || [new LinkData(), new LinkData(), new LinkData()];
    }

    static fromJSON(json : any): PointData|null { 
        if(typeof json !== 'object' || json == null){
            return null;
        }
        // build link
        let linksData: Array<LinkData> = [];
        
        for(let i = 0; i++; i < 3){
            if(json.links && json.links[i]){
                let parsedLink = LinkData.fromJSON(json.links[i]);
                linksData.push(parsedLink ? parsedLink : new LinkData());
            }else{
                linksData.push(new LinkData());
            }            
        }
        // get point
        return new PointData(
            json.id,
            json.title,
            json.content,
            json.logo,
            linksData,
            json.x,
            json.y
        );
    }
  }
  
  export default PointData;