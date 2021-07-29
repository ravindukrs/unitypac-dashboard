import React, { useContext, useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker
} from "react-simple-maps";
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Avatar,
    LinearProgress,
    CardHeader,
    Button,
    Divider,
    CardActions,
} from '@material-ui/core';
import InsertChartIcon from '@material-ui/icons/InsertChartOutlined';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';

import { FirebaseContext } from '../../../../config/Firebase';


const useStyles = makeStyles(theme => ({
    root: {
        height: '120%'
    },
    content: {
        alignItems: 'center',
        display: 'flex',
    },
    title: {
        fontWeight: 700
    },
    avatar: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        height: 56,
        width: 56
    },
    icon: {
        height: 32,
        width: 32
    },
    progress: {
        marginTop: theme.spacing(3)
    }
}));


const geoUrl =
    "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const MapChart = (props) => {

    const contextValue = useContext(FirebaseContext);

    const [warehouseMarkers, setWarehouseMarkers] = useState(null);
    const [carrierMarkers, setCarrierMarkers] = useState(null);



    useEffect(() => {
        (async () => {
            try {
                await contextValue.db.collection('users').where("userType", "==", "Warehouse")
                    .onSnapshot(snapshot => {
                        var markersArray = [];
                        snapshot.forEach(doc => {
                            const id = doc.id;
                            const data = doc.data();
                            const unitString = { markerOffset: 25, name: id, coordinates: [parseFloat(data.currentLocation.lng), parseFloat(data.currentLocation.lat)] }
                            markersArray.push(unitString);
                        })
                        setWarehouseMarkers(markersArray);
                    })
                    await contextValue.db.collection('users').where("userType", "==", "Carrier")
                    .onSnapshot(snapshot => {
                        var markersArray = [];
                        snapshot.forEach(doc => {
                            const id = doc.id;
                            const data = doc.data();
                            const unitString = { markerOffset: 25, name: id, coordinates: [parseFloat(data.currentLocation.lng), parseFloat(data.currentLocation.lat)] }
                            markersArray.push(unitString);
                        })
                        setCarrierMarkers(markersArray);
                    })
            } catch (error) {
                console.log(error);
            }
        })()
    }, [])


    const { className, ...rest } = props;
    const classes = useStyles();

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
                title="Carrier & Warehouse Distribution"
            />
            <Divider />
            <CardContent>
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{
                        //rotate: [58, 20, 0],
                        scale: 9000,
                        center: [80.7718, 7.7731]
                    }}
                >
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies
                                .filter(d => d.properties.NAME === "Sri Lanka")
                                .map(geo => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#EAEAEC"
                                        stroke="#D6D6DA"
                                    />
                                ))
                        }
                    </Geographies>
                    {warehouseMarkers && warehouseMarkers.map(({ name, coordinates, markerOffset }) => (
                        <Marker key={name} coordinates={coordinates}>
                            <circle r={10} fill="#F00" stroke="#fff" strokeWidth={2} />
                            <text
                                textAnchor="middle"
                                y={markerOffset}
                                style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
                            >
                                
                            </text>
                        </Marker>
                    ))}
                    {carrierMarkers && carrierMarkers.map(({ name, coordinates, markerOffset }) => (
                        <Marker key={name} coordinates={coordinates}>
                            <circle r={3} fill="#32CD32" stroke="#32CD32" strokeWidth={2} />
                            <text
                                textAnchor="middle"
                                y={markerOffset}
                                style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
                            >
                                
                            </text>
                        </Marker>
                    ))}
                </ComposableMap>

            </CardContent>
        </Card>
    );
};

MapChart.propTypes = {
    className: PropTypes.string
};

export default MapChart;
