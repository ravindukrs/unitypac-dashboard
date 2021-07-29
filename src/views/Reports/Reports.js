import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Bar, Doughnut } from 'react-chartjs-2';
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
import { FirebaseContext } from '../../config/Firebase';
import { Grid } from '@material-ui/core';
import LatestOrders from './properties/LatestOrders';
import Iframe from 'react-iframe'



import { options, doughnutOptions } from './properties/chart';

const useStyles = makeStyles((theme) => ({
  root: { padding: theme.spacing(4) },
  chartContainer: {
    height: 400,
    position: 'relative'
  },
  actions: {
    justifyContent: 'flex-end'
  }
}));

//Default Dataset for Order Statistics
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

//Default Dataset for Average Warehouse Hops for Distance Travelled

const dataObject2 = {
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

const Reports = props => {
  const { className, ...rest } = props;

  const contextValue = useContext(FirebaseContext);


  const classes = useStyles();

  const [users, setUsers] = useState(null);
  const [packages, setPackages] = useState(null);
  const [transferHistory, setTransferHistory] = useState(null);
  //State array containing formatted Data for Chart 1
  const [data, setData] = useState(dataObject);
  //State Array Containing {hops, distanceTravelled}
  const [distanceWarehouseHops, setDistanceWarehouseHops] = useState([]);
  //State array containing formatted Data for Chart 2
  const [hopsDistanceData, setHopsDistanceData] = useState(dataObject2);
  //Time Propotion Doughnut
  const [timePropotionData, setTimePropotionData] = useState(null);
  //Cost Propotion Doughnut
  const [costPropotionData, setCostPropotionData] = useState(null);


  //Get All Users
  useEffect(() => {
    (async () => {
      try {
        await contextValue.db.collection('users').
          onSnapshot(snapshot => {
            var usersArray = [];
            snapshot.forEach(doc => {
              const id = doc.id;
              const data = doc.data();
              usersArray.push({ id, ...data })
            })
            setUsers(usersArray);
          })

      } catch (error) {
        console.log(error);
      }
    })()
  }, [])

  //Get All Packages
  useEffect(() => {
    (async () => {
      try {
        await contextValue.db.collection('packages').
          onSnapshot(snapshot => {
            var packagesArray = [];
            snapshot.forEach(doc => {
              const id = doc.id;
              const data = doc.data();
              packagesArray.push({ id, ...data })
            })
            setPackages(packagesArray);
          })

      } catch (error) {
        console.log(error);
      }
    })()
  }, [])

  //Get All SubCollections
  useEffect(() => {
    (async () => {
      try {

        var packages = await contextValue.db.collectionGroup('packageTransferHistory');
        packages.get().then(function (querySnapshot) {
          var subCollection = []
          querySnapshot.forEach(function (doc) {
            const id = doc.id;
            const data = doc.data();
            const parentId = doc.ref.parent.parent.id;
            subCollection.push({ id, parentId, ...data })
          });
          setTransferHistory(subCollection);
        });
      } catch (error) {
        console.log(error);
      }
    })()
  }, [])

  //Start Chart 2

  const findNumberOfWarehousesToDistance = async () => {

    var dataArray = []
    var hopsPerKmArray = []


    packages.forEach(async (pack) => {
      var totalDistanceTravelled = 0;
      var warehouseHops = 0;
      transferHistory.forEach(historyUnit => {
        //Increment Warehouse Hop
        if (historyUnit.parentId == pack.id && historyUnit.transferType == "WAREHOUSE_TRANSFER") {
          //console.log(historyUnit.parentId);
          warehouseHops++;
        }
        console.log("Check Iterations");
        if (historyUnit.parentId == pack.id) {
          if (historyUnit.associatedPay) {
            if (historyUnit.associatedPay.distanceTravelled) {
              totalDistanceTravelled += historyUnit.associatedPay.distanceTravelled;
            }
          }
        }
      })

      await dataArray.push({ distance: totalDistanceTravelled, hops: warehouseHops })
    })
    setDistanceWarehouseHops(dataArray);
  }

  useEffect(() => {
    packages && transferHistory && findNumberOfWarehousesToDistance();
  }, [packages, transferHistory])

  useEffect(() => {
    if (distanceWarehouseHops.length != 0) {
      var hopArrayPerKm = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      var arrLength = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      var distances = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
      var hopAverage = []
      var i;

      for (i = 0; i < distances.length; i++) {

        if (i == 0) {
          arrLength[i] = distanceWarehouseHops.filter(data => data.distance < distances[i]).length;
          distanceWarehouseHops.filter(data => data.distance < distances[i]).forEach(data => {
            hopArrayPerKm[i] += data.hops;
          })
        } else if (i == 1) {
          arrLength[i] = distanceWarehouseHops.filter(data => data.distance < distances[i] && data.distance > distances[i] - 4).length;
          distanceWarehouseHops.filter(data => data.distance < distances[i] && data.distance > distances[i] - 4).forEach(data => {
            hopArrayPerKm[i] += data.hops;
          })
        } else {
          arrLength[i] = distanceWarehouseHops.filter(data => data.distance < distances[i] && data.distance > distances[i] - 5).length;
          distanceWarehouseHops.filter(data => data.distance < distances[i] && data.distance > distances[i] - 5).forEach(data => {
            hopArrayPerKm[i] += data.hops;
          })
        }
        hopAverage.push(hopArrayPerKm[i] / arrLength[i]);
      }

      setHopsDistanceData((prevState) => ({
        ...prevState,
        labels: ["<1 KM", "1-5 KM", "5-10 KM", "10-15 KM", "15-20 KM", "20-25 KM", "25-30 KM", "30-35 KM", "35-40 KM", "40-45 KM", "45-50 KM", "50-55 KM", "55-60 KM", "60-65 KM", "65-70 KM", "70-75 KM", "75-80 KM", "80-85 KM", "85-90 KM", "90-95 KM", "96-100 KM"],

        datasets: [
          {
            label: 'This year',
            backgroundColor: palette.primary.main,
            data: hopAverage
          },
          {
            label: 'Last year',
            backgroundColor: palette.neutral,
            data: hopAverage
          }
        ]

      }))
    }

  }, [distanceWarehouseHops])

  // End Chart 2

  //Start Chart 1
  useEffect(() => {
    (async () => {
      try {
        await contextValue.db.collection('packages').
          onSnapshot(snapshot => {
            var thisYear = [0, 0, 0, 0, 0, 0, 0];
            var lastYear = [0, 0, 0, 0, 0, 0, 0];
            snapshot.forEach(doc => {
              const id = doc.id;
              const data = doc.data();
              if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(5, 'days'), 'day')) {
                thisYear[0] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(4, 'days'), 'day')) {
                thisYear[1] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(3, 'days'), 'day')) {
                thisYear[2] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(2, 'days'), 'day')) {
                thisYear[3] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(1, 'days'), 'day')) {
                thisYear[4] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment(), 'day')) {
                thisYear[5] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(5, 'days').subtract(1, 'year'), 'day')) {
                lastYear[0] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(4, 'days').subtract(1, 'year'), 'day')) {
                lastYear[1] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(3, 'days').subtract(1, 'year'), 'day')) {
                lastYear[2] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(2, 'days').subtract(1, 'year'), 'day')) {
                lastYear[3] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(1, 'days').subtract(1, 'year'), 'day')) {
                lastYear[4] += 1
              } else if (moment(data.senderCustomer.postedDateTime).isSame(moment().subtract(1, 'year'), 'day')) {
                lastYear[5] += 1
              }
            })

            setData((prevState) => ({
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

  //End Chart 1

  //Start Doughnut 1 (Time Propotion) => Contributes Doughnut 2
  const getTotalCostAndTimeFigures = async () => {

    var totalWarehouseHours = 0;
    var totalDuration = 0;
    var packWarehouseTotalPay = 0;
    var carrierTotalPay = 0;

    packages.forEach(async (pack) => {

      if (pack.transit.transitStatus === "Complete") {
        var packStartTime;
        var packEndTime;
        var packWarehouseTime = 0;

        transferHistory.forEach(historyUnit => {
          //Increment Warehouse Hop
          if (historyUnit.parentId == pack.id) {
            if (historyUnit.transferType === "INITIAL_SENDER") {
              packStartTime = historyUnit.timeStamp;
            }
            if (historyUnit.transferType === "FINAL_RECEPIENT") {
              packEndTime = historyUnit.timeStamp;
              carrierTotalPay += historyUnit.associatedPay.charge;
            }
            if (historyUnit.transferType === "WAREHOUSE_TRANSFER") {
              carrierTotalPay += historyUnit.associatedPay.charge;
            }
            if (historyUnit.transferType === "TRANSFER_FROM_WAREHOUSE") {
              packWarehouseTime += historyUnit.associatedPay.hours;
              packWarehouseTotalPay += historyUnit.associatedPay.charge;
            }
          }

        })
        var duration = moment.duration(moment(packEndTime).diff(moment(packStartTime)));
        totalDuration += duration.asHours();
        totalWarehouseHours += packWarehouseTime;
      }
    })

    console.log("totalWarehouseHours ", totalWarehouseHours);
    console.log("totalDuration ", totalDuration)
    console.log("packWarehouseTotalPay ", packWarehouseTotalPay)
    console.log("carrierTotalPay ", carrierTotalPay)

    setTimePropotionData({
      datasets: [
        {
          data: [Math.round(totalWarehouseHours / totalDuration * 100), Math.round((totalDuration - totalWarehouseHours) / totalDuration * 100)],
          backgroundColor: [
            palette.primary.main,
            palette.error.main,
            palette.warning.main
          ],
          borderWidth: 0,
          borderColor: palette.white,
          hoverBorderColor: palette.white
        }
      ],
      labels: ['Warehouse Time %', 'Carrier Time %']
    })

    setCostPropotionData({
      datasets: [
        {
          data: [Math.round(carrierTotalPay / (carrierTotalPay + packWarehouseTotalPay) * 100), Math.round(packWarehouseTotalPay / (carrierTotalPay + packWarehouseTotalPay) * 100)],
          backgroundColor: [
            palette.primary.main,
            palette.error.main,
            palette.warning.main
          ],
          borderWidth: 0,
          borderColor: palette.white,
          hoverBorderColor: palette.white
        }
      ],
      labels: ['Warehouse Cost %', 'Carrier Cost %']
    })


  }

  useEffect(() => {
    packages && transferHistory && getTotalCostAndTimeFigures();
  }, [packages, transferHistory])

  //End Doughnut 1

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={4}
      >
        <Grid
          item
          lg={8}
          md={12}
          xl={9}
          xs={12}
        >
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
            {/* <CardActions className={classes.actions}>
              <Button
                color="primary"
                size="small"
                variant="text"
              >
                Overview <ArrowRightIcon />
              </Button>
            </CardActions> */}
          </Card>
        </Grid>

        {/* New Chart */}
        <Grid
          item
          lg={8}
          md={12}
          xl={9}
          xs={12}
        >
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
                  {/* Last 7 days <ArrowDropDownIcon /> */}
                </Button>
              }
              title="Average Warehouse Hops for Distance Travelled"
            />
            <Divider />
            <CardContent>
              <div className={classes.chartContainer}>
                <Bar
                  data={hopsDistanceData}
                  options={options}
                />
              </div>
            </CardContent>
            <Divider />
            {/* <CardActions className={classes.actions}>
              <Button
                color="primary"
                size="small"
                variant="text"
              >
                Overview <ArrowRightIcon />
              </Button>
            </CardActions> */}
          </Card>
        </Grid>

        {/* Doughnut 1 */}
        <Grid
          item
          lg={4}
          md={4}
          xl={3}
          xs={12}
        >
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
                  {/* Last 7 days <ArrowDropDownIcon /> */}
                </Button>
              }
              title="Transit Time Propotion"
            />
            <Divider />
            <CardContent>

              {timePropotionData ? (
                <Doughnut
                  data={timePropotionData}
                  options={doughnutOptions}
                />
              ) : null}

            </CardContent>
          </Card>
        </Grid>

        {/* Doughnut 2 */}
        <Grid
          item
          lg={4}
          md={4}
          xl={3}
          xs={12}
        >
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
                  {/* Last 7 days <ArrowDropDownIcon /> */}
                </Button>
              }
              title="Transit Cost Propotion"
            />
            <Divider />
            <CardContent>

              {timePropotionData ? (
                <Doughnut
                  data={costPropotionData}
                  options={doughnutOptions}
                />
              ) : null}

            </CardContent>
            <Divider />
          </Card>
        </Grid>
        {/* LatestOrders */}
        <Grid
          item
          lg={12}
          md={12}
          xl={12}
          xs={12}
        >



          <LatestOrders />


        </Grid>
        <Grid
          item
          lg={12}
          md={12}
          xl={12}
          xs={12}
        >


          {/* <Card
            {...rest}
            className={clsx(classes.root, className)}
          >
            <CardHeader
              action={
                <Button
                  size="small"
                  variant="text"
                >
                  //  Last 7 days <ArrowDropDownIcon /> 
                </Button>
              }
              title="User Distribution"
            />
            <Divider />
            <CardContent>
              <Iframe url="https://datastudio.google.com/embed/reporting/fff3e99b-f1cb-4293-9b48-7cb1dc37d3d4/page/azjBB"
                width="100%"
                height="450px"
                id="myId"
                className="myClassname"
                display="initial"
                position="relative" />
            </CardContent>
            <Divider />
          </Card> */}
          </Grid>
          <Grid
          item
          lg={12}
          md={12}
          xl={12}
          xs={12}
        >
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
                  {/* Last 7 days <ArrowDropDownIcon /> */}
                </Button>
              }
              title="User Details"
            />
            <Divider />
            <CardContent>
              <Iframe url="https://datastudio.google.com/embed/reporting/d2e53e2a-f623-4aec-8b5f-9d3a792bed47/page/azjBB"
                width="100%"
                height="1000px"
                id="myId"
                className="myClassname"
                display="initial"
                position="relative" />
            </CardContent>
            <Divider />
          </Card>
        </Grid>
        <Grid
          item
          lg={12}
          md={12}
          xl={12}
          xs={12}
        >
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
                  {/* Last 7 days <ArrowDropDownIcon /> */}
                </Button>
              }
              title="Sales Summary Report"
            />
            <Divider />
            <CardContent>
              <Iframe url="https://datastudio.google.com/embed/reporting/23bbd381-049d-466f-94fa-1bb3f13386e4/page/1M"
                width="100%"
                height="1000px"
                id="myId"
                className="myClassname"
                display="initial"
                position="relative" />
            </CardContent>
            <Divider />
          </Card>
        </Grid>
        <Grid
          item
          lg={12}
          md={12}
          xl={12}
          xs={12}
        >
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
                  {/* Last 7 days <ArrowDropDownIcon /> */}
                </Button>
              }
              title="Sales Report"
            />
            <Divider />
            <CardContent>
              <Iframe url="https://datastudio.google.com/embed/reporting/5c83ebde-8d1a-420b-9d25-3c82c2c4f6aa/page/azjBB"
                width="100%"
                height="1000px"
                id="myId"
                className="myClassname"
                display="initial"
                position="relative" />
            </CardContent>
            <Divider />
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

Reports.propTypes = {
  className: PropTypes.string
};

export default Reports;
