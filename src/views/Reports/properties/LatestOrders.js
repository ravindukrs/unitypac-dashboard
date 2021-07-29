import React, { useState, useEffect, useContext } from 'react';
import clsx from 'clsx';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Backdrop from '@material-ui/core/Backdrop';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';


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

import { FirebaseContext } from '../../../config/Firebase';


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
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        backgroundColor: 'rgba(192,192,192,0.9)'
    },
    paper: {
        padding: '6px 16px',
    },
    secondaryTail: {
        backgroundColor: theme.palette.secondary.main,
    },
}));



const statuses = {
    INITIAL_SENDER: 'Obtained Package from Sender',
    WAREHOUSE_TRANSFER: 'Package Handed over TO Warehouse',
    TRANSFER_FROM_WAREHOUSE: 'Package Handed over FROM Warehouse',
    FINAL_RECEPIENT: 'Package Handed Over to Customer (Reciever)',
};


const LatestOrders = props => {
    const contextValue = useContext(FirebaseContext);

    const { className, ...rest } = props;

    const classes = useStyles();

    const [packages, setPackages] = useState(null);
    const [open, setOpen] = useState(false);
    const [transferHistory, setTransferHistory] = useState(null);


    const compareValues = (key, order = 'asc') => {
        return function innerSort(a, b) {
            if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
                // property doesn't exist on either object
                return 0;
            }

            const varA = (typeof a[key] === 'string')
                ? a[key].toUpperCase() : a[key];
            const varB = (typeof b[key] === 'string')
                ? b[key].toUpperCase() : b[key];

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order === 'desc') ? (comparison * -1) : comparison
            );
        };
    }


    const handleClose = () => {
        setOpen(false);
    };
    const handleToggle = async (parcel) => {
        console.log(parcel);
        try {
            var packages = await contextValue.db.collectionGroup('packageTransferHistory');
            await packages.get().then(function (querySnapshot) {
                var subCollection = []
                querySnapshot.forEach(function (doc) {
                    const id = doc.id;
                    const data = doc.data();
                    const parentId = doc.ref.parent.parent.id;
                    if (parentId === parcel.id) {
                        subCollection.push({ id, parentId, ...data })
                    }
                });

                setTransferHistory(subCollection.sort(compareValues('timeStamp')));
            });
        } catch (error) {
            console.log(error);
        }

        setOpen(!open);
    };

    useEffect(() => {
        (async () => {
            try {
                await contextValue.db.collection('packages').orderBy("packageTransactions.timeStamp", "desc").
                    onSnapshot(snapshot => {
                        var packagesArray = [];
                        snapshot.forEach(doc => {
                            const id = doc.id;
                            const data = doc.data();
                            packagesArray.push({ id, ...data });
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
        <div>
            <Card
                {...rest}
                className={clsx(classes.root, className)}
            >
                <CardHeader
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
                                                   Posted Date
                                        </TableSortLabel>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>Origin Address</TableCell>
                                        <TableCell>Destination Address</TableCell>
                                        <TableCell>Status</TableCell>
                                        
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {packages && packages.map(order => (
                                        <TableRow
                                            hover
                                            key={order.id}
                                            onClick={() => handleToggle(order)}
                                        >
                                            <TableCell>{order.id}</TableCell>
                                            <TableCell>{order.recieverCustomer.customerName}</TableCell>
                                            <TableCell>
                                                {order.senderCustomer.postedDateTime}
                                            </TableCell>
                                            <TableCell>
                                                {order.location.originLocation.originAddress}
                                            </TableCell>
                                            <TableCell>
                                                {order.location.destinationLocation.destinationAddress}
                                            </TableCell>
                                            <TableCell>
                                                <div className={classes.statusContainer}>
                                                    {/* <StatusBullet
                          className={classes.status}
                          color={statusColors[order.transit.transitStatus.replace(/ /g, "_")]}
                          size="sm"
                        /> */}                      {order.transit.transitStatus}

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
            <div>
                <Backdrop className={classes.backdrop} open={open} onClick={handleClose}>
                    <React.Fragment>
                        <Timeline align="alternate">

                            {transferHistory && transferHistory.map(order => (
                                <TimelineItem key={order.id}>
                                    <TimelineOppositeContent>
                                        <Typography color="success">{order.timeStamp}</Typography>
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot />
                                        <TimelineConnector />
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Paper elevation={3} className={classes.paper}>
                                            <Typography variant="h4" component="h1">
                                                {statuses[order.transferType]}
                                            </Typography>
                                            <Typography variant="h6" component="h1">
                                                Package Scanned by UID : {order.scanUser}
                                                </Typography>
                                                <Typography variant="h6" component="h1">Package QR Generated by UID : {order.qrUser}</Typography>
                                                <Typography variant="h6" component="h1">Pay Amount at Transaction Completion: {order.associatedPay ? order.associatedPay.charge : "Payment Not Applicable"}</Typography>
                                                <Typography variant="h6" component="h1">Distance Travelled: {order.associatedPay&&order.associatedPay.distanceTravelled ? order.associatedPay.distanceTravelled : "Distance Not Applicable"}</Typography>
                                                <Typography variant="h6" component="h1">Warehouse Hours: {order.associatedPay&&order.associatedPay.hours ? order.associatedPay.hours : "Warehouse Hours Not Applicable"}`</Typography>        
                                        </Paper>
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </Timeline>
                    </React.Fragment>
                </Backdrop>
            </div>
        </div>
    );
};

LatestOrders.propTypes = {
    className: PropTypes.string
};

export default LatestOrders;
