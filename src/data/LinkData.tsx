
class LinkData{

    label: string;
    url: string;

    constructor(url = '', label = ''){
        this.url = url;
        this.label = label;
    }

    static fromJSON(json : any): LinkData|null { 
        if(typeof json !== 'object'){
            return null;
        }
        // get link
        return new LinkData(
            json.url,
            json.label
        );
    }
}

export default LinkData;