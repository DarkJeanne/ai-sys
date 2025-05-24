import cv2
from ultralytics import YOLO

# Load mô hình YOLOv12m đã huấn luyện
model = YOLO("models/best.pt")  # Đường dẫn tới mô hình đã train

# Đọc video đầu vào
video_path = r"D:\nam2\thpthtttnt\Full\image\6635961542355.mp4"
cap = cv2.VideoCapture(video_path)

# Kiểm tra mở video thành công chưa
if not cap.isOpened():
    print("Không mở được video. Kiểm tra lại đường dẫn.")
    exit()

# Vòng lặp đọc và dự đoán
while True:
    ret, frame = cap.read()
    if not ret:
        break  # Hết video hoặc lỗi đọc

    # Dự đoán với mô hình YOLO
    results = model.predict(frame, imgsz=640, conf=0.3)

    # Vẽ kết quả lên frame
    annotated_frame = results[0].plot()

    # Hiển thị frame đã dự đoán
    cv2.imshow("YOLOv12m - Dự đoán video", annotated_frame)

    # Nhấn 'q' để thoát
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Giải phóng tài nguyên
cap.release()
cv2.destroyAllWindows()
