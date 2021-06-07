from flask import Flask, json, request
from flask_cors import CORS
import sqlite3 as sl
import os
from datetime import datetime
from keycloak import KeycloakOpenID
from keycloak import exceptions

api = Flask(__name__)
CORS(api, resources={r"/*": {"origins": "*"}})
keycloakOpenid = None

@api.route('/view/<fid>', methods=['GET'])
def view(fid):  
    con = __connect()
    if not con:
        return __jsonServerErrorResponse()
    cur = con.cursor()
    cur.execute('SELECT saved_at, background, points FROM user_data WHERE id = ?', (fid))
    result = cur.fetchone()    
    con.close()

    if not result or len(result) == 0:
        return __jsonNotFoundResponse()

    return __jsonOKResponse({'id': fid, 'saved_at': result[0], 'background': result[1], 'points': json.loads(result[2])})


@api.route('/user/<uid>/files', methods=['GET'])
def liste(uid):
    if not __auth(request, uid):
        return __jsonNotAutorizedResponse()

    con = __connect()
    if not con:
        return __jsonServerErrorResponse()
    data = []
    cur = con.cursor()
    for row in cur.execute('SELECT id, name FROM user_data ORDER BY saved_at'):
        data.append({'id' : row[0], 'name': row[1]})
    con.close()

    return __jsonOKResponse(data)

@api.route('/user/<uid>/files/<fid>', methods=['GET'])
def get(uid, fid):  
    if not __auth(request, uid):
        return __jsonNotAutorizedResponse()

    con = __connect()
    if not con:
        return __jsonServerErrorResponse()
    cur = con.cursor()
    cur.execute('SELECT name, ai, saved_at, background, points FROM user_data WHERE id = ? AND uid = ?', (fid, uid))
    result = cur.fetchone()    
    con.close()

    if not result or len(result) == 0:
        return __jsonNotFoundResponse()

    return __jsonOKResponse({'id': fid, 'uid': uid, 'name': result[0], 'ai': result[1], 'saved_at': result[2], 'background': result[3], 'points': json.loads(result[4])})

@api.route('/user/<uid>/files/<fid>', methods=['DELETE'])
def delete(uid, fid): 
    if not __auth(request, uid):
        return __jsonNotAutorizedResponse()

    con = __connect()
    if not con:
        return __jsonServerErrorResponse()        
    cur = con.cursor()
    cur.execute('DELETE FROM user_data WHERE uid = ? AND id = ?', (uid, fid))        
    con.commit()
    con.close()
    return __jsonOKResponse({'status': True, 'message': 'File deleted with ID : '+ str(uid) +'of User ID : '+str(fid)})

@api.route('/user/<uid>/files', methods=['POST'])
def create(uid):  
    if not __auth(request, uid):
        return __jsonNotAutorizedResponse()

    content = request.json
    con = __connect()
    if not con:
        return __jsonServerErrorResponse()
    now = datetime.now()        
    cur = con.cursor()
    cur.execute('INSERT INTO user_data (uid, name, ai, saved_at, background, points) VALUES (?, ?, ?, ?, ?, ?)', (uid, content['name'], content['ai'], now.isoformat(), content['background'], json.dumps(content['points'])))        
    con.commit()
    con.close()
    return __jsonOKResponse({'status': True, 'message': cur.lastrowid})

@api.route('/user/<uid>/files/<fid>', methods=['PUT'])
def update(uid, fid):  
    if not __auth(request, uid):
        return __jsonNotAutorizedResponse()

    content = request.json
    con = __connect()
    if not con:
        return __jsonServerErrorResponse()
    now = datetime.now()        
    cur = con.cursor()     
    cur.execute('UPDATE user_data SET name = ? , ai = ?, saved_at = ? , background = ? , points = ? WHERE uid = ? AND id = ?', (content['name'], content['ai'], now.isoformat(), content['background'], json.dumps(content['points']), uid, fid))        
    con.commit()
    con.close()
    return __jsonOKResponse({'status': cur.rowcount == 1, 'message': fid})

def __jsonOKResponse(data):
    return api.response_class(
        response=json.dumps(data),
        status=200,
        mimetype='application/json'
    )

def __jsonServerErrorResponse():
    return api.response_class(
        response=json.dumps({'message': 'Internal error' , 'code': 500}),
        status=500,
        mimetype='application/json'
    )

def __jsonNotFoundResponse():
    return api.response_class(
        response=json.dumps({'message': 'Not found' , 'code': 404}),
        status=404,
        mimetype='application/json'
    )

def __jsonNotAutorizedResponse():    
    return api.response_class(
        response=json.dumps({'message': 'Not Authorized' , 'code': 403}),
        status=403,
        mimetype='application/json'
    )

def __connect():
    try:
        con = sl.connect('jsapp.db')
        if not con:
            return None
        return con
    except RuntimeError as e:
        return None

def __startup():
    dbpath = 'jsapp.db'
    if 'DB_PATH' in os.environ:
        dbpath = os.environ['DB_PATH']

    con = sl.connect(dbpath)
    if not con:
        raise SystemExit('Unable to intitialise embedded db connection !')

    con.execute("""
        CREATE TABLE IF NOT EXISTS user_data (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            uid TEXT NOT NULL,
            name TEXT NOT NULL,
            saved_at TEXT NOT NULL,
            background TEXT,
            ai INTEGER DEFAULT 0,
            points TEXT
        );
    """)        
    print('Embedded DB ['+ dbpath +'] initialised...')
    con.close()

    global keycloakOpenid
    keycloakOpenid = KeycloakOpenID(
        server_url="http://localhost:8080/auth/",
        client_id="js-app",
        realm_name="master"
    )
    print('KeyCloak Client initialised...')

def __auth(request, uid):
    token = request.headers.get('Authorization')
    if not token:
        return False
    try:       
        userinfo = keycloakOpenid.userinfo(token)        
        if not userinfo:
            return False
        return uid == userinfo['sub']
    except exceptions.KeycloakAuthenticationError as error:
        return False
    return True

if __name__ == '__main__':
    __startup()
    api.run(host='0.0.0.0', debug=True)