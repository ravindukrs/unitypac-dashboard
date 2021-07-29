import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import moment from 'moment';
import palette from 'theme/palette';
import { FirebaseContext } from '../../../../config/Firebase';


import { options } from './chart';

const useStyles = makeStyles(() => ({
  root: {},
  chartContainer: {
    height: 400,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

const dataObject = {
  labels: [moment().subtract(5, 'days').format('LL'), moment().subtract(4, 'days').format('LL').toString(), moment().subtract(3, 'days').format('LL'), moment().subtract(2, 'days').format('LL'), moment().subtract(1, 'days').format('LL'), moment().format('LL').toString()],
  datasets: [
    {
      label: 'This year',
      backgroundColor: palette.primary.main,
      data: [0, 0, 0, 0, 0, 0, 0]
    },
    {
      label: 'Last year',
      backgroundColor: palette.neutral,
      data: [0, 0, 0, 0, 0, 0, 0]
    }
  ]
};

const LatestSales = props => {
  const { className, ...rest } = props;

  const contextValue = useContext(FirebaseContext);


  const classes = useStyles();

  const [packages, setPackages] = useState(null);
  const [data, setData] = useState(dataObject);


  useEffect(() => {
    (async () => {
        try {
            await contextValue.db.collection('packages').
                onSnapshot(snapshot => {
                  var thisYear = [0,0,0,0,0,0,0];
                  var lastYear = [0,0,0,0,0,0,0];
                    snapshot.forEach(doc => {
                        const id = doc.id;
                        const data = doc.data();
                        console.log(data);
                        
                        if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(5, 'days'), 'day')){
                          thisYear[0] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(4, 'days'), 'day')){
                          thisYear[1] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(3, 'days'), 'day')){
                          thisYear[2] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(2, 'days'), 'day')){
                          thisYear[3] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(1, 'days'), 'day')){
                          thisYear[4] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment(), 'day')){
                          thisYear[5] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(5, 'days').subtract(1, 'year'), 'day')){
                          lastYear[0] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(4, 'days').subtract(1, 'year'), 'day')){
                          lastYear[1] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(3, 'days').subtract(1, 'year'), 'day')){
                          lastYear[2] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(2, 'days').subtract(1, 'year'), 'day')){
                          lastYear[3] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(1, 'days').subtract(1, 'year'), 'day')){
                          lastYear[4] += 1
                        } else if(moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(1, 'year'), 'day')){
                          lastYear[5] += 1
                        } 
                    })
                    //setPackages(packagesArray);
                    console.log(thisYear);
                    console.log(lastYear);
                    setData((prevState)=>({
                      ...prevState,
                      datasets: [
                        {
                          label: 'This year',
                          backgroundColor: palette.primary.main,
                          data: thisYear
                        },
                        {
                          label: 'Last year',
                          backgroundColor: palette.neutral,
                          data: lastYear
                        }
                      ]

                    }))
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
            size="small"
            variant="text"
          >
            Last 7 days <ArrowDropDownIcon />
          </Button>
        }
        title="Latest Order Statistics"
      />
      <Divider />
      <CardContent>
        <div className={classes.chartContainer}>
          <Bar
            data={data}
            options={options}
          />
        </div>
      </CardContent>
      <Divider />
      <CardActions className={classes.actions}>
        <Button
          color="primary"
          size="small"
          variant="text"
        >
          Overview <ArrowRightIcon />
        </Button>
      </CardActions>
    </Card>
  );
};

LatestSales.propTypes = {
  className: PropTypes.string
};

export default LatestSales;
