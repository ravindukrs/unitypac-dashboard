import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Grid, Typography, Avatar } from '@material-ui/core';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import { FirebaseContext } from '../../../../config/Firebase';


const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  content: {
    alignItems: 'center',
    display: 'flex'
  },
  title: {
    fontWeight: 700
  },
  avatar: {
    backgroundColor: theme.palette.white,
    color: theme.palette.primary.main,
    height: 56,
    width: 56
  },
  icon: {
    height: 32,
    width: 32
  }
}));

const TotalProfit = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  const contextValue = useContext(FirebaseContext);
  const [revenue, setRevenue] = useState(null);
  const [expense, setExpense] = useState(null);
  const [profit, setProfit] = useState(null);
  useEffect(() => {
    (async () => {
        try {
           var revenue = 0;
            await contextValue.db.collection('packages').
                onSnapshot(snapshot => {
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if(data.packageCost.senderCharge){
                          revenue+=data.packageCost.senderCharge;
                        }
                    })
                    setRevenue(revenue);

                })
  
        } catch (error) {
            console.log(error);
        }
    })()
  }, [])

  useEffect(() => {
    (async () => {
        try {
          var expense = 0;
          var packages = await contextValue.db.collectionGroup('packageTransferHistory');
          packages.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                const id = doc.id;
                const data = doc.data();

                if(data.associatedPay){
                  expense+=data.associatedPay.charge;
                }
            });
            setExpense(expense);
        });
  
        } catch (error) {
            console.log(error);
        }
    })()
  }, [])

  useEffect(() => {
    (async () => {
        try {
          expense&&revenue? setProfit(revenue-expense) : 0;
        } catch (error) {
            console.log(error);
        }
    })()
  }, [revenue, expense])
  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <Grid
          container
          justify="space-between"
        >
          <Grid item>
            <Typography
              className={classes.title}
              color="inherit"
              gutterBottom
              variant="body2"
            >
              PROFIT (THIS MONTH)
            </Typography>
            <Typography
              color="inherit"
              variant="h3"
            >
              Rs. {profit?Math.round(profit*100+Number.EPSILON)/100:"Loading..."}
            </Typography>
          </Grid>
          <Grid item>
            <Avatar className={classes.avatar}>
              <AttachMoneyIcon className={classes.icon} />
            </Avatar>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

TotalProfit.propTypes = {
  className: PropTypes.string
};

export default TotalProfit;
