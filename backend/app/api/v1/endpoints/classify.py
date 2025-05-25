
import os
import base64
from fastapi import WebSocket, Query, WebSocketDisconnect
from app.core.security import get_user_from_token
from starlette.websockets import WebSocketState
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
import base64
import io
from PIL import Image, ImageDraw
import numpy as np
import cv2
from app.services.classifier import Classifier
from app.services.video_processor import VideoProcessor
from app.core.security import get_user_from_token
import uuid
from fastapi.responses import FileResponse

frames_list = []  # lưu đường dẫn các frame tạm
FRAME_DIR = "temp_frames"
OUTPUT_VIDEO = "output_video.mp4"
if not os.path.exists(FRAME_DIR):
    os.makedirs(FRAME_DIR)

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
    token = websocket.query_params.get("token")
    if not token:
        print("No token in query params")
        await websocket.close(code=1008)
        return

    user = get_user_from_token(token)
    if not user:
        print("Token invalid or expired")
        await websocket.close(code=1008)
        return

    print("Token received:", token)

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
            if frame is None:
                print('Failded to decode frame')
                await websocket.close(code=1003)
                return

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
        pass


@router.post("/api/process_frame")
async def process_frame(request: Request):
    data = await request.json()
    image_base64 = data.get("image_base64")

    if not image_base64:
        return JSONResponse(status_code=400, content={"error": "No image_base64 provided"})

    try:
        if "," in image_base64:
            header, image_base64 = image_base64.split(",", 1)

        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Lưu frame ra file với tên uuid để tránh trùng
        frame_filename = os.path.join(FRAME_DIR, f"{uuid.uuid4()}.jpg")
        image.save(frame_filename)
        frames_list.append(frame_filename)

        # Giới hạn số frame, ví dụ tối đa 20 frame (4s * 5fps)
        if len(frames_list) >= 20:
            # Tạo video từ frames
            first_frame = cv2.imread(frames_list[0])
            height, width, layers = first_frame.shape
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            video = cv2.VideoWriter(OUTPUT_VIDEO, fourcc, 5, (width, height))

            for frame_path in frames_list:
                frame = cv2.imread(frame_path)
                video.write(frame)
            video.release()

            # Xoá ảnh tạm sau khi tạo video
            for f in frames_list:
                os.remove(f)
            frames_list.clear()

            return JSONResponse(content={"msg": "Video created"})

        return JSONResponse(content={"msg": "Frame received and processed"})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/api/get_processed_video")
async def get_processed_video():
    if os.path.exists(OUTPUT_VIDEO):
        return FileResponse(OUTPUT_VIDEO, media_type="video/mp4", filename="processed_video.mp4")
    else:
        return JSONResponse(status_code=404, content={"error": "No processed video found"})