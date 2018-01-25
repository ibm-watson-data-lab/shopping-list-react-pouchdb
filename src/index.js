import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import registerServiceWorker from './registerServiceWorker';
import { ShoppingListFactory, ShoppingListRepositoryPouchDB } from 'ibm-shopping-list-model';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind); // install the pouchdb-find plugin
const localDB = new PouchDB('shopping_list_react');
let remoteDB = undefined;
// try to get remote database credentials from a file (use secret.js.template as an example)
// user can alternatively enter this connection string in the app by clicking the settings gear icon
try {
  let Credentials = require('./secret');
  if (Credentials.default.cloudant_url) {
    remoteDB = new PouchDB(Credentials.default.cloudant_url);
  }
}
catch (ex) {
  console.log('secret.js file missing; disabling remote sync.')
}
// these are framework-independent interfaces for working with lists and items in the list
const shoppingListFactory = new ShoppingListFactory();
const shoppingListRepository = new ShoppingListRepositoryPouchDB(localDB);

// key offline-first step - more info at https://developers.google.com/web/fundamentals/primers/service-workers/
registerServiceWorker(); 
// create the app with access to the helper interfaces, the local database store (PouchDB), and the remote one
shoppingListRepository.ensureIndexes().then((response) => {
    ReactDOM.render(<App shoppingListFactory={shoppingListFactory} shoppingListRepository={shoppingListRepository} localDB={localDB} remoteDB={remoteDB} />, document.getElementById('root'));
}).catch( reason => {
    console.log("in put catch");
    console.log(reason) 
});