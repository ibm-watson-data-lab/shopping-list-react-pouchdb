import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import registerServiceWorker from './registerServiceWorker';
// import { ShoppingListFactory, ShoppingListRepositoryPouchDB } from 'ibm-shopping-list-model';
import { ShoppingListFactory, ShoppingListRepositoryPouchDB } from 'ibm-shopping-list-model/dist/bundle.js';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('shopping_list_react');
let remoteDB = undefined;
try {
  let Credentials = require('./secret');
  if (Credentials.default.cloudant_url) {
    remoteDB = new PouchDB(Credentials.default.cloudant_url);
  }
}
catch (ex) {
  console.log('secret.js file missing; disabling remote sync.')
}
const shoppingListFactory = new ShoppingListFactory();
const shoppingListRepository = new ShoppingListRepositoryPouchDB(localDB);

registerServiceWorker();
shoppingListRepository.ensureIndexes().then((response) => {
    ReactDOM.render(<App shoppingListFactory={shoppingListFactory} shoppingListRepository={shoppingListRepository} localDB={localDB} remoteDB={remoteDB} />, document.getElementById('root'));
}).catch( reason => {
    console.log("in put catch");
    console.log(reason) 
});