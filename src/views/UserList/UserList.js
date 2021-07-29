import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';

import { UsersToolbar, UsersTable } from './components';
import mockData from './data';

import { FirebaseContext } from '../../config/Firebase';



const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const UserList = () => {
  const classes = useStyles();

  // const [users] = useState(mockData);
  const contextValue = useContext(FirebaseContext);
  const [users,setUsers] = useState(null);

  useEffect(() => {
    (async () => {
        try {
            await contextValue.db.collection('users')
                .onSnapshot(snapshot => {
                    var usersArray = [];
                    snapshot.forEach(doc => {
                        const id = doc.id;
                        const data = doc.data();
                        usersArray.push({id, ...data});
                    })
                    setUsers(usersArray);
                })
        } catch (error) {
            console.log(error);
        }
    })()
}, [])
  if (users){
    return (
      <div className={classes.root}>
        <UsersToolbar />
        <div className={classes.content}>
          <UsersTable users={users} />
        </div>
      </div>
    );
  } else{
    return null
  }
  
};

export default UserList;
