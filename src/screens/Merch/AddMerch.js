import { useState, useEffect } from "react";
import { makeStyles, Button, TextField, Select } from "@material-ui/core";
import ImageUploading from 'react-images-uploading';
import axios from "axios";
import { BASEURL, errorToast, successToast } from "../../utils/Utils";
import { Delete } from "@material-ui/icons";

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
	},

}))

const AddMerch = () => {
	const [tokenList, setTokenList] = useState([]);
	const params = new URLSearchParams(window.location.search);
	const adminKey = params.get('key');
	
	const classes = useStyles();
	const defaultColorData = {
		color: '',
		file: [],
		sizes: [
			{size: '', price: [{currency: 'Sol', price: 0, token: 0}], amount: 0},
		]
	}

	const defaultMerchData = {
		title: '',
		description: '',
		file: [],
		colors: []
	}
	const [merchData, setMerchData] = useState(defaultMerchData);

	const addColor = () => {
		const colorData = { ...defaultColorData };
		tokenList.forEach(token => { colorData.sizes[0].price.push({currency: token.name, price: 0, token: token.address}) });
		console.log(colorData)
		const newColorData = [...merchData.colors, colorData];
		const newMerchData = {...merchData, colors: newColorData}
		setMerchData(newMerchData);
	}

	const addSize = (index) => {
		let priceList = [{currency: 'Sol', price: 0, token: 0}];
		tokenList.forEach(token => { priceList.push({currency: token.name, price: 0, token: token.address}) });
		let newMerchData = {...merchData};
		newMerchData.colors[index].sizes.push({size: '', price: priceList, amount: 0});
		setMerchData(newMerchData);
	}

	const removeColor = (index) => {
		let newData = {...merchData};
		newData.colors = newData.colors.filter((item, i) => index !== i);
		console.log(newData)
		setMerchData(newData);
	}

	const fileChange = (imageList, index) => {
		const newData = {...merchData};
		newData.colors[index].file = imageList;
		setMerchData(newData);
	};

	const handleInput = (e, index, subIndex, tokenIndex) => {
		const newData = {...merchData};

		if (index === undefined && subIndex == undefined && tokenIndex == undefined) {
			newData[e.target.name] = e.target.value;
		} else if (subIndex === undefined && tokenIndex == undefined) {
			newData.colors[index][e.target.name] = e.target.value
		} else if (tokenIndex == undefined) {
			let sizeData = newData.colors[index].sizes
			sizeData[subIndex][e.target.name] = e.target.value;
		} else {
			let sizeData = newData.colors[index].sizes
			sizeData[subIndex].price[tokenIndex].price = e.target.value;
		}
		setMerchData(newData);
	}

	const handleSave = async () => {
		if (!merchData.title || !merchData.description || merchData.colors.length === 0 ) {
			errorToast("Please input all field");
			return;
		}

		let validate = false;
		merchData.colors.forEach(item => {
			if (!item.color || item.file.length === 0) {
				validate = true;
			}
		})

		if (validate) {
			errorToast("Please input all field");
			return;
		}
		
		try {
			merchData.key = adminKey;
			const url = BASEURL + '/merch/add';
			const res = await axios.post(url, merchData);
			if (res.data.message === "Success") {
				successToast("New Merch is added succssfully");
				window.location.href = "/admin"
			} else {
				errorToast(res.data.message);
			}
		} catch (err) {
			console.log(err);
			errorToast("Network is unconnected");
		}
	}

	useEffect( async () => {
		try {
			const url = BASEURL + "/currency/all";
			const res = await axios.get(url);
			if (res.data.message === "Success") {
			  setTokenList(res.data.data);
			}
		} catch (error) {
			errorToast("Server is not connected");
		}
	}, []);

	return (
		<div className="mb-8 px-4">
			<p className="text-3xl font-bold mb-8 marion-font">New Merch</p>
			<div className={classes.input}>
				<div className="mb-4 flex justify-between">
					<div className="flex flex-col flex-1 justify-between">
						<div className="mb-4">
							<TextField
								name="brand"
								onChange={handleInput}
								value={merchData.brand}
								error={!merchData.brand}
								required
								className="w-5/12"
								label="Brand" />
						</div>
						<div className="mb-4">
							<TextField
								name="title"
								onChange={handleInput}
								value={merchData.title}
								error={!merchData.title}
								required
								className="w-5/12"
								label="Title" />
						</div>
						<TextField
							name="description"
							value={merchData.description}
							error={!merchData.description}
							onChange={handleInput}
							multiline
							required
							minRows={5}
							className="w-full"
							label="Description" />
					</div>
				</div>
				<div className="">
					{
						merchData.colors.length > 0 && merchData.colors.map((color, index) => 
							<div key={index} className="mb-8 flex flex-col md:flex-row justify-between p-4 border-2 border-black rounded-lg">
								<div className="">
									<TextField
										name="color"
										value={color.color}
										onChange={(e) => handleInput(e, index)}
										required
										label="Color" />
								</div>
								<div className="flex-1 md:px-8 mb-4">
									<div className="mb-8">
										{
											color.sizes.map((size, subIndex) => 
												<div key={subIndex} className="mt-2 flex justify-around">
													<TextField
														style={{width: '80px'}}
														name="size"
														value={size.size}
														onChange={(e) => handleInput(e, index, subIndex)}
														label="Size" />
													<TextField
														name="amount"
														type="number"
														value={size.amount}
														onChange={(e) => handleInput(e, index, subIndex)}
														label="Amount" />
													<div className="flex flex-col">
														<TextField
															name="price"
															type="number"
															value={size.price[0].price}
															onChange={(e) => handleInput(e, index, subIndex, 0)}
															label="Sol" />
														{
															tokenList.length &&
																tokenList.map((token, i) => 
																	<TextField
																		key={i}
																		name="price"
																		type="number"
																		value={size.price[i + 1].price}
																		onChange={(e) => handleInput(e, index, subIndex, i + 1)}
																		label={token.name} />
																)
														}
													</div>
												</div>
											)
										}
									</div>
									<Button className={classes.button} variant="outlined" onClick={() => addSize(index)}>Add Size</Button>
								</div>
								<div className="md:w-60 lg:max-w-xs flex flex-col justify-between">
									<ImageUploading
										multiple
										value={color.file}
										onChange={(list) => fileChange(list, index)}
										dataURLKey="data_url"
									>
										{({
											imageList,
											onImageUpload,
											onImageRemove,
											isDragging,
											dragProps,
										}) => (
											// write your building UI
											<div className="flex flex-col mb-8">
												<button
													className="p-4 round-lg border-2 border-black text-sm mb-4"
													style={isDragging ? { color: 'red' } : undefined}
													onClick={onImageUpload}
													{...dragProps}
												>
													Click or Drop here to upload image
												</button>
												<div className="flex flex-wrap">
													{imageList.map((image, index) => (
														<div key={index} className="w-2/6 relative p-2">
															<img className="w-full" src={image['data_url']} />
															<button className="absolute bottom-0 right-0 bg-slate-50" onClick={() => onImageRemove(index)}>
																<Delete />
															</button>
														</div>
													))}
												</div>
											</div>
										)}
									</ImageUploading>
									<Button className={classes.button} variant="outlined" onClick={() => removeColor(index)}>Remove Color</Button>
								</div>
							</div>
						)
					}
					<Button className={classes.button} variant="outlined" onClick={addColor}>Add Color</Button>
				</div>
				<div className="flex justify-end">
					<Button className={classes.button} variant="outlined" onClick={handleSave}>Save</Button>
				</div>
			</div>
		</div>
	);
}

export default AddMerch;