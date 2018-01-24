import React from 'react';
import {List} from 'immutable';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import {Card, CardTitle} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import KeyboardBackspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import {grey800, blueGrey500, pinkA100, white} from 'material-ui/styles/colors';

import PouchDB from 'pouchdb';
// import PouchDBFind from 'pouchdb-find';

import ShoppingLists from './components/ShoppingLists';
import ShoppingList from './components/ShoppingList';

if (process.env.VCAP_APP_PORT) {
  process.env.PORT = process.env.VCAP_APP_PORT;
}

const muiTheme = getMuiTheme({
  palette: {
    textColor: grey800, 
    alternateTextColor: white, 
    primary1Color: pinkA100,
    accent1Color: blueGrey500
  }
});

const appBarStyle = {
  backgroundColor: blueGrey500, 
  width: "100%", 
  // padding: "8px", 
  // color: white
};

const NOLISTMSG = "Click the + sign above to create a shopping list."
const NOITEMSMSG = "Click the + sign above to create a shopping list item."

class App extends React.Component {
  constructor(props) {
    super(props);
    this.remoteDB = props.remoteDB;

    this.state = {
      shoppingList: null, 
      shoppingLists: [], 
      totalShoppingListItemCount: List(), //Immutable.js List with list ids as keys
      checkedTotalShoppingListItemCount: List(), //Immutable.js List with list ids as keys
      shoppingListItems: null, 
      adding: false, 
      view: 'lists',
      newName: '',
      settingsOpen: false,
    }
  }

  componentDidMount = () => {
      this.getShoppingLists();
      if (this.remoteDB) {
        this.syncToRemote();
      }
  }

  syncToRemote = () => {
    this.props.localDB.sync(this.remoteDB, {live: true, retry: true})
    .on('change', change => {
      this.getPouchDocs();
    })
    // .on('paused', info => console.log('replication paused.'))
    // .on('active', info => console.log('replication resumed.'))
    .on('error', err => console.log('uh oh! an error occured while synching.'));
}

  getShoppingLists = () => {
    let checkedCount = List();
    let totalCount = List();
    let lists = null;
    this.props.shoppingListRepository.find().then( foundLists => {
      console.log('got Shopping Lists from PouchDB. count: '+foundLists.size);
      lists = foundLists;
      return foundLists;
    }).then( foundLists => {
      return this.props.shoppingListRepository.findItemsCountByList();
    }).then( countsList => { 
      console.log('TOTAL COUNT LIST');
      console.log(countsList);
      totalCount = countsList;
      return this.props.shoppingListRepository.findItemsCountByList({
        selector: {
          type: 'item', 
          checked: true
        },
        fields: ['list']
      });
    }).then( checkedList => {
      console.log('CHECKED LIST');
      console.log(checkedList);
      checkedCount = checkedList;
      this.setState({
        view: 'lists', 
        shoppingLists: lists, 
        shoppingList: null,
        shoppingListItems: null, 
        checkedTotalShoppingListItemCount: checkedCount, 
        totalShoppingListItemCount: totalCount
      });
    });
  }

  openShoppingList = (listid) => {
    this.props.shoppingListRepository.get(listid).then( list => {
      return list;
    }).then(list => {
      this.getShoppingListItems(listid).then(items => {
        this.setState({
          view: 'items', 
          shoppingList: list,
          shoppingListItems: items
        });
      });
    });
  }

  getShoppingListItems = (listid) => {
    return this.props.shoppingListRepository.findItems({
      selector: {
        type: 'item', 
        list: listid
      }
    });
  }

  refreshShoppingListItems = (listid) => {
    this.props.shoppingListRepository.findItems({
      selector: {
        type: 'item', 
        list: listid
      }
    }).then(items => {
      this.setState({
        view: 'items', 
        shoppingListItems: items
      });
    });
  }

  renameShoppingListItem = (itemid, newname) => {
    console.log('IN renameShoppingListItem with id='+itemid+', name='+newname);
    this.props.shoppingListRepository.getItem(itemid).then(item => {
      item = item.set('title', newname);
      return this.props.shoppingListRepository.putItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }

  deleteShoppingListItem = (itemid) => {
    this.props.shoppingListRepository.getItem(itemid).then(item => {
      return this.props.shoppingListRepository.deleteItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }

  toggleItemCheck = (evt) => {
    let itemid = evt.target.dataset.id;
    this.props.shoppingListRepository.getItem(itemid).then(item => {
      item = item.set('checked', !item.checked);
      return this.props.shoppingListRepository.putItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }

  checkAllListItems = (listid) => {
    let listcheck = true;
    this.getShoppingListItems(listid).then( items => {
      let newitems = [];
      items.forEach(item => {
        if (!item.checked) {
          newitems.push( item.mergeDeep({checked:true}) );
        }
      }, this);
      // if all items were already checked let's uncheck them all
      if (newitems.length === 0) {
        listcheck = false;
        items.forEach(item => {
          newitems.push( item.mergeDeep({checked:false}) );
        }, this);
      }
      let listOfShoppingListItems = this.props.shoppingListFactory.newListOfShoppingListItems(newitems);
      return this.props.shoppingListRepository.putItemsBulk(listOfShoppingListItems);
    }).then(newitemsresponse => {
      return this.props.shoppingListRepository.get(listid);
    }).then(shoppingList => {
      shoppingList = shoppingList.set("checked", listcheck);
      return this.props.shoppingListRepository.put(shoppingList);
    }).then(shoppingList => {
      this.getShoppingLists();
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

  createNewShoppingListOrItem = (e) => {
    e.preventDefault();
    this.setState({adding: false});
    
    if (this.state.view === 'lists') {
      let shoppingList = this.props.shoppingListFactory.newShoppingList({
        title: this.state.newName
      });
      this.props.shoppingListRepository.put(shoppingList).then(this.getShoppingLists);

    } else if (this.state.view === 'items') {
      let item = this.props.shoppingListFactory.newShoppingListItem({
        title: this.state.newName
      }, this.state.shoppingList);
      this.props.shoppingListRepository.putItem(item).then(item => {
        this.getShoppingListItems(this.state.shoppingList._id).then(items => {
          this.setState({
            view: 'items', 
            shoppingListItems: items
          });
        });
      });
    }
  }

  updateName = (e) => {
    this.setState({newName: e.target.value});
  }

  displayAddingUI = () => {
    this.setState({adding: true});
  }

  renderNewNameUI = () => {
    return (
      <form onSubmit={this.createNewShoppingListOrItem} style={{marginTop:'12px'}}>
          <Paper>
            <TextField className="form-control" type="text" 
              autoFocus={true} 
              hintText="Name..." 
              onChange={this.updateName} 
              fullWidth={false} 
              style={{padding:'0px 12px',width:'calc(100% - 24px)'}}
              underlineStyle={{width:'calc(100% - 24px)'}}/>
          </Paper>
      </form>
    );
  }

  renderShoppingLists = () => {
    if (this.state.shoppingLists.length < 1) 
      return ( <Card style={{margin:"12px 0"}}><CardTitle title={NOLISTMSG} /></Card> );
    return (
      <ShoppingLists 
        shoppingLists={this.state.shoppingLists} 
        openListFunc={this.openShoppingList} 
        deleteListFunc={this.deleteShoppingList} 
        renameListFunc={this.renameShoppingList} 
        checkAllFunc={this.checkAllListItems} 
        totalCounts={this.state.totalShoppingListItemCount}
        checkedCounts={this.state.checkedTotalShoppingListItemCount} /> 
    )
  }

  renderShoppingListItems = () => {
    if (this.state.shoppingListItems.size < 1) 
      return ( <Card style={{margin:"12px 0"}}><CardTitle title={NOITEMSMSG} /></Card> );
    return (
      <ShoppingList 
        shoppingListItems={this.state.shoppingListItems} 
        deleteFunc={this.deleteShoppingListItem} 
        toggleItemCheckFunc={this.toggleItemCheck} 
        renameItemFunc={this.renameShoppingListItem} /> 
    )
  }

  renderBackButton = () => {
    if (this.state.view === 'items') 
      return (<IconButton touch={true} onClick={this.getShoppingLists}><KeyboardBackspace /></IconButton>)
    else 
      return (<IconButton touch={true} onClick={this.handleOpenSettings}><SettingsIcon /></IconButton>)
  }

  handleOpenSettings = () => {
    this.setState({settingsOpen: true});
  }

  handleCloseSettings = () => {
    this.setState({settingsOpen: false});
  }

  handleSubmitSettings = () => {
    try {
      this.remoteDB = new PouchDB(this.tempdburl);
      this.syncToRemote();
    }
    catch (ex) {
      console.log('Error setting remote database: ');
      console.log(ex);
    }
    this.handleCloseSettings();
  }

  showSettingsDialog = () => {
    const actions = [
        <FlatButton label="Cancel" primary={false} keyboardFocused={true} onClick={this.handleCloseSettings} />,
        <FlatButton label="Submit" primary={true} onClick={this.handleSubmitSettings} />,
    ];

    return (
      <Dialog 
        title="Shopping List Settings" 
        actions={actions} 
        modal={false} 
        open={this.state.settingsOpen} 
        onRequestClose={this.handleCloseSettings}
      >
      <p>Enter a fully qualified URL (including username and password) to a remote IBM Cloudant, Apache CouchDB, or PouchDB database to sync your shopping list.</p>
      <TextField id="db-url" 
        floatingLabelText="https://username:password@localhost:5984/database" 
        fullWidth={true} 
        onChange={ e => {this.tempdburl = e.target.value} } />
      </Dialog>
    )
  }

  renderAddButton = () => {
    return (
    <FloatingActionButton onClick={this.displayAddingUI} mini={true}>
      <ContentAdd />
    </FloatingActionButton>
    );
}

  render() {
    let screenname = "Shopping Lists";
    if (this.state.view === 'items') screenname = this.state.shoppingList.title;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
      <div className="App">
        <AppBar title={screenname} 
                iconElementLeft={this.renderBackButton()}
                style={appBarStyle} 
                iconElementRight={this.renderAddButton()} />
        <div className={'listsanditems'} style={{margin:'8px'}}>
          {this.state.adding ? this.renderNewNameUI() : <span/>}
          {this.state.view === 'lists' ? this.renderShoppingLists() : this.renderShoppingListItems()}
        </div>
        {this.state.settingsOpen ? this.showSettingsDialog() : <span/>}
      </div>
      </MuiThemeProvider>
    )
  }
}

export default App;