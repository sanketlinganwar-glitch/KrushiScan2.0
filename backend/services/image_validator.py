"""
KrushiScan AI - Rigorous Image Decoding and Pixel Validation Service

Performs deep image payload screening to prevent blank, corrupted, solid-color,
zero-byte, or unreadable images from reaching the AI vision model.
"""

import io
import logging
from typing import Dict, Any, Optional
from PIL import Image, ImageStat
from fastapi import HTTPException

logger = logging.getLogger(__name__)

VALID_MIMES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

def is_valid_image_magic(data: bytes, content_type: str) -> bool:
    """Verifies that uploaded file binary header matches stated image MIME type."""
    if len(data) < 12:
        return False
    if content_type in ["image/jpeg", "image/jpg"] and data[:3] == b"\xff\xd8\xff":
        return True
    if content_type == "image/png" and data[:8] == b"\x89PNG\r\n\x1a\n":
        return True
    if content_type == "image/webp" and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return True
    return False

def validate_image_payload(
    image_bytes: bytes,
    content_type: str = "image/jpeg",
    min_dimension: int = 40,
    slot_name: str = "main"
) -> Dict[str, Any]:
    """
    Decodes image bytes and performs pixel-level validation:
    - Verifies non-empty payload.
    - Verifies MIME type and magic header.
    - Verifies image decoding integrity via PIL.
    - Rejects images with zero or sub-minimum dimensions.
    - Rejects fully transparent images.
    - Rejects solid pitch black (lens cap on, blocked camera, underexposed).
    - Rejects solid pure white (overexposed, blank canvas, blank white sheet with no subject).
    - Rejects flat uniform single-color fields with near-zero variance.
    - Does NOT reject legitimate leaves on white paper (high contrast creates high variance).
    """
    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail=f"The {slot_name} photo file is empty (0 bytes). Please upload a valid crop photo."
        )

    # 1. MIME and magic byte verification
    norm_mime = content_type.lower()
    if norm_mime not in VALID_MIMES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{content_type}' for {slot_name} image. Please provide a JPEG, PNG, or WEBP photo."
        )

    if not is_valid_image_magic(image_bytes, norm_mime):
        raise HTTPException(
            status_code=400,
            detail=f"The {slot_name} photo appears corrupted or does not match expected image format headers."
        )

    # 2. Decode image using PIL
    try:
        with Image.open(io.BytesIO(image_bytes)) as test_img:
            test_img.verify()
    except Exception as e:
        logger.warning(f"PIL verification failed on {slot_name} image: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Photo could not be analyzed because the image appears blank or unreadable. Please take a clear photo of the affected leaf in good lighting and try again."
        )

    # 3. Pixel variance and luminance analysis
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            width, height = img.size
            if width < min_dimension or height < min_dimension:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image dimensions ({width}x{height}) are too small for crop diagnosis. Minimum required: {min_dimension}x{min_dimension}."
                )

            # Check alpha transparency if present
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                rgba_img = img.convert("RGBA")
                alpha_channel = rgba_img.split()[-1]
                alpha_stat = ImageStat.Stat(alpha_channel)
                if alpha_stat.mean[0] < 15.0:
                    raise HTTPException(
                        status_code=400,
                        detail="Photo could not be analyzed because the image appears blank or unreadable. Please take a clear photo of the affected leaf in good lighting and try again."
                    )

            # Convert to grayscale for luminance variance
            gray = img.convert("L")
            # Downsample to at most 128x128 for efficient variance computation
            gray.thumbnail((128, 128))
            stat = ImageStat.Stat(gray)
            mean_luma = stat.mean[0]
            stddev_luma = stat.stddev[0]

            # Condition A: Pitch black (lens cap on / extreme underexposure)
            if mean_luma < 14.0 and stddev_luma < 12.0:
                raise HTTPException(
                    status_code=400,
                    detail="Photo could not be analyzed because the image appears blank or unreadable. Please take a clear photo of the affected leaf in good lighting and try again."
                )

            # Condition B: Solid pure white (blown out / blank sheet with no leaf)
            if mean_luma > 242.0 and stddev_luma < 10.0:
                raise HTTPException(
                    status_code=400,
                    detail="Photo could not be analyzed because the image appears blank or unreadable. Please take a clear photo of the affected leaf in good lighting and try again."
                )

            # Condition C: Uniform flat color (monochrome screen or featureless background)
            if stddev_luma < 4.0:
                raise HTTPException(
                    status_code=400,
                    detail="Photo could not be analyzed because the image appears blank or unreadable. Please take a clear photo of the affected leaf in good lighting and try again."
                )

            return {
                "format": img.format or "JPEG",
                "width": width,
                "height": height,
                "mean_luma": round(mean_luma, 1),
                "stddev_luma": round(stddev_luma, 1)
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inspecting {slot_name} image pixels: {e}")
        raise HTTPException(
            status_code=400,
            detail="Photo could not be analyzed because the image appears blank or unreadable. Please take a clear photo of the affected leaf in good lighting and try again."
        )
