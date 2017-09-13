import React from 'react';
import PropTypes from 'prop-types';
import {List} from 'material-ui/List';

// import MenuItem from 'material-ui/MenuItem';
// import {blue600, grey900, white} from 'material-ui/styles/colors';

export default function ShoppingList(props) {
  return (
    <div>
      {props.children ? <List children={props.children} /> : <p>EMPTY SHOPPING LIST</p>}
    </div>
  );
}

ShoppingList.propTypes = {
  children: PropTypes.array
}