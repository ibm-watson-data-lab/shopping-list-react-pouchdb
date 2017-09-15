import React from 'react';
// import { ShoppingListFactory, ShoppingListRepositoryPouchDB } from 'ibm-shopping-list-model';
import {List} from 'immutable';
import ShoppingLists from './components/ShoppingLists';
import ShoppingList from './components/ShoppingList';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import {Card, CardTitle} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import KeyboardBackspace from 'material-ui/svg-icons/hardware/keyboard-backspace';
import {grey800, lightBlue500, amber900, white} from 'material-ui/styles/colors';

const NOLISTMSG = "Click the + sign below to create a shopping list."
const NOITEMSMSG = "Click the + sign below to create a shopping list item."

const muiTheme = getMuiTheme({
  palette: {
    textColor: grey800, 
    alternateTextColor: white, 
    // primary1Color: lightBlue500,
    accent1Color: amber900
  }
});

const appBarStyle = {
  backgroundColor: lightBlue500, 
  width: "100%", 
  // padding: "8px", 
  // color: white
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shoppingList: null, 
      shoppingLists: [], 
      totalShoppingListItemCount: List(), //Immutable.js List with list ids as keys
      checkedTotalShoppingListItemCount: List(), //Immutable.js List with list ids as keys
      shoppingListItems: null, 
      adding: false, 
      view: 'lists',
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
      this.props.shoppingListRepository.post(shoppingList).then(this.getShoppingLists);

    } else if (this.state.view === 'items') {
      let item = this.props.shoppingListFactory.newShoppingListItem({
        title: this.state.newName
      }, this.state.shoppingList);
      this.props.shoppingListRepository.postItem(item).then(item => {
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
      return <span/>
  }

  render() {
    let screenname = "Shopping Lists";
    if (this.state.view === 'items') screenname = this.state.shoppingList.title;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
      <div className="App">
        <AppBar title={screenname} 
                iconElementLeft={this.renderBackButton()}
                style={appBarStyle} />
        <div className={'listsanditems'} style={{margin:'8px'}}>
        {this.state.adding ? this.renderNewNameUI() : <span/>}
        {this.state.view === 'lists' ? this.renderShoppingLists() : this.renderShoppingListItems()}
        <FloatingActionButton onClick={this.displayAddingUI} mini={true}>
            <ContentAdd />
        </FloatingActionButton>
        </div>
      </div>
      </MuiThemeProvider>
    )
  }
}

export default App;