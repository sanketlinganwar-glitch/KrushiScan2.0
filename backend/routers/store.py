import logging
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from backend.routers.auth import get_current_user_and_role
from backend.services.supabase_client import get_supabase_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/store", tags=["Agri Store & Orders"])

class OrderItem(BaseModel):
    productId: str
    name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)

class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    shippingAddress: Dict[str, Any]
    paymentMethod: str = Field(..., description="kcc, upi, or cod")
    subtotal: float = Field(..., gt=0)
    deliveryCharge: float = 0.0
    totalAmount: float = Field(..., gt=0)

# Verified Agri Products for Vidarbha Farming Ecosystem
STORE_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "prod-1",
        "name": "पिंक बोलवॉर्म कामगंध सापळे (Pink Bollworm Pheromone Traps)",
        "name_local": {"mr": "गुलाबी बोंडअळी फेरोमोन ट्रॅप", "hi": "गुलाबी सुंडी फेरोमोन ट्रैप", "en": "Pink Bollworm Pheromone Traps"},
        "category": "protection",
        "price": 320,
        "original_price": 450,
        "rating": 4.8,
        "reviews_count": 142,
        "image_url": "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a8f?auto=format&fit=crop&w=600&q=80",
        "description": "CICR नागपूर प्रमाणित ल्यूर व फनेल ट्रॅप. एकरी ५ सापळे लावल्याने गुलाबी बोंडअळीच्या पतंगांचे प्रभावी नियंत्रण होते.",
        "dosage_or_usage": "प्रति एकर ५ ट्रॅप पिकाच्या उंचीपेक्षा १ फूट वर लावावे.",
        "seller_name": "महाबीज अधिकृत कृषी केंद्र",
        "is_verified_seller": True,
        "in_stock": True
    },
    {
        "id": "prod-2",
        "name": "ट्रायकोडर्मा व्हिरीडी जैविक बुरशीनाशक (Trichoderma Viride)",
        "name_local": {"mr": "ट्रायकोडर्मा व्हिरीडी पावडर", "hi": "ट्राइकोडर्मा विरिडी पाउडर", "en": "Trichoderma Viride Bio-Fungicide"},
        "category": "bio",
        "price": 185,
        "original_price": 240,
        "rating": 4.9,
        "reviews_count": 89,
        "image_url": "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80",
        "description": "तुरीवरील मर (Wilt) आणि कपाशीवरील मूळकुज रोगावर उपयुक्त प्रमाणित सेंद्रिय व जैविक बुरशीनाशक. (टीप: परिणाम हवामान व जमिनीनुसार बदलू शकतात).",
        "dosage_or_usage": "बियाणे प्रक्रिया: ५ ग्रॅम प्रति किलो बियाणे; जमिनीतून: १ किलो प्रति एकर शेणखतात मिसळून.",
        "seller_name": "PDKV अकोला कृषी विज्ञान केंद्र",
        "is_verified_seller": True,
        "in_stock": True
    },
    {
        "id": "prod-3",
        "name": "महाबीज सोयाबीन बियाणे JS-335 / JS 20-34 (Certified)",
        "name_local": {"mr": "महाबीज प्रमाणित सोयाबीन बियाणे", "hi": "महाबीज प्रमाणित सोयाबीन बीज", "en": "Mahabeej Certified Soybean Seed"},
        "category": "seeds",
        "price": 2250,
        "original_price": 2600,
        "rating": 4.7,
        "reviews_count": 210,
        "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
        "description": "महाराष्ट्र राज्य बियाणे महामंडळ (Mahabeej) प्रमाणित ३० किलो बॅग. उगवण क्षमता ८५% पेक्षा जास्त.",
        "dosage_or_usage": "प्रति एकर ३० किलो बियाणे पेरणीसाठी वापरावे.",
        "seller_name": "महाराष्ट्र राज्य बियाणे महामंडळ (Mahabeej)",
        "is_verified_seller": True,
        "in_stock": True
    },
    {
        "id": "prod-4",
        "name": "बॅटरी ऑपरेटेड १६L कृषी स्प्रेअर पंप (Electric Knapsack Sprayer)",
        "name_local": {"mr": "१६ लिटर बॅटरी फवारणी पंप", "hi": "16 लीटर बैटरी स्प्रेयर पंप", "en": "16L Battery Agricultural Sprayer"},
        "category": "tools",
        "price": 1850,
        "original_price": 2499,
        "rating": 4.6,
        "reviews_count": 95,
        "image_url": "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80",
        "description": "१२ व्होल्ट हेवी-ड्युटी रिचार्जेबल बॅटरी, ड्युअल नोझल व ब्रास लान्ससह. एका चार्जिंगवर २५ पंप फवारणी.",
        "dosage_or_usage": "१६ लिटर पाणी क्षमता, ६ महिने वॉरंटी.",
        "seller_name": "किसान ॲग्रो इक्विपमेंट यवतमाळ",
        "is_verified_seller": True,
        "in_stock": True
    }
]

@router.get("/categories")
def list_categories():
    """
    Returns unique product categories with Marathi and English labels.
    """
    categories = [
        {"id": "all", "label": {"mr": "सर्व उत्पादने", "en": "All Products"}},
        {"id": "protection", "label": {"mr": "कीड व रोग नियंत्रण", "en": "Crop Protection"}},
        {"id": "bio", "label": {"mr": "जैविक खते व औषधे", "en": "Bio-Fertilizers"}},
        {"id": "seeds", "label": {"mr": "प्रमाणित बियाणे", "en": "Certified Seeds"}},
        {"id": "tools", "label": {"mr": "कृषी अवजारे व पंप", "en": "Tools & Sprayers"}},
    ]
    return categories

@router.get("/products")
def list_products(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    Returns verified agri products catalog with optional category and search filters.
    """
    results = STORE_CATALOG
    if category and category != "all":
        results = [p for p in results if p["category"] == category]
    if search:
        s_lower = search.lower()
        results = [
            p for p in results
            if s_lower in p["name"].lower() or s_lower in p["description"].lower()
        ]
    return results

@router.get("/products/{product_id}")
def get_product_by_id(product_id: str):
    """
    Returns details for a single agri product.
    """
    match = next((p for p in STORE_CATALOG if p["id"] == product_id), None)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' was not found in catalog."
        )
    return match

@router.post("/orders", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: CreateOrderRequest,
    current_user: dict = Depends(get_current_user_and_role)
):
    """
    Creates a new authenticated farmer order.
    """
    user_id = current_user["id"]
    order_id = f"KSCAN-ORD-{uuid.uuid4().hex[:8].upper()}"

    supabase = get_supabase_admin()
    if supabase:
        try:
            order_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "subtotal": payload.subtotal,
                "delivery_charge": payload.deliveryCharge,
                "total_amount": payload.totalAmount,
                "shipping_address": payload.shippingAddress,
                "payment_method": payload.paymentMethod,
                "status": "placed",
                "items": [item.dict() for item in payload.items]
            }
            supabase.table("orders").insert(order_data).execute()
        except Exception as e:
            logger.warning(f"Could not write order to database: {e}")

    return {
        "success": True,
        "orderId": order_id,
        "totalAmount": payload.totalAmount,
        "paymentMethod": payload.paymentMethod,
        "status": "placed",
        "message": "ऑर्डर यशस्वीरीत्या नोंदवली गेली आहे (Order Placed Successfully)."
    }

@router.get("/orders")
def get_user_orders(current_user: dict = Depends(get_current_user_and_role)):
    """
    Returns order history for the current farmer.
    """
    supabase = get_supabase_admin()
    user_id = current_user["id"]
    if not supabase:
        return []

    try:
        res = supabase.table("orders").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch user orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve order history.")
