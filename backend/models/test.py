from ultralytics import YOLO

# Load model đã huấn luyện
model = YOLO(r"backend/models/best.pt")

# Dự đoán ảnh
#results = model(r"D:\nam2\thpthtttnt\Full\image\1719.jpg")

# Hiển thị kết quả (sử dụng phương thức `show()` của object YOLOv8Results)
#results[0].show()
