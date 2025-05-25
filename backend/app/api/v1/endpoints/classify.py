from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.classifier import Classifier
from app.services.video_processor import VideoProcessor
import tempfile
from PIL import Image
import time
import io
from app.services import utils
from datetime import datetime
from fastapi import APIRouter, WebSocket
import cv2
import base64
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import io
import base64

router = APIRouter()
classifier = Classifier()
video_processor = VideoProcessor(frame_skip=0)  # Set frame_skip to 1 to capture every frame for 60fps


@router.post("/analyze_image")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")

    # Dự đoán
    result = classifier.predict_image(contents)

    # Vẽ bbox + label lên ảnh
    draw = ImageDraw.Draw(img)
    bbox = result.get('bounding_box', [])
    if len(bbox) == 4:
        x1, y1, x2, y2 = bbox
        # Vẽ rectangle
        draw.rectangle([x1, y1, x2, y2], outline='lime', width=3)

        # Chuẩn bị label
        label = f"{result['classification']} ({result['confidence'] * 100:.1f}%)"

        # Vẽ label (dùng font mặc định hoặc thêm font nếu cần)
        draw.text((x1, y1 - 20), label, fill='lime')

    # Chuyển ảnh sang bytes để gửi về
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_bytes = buffered.getvalue()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    return {
        "type": "image_with_info",
        "status": "success",
        "data": {
            "image_base64": img_base64,
            "classification": result["classification"],
            "confidence": result["confidence"],
            "bounding_box": bbox
        }
    }


# ---------------------- Xử lý video từ camera ----------------------

@router.websocket("/ws/camera")
async def websocket_camera(websocket: WebSocket):
    print("WebSocket connection started")
    await websocket.accept()
    try:
        while True:
            # Nhận frame base64 từ client (định dạng chuỗi)
            data = await websocket.receive_text()

            # Giải mã base64 thành bytes
            frame_bytes = base64.b64decode(data)

            # Chuyển bytes thành numpy array (để OpenCV xử lý)
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Xử lý frame với model classification (bạn convert frame cho phù hợp)
            result = classifier.predict_frame(frame)

            # Gửi lại kết quả classification dạng JSON
            await websocket.send_json({
                "classification": result["classification"],
                "confidence": result["confidence"],
                "bounding_box": result.get("bounding_box", [])
            })
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()



