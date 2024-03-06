import { useEffect, useState } from "react";
import SwipeableViews from 'react-swipeable-views';
import { makeStyles, useTheme, Tabs, Tab, List, ListItem, Button, TextField } from "@material-ui/core";
import Card from "../../components/Card";
import axios from "axios";
import { Delete } from "@material-ui/icons";
import { BASEURL, errorToast, successToast } from "../../utils/Utils";
import Spinner from "../../components/Spinner";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    border: '2px solid black',
    borderRadius: '16px',
    color: 'black',
    marginBottom: '8px',
    "&:hover": {
      borderColor: 'blue'
    }
  },
  inline: {
      display: 'flex',
      justifyContent: 'space-between',
      color: 'black'
  },
	tabs: {
		"& .MuiTabs-indicator": {
			backgroundColor: "black"
		}
	},
	tab: {
		"&.MuiButtonBase-root.MuiTab-root": {
			color: "black"
		}
	},
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
	},
}))

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <>
          {children}
        </>
      )}
    </div>
  );
}

const a11yProps = (index) => {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const Admin = () => {
  const params = new URLSearchParams(window.location.search);
	const adminKey = params.get('key');
	const classes = useStyles();
  const [merches, setMerches] = useState([]);
  const [trades, setTrades] = useState([]);
  const [tokenList, setTokenList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
	const [value, setValue] = useState(0);
  const [trackNumber, setTrackNumber] = useState([]);
  const [tokenName, setTokenName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  
	const theme = useTheme();

  useEffect(() => {
		value === 0 
      ? loadMerches() 
      : value === 1
        ? loadTrades()
        : getTokenList();
  }, [value]);

	const handleChange = (event, newValue) => {
    setValue(newValue);
  };

	const handleChangeIndex = (index) => {
    setValue(index);
  };

	const loadTrades = async() => {
		setIsLoading(true);
		axios
			.get(BASEURL + "/trade/all")
			.then((response) => {
        const newTradeData = response.data.data;
        let newTrack = [];
        const data = newTradeData.map(item => { 
          newTrack.push("");
          const soldDate = new Date(item.soldAt);
          const deliveryDate = new Date(item.deliveryAt);
          return {...item, soldAt: soldDate.toLocaleDateString(), deliveryAt: deliveryDate.toLocaleDateString()};
        })
        setTrackNumber(newTrack);
        setTrades(data);
				setIsLoading(false);
			})
			.catch((e) => {
				console.log(e);
				setTrades(false);
				errorToast(e.response.data.message);
			});
	};

  const loadMerches = () => {
    setIsLoading(true);
    axios
      .get(BASEURL + "/merch/all")
      .then((response) => {
        setMerches(response.data.data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setMerches(false);
        errorToast(e.response.data.message);
      });
  };

  const getTokenList = () => {
    setIsLoading(true);
    axios
      .get(BASEURL + "/currency/all")
      .then((response) => {
        setTokenList(response.data.data);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setTokenList([]);
        errorToast(e.response.data.message);
      });
  }

  const handleInput = (value, index) => {
    let newTrack = [...trackNumber];
    newTrack[index] = value;
    setTrackNumber(newTrack);
  }

  const handleDelivery = async (id) => {
    try {
      const url = BASEURL + "/trade/delivery";
      const res = await axios.post(url, {id, trackNumber});
      if (res.data.message === "Success") {
          successToast("Request is success");
          loadTrades();
      } else {
          errorToast("Request is failed.")
      } 
    } catch (error) {
        errorToast("Network is not connected.")
    }
  }

  const tradeComplete = async (id) => {
    try {
        const url = BASEURL + "/trade/complete";
        const res = await axios.post(url, {id});
        if (res.data.message === "Success") {
            successToast("Request is success");
            loadTrades();
        } else {
            errorToast("Request is failed.")
        } 
    } catch (error) {
        errorToast("Network is not connected.")
    }
  }

  const addNewToken = async () => {
    if (!tokenName || !tokenAddress ) {
      errorToast("Please input all field");
      return;
    }

    try {
      const url = BASEURL + "/currency/add";
      const res = await axios.post(url, {name: tokenName, address: tokenAddress, key: adminKey});
      if (res.data.message === "Success") {
        successToast("Request is success");
        getTokenList();
      } else {
        errorToast("Request is Failed");
      }
    } catch (error) {
      errorToast("Server is not connected");
    }
  }

  const removeToken = async (id) => {
    try {
      const url = BASEURL + "/currency/delete/" + id;
      const res = await axios.post(url, {key: adminKey});
      if (res.data.message === "Success") {
        successToast("Request is success");
        getTokenList();
      } else {
        errorToast("Request is Failed");
      }
    } catch (error) {
      errorToast("Server is not connected");
    }
  }

  const removeMerch = async (id) => {
    try {
      const url = BASEURL + "/merch/delete/" + id;
      const res = await axios.post(url, {key: adminKey});
      if (res.data.message === "Success") {
        successToast("Request is success");
        loadMerches();
      } else {
        errorToast("Request is Failed");
      }
    } catch (error) {
      errorToast("Server is not connected");
    }
  }

  return (
    <div className="flex flex-col px-4">
			{
				value === 0 &&
					<a href="/add-new" className="text-center border-2 border-black rounded-lg py-2 hover:bg-black hover:text-white font-bold">Add Merch</a>
			}
			<Tabs
				className={classes.tabs}
				value={value}
				onChange={handleChange}
				variant="fullWidth"
				indicatorColor="secondary"
				textColor="secondary"
				aria-label="full width tabs example"
			>
				<Tab className={classes.tab} label="Merch List" {...a11yProps(0)} />
				<Tab className={classes.tab} label="Order List" {...a11yProps(1)} />
				<Tab className={classes.tab} label="Add Currency" {...a11yProps(2)} />
			</Tabs>
			<SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          <div className="flex flex-wrap justify-center">
            {
              isLoading
                ? <Spinner /> 
                : merches && merches.length === 0 
                  ? (
                      <p className="my-10 text-xl font-semibold text-center">
                        No Merch(s) Found
                      </p>
                    )
                  : (
                      merches.map((d, index) => 
                        <div key={index} className="relative">
                          <button className="absolute" onClick={() => removeMerch(d._id)}><Delete  /></button>
                          <Card data={d} />
                        </div>
                      )
                    )
            }
          </div>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          {
						isLoading
							? <Spinner /> 
							: trades && trades.length === 0 
								? (
										<p className="my-10 text-xl font-semibold text-center">
											No Trade(s) Found
										</p>
									)
								: (
                  <List>
                    {
                      trades.map((item, index) => 
                        <ListItem className={classes.root} key={index} alignItems='flex-start'>
                            <div className='flex w-full'>
                                <img className='w-32 border-1' src={item.imageUrl} alt="merch" />
                                <div className='flex-1 flex flex-col justify-between pl-4'>
                                    <div className='flex flex-col'>
                                        <div className='flex justify-between text-lg'>
                                            <span>{item.title}</span>
                                            <span>Sold at: {item.soldAt}</span>
                                        </div>
                                        <div className='text-lg'>Price: {item.price}</div>
                                        <div className='text-lg'>Amount: {item.amount}</div>
                                        <div className='flex justify-between'>
                                          <div className=''>
                                            <div className='text-lg'>Full Name: {item.firstName}&nbsp;{item.lastName}</div>
                                            <div className='text-lg'>Address: {item.country}&nbsp;{item.city}&nbsp;{item.streetName}&nbsp;{item.streetNumber}</div>
                                          </div>
                                          <div className=''>
                                            {
                                              item.completed !== 0 &&
                                                <div className="">
                                                  <p>Delivery within {item.deliveryAt}</p>
                                                  <p>Tracking Number: <a href="#">{item.trackNumber}</a></p>
                                                </div>
                                            }
                                          </div>
                                        </div>
                                    </div>
                                    <div className='flex flex-row items-center justify-between'>
                                        { 
                                          item.completed === 0 
                                            ? "Order Received"
                                            : item.completed === 1
                                              ? "On the way"
                                              : "Delivered"
                                        }
                                        <div>
                                          {
                                            item.completed === 0
                                              ? <div className="flex">
                                                  <TextField 
                                                    className="w-96" 
                                                    value={trackNumber[index]}
                                                    onChange={e => handleInput(e.target.value, index)}
                                                    label="Tracking Number" />
                                                  <Button 
                                                    onClick={() => handleDelivery(item._id)} 
                                                    className={classes.button} 
                                                    variant="outlined">Delivery Now</Button>
                                                </div>
                                              : item.completed === 1
                                                ? <Button 
                                                    onClick={() => tradeComplete(item._id)} 
                                                    className={classes.button} 
                                                    variant="outlined">Complete</Button>
                                                : <span></span>
                                          }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ListItem>)
                      }
                  </List>
                )
					}
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction} >
          <div className="flex flex-col mb-8">
            <div className="flex items-end">
              <div className="flex flex-col md:flex-row">
                <div className="mr-8">
                  <TextField
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    error={!tokenName}
                    required
                    label="Token Name" />
                </div>
                <div className="mr-8">
                  <TextField
                    value={tokenAddress}
                    error={!tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    required
                    label="Token Address" />
                </div>
              </div>
              <Button 
                onClick={() => addNewToken()} 
                className={classes.button} 
                variant="outlined">Add New Token</Button>
            </div>
            <div className="my-8">
              {
                !tokenList.length
                  ? <p className="text-xl font-semibold text-center">There is no any currency</p>
                  : <div className="">
                    {
                      tokenList.map((token, index) => 
                        <div key={index} className="flex justify-between border-b-2 border-black pb-2 mb-2">
                          <div className="flex-1 pr-8 flex justify-between items-end text-xl font-bold">
                            <span>{token.name}</span>
                            <span>{token.address}</span>
                          </div>
                          <Button 
                            onClick={() => removeToken(token._id)} 
                            className={classes.button} 
                            variant="outlined">remove</Button>
                        </div>
                      )
                    }
                  </div>
              }
            </div>
          </div>
        </TabPanel>
      </SwipeableViews>
    </div>
  );
};

export default Admin;
