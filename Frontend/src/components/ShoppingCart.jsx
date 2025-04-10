import React, { useEffect } from 'react';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { useState } from 'react';

function ShoppingCart() {
	//state management
	const [customerId, setCustomerId] = useState(null);
	const [cartItems, setCartItems] = useState([]);
	const [quantities, setQuantities] = useState({}); //key value pair to contain id: quantity
	const [selectedItems, setSelectedItems] = useState([]); //array to contain id of selected items

	//fetching customerId
	const fetchCustomerId = async () => {
		try {
			const url = import.meta.env.VITE_SERVER + 'api/session/customer-id';
			const res = await fetch(url);
			if (!res.ok) throw new Error('Error getting cart items!');
			const data = await res.json();
			//checking
			console.log('Customer ID: ', data);
			setCustomerId(data);
			return data;
		} catch (err) {
			console.error('Error fetching customer ID: '.err);
		}
	};

	//fetch cart items
	const fetchCartItems = async (id) => {
		try {
			const url = import.meta.env.VITE_SERVER + `api/cart/customer/${id}/items`;
			const res = await fetch(url);
			if (!res.ok) throw new Error('Error getting cart items');
			const items = await res.json();
			setCartItems(items);
			console.log('Cart: ', items);

			//to preselect all items in checkbox, first extract out cartItemId into array
			const preSelectAllItems = items.map((item) => item.cartItemId);
			setSelectedItems(preSelectAllItems);

			//setting quantity of items
			const initialQuantity = {};
			//populate initalQuantity with existing item quantity or default to 1
			items.forEach((item) => {
				initialQuantity[item.cartItemId] = item.quantity || 1;
			});
			setQuantities(initialQuantity);
			return items;
		} catch (err) {
			console.error('Error fetching cart items:', err);
		}
	};

	useEffect(() => {
		const loadCart = async () => {
			const id = await fetchCustomerId();
			console.log('id: ', id);
			if (id) {
				await fetchCartItems(id);
			}
		};
		loadCart();
	}, []);

	return (
		<div className='main container'>
			<div className='title row'>
				<div className='col'>
					<h5>Shopping Cart</h5>
				</div>
				<div className='col text-right'>
					<button className='btn btn-outline-danger'>
						<span style={{ marginRight: '5px' }}>
							<i className='bi bi-trash3'></i>
						</span>
						Empty cart
					</button>
				</div>
			</div>

			<div className='container'>
				<form>
					<div className='row mt-4'>
						{/* Shopping cart grid */}
						<div className='col-md-7 pr-md-3'>
							<div
								className='border bg-light rounded overflow-hidden mb-2'
								style={{ padding: '1vh 1vh 0 1vh' }}>
								{cartItems.map((item) => (
									<CartItem
										item={item}
										selectedItems={selectedItems}
										setSelectedItems={setSelectedItems}
										setQuantities={setQuantities}
										quantities={quantities[item.cartItemId]}
									/>
								))}
							</div>
						</div>

						{/* Subtotal grid */}
						<div className='col-md-5 pl-md-3'>
							<CartSummary />
							<div className='text-right mt-3'>
								<button
									className='btn btn-success btn-sm'
									style={{ width: '100%' }}
									type='submit'>
									Checkout
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}

export default ShoppingCart;
