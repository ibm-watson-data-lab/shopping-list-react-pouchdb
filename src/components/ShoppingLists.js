import React from 'react';
import PropTypes from 'prop-types';
import {Card, CardActions, CardTitle} from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {blue600, grey500} from 'material-ui/styles/colors';
import './ShoppingLists.css';

const iconButtonElement = (
    <IconButton touch={true} tooltip="more" tooltipPosition="bottom-left">
        <MoreVertIcon color={grey500} />
    </IconButton>
);

class ShoppingLists extends React.Component {

    getShoppingList = (evt, theId) => {
        this.props.updateFunc(evt, theId);
    }

    render() {
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
                        <MenuItem>Edit</MenuItem>
                        <MenuItem 
                            primaryText="Delete" 
                            onClick={()=>this.props.deleteFunc(list._id, list.title, true)}/>
                    </IconMenu>
                } />
            <hr className={'shoppinglistcarddivider'}/>
            <CardActions>
                <Checkbox />
            </CardActions>
        </Card>
    )
    return (
        <div>{listItems}</div>
    )
    }
}

ShoppingLists.PropTypes = {
    shoppingLists: PropTypes.array.isRequired, 
    deleteFunc: PropTypes.func.isRequired, 
    openListFunc: PropTypes.func.isRequired
}

export default ShoppingLists;