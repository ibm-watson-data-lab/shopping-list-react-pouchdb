import React from 'react';
import PropTypes from 'prop-types';
// import ShoppingList from './ShoppingList';
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
    constructor(props) {
        super(props);
        const lists = props.shoppingLists;
        this.state = {
            listItems: lists.map( (list) => 
                <Card key={list._id} style={{margin:"12px 0"}}>
                    <CardTitle 
                        title={list.title}
                        children={
                            <IconMenu iconButtonElement={iconButtonElement}   
                                className="vertmenu-list">
                                <MenuItem 
                                    primaryText="Open" 
                                    onClick={()=>props.openListFunc(list._id)}/>
                                <MenuItem>Edit</MenuItem>
                                <MenuItem 
                                    primaryText="Delete" 
                                    onClick={()=>props.updateFunc(list._id, true)}/>
                            </IconMenu>
                        } />
                    <hr className={'shoppinglistcarddivider'}/>
                    <CardActions>
                        <Checkbox />
                    </CardActions>
                </Card>
            )
        };
    }

    getShoppingList = (evt, theId) => {
        this.props.updateFunc(evt, theId);
    }

    render() {
        return (
            <div>{this.state.listItems}</div>
        )
    }
}

ShoppingLists.PropTypes = {
    shoppingLists: PropTypes.array.isRequired, 
    updateFunc: PropTypes.func.isRequired, 
    openListFunc: PropTypes.func.isRequired
}

export default ShoppingLists;