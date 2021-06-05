
class DataService {
    
    list(token: string, userUID: string, onSuccess: (data: object) => void, onError: (error: object) => void){
        let headers = new Headers();
        headers.append('Authorization', (token));
        // get user data
        let url = process.env.REACT_APP_API_URL_BASE+'/user/'+userUID+'/files';
        fetch(url, {headers: headers})
        .then((res) => {
            if(!res.ok){
             throw  new Error('');                
            }
            return res.json()
        }).then((data) => {
            onSuccess(data);
        }).catch((error) => {
            onError(error);
        });
    }

    save(token: string, userUID: string, content: object, currentFileID: string|null, onSuccess: (data: object) => void, onError: (error: object) => void){              
        let method = 'post';
        let url = process.env.REACT_APP_API_URL_BASE+'/user/'+userUID+'/files';
        if(currentFileID){
            method = 'put';
            url = url + '/' + currentFileID;
        }

        let headers = new Headers();        
        headers.append('Authorization', token);
        headers.append('Content-Type', 'application/json');
        
        fetch(url, {headers: headers, method: method, body: JSON.stringify(content)})
        .then((res) => {
            if(!res.ok){
             throw  new Error('');                
            }
            return res.json()
        }).then((data) => {
            onSuccess(data);                  
        }).catch((error) => {
            onError(error);
        });
    }

    delete(token: string, userUID: string, fileID: string, onSuccess: (data: object) => void, onError: (error: object) => void){              
        let method = 'delete';
        let url = process.env.REACT_APP_API_URL_BASE+'/user/'+userUID+'/files/'+fileID;

        let headers = new Headers();        
        headers.append('Authorization', token);
        headers.append('Content-Type', 'application/json');        

        fetch(url, {headers: headers, method: method})
        .then((res) => {
            if(!res.ok){
             throw  new Error('');                
            }
            return res.json()
        }).then((data) => {
            onSuccess(data);                 
        }).catch((error) => {
            onError(error);
        });
    }

    get(token: string, userUID: string, fileID: string, onSuccess: (data: object) => void, onError: (error: object) => void){
        let method = 'get';
        let url = process.env.REACT_APP_API_URL_BASE+'/user/'+userUID+'/files/'+fileID;

        let headers = new Headers();        
        headers.append('Authorization', token);
        headers.append('Content-Type', 'application/json'); 

        fetch(url, {headers: headers, method: method})
        .then((res) => {
            if(!res.ok){
             throw  new Error('');                
            }
            return res.json()
        })
        .then((data) => {
            onSuccess(data);                     
        }).catch((error) => {
            onError(error);
        });
    }

    view(fileID: string, onSuccess: (data: object) => void, onError: (error: object) => void){
        let method = 'get';
         let url = process.env.REACT_APP_API_URL_BASE+'/view/'+fileID;

        let headers = new Headers();        
        headers.append('Content-Type', 'application/json');    

        fetch(url, {headers: headers, method: method})
        .then((res) => {
            if(!res.ok){
             throw  new Error('');                
            }
            return res.json()
        }).then((data) => {
            onSuccess(data);                   
        }).catch((error) => {
            onError(error);
        });
    }
}

export default DataService;