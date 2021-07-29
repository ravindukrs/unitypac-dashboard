import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid, Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  TextField } from '@material-ui/core';

import { Notifications, Password, PayForm, CarrierPricing, WarehousePricing } from './components';
import clsx from 'clsx';


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));

import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const Settings = (props) => {
  const classes = useStyles();
  const { className, ...rest } = props;

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={4}
      >
        <Grid
          item
          md={7}
          xs={12}
        >
          <Notifications />
        </Grid>
        <Grid
          item
          md={5}
          xs={12}
        >
          <Password />
        </Grid>
        <Grid
          item
          md={4}
          xs={12}
        >
          <PayForm />
        </Grid>
        <Grid
          item
          md={4}
          xs={12}
        >
          <CarrierPricing />
        </Grid>
        <Grid
          item
          md={4}
          xs={12}
        >
          <WarehousePricing />
        </Grid>
        
      </Grid>
    </div>
  );
};

export default Settings;
