import React from 'react';
import PropTypes from 'prop-types';
import {Card, CardActions, CardTitle} from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import './ShoppingLists.css';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

const iconButtonElement = (
    <IconButton touch={true} tooltip="more" tooltipPosition="bottom-left">
        <MoreVertIcon />
    </IconButton>
);

class ShoppingLists extends React.Component {
  // all state actions are for handling the renaming dialog
  state = {
    open: false,
    activeListId: '', 
    oldName: '',
    newName: ''
  };

  handleOpen = (listid, listtitle) => {
    this.setState({open: true, activeListId: listid, oldName: listtitle});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleSubmit = (e) => {
    this.props.renameListFunc(this.state.activeListId, this.state.newName);
    this.handleClose();
  };

  updateName = (e) => {
    this.setState({newName: e.target.value});
  }

  /**
   * Show the UI. The most important thing happening here is that the UI elements 
   * make use of the functions passed into the component as props to do all the heavy 
   * lifting of manipulating shopping lists, so this component is pure UI.
   */
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
    
    let listItems = this.props.shoppingLists.map( (list) => 
    <Card key={list._id} style={{margin:"12px 0"}}>
      <CardTitle 
        title={list.title} 
        children={
          <IconMenu iconButtonElement={iconButtonElement}   
            className="vertmenu-list">
            <MenuItem 
              primaryText="Open" 
              onClick={()=>this.props.openListFunc(list._id)}/>
            <MenuItem 
              primaryText="Rename"
              onClick={()=>this.handleOpen(list._id, list.title)}/>
            <MenuItem 
              primaryText="Delete" 
              onClick={()=>this.props.deleteListFunc(list._id)}/>
          </IconMenu>
        } />
      <CardActions>
        <Checkbox label={(this.props.checkedCounts.get(list._id) || 0)+' of '+(this.props.totalCounts.get(list._id) || 0)+' items checked'}
          checked={list.checked} 
          onCheck={()=>this.props.checkAllFunc(list._id)} />
      </CardActions>
    </Card>
  )
  return (
    <div>
      <div>{listItems}</div>
      <Dialog
        title="Rename Item"
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}>
          <TextField className="form-control" type="text" id="textfield-item-rename"
          defaultValue={this.state.oldName} 
          onChange={this.updateName} 
          fullWidth={true} />
      </Dialog>
    </div>
  )
  }
}

ShoppingLists.propTypes = {
    shoppingLists: PropTypes.array.isRequired, 
    deleteFunc: PropTypes.func.isRequired, 
    openListFunc: PropTypes.func.isRequired, 
    renameListFunc: PropTypes.func.isRequired
}

export default ShoppingLists;