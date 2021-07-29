import React, { useState, useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { FirebaseContext } from '../../../../config/Firebase';
import Alert from '@material-ui/lab/Alert';


import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
  Button,
  TextField
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {}
}));

const AccountDetails = props => {
  const { className, foundUser, ...rest } = props;
  const contextValue = useContext(FirebaseContext);

  const classes = useStyles();


  const [values, setValues] = useState(foundUser);
  const [showUpdated, setShowUpdated] = useState(false);
  const handleChange = event => {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });

    
  };

  const handleClick = async () => {
    await contextValue.db.collection('users').doc(values.uid).update(values).then(()=>setShowUpdated(true))
  }



  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <form
        autoComplete="off"
        noValidate
      >
        <CardHeader
          subheader="The information can be edited"
          title="Profile"
        />
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                helperText="Please specify the first name"
                label="First name"
                margin="dense"
                name="fName"
                onChange={handleChange}
                required
                value={values.fName}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="Last name"
                margin="dense"
                name="lName"
                onChange={handleChange}
                required
                value={values.lName}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="Email Address"
                margin="dense"
                name="email"
                onChange={handleChange}
                required
                value={values.email}
                variant="outlined"
                disabled
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="Phone Number"
                margin="dense"
                name="mobile"
                onChange={handleChange}
                type="number"
                value={values.mobile}
                variant="outlined"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="User Type"
                margin="dense"
                name="userType"
                onChange={handleChange}
                required
                value={values.userType}
                variant="outlined"
                disabled
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                label="User ID"
                margin="dense"
                name="uid"
                onChange={handleChange}
                required
                value={values.uid}
                variant="outlined"
                disabled
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button
            color="primary"
            variant="contained"
            onClick = {() => handleClick()}
          >
            Save details
          </Button>
        </CardActions>
      </form>
      {showUpdated?(<Alert severity="success">Profile Updated Successfully!</Alert>
):null}
    </Card>
  );
};

AccountDetails.propTypes = {
  className: PropTypes.string
};

export default AccountDetails;
