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

const WarehousePricing = props => {
  const { className, ...rest } = props;
  const contextValue = useContext(FirebaseContext);

  const classes = useStyles();


  const [values, setValues] = useState({perkg:0,perunitvol:0,perhour:0});
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
        await contextValue.db.collection('pricing').doc('warehouse-pricing').
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
    await contextValue.db.collection('pricing').doc("warehouse-pricing").update(values).then(()=>setShowUpdated(true))
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
          title="Warehouse Pricing"
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
                helperText="Per Hour Charge"
                label="Per Hour Charge"
                margin="dense"
                name="perhour"
                onChange={handleChange}
                required
                value={values.perhour}
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
                helperText="Per KG"
                label="Per KG"
                margin="dense"
                name="perkg"
                onChange={handleChange}
                required
                value={values.perkg}
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

WarehousePricing.propTypes = {
  className: PropTypes.string
};

export default WarehousePricing;
