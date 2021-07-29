import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import uuid from 'uuid/v1';
var CryptoJS = require("crypto-js");
import PerfectScrollbar from 'react-perfect-scrollbar';

import { UsersToolbar, UsersTable } from './components';
import mockData from './data';

import { FirebaseContext } from '../../config/Firebase';
var QRCode = require('qrcode.react');
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  TableSortLabel,
  TextField
} from '@material-ui/core';

import FilledInput from '@material-ui/core/FilledInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


import ReactExport from "react-export-excel";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;


const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 400,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const Envelope = props => {
  const { className, ...rest } = props;

  const classes = useStyles();

  // const [users] = useState(mockData);
  const contextValue = useContext(FirebaseContext);
  const [envSize, setEnvSize] = useState("SM");
  const [phrase, setPhrase] = useState(null);
  const [currentQr, setCurrentQr] = useState(null);
  const [envelopes, setEnvelopes] = useState(null);
  const [batchQty, setBatchQty] = useState(1);
  const [batchSize, setBatchSize] = useState("SM")

  useEffect(() => {
    (async () => {
      const keyPhrase = await contextValue.db.collection('cipher').doc("symmetric").get();
      setPhrase(keyPhrase.data().key);
      console.log("Phrase is ", keyPhrase.data())
    })()
  }, [])

  const handleChange = async (val) => {
    val.preventDefault();
    await setEnvSize(val.target.value);

  }

  useEffect(() => {
    (async () => {
      try {
        await contextValue.db.collection('envelopes').orderBy("used", "desc").
          onSnapshot(snapshot => {
            var envelopesArray = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              envelopesArray.push(data);
            })
            setEnvelopes(envelopesArray);
          })

      } catch (error) {
        console.log(error);
      }
    })()
  }, [])

  const handleSubmit = async () => {
    const currentUUID = await uuid();
    const envelope = {
      size: envSize,
      used: false,
      type: "ENV_BARCODE",
      envid: currentUUID
    }
    console.log("Envelope: ", envelope)
    var ciphertext = await CryptoJS.AES.encrypt(JSON.stringify(envelope), phrase).toString();
    console.log("CipherText: ", ciphertext)

    contextValue.db.collection('envelopes').doc(`${currentUUID}`).set(
      { ...envelope, ciphertext }
    );


    setCurrentQr(ciphertext);
  }

  const generateBatch = async () => {

    for(var i=0; i<batchQty; i++){
      const currentUUID = await uuid();
      const envelope = {
        size: batchSize,
        used: false,
        type: "ENV_BARCODE",
        envid: currentUUID
      }
      console.log("Envelope: ", envelope)
      var ciphertext = await CryptoJS.AES.encrypt(JSON.stringify(envelope), phrase).toString();
      console.log("CipherText: ", ciphertext)
  
      contextValue.db.collection('envelopes').doc(`${currentUUID}`).set(
        { ...envelope, ciphertext }
      );
    }
   console.log("Generation Complete");
  }

  if (phrase) {
    return (
      <div className={classes.root}>
        <Grid
          container
          spacing={4}
        >
          <Grid
            item
            lg={6}
            md={6}
            xl={6}
            xs={6}
          >
            <Card
              {...rest}
              className={clsx(classes.root, className)}
            >
              <CardHeader
                title="Create Envelope Form"
              />
              <Divider />
              <CardContent>
                <FormControl className={classes.formControl}>
                  <InputLabel id="demo-simple-select-label">Envelope Size</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={envSize}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value={"L"}>Large</MenuItem>
                    <MenuItem value={"M"}>Medium</MenuItem>
                    <MenuItem value={"SM"}>Small</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={() => handleSubmit()}>
                  Generate QR
                </Button>
              </CardContent>
              <Divider />
            </Card>
          </Grid>
          <Grid
            item
            lg={6}
            md={6}
            xl={6}
            xs={6}
          >
            {currentQr ? (
              <Card
                {...rest}
                className={clsx(classes.root, className)}
              >
                <CardHeader
                  title="Generated Envelope QR"
                />
                <Divider />
                <CardContent>
                  <QRCode value={currentQr} />
                </CardContent>
                <Divider />
              </Card>
            ) : null}
          </Grid>
          <Grid
            item
            lg={6}
            md={6}
            xl={6}
            xs={6}
          >
            <Card
              {...rest}
              className={clsx(classes.root, className)}
            >
              <CardHeader
                title="Batch Generate Envelopes"
              />
              <Divider />
              <CardContent>
                <FormControl className={classes.formControl}>
                  <InputLabel id="select-label">Envelope Size</InputLabel>
                  <Select
                    labelId="select-label"
                    id="select"
                    value={batchSize}
                    onChange={(event)=>{
                      setBatchSize(
                        event.target.value
                      )
                    }}
                    fullWidth
                  >
                    <MenuItem value={"L"}>Large</MenuItem>
                    <MenuItem value={"M"}>Medium</MenuItem>
                    <MenuItem value={"SM"}>Small</MenuItem>
                  </Select>
                  <TextField
                    id="outlined-number"
                    label="Quantity"
                    type="number"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    variant="outlined"
                    onChange = {(event)=> {
                      setBatchQty(parseInt(event.target.value))
                    }}
                    value={batchQty}
                    margin="normal"
                  />
                </FormControl>
                <Button variant="contained" color="primary" onClick={() => generateBatch()}>
                  Generate Envelope Batch
                </Button>
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
                title="Envelopes in Circulation"
              />
               <ExcelFile element={<button>Download Data</button>}>
                <ExcelSheet data={envelopes} name="Envelopes">
                    <ExcelColumn label="Envelope ID" value="envid"/>
                    <ExcelColumn label="Size" value="size"/>
                    <ExcelColumn label="Status"
                                 value={(col) => col.used ? "Used" : "In Circulation"}/>
                </ExcelSheet>
                <ExcelSheet data={envelopes} name="Contractor">
                    <ExcelColumn label="Envelope QR" value="ciphertext"/>
                    <ExcelColumn label="Size" value="size"/>
                </ExcelSheet>
            </ExcelFile>
              <Divider />
              <CardContent className={classes.content}>
                <PerfectScrollbar>
                  <div className={classes.inner}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Envelope ID</TableCell>
                          <TableCell>Used</TableCell>
                          <TableCell sortDirection="desc">
                            <Tooltip
                              enterDelay={300}
                              title="Sort"
                            >
                              <TableSortLabel
                                active
                                direction="desc"
                              >
                                Size
                                        </TableSortLabel>
                            </Tooltip>
                          </TableCell>

                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {envelopes && envelopes.map(item => (
                          <TableRow
                            hover
                            key={item.envid}
                          //onClick={() => handleToggle(order)}
                          >
                            <TableCell>{item.envid}</TableCell>
                            <TableCell>{item.used ? "Used / Discarded" : "In Circulation"}</TableCell>
                            <TableCell>
                              {item.size}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </PerfectScrollbar>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  } else {
    return null
  }

};

export default Envelope;
