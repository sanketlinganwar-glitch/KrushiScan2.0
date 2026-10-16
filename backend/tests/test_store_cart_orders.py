import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)
AUTH_HEADER = {"Authorization": "Bearer dev_test_token"}

def test_store_product_categories():
    res = client.get("/api/store/categories")
    assert res.status_code == 200
    categories = res.json()
    assert len(categories) >= 3

def test_store_product_by_id():
    # First get product list
    res_list = client.get("/api/store/products")
    assert res_list.status_code == 200
    products = res_list.json()
    assert len(products) > 0
    first_product = products[0]

    # Query single product
    res_single = client.get(f"/api/store/products/{first_product['id']}")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == first_product["id"]

def test_order_checkout_flow():
    # Place an order matching CreateOrderRequest
    order_payload = {
        "items": [
            {
                "productId": "prod-1",
                "name": "पिंक बोलवॉर्म कामगंध सापळे",
                "quantity": 3,
                "price": 85.0
            }
        ],
        "shippingAddress": {
            "name": "गजानन पवार",
            "phone": "9876543210",
            "village": "दारव्हा",
            "district": "यवतमाळ",
            "pincode": "445202"
        },
        "paymentMethod": "cod",
        "subtotal": 255.0,
        "deliveryCharge": 0.0,
        "totalAmount": 255.0
    }

    res_order = client.post("/api/store/orders", json=order_payload, headers=AUTH_HEADER)
    assert res_order.status_code == 201
    order = res_order.json()
    assert "orderId" in order
    assert order["totalAmount"] == 255.0
    assert order["status"] == "placed"

def test_user_orders_listing():
    res = client.get("/api/store/orders", headers=AUTH_HEADER)
    assert res.status_code == 200
    orders = res.json()
    assert isinstance(orders, list)
