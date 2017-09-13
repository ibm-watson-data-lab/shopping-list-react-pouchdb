import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import Credentials from './secret';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

PouchDB.plugin(PouchDBFind);
var localDB = new PouchDB('shopping_list_react');
var remoteDB = new PouchDB(Credentials.cloudant_url);

localDB = new PouchDB('shopping_list_react');
localDB.createIndex({ index: { fields: ['type'] }}).then((response) => {
    console.log("RESPONSE: " +JSON.stringify(response));
    return response;
}).then((indexresponse) => {
    ReactDOM.render(<App localDB={localDB} remoteDB={remoteDB} />, document.getElementById('root'));
    registerServiceWorker();
}).catch( reason => {
    console.log("in put catch");
    console.log(reason) 
});