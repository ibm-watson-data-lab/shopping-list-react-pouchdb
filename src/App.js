import React from 'react';
import {List} from 'immutable';
// We're using Material Design React components from http://www.material-ui.com
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import {Card, CardTitle} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import KeyboardBackspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import AboutIcon from 'material-ui/svg-icons/action/info-outline';
import {grey800, blueGrey500, pinkA100, white} from 'material-ui/styles/colors';

import PouchDB from 'pouchdb';

import ShoppingLists from './components/ShoppingLists';
import ShoppingList from './components/ShoppingList';

// create a custom color scheme for Material-UI
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
};

const NOLISTMSG = "Click the + sign below to create a shopping list."
const NOITEMSMSG = "Click the + sign below to create a shopping list item."

/** 
 * This is the main React application
 */
class App extends React.Component {
  constructor(props) {
    super(props);
    // manage remoteDB here because user might change it via the UI
    // but don't put it in state because changing the backend db doesn't require a re-render
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
      aboutOpen: false
    }
  }

  /**
   * Before this component shows the user anything, get the data from the local PouchDB
   * 
   * Then, if we were initialized with a remote DB, synchronize with it
   */
  componentDidMount = () => {
      this.getShoppingLists();
      if (this.remoteDB) {
        this.syncToRemote();
      }
  }

  /**
   * Synchronize local PouchDB with a remote CouchDB or Cloudant
   */
  syncToRemote = () => {
    this.props.localDB.sync(this.remoteDB, {live: true, retry: true})
    .on('change', change => {
      this.getPouchDocs();
    })
    // .on('paused', info => console.log('replication paused.'))
    // .on('active', info => console.log('replication resumed.'))
    .on('error', err => console.log('uh oh! an error occured while synching.'));
}

  /**
   * From the local DB, load all the shopping lists and item counts and which are checked
   */
  getShoppingLists = () => {
    let checkedCount = List();
    let totalCount = List();
    let lists = null;
    this.props.shoppingListRepository.find().then( foundLists => {
      console.log('GOT SHOPPING LISTS FROM POUCHDB. COUNT: '+foundLists.size);
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

  /**
   * Get a shopping list by id 
   * @param {string} listid id of a shopping list
   */
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

  /**
   * Get the items in a shopping list
   * @param {string} listid id of a shopping list
   */
  getShoppingListItems = (listid) => {
    return this.props.shoppingListRepository.findItems({
      selector: {
        type: 'item', 
        list: listid
      }
    });
  }

  /**
   * Refresh the items in a shopping list
   * @param {string} listid id of a shopping list
   */
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

  /**
   * Change the name of an item
   * @param {string} itemid id of an item
   * @param {string} newname new name of the item
   */
  renameShoppingListItem = (itemid, newname) => {
    console.log('IN renameShoppingListItem with id='+itemid+', name='+newname);
    this.props.shoppingListRepository.getItem(itemid).then(item => {
      item = item.set('title', newname);
      return this.props.shoppingListRepository.putItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }

  /**
   * Delete an item
   * @param {string} itemid id of an item
   */
  deleteShoppingListItem = (itemid) => {
    this.props.shoppingListRepository.getItem(itemid).then(item => {
      return this.props.shoppingListRepository.deleteItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }

  /**
   * Check off or un-check an item
   * @param {event} evt The click event on the UI element requesting to toggle state. It's id is the item id
   */
  toggleItemCheck = (evt) => {
    let itemid = evt.target.dataset.id;
    this.props.shoppingListRepository.getItem(itemid).then(item => {
      item = item.set('checked', !item.checked);
      return this.props.shoppingListRepository.putItem(item);
    }).then(this.refreshShoppingListItems(this.state.shoppingList._id));
  }

  /**
   * Check off all items in the shopping list
   * @param {string} listid id of a shopping list
   */
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

  /**
   * Delete a shopping list
   * @param {string} listid id of a shopping list
   */
  deleteShoppingList = (listid) => {
    this.props.shoppingListRepository.get(listid).then(shoppingList => {
      shoppingList = shoppingList.set("_deleted", true);
      return this.props.shoppingListRepository.put(shoppingList);
    }).then(result => {
      this.getShoppingLists();
    });
  }

  /**
   * Change the name of a shopping list
   * @param {string} listid id of a shopping list
   * @param {string} newname new name of the list
   */
  renameShoppingList = (listid, newname) => {
    this.props.shoppingListRepository.get(listid).then(shoppingList => {
      shoppingList = shoppingList.set('title', newname);
      return this.props.shoppingListRepository.put(shoppingList);
    }).then(this.getShoppingLists);
  }

  /**
   * Create a new shopping list or item based on where the event came from
   * @param {event} evt The click event on the UI element requesting to the action. Get the name from state and decide whether to add a list or an item based on the `state.view` 
   */
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

  /**
   * Set the new name the user has typed in state for pickup later by other functions
   * @param {event} evt The change event on the UI element that let's user type a name
   */
  updateName = (evt) => {
    this.setState({newName: evt.target.value});
  }

  /**
   * Tell the component we're in adding list or item mode
   */
  displayAddingUI = () => {
    this.setState({adding: true});
  }

  /**
   * Show UI for typing in a new name
   */
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

  /**
   * Show UI for shopping lists
   */
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

  /**
   * Show UI for shopping list items
   */
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

  /**
   * If we're showing items from a shopping list, show a back button.  
   * If we're showing shopping lists, show a settings button.
   */
  renderBackButton = () => {
    if (this.state.view === 'items') 
      return (<IconButton touch={true} onClick={this.getShoppingLists}><KeyboardBackspace /></IconButton>)
    else 
      return (<img src="cart_sm.png" width="48px" alt="Shopping List app logo" />)
  }

  renderActionButtons = () => {
    const iconStyle = {
      fill: 'white'
    };
    return (
      <div>
      <IconButton touch={true} onClick={this.handleOpenSettings} iconStyle={iconStyle}><SettingsIcon /></IconButton>
      <IconButton touch={true} onClick={this.handleOpenAbout} iconStyle={iconStyle}><AboutIcon /></IconButton>
      </div>
    );
  }

  /**
   * Tell component we want to show settings dialog
   */
  handleOpenSettings = () => {
    this.setState({settingsOpen: true});
  }

  /**
   * Tell component we want to hide settings dialog
   */
  handleCloseSettings = () => {
    this.setState({settingsOpen: false});
  }

  /**
   * Tell component we want to show about dialog
   */
  handleOpenAbout = () => {
    this.setState({aboutOpen: true});
  }

  /**
   * Tell component we want to hide about dialog
   */
  handleCloseAbout = () => {
    this.setState({aboutOpen: false});
  }

  /**
   * Right now the only setting is changing the remote DB, so do that then close the dialog
   */
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

  /**
   * Show settings dialog UI
   */
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

  /**
   * Show about dialog UI
   */
  showAboutDialog = () => {
    const actions = [
        <FlatButton label="Close" primary={false} keyboardFocused={true} onClick={this.handleCloseAbout} />
    ];

    return (
      <Dialog 
        title="About" 
        actions={actions} 
        modal={false} 
        open={this.state.aboutOpen} 
        onRequestClose={this.handleAboutSettings}
      >
      <p>
        <a href="https://github.com/ibm-watson-data-lab/shopping-list" target="_blank" rel="noopener noreferrer">Shopping List is a series of Offline First demo apps, each built using a different stack.</a>
          These demo apps cover Progressive Web Apps, hybrid mobile apps, native mobile apps, and desktop apps. This particular demo app is a <strong>Progressive Web App</strong>
          built using <strong>React and PouchDB</strong>. <a href="https://github.com/ibm-watson-data-lab/shopping-list-react-pouchdb" target="_blank" rel="noopener noreferrer">Get the source code</a>.
      </p>
      </Dialog>
    )
  }

  /**
   * Show the UI
   */
  render() {
    let screenname = "Shopping List";
    if (this.state.view === 'items') screenname = this.state.shoppingList.title;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
      <div className="App">
        <AppBar title={screenname} 
                iconElementLeft={this.renderBackButton()}
                style={appBarStyle} 
                iconElementRight={this.renderActionButtons()} />
        <div className={'listsanditems'} style={{margin:'8px'}}>
          {this.state.adding ? this.renderNewNameUI() : <span/>}
          {this.state.view === 'lists' ? this.renderShoppingLists() : this.renderShoppingListItems()}
        </div>
        {this.state.settingsOpen ? this.showSettingsDialog() : <span/>}
        {this.state.aboutOpen ? this.showAboutDialog() : <span/>}
        <FloatingActionButton 
          onClick={this.displayAddingUI} 
          mini={true}
          style={{position: 'fixed', bottom:'25px', right:'25px'}}>
          <ContentAdd />
        </FloatingActionButton>
      </div>
      </MuiThemeProvider>
    )
  }
}

export default App;