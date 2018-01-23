import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import registerServiceWorker from './registerServiceWorker';
// import { ShoppingListFactory, ShoppingListRepositoryPouchDB } from 'ibm-shopping-list-model';
import { ShoppingListFactory, ShoppingListRepositoryPouchDB } from 'ibm-shopping-list-model/dist/bundle.js';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import Credentials from './secret';

PouchDB.plugin(PouchDBFind);
const localDB = new PouchDB('shopping_list_react');
const remoteDB = new PouchDB(Credentials.cloudant_url);
const shoppingListFactory = new ShoppingListFactory();
const shoppingListRepository = new ShoppingListRepositoryPouchDB(localDB);

registerServiceWorker();
shoppingListRepository.ensureIndexes().then((response) => {
    ReactDOM.render(<App shoppingListFactory={shoppingListFactory} shoppingListRepository={shoppingListRepository} localDB={localDB} remoteDB={remoteDB} />, document.getElementById('root'));
}).catch( reason => {
    console.log("in put catch");
    console.log(reason) 
});