import React, { useEffect, useState } from 'react';

function CartItem({
	item,
	selectedItems,
	setSelectedItems,
	setQuantities,
	quantities,
	setSubTotal,
	subTotal,
	cartItems,
	itemPrice,
	setItemPrice,
	removeCartItem,
	itemSubtotal,
}) {
	const [product, setProduct] = useState({});
	const [localQuantity, setLocalQuantity] = useState(item.quantity);

	const handleDeleteItem = async (cartId, itemId) => {
		const confirmDelete = window.confirm(
			'Are you sure you want to remove this item from your cart?'
		);
		if (!confirmDelete) return;

		try {
			const url =
				import.meta.env.VITE_SERVER + `api/cart/${cartId}/item/${itemId}`;
			const res = await fetch(url, { method: 'DELETE' });
			if (!res.ok) throw new Error('Error deleting cart item');
			console.log('Deleted cart item: ', itemId);
			if (removeCartItem) {
				removeCartItem(itemId);
			}
		} catch (err) {
			console.error('Error deleting item: ', err);
		}
	};

	function handleUpdateQuantity(itemId, newQuantity) {
		setLocalQuantity(newQuantity);
		setQuantities((prev) => ({
			...prev,
			[itemId]: newQuantity,
		}));
	}

	function handleToggleCheckBox(itemId) {
		if (selectedItems.includes(itemId)) {
			setSelectedItems(selectedItems.filter((id) => id !== itemId));
		} else {
			setSelectedItems([...selectedItems, itemId]);
		}
	}

	const updateQuantityDB = async (cartId, cartItemId, quantity) => {
		try {
			const url = import.meta.env.VITE_SERVER + 'api/cart/update-quantity';
			const res = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ cartId, cartItemId, quantity }),
			});
			if (!res.ok) throw new Error('Error updating quantity to db');
			console.log('Quantity updated for item: ', cartItemId);
		} catch (err) {
			console.error('Error: ', err);
		}
	};

	const updateLocalItemPrice = (cartItemId, price) => {
		setItemPrice((prev) => ({
			...prev,
			[cartItemId]: price,
		}));
	};

	const fetchProduct = async () => {
		try {
			const url = import.meta.env.VITE_SERVER + `api/product/${item.productId}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error('Error getting product details!');
			const data = await res.json();
			console.log('Product: ', data);
			setProduct(data);
			updateLocalItemPrice(item.cartItemId, data.price);
			return data;
		} catch (err) {
			console.error('Error: ', err);
		}
	};

	useEffect(() => {
		fetchProduct();
	}, []);

	useEffect(() => {
		let total = 0;
		for (let item of cartItems) {
			if (selectedItems.includes(item.cartItemId)) {
				const quant = quantities[item.cartItemId];
				const price = itemPrice[item.cartItemId];
				if (quant && price) {
					total += quant * price;
				}
			}
		}
		setSubTotal(total);
	}, [cartItems, quantities, selectedItems, itemPrice]);

	return (
		<div className='row border-bottom p-3 align-items-center'>
			<div className='product-checkbox col-1 d-flex justify-content-center'>
				<input
					className='form-check-input'
					type='checkbox'
					checked={selectedItems.includes(item.cartItemId)}
					onChange={() => handleToggleCheckBox(item.cartItemId)}
				/>
			</div>

			<div className='product-image col-2'>
				{product.imageURL && (
					<img
						alt={product.name}
						className='img-fluid rounded'
						src={`${import.meta.env.VITE_SERVER}${product.imageURL}`}
						onError={(e) => {
							e.target.onerror = null;
							e.target.src = `${import.meta.env.VITE_SERVER}assets/placeholder.jpg`;
						}}
					/>
				)}
			</div>

			<div className='product-name col-7'>
				<h6>
					<b>{product.name}</b>
				</h6>

				<p style={{ fontSize: 'smaller', marginBottom: '0.5rem' }}>
					<i>{product.description}</i>
				</p>

				<p
					style={{
						fontSize: 'smaller',
						fontWeight: 'bold',
						marginBottom: '0.5rem',
					}}>
					${product.price !== undefined
						? product.price.toFixed(2)
						: product.price}
				</p>

				{/* Quantity input with dual constraint logic */}
				<input
					className='form-control form-control-sm text-center'
					min='1'
					max={Math.min(product.quantity, 30)}
					style={{ width: '80px' }}
					type='number'
					value={quantities[item.cartItemId]}
					onChange={(event) => {
						const newQty = parseInt(event.target.value);
						const maxAllowed = Math.min(product.quantity, 30);
						if (newQty > maxAllowed) {
							alert(`You can only purchase up to ${maxAllowed} units`);
							return;
						}
						setLocalQuantity(newQty);
						handleUpdateQuantity(item.cartItemId, newQty);
					}}
					onBlur={() => {
						const qty = parseInt(localQuantity);
						const maxAllowed = Math.min(product.quantity, 30);
						if (!isNaN(qty) && qty >= 1 && qty <= maxAllowed) {
							updateQuantityDB(item.cartId, item.cartItemId, qty);
						} else {
							console.warn('Invalid quantity entered');
						}
					}}
				/>

				<p className='text-muted small mt-1'>(Max 30 per customer)</p>
			</div>

			<div
				className='price-delete col-1 d-flex flex-column align-items-center'
				style={{ marginLeft: '3vh' }}>
				<p
					style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px' }}>
					${itemSubtotal}
				</p>
				<i
					onClick={() => handleDeleteItem(item.cartId, item.cartItemId)}
					className='bi bi-trash3'
					style={{ cursor: 'pointer' }}></i>
			</div>
		</div>
	);
}

export default CartItem;
