import { useState, useEffect } from 'react';
import { useWallet } from "@solana/wallet-adapter-react";
import axios from 'axios';
import { TextField, makeStyles, Button } from "@material-ui/core";
import { BASEURL, errorToast, successToast } from "../utils/Utils";

const useStyles = makeStyles((theme) => ({
  button: {
    "&.MuiButton-outlined": {
      border: '1px solid black',
      color: 'black'
    },
    "&:hover":{
      backgroundColor: 'black',
      color: 'white'
    },
    "&:disabled":{
        color: 'gray'
    }
  }
}))

const Setting = () => {
    const classes = useStyles();
    const instance = useWallet();
    const { publicKey } = instance;
    const defaultUserInfo = {
      firstName: '',
      lastName: '',
      title: '',
      streetName: '',
      streetNumber: '',
      country: '',
      city: '',
      postalCode: '',
    }
    const [userInfo, setUserInfo] = useState(defaultUserInfo);
    const [update, setUpdate] = useState(false);

    const handleInput = (e) => {
      const newUserInfo = {...userInfo};
      newUserInfo[e.target.name] = e.target.value;
      setUserInfo(newUserInfo);
    }

    const handleSave = async () => {
      let validate = false;
      if (!publicKey) {
        errorToast("Please connect Wallet")
        return;
      }

      Object.keys(userInfo).forEach((item) => {
        if (!userInfo[item] && item !== "title") {
          validate = true
        }
      })

      if (validate) {
        errorToast("Please input all field");
        return;
      }
      
      const userData = {...userInfo, walletAddress: publicKey};
      try {
        let res;
        if (update) {
          const url = BASEURL + '/user/update';
          res = await axios.put(url, userData);
        } else {
          const url = BASEURL + '/user/register';
          res = await axios.post(url, userData);
        }
        console.log(res)
        const resData = res.data;
        if (resData.message === "Success") {
          successToast(`${update ? "Update" : "Register"} is success`);
          setUpdate(true);
        }
        else if (resData.message === "Existed") errorToast("This wallet is already registered");
        else errorToast(`${update ? "Update" : "Register"} is failed`);
      } catch (error) {
        console.log(error);
        errorToast("Network is unconnected.")
      }
    }

    useEffect(async () => {
      if (publicKey) {
        const url = BASEURL + `/user/get/${publicKey}`;
        console.log(url)
        const res = await axios.get(url);
        if (res.data.message === "Success") {
          const newUserInfo = res.data.data;
          setUserInfo(newUserInfo);
          setUpdate(true);
        } 
      }
    }, [publicKey])

    return (
        <div className="w-full flex flex-col px-2 my-8">
          <p className="text-3xl font-bold marion-font">User Info</p>
          <form noValidate>
            <div className="flex justify-between mb-4">
              <TextField
                name="firstName"
                value={userInfo.firstName}
                onChange={handleInput}
                required
                className="w-5/12"
                error={!userInfo.firstName}
                label="First Name" />
              <TextField 
                name="lastName"
                required
                value={userInfo.lastName}
                onChange={handleInput}
                className="w-5/12"
                error={!userInfo.lastName}
                label="Last Name" />
            </div>
            <div className="mb-4">
              <TextField 
                name="title"
                value={userInfo.title}
                onChange={handleInput}
                className="w-full"
                label="Title" />
            </div>
            <div className="flex justify-between mb-4">
              <TextField 
                name="streetName"
                value={userInfo.streetName}
                onChange={handleInput}
                required
                className="w-5/12 md:w-7/12"
                error={!userInfo.streetName}
                label="Street Name" />
              <TextField 
                name="streetNumber"
                value={userInfo.streetNumber}
                onChange={handleInput}
                required
                className="w-5/12 mdw-3/12"
                error={!userInfo.streetNumber}
                label="Street Number" />
            </div>
            <div className="flex flex-wrap justify-between mb-8">
              <TextField 
                name="country"
                value={userInfo.country}
                onChange={handleInput}
                required
                className="w-4/12"
                error={!userInfo.country}
                label="Country" />
              <TextField 
                name="city"
                value={userInfo.city}
                onChange={handleInput}
                required
                className="w-4/12"
                error={!userInfo.city}
                label="City" />
              <TextField 
                name="postalCode"
                value={userInfo.postalCode}
                onChange={handleInput}
                required
                className="w-6/12 md:w-2/12"
                error={!userInfo.postalCode}
                label="Postal Code" />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} className={classes.button} variant="outlined">
                {update ? "Update" : "Save"}
              </Button>
            </div>
          </form>
        </div>
    );
}

export default Setting;