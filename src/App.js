import React from 'react';
import { ShoppingListFactory, ShoppingListRepositoryPouchDB } from 'ibm-shopping-list-model';
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

const NOLISTMSG = "Click the + sign below to create a shopping list."

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

  //TODO work on this
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

  //TODO work on this
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

  deleteShoppingList = (listid) => {
    this.props.shoppingListRepository.get(listid).then(shoppingList => {
      shoppingList = shoppingList.set("_deleted", true);
      return this.props.shoppingListRepository.put(shoppingList);
    }).then(result => {
      this.getShoppingLists();
    });
  }

  renameShoppingList = (listid, newname) => {
    this.props.shoppingListRepository.get(listid).then(shoppingList => {
      shoppingList = shoppingList.set('title', newname);
      return this.props.shoppingListRepository.put(shoppingList);
    }).then(this.getShoppingLists);
  }

  createNewShoppingList = (e) => {
    e.preventDefault();
    this.setState({addingList: false});
    let shoppingList = this.props.shoppingListFactory.newShoppingList({
      title: this.state.newName
    });
    this.props.shoppingListRepository.post(shoppingList).then(this.getShoppingLists);
  }

  updateNewShoppingListName = (e) => {
    this.setState({newName: e.target.value});
  }

  displayNewShoppingListUI = () => {
    this.setState({addingList: true});
  }

  renderNewShoppingListUI = () => {
    return (
      <form onSubmit={this.createNewShoppingList}>
          <Paper>
            <TextField className="form-control" type="text" 
              hintText="Shopping list name..." 
              onChange={this.updateNewShoppingListName} 
              fullWidth={true} />
          </Paper>
      </form>
    );
  }

  render() {
    console.log("IN RENDER");
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
      <div className="App">
        <AppBar title="Shopping Lists" 
                iconElementLeft={<span/>}
                iconClassNameRight="muidocs-icon-navigation-expand-more" 
                style={appBarStyle} />
      {this.state.addingList ? this.renderNewShoppingListUI() : <span/>}
      {this.state.shoppingLists.length>0 ?
        <ShoppingLists 
          shoppingLists={this.state.shoppingLists} openListFunc={this.openShoppingList} deleteFunc={this.deleteShoppingList} /> 
          : <Card style={{margin:"12px 0"}}><CardTitle title={NOLISTMSG} /></Card>
      }
      <FloatingActionButton onClick={this.displayNewShoppingListUI}>
          <ContentAdd />
      </FloatingActionButton>
      </div>
    </MuiThemeProvider>
    )
  }
}

export default App;