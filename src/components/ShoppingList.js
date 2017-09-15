import React from 'react';
import {ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {grey500} from 'material-ui/styles/colors';
import './ShoppingList.css';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
// import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

const moveVertButton = (
    <IconButton touch={true} tooltip="more" tooltipPosition="bottom-left">
        <MoreVertIcon color={grey500} />
    </IconButton>
);

class ShoppingList extends React.Component {
  /* all state actions are for handling the renaming dialog */
  state = {
    open: false,
    activeItemId: '', 
    oldName: '',
    newName: ''
  };

  handleOpen = (itemid, itemtitle) => {
    this.setState({open: true, activeItemId: itemid, oldName: itemtitle});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleSubmit = (e) => {
    this.props.renameItemFunc(this.state.activeItemId, this.state.newName);
    this.handleClose();
  };

  updateName = (e) => {
    this.setState({newName: e.target.value});
  }

  render() {
    /* rename dialog stuff */
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleSubmit}
      />,
    ];
    /* end rename dialog stuff */

    let items = this.props.shoppingListItems.map( (item) => 
      <div key={'listitem_'+item._id}>
      <ListItem className='shoppinglistitem'
        primaryText={
            <span className={(item.checked ? 'checkeditem' : 'uncheckeditem')}>{item.title}</span>} 
        leftCheckbox={
          <Checkbox onCheck={this.props.toggleItemCheckFunc} data-item={item._id} data-id={item._id} checked={item.checked} />} 
        rightIconButton={
          <IconMenu iconButtonElement={moveVertButton} 
            className="vertmenu-list">
            <MenuItem 
              primaryText="Rename"
              onClick={()=>this.handleOpen(item._id, item.title)} />
            <MenuItem 
              primaryText="Delete" 
              onClick={()=>this.props.deleteFunc(item._id)}/>
          </IconMenu>
        }>
      </ListItem>
      <Divider inset={true} />
      </div>
    );
      
    return (
      <div>
        <div>{items}</div>
        <Dialog
          title="Rename Item"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}>
          {/* <form onSubmit={this.handleSubmit}> */}
            <TextField className="form-control" type="text" id="textfield-item-rename"
              defaultValue={this.state.oldName} 
              onChange={this.updateName} 
              fullWidth={true} />
          {/* </form> */}
        </Dialog>
      </div>
    )
  }
}

export default ShoppingList;