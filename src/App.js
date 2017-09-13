import React from 'react';
import ShoppingLists from './components/ShoppingLists';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import {Card, CardTitle} from 'material-ui/Card';
import {blue600, grey900, white} from 'material-ui/styles/colors';
import cuid from 'cuid';

const muiTheme = getMuiTheme({
  palette: {
    textColor: grey900, 
    alternateTextColor: white, 
    primary1Color: blue600
  }
});

const appBarStyle = {
  backgroundColor: blue600, 
  width: "100%", 
  // padding: "8px", 
  // color: white
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shoppingLists: [], 
      shoppingListItems: [], 
      addingList: false, 
      newName: ''
    }
  }

  componentDidMount = () => {
      this.getShoppingLists();
      this.props.localDB.sync(this.props.remoteDB, {live: true, retry: true})
        .on('change', change => {
          console.log('something changed!');
          this.getPouchDocs();
        })
        // .on('paused', info => console.log('replication paused.'))
        // .on('active', info => console.log('replication resumed.'))
        .on('error', err => console.log('uh oh! an error occured.'));
  }

  getShoppingLists = () => {
      this.props.localDB.find({
          selector: {
              type: 'list'
          }
      }).then( response => {
          console.log('got shopping lists from PouchDB. count: '+response.docs.length);
          this.setState({
            view: "lists", 
            shoppingLists: response.docs.map(item => {return item}), 
            shoppingListItems: []
          });
      });
  }

  openShoppingList = (listId) => {
    this.props.localDB.find({
        selector: {
            type: 'item', 
            list: listId
        }
    }).then( response => {
        console.log('got shopping list items from PouchDB for: '+listId+', count='+response.docs.length);
        this.setState({
          view: "items", 
          shoppingLists: [],
          shoppingListItems: response.docs.map(item => {return item})
        });
    });
}

  // takes a shopping list ID and uses that 
  // to look up the document in the database and update it.
  updateShoppingList = (listid, name, deleteMe=false) => {
    console.log('In updateShoppingList with listid='+listid+', deleteMe='+deleteMe+', name='+name);
    if (deleteMe) {
      this.props.localDB.get(listid).then( (doc) => {
        let deletedoc = {
          '_id': doc._id, 
          '_rev': doc._rev, 
          '_deleted': true
        }
        return this.props.localDB.put(deletedoc);
      }).then( (result) => {
        this.getShoppingLists();
      });
    // create new list with name
    } else if ((typeof listid === 'undefined' || !listid) && typeof name !== 'undefined') {
      let doc = {
        _id: 'list:'+cuid(), 
        type: 'list', 
        checked: false,
        title: name
      };
      this.props.localDB.put(doc).then( (response) => {
        console.log("New list response: ");
        console.log(response);
        this.getShoppingLists();
      }).catch( (err) => {
        console.log(err)
      });
    // change the name of an existing list
    } else if (typeof listid !== 'undefined' && typeof name !== 'undefined') { 
      this.props.localDB.get(listid).then( (doc) => {
        doc.title = name;
        return this.props.localDB.put(doc);
      }).then( (result) => {
        this.getShoppingLists();
      });
    }
  }

  addShoppingList = () => {
    this.setState({addingList: true});
  }

  newShoppingList = (e) => {
    e.preventDefault();
    this.updateShoppingList(null, this.state.newName);
  }

  changeNewShoppingListName = (e) => {
    this.setState({newName: e.target.value});
  }

  showNewListUI = () => {
    return (
      <form onSubmit={this.newShoppingList}>
          <Paper>
            <TextField className="form-control" type="text" 
              hintText="Shopping list name..." 
              onChange={this.changeNewShoppingListName} 
              fullWidth={true} />
          </Paper>
      </form>
    );
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
      <div className="App">
        <AppBar title="Shopping Lists" 
                iconElementLeft={<span/>}
                iconClassNameRight="muidocs-icon-navigation-expand-more" 
                style={appBarStyle} />
      {this.state.addingList ? this.showNewListUI() : <span/>}
      {this.state.shoppingLists.length>0 ?
        <ShoppingLists 
          shoppingLists={this.state.shoppingLists} openListFunc={this.openShoppingList} updateFunc={this.updateShoppingList} /> 
          : <Card style={{margin:"12px 0"}}><CardTitle title="NO LISTS" /></Card>
      }
      <FloatingActionButton onClick={this.addShoppingList}>
          <ContentAdd />
      </FloatingActionButton>
      </div>
    </MuiThemeProvider>
    )
  }
}

export default App;