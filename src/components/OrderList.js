import { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet } from "@solana/wallet-adapter-react";
import { makeStyles, Button } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { BASEURL, errorToast, successToast } from '../utils/Utils';
import Spinner from './Spinner';

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
}));

const OrderList = () => {
    const { publicKey } = useWallet();
    const classes = useStyles();
    const [orderList, setOrderList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const initOrderList = async() => {
        setIsLoading(true);
        try {
            const userId = localStorage.getItem('userId');
            const url = BASEURL + '/trade/user/' + userId;
            
            const res = await axios.get(url);
            if (res.data.message === "Success") {
                let newOrderList = res.data.data;
                const data = newOrderList.map(item => { 
                    const soldDate = new Date(item.soldAt);
                    const deliveryDate = new Date(item.deliveryAt);
                    return {...item, soldAt: soldDate.toLocaleDateString(), deliveryAt: deliveryDate.toLocaleDateString()};
                })
                setOrderList(data);
            } else {
                errorToast("Request is failed")
            }
        } catch (error) {
            console.log(error);
            errorToast("Network is unconnected")
        }
        setIsLoading(false);
    }

    useEffect(async() => {
        if (publicKey) {
            await initOrderList()
        }
    }, [publicKey]);

    return (
        <div className=''>
            <p className="text-3xl font-bold marion-font">Order List</p>
            {
                publicKey
                    ? isLoading 
                        ? <Spinner />
                        : <List>
                            {
                                !orderList.length
                                    ? <p className='text-lg font-bold text-center'>There is no any develiry.</p>
                                    : orderList.map((item, index) => 
                                            <ListItem className={classes.root} key={index} alignItems='flex-start'>
                                                <div className='flex w-full'>
                                                    <img className='w-32 border-1' src={item.imageUrl} />
                                                    <div className='flex-1 flex flex-col justify-between pl-4'>
                                                        <div className='flex flex-col'>
                                                            <div className='flex justify-between text-lg'>
                                                                <span>{item.title}</span>
                                                                <span>Sold at: {item.soldAt}</span>
                                                            </div>
                                                            <div className='text-lg'>Size: {item.size}</div>
                                                            <div className='text-lg'>Price: {item.price}</div>
                                                            <div className='text-lg'>Amount: {item.amount}</div>
                                                            <div className='flex justify-between'>
                                                                <div className=''></div>
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
                                                        </div>
                                                    </div>
                                                </div>
                                            </ListItem>
                                        )
                            }
                        </List>
                    : <p className='text-center text-bold my-8 text-xl'>Please connect wallet</p>
            }
        </div>
    );
}

export default OrderList;