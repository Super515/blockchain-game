import { useState } from "react";
import axios from "axios";
import { makeStyles, TextField, Button } from "@material-ui/core";
import Spinner from "../../components/Spinner";
import { BASEURL, errorToast, successToast } from "../../utils/Utils";

const useStyles = makeStyles((theme) => ({
  root: {
    '& label.Mui-focused': {
      color: 'white',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'white',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'yellow',
      },
    },
    '& .MuiInputBase-multiline': {
      padding: 0
    }
  },
  inputColor: {
    borderBottom: '2px solid white',
    color: 'white',
    '&:after': {
      borderBottom: '0px',
    },
  },
  labelColor: {
    color: 'white',
    '&.Mui-focused': {
      color: 'white',
    }
  },
  button: {
    "&.MuiButton-outlined": {
      border: '1px solid white',
      color: 'white'
    },
    "&:hover":{
      backgroundColor: 'white',
      color: 'black'
    },
    "&:disabled":{
        color: 'gray'
    }
  },
}))

const AddRaffle = () => {
  const params = new URLSearchParams(window.location.search);
	const adminKey = params.get('key');
  const classes = useStyles();
  const date = new Date();
  const defaultCurrencyData = {
    price: 0,
    currency: "",
    token: "",
  }
  const defaultNFTData = {
    title: "",
    titleLink: "",
    portValue: 0,
    imageUrl: "",
    startTime: date.toISOString().slice(0, 16),
    endTime: date.toISOString().slice(0, 16),
    ticketPrice: [defaultCurrencyData],
  }

  const [nftData, setNFTData] = useState(defaultNFTData);
  const [isLoading, setIsLoading] = useState(false);

  const handleInput = (e, index) => {
    const newNFTData = {...nftData};
    if (index === undefined) {
      newNFTData[e.target.name] = e.target.value;
    } else {
      newNFTData.ticketPrice[index][e.target.name] = e.target.value;
    }

    setNFTData(newNFTData);
  }

  const addNewCurrency = () => {
    const newNFTData = {...nftData};
    newNFTData.ticketPrice.push(defaultCurrencyData);
    setNFTData(newNFTData);
  }

  const save = async () => {
    console.log(nftData);
    try {
      const url = BASEURL + '/nft';
      setIsLoading(true);
      const res = await axios.post(url, {...nftData, key: adminKey});
      
      if (res.data.message === "Success") {
        setIsLoading(false);
        successToast("Request is Success.");
        window.location.href = "/raffle";
      } else {
        errorToast("Request is failed.");
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      errorToast("Server is not connected")
      setIsLoading(false);
    }
  }

  return (
      isLoading
        ? <Spinner />
        : <div className="mb-8 px-4">
            <div className={classes.root}>
              <div className="flex justify-between mb-4">
                <TextField 
                  required
                  name="title"
                  className="w-2/6"
                  onChange={handleInput}
                  value={nftData.title}
                  error={!nftData.title}
                  InputLabelProps={{className: classes.labelColor}} 
                  inputProps={{className: classes.inputColor}}
                  label="Title" />
                <TextField 
                  required
                  name="titleLink"
                  className="w-2/6"
                  onChange={handleInput}
                  value={nftData.titleLink}
                  error={!nftData.titleLink}
                  InputLabelProps={{className: classes.labelColor}} 
                  inputProps={{className: classes.inputColor}}
                  label="Title Link" />
              </div>
              <div className="mb-4">
                <TextField 
                  required
                  name="portValue"
                  type="number"
                  onChange={handleInput}
                  value={nftData.portValue}
                  error={!nftData.portValue}
                  InputLabelProps={{className: classes.labelColor}} 
                  inputProps={{className: classes.inputColor}}
                  label="Port Value" />
              </div>
              <div className="flex justify-between mb-4">
                <TextField
                  required
                  name="startTime"
                  onChange={handleInput}
                  value={nftData.startTime}
                  error={!nftData.startTime}
                  className="w-2/6"
                  label="State Time"
                  type="datetime-local"
                  InputLabelProps={{className: classes.labelColor}} 
                  inputProps={{className: classes.inputColor}} />
                <TextField
                  required
                  name="endTime"
                  label="End Time"
                  className="w-2/6"
                  onChange={handleInput}
                  value={nftData.endTime}
                  error={!nftData.endTime}
                  type="datetime-local"
                  InputLabelProps={{className: classes.labelColor}} 
                  inputProps={{className: classes.inputColor}} />
              </div>
              <div className="mb-4">
                <TextField 
                  required
                  name="imageUrl"
                  className="w-full"
                  onChange={handleInput}
                  value={nftData.imageUrl}
                  error={!nftData.imageUrl}
                  InputLabelProps={{className: classes.labelColor}} 
                  inputProps={{className: classes.inputColor}}
                  label="Image URL" />
              </div>
              <div className="mb-4 border-2 border-white rounded-lg p-4">
                {
                  nftData.ticketPrice.map((item, index) => 
                    <div key={index} className="flex justify-between mb-4">
                      <TextField 
                        required
                        name="currency"
                        className="w-4/12"
                        onChange={(e) => handleInput(e, index)}
                        value={item.currency}
                        error={!item.currency}
                        InputLabelProps={{className: classes.labelColor}} 
                        inputProps={{className: classes.inputColor}}
                        label="Currency" />
                      <TextField 
                        type="number"
                        required
                        name="price"
                        className="w-2/12"
                        onChange={(e) => handleInput(e, index)}
                        value={item.price}
                        error={!item.price}
                        InputLabelProps={{className: classes.labelColor}} 
                        inputProps={{className: classes.inputColor}}
                        label="Price" />
                      <TextField 
                        required
                        name="token"
                        className="w-5/12"
                        onChange={(e) => handleInput(e, index)}
                        value={item.token}
                        error={!item.token}
                        InputLabelProps={{className: classes.labelColor}} 
                        inputProps={{className: classes.inputColor}}
                        label="Token Address" />
                    </div>
                  )
                }
                <Button className={classes.button} variant="outlined" onClick={addNewCurrency}>Add Token</Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className={classes.button} variant="outlined" onClick={save} >Save</Button>
            </div>
          </div>
  );
}

export default AddRaffle;