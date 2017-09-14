import React from 'react';
import PropTypes from 'prop-types';
import {ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {grey500} from 'material-ui/styles/colors';
import './ShoppingList.css';

const moveVertButton = (
    <IconButton touch={true} tooltip="more" tooltipPosition="bottom-left">
        <MoreVertIcon color={grey500} />
    </IconButton>
);

class ShoppingList extends React.Component {

  render() {
    let items = this.props.shoppingListItems.map( (item) => 
      <div key={item._id}>
      <ListItem className='shoppinglistitem'
          leftCheckbox={
            <Checkbox onCheck={this.props.toggleItemCheckFunc} data-item={item._id} data-id={item._id} checked={item.checked} />} 
          primaryText={
            <div className={(item.checked ? 'checkeditem' : 'uncheckeditem')}>{item.title}</div>} 
          rightIconButton={
            <IconMenu iconButtonElement={moveVertButton} 
              className="vertmenu-list">
              <MenuItem 
                primaryText="Edit"
                disabled={true}/>
              <MenuItem 
                primaryText="Delete" 
                onClick={()=>this.props.deleteFunc(item._id)}/>
            </IconMenu>
          }>
        </ListItem>
        <Divider inset={true} />
      </div>
  )
  return (
    <div>{items}</div>
  )
  }
}

ShoppingList.PropTypes = {
  deleteFunc: PropTypes.func.isRequired, 
}

export default ShoppingList;