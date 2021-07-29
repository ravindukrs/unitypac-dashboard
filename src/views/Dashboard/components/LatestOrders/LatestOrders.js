import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardActions,
  CardHeader,
  CardContent,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  TableSortLabel
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import { StatusBullet } from 'components';
import { FirebaseContext } from '../../../../config/Firebase';


const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    padding: 0
  },
  inner: {
    minWidth: 800
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  status: {
    marginRight: theme.spacing(1)
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));



const statusColors = {
  In_Transit: 'primary',
  In_Transport: 'info',
  Awaiting_Pickup: 'warning',
  In_Warehouse: 'neutral',
  Complete:'success',
};


const LatestOrders = props => {
  const contextValue = useContext(FirebaseContext);

  const { className, ...rest } = props;

  const classes = useStyles();

  const [packages, setPackages] = useState(null);

  useEffect(() => {
    (async () => {
        try {
            await contextValue.db.collection('packages').
                onSnapshot(snapshot => {
                    var packagesArray = [];
                    snapshot.forEach(doc => {
                        const id = doc.id;
                        const data = doc.data();
                        packagesArray.push({id, ...data});
                    })
                    setPackages(packagesArray);
                    console.log(packagesArray);
                })
  
        } catch (error) {
            console.log(error);
        }
    })()
  }, [])
  

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader
        action={
          <Button
            color="primary"
            size="small"
            variant="outlined"
          >
            New entry
          </Button>
        }
        title="Latest Orders"
      />
      <Divider />
      <CardContent className={classes.content}>
        <PerfectScrollbar>
          <div className={classes.inner}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Ref</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell sortDirection="desc">
                    <Tooltip
                      enterDelay={300}
                      title="Sort"
                    >
                      <TableSortLabel
                        active
                        direction="desc"
                      >
                        Date
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {packages&&packages.map(order => (
                  <TableRow
                    hover
                    key={order.id}
                  >
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.recieverCustomer.customerName}</TableCell>
                    <TableCell>
                    {order.senderCustomer.postedDateTime}
                    </TableCell>
                    <TableCell>
                      <div className={classes.statusContainer}>
                        <StatusBullet
                          className={classes.status}
                          color={statusColors[order.transit.transitStatus.replace(/ /g, "_")]}
                          size="sm"
                        />
                        {order.transit.transitStatus}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </PerfectScrollbar>
      </CardContent>
      <Divider />
      <CardActions className={classes.actions}>
        <Button
          color="primary"
          size="small"
          variant="text"
        >
          View all <ArrowRightIcon />
        </Button>
      </CardActions>
    </Card>
  );
};

LatestOrders.propTypes = {
  className: PropTypes.string
};

export default LatestOrders;
