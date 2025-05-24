import cv2
from ultralytics import YOLO

# Load mô hình YOLOv12m đã huấn luyện
model = YOLO("models/best.pt")  # thay bằng đường dẫn đến model của bạn

# Đọc video đầu vào
video_path = "image/6635961542355.mp4"
cap = cv2.VideoCapture(video_path)

# Thông tin để lưu video kết quả
output_path = "output_video.mp4"
fourcc = cv2.VideoWriter_fourcc(*"mp4v")
fps = int(cap.get(cv2.CAP_PROP_FPS))
width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

# Xử lý từng frame
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # Dự đoán với YOLOv12m
    results = model.predict(frame, imgsz=640, conf=0.3)

    # Vẽ kết quả lên frame
    annotated_frame = results[0].plot()

    # Hiển thị (tùy chọn)
    cv2.imshow("YOLOv12m Detection", annotated_frame)

    # Ghi ra video kết quả
    out.write(annotated_frame)

    # Nhấn 'q' để dừng sớm
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Giải phóng tài nguyên
cap.release()
out.release()
cv2.destroyAllWindows()
