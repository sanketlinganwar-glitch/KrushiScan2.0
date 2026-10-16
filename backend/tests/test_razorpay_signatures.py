import hmac
import hashlib
from backend.services.razorpay_service import verify_razorpay_signature
from backend.config import settings

def test_razorpay_signature_verification_success(monkeypatch):
    test_secret = "test_razorpay_secret_key_12345"
    test_order_id = "order_test_998877"
    test_payment_id = "pay_test_112233"

    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "rzp_test_key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", test_secret)

    msg = f"{test_order_id}|{test_payment_id}"
    valid_signature = hmac.new(test_secret.encode("utf-8"), msg.encode("utf-8"), hashlib.sha256).hexdigest()

    is_verified = verify_razorpay_signature(
        razorpay_order_id=test_order_id,
        razorpay_payment_id=test_payment_id,
        razorpay_signature=valid_signature
    )
    assert is_verified is True

def test_razorpay_signature_verification_tamper_detected(monkeypatch):
    test_secret = "test_razorpay_secret_key_12345"
    test_order_id = "order_test_998877"
    test_payment_id = "pay_test_112233"

    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "rzp_test_key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", test_secret)

    fake_signature = "bad_signature_attempt_0000000000000000000000000000000000000000"

    is_verified = verify_razorpay_signature(
        razorpay_order_id=test_order_id,
        razorpay_payment_id=test_payment_id,
        razorpay_signature=fake_signature
    )
    assert is_verified is False
