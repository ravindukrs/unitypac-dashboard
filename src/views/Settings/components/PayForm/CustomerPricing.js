import React, { useState, useContext, useEffect } from 'react';
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

const CustomerPricing = props => {
  const { className, ...rest } = props;
  const contextValue = useContext(FirebaseContext);

  const classes = useStyles();


  const [values, setValues] = useState({perkm:0,fragilesurcharge:0,perunitvol:0,perunitweight:0,verhiclesurcharge:0});
  const [showUpdated, setShowUpdated] = useState(false);
  const handleChange = event => {
    setValues({
      ...values,
      [event.target.name]: parseInt(event.target.value)
    });
  }

  //Get All Users
  useEffect(() => {
    (async () => {
      try {
        await contextValue.db.collection('pricing').doc('customer-pricing').
          onSnapshot(
            function(doc){
              setValues(doc.data())
            }
            // var usersArray = [];
            // snapshot.forEach(doc => {
            //   const id = doc.id;
            //   const data = doc.data();
            //   usersArray.push({ id, ...data })
            // })
            // setUsers(usersArray);
          )

      } catch (error) {
        console.log(error);
      }
    })()
  }, [])










  const handleClick = async () => {
    //console.log(values);
    await contextValue.db.collection('pricing').doc("customer-pricing").update(values).then(()=>setShowUpdated(true))
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
          title="Customer Pricing"
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
                helperText="Per KM Charge"
                label="Per KM Charge"
                margin="dense"
                name="perkm"
                onChange={handleChange}
                required
                value={values.perkm}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                helperText="Per Unit Kilogram"
                label="Per Unit Kilogram"
                margin="dense"
                name="perunitweight"
                onChange={handleChange}
                required
                value={values.perunitweight}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                helperText="Per Unit Volume"
                label="Per Unit Volume"
                margin="dense"
                name="perunitvol"
                onChange={handleChange}
                required
                value={values.perunitvol}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                helperText="Fragile Surcharge"
                label="Fragile Surcharge"
                margin="dense"
                name="fragilesurcharge"
                onChange={handleChange}
                required
                value={values.fragilesurcharge}
                variant="outlined"
                type="number"
              />
            </Grid>
            <Grid
              item
              md={6}
              xs={12}
            >
              <TextField
                fullWidth
                helperText="Vehicle Surcharge"
                label="Vehicle Surcharge"
                margin="dense"
                name="vehiclesurcharge"
                onChange={handleChange}
                required
                value={values.vehiclesurcharge}
                variant="outlined"
                type="number"
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
      {showUpdated?(<Alert severity="success">Details Updated Successfully!</Alert>
):null}
    </Card>
  );
};

CustomerPricing.propTypes = {
  className: PropTypes.string
};

export default CustomerPricing;
