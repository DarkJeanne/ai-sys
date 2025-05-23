import torch
import numpy as np
from PIL import Image
from typing import Dict, Union, List
from .utils import preprocess_image  # Bạn cần đảm bảo hàm này trả về ảnh định dạng phù hợp (PIL hoặc ndarray)
from ultralytics import YOLO
import os


class Classifier:
    def __init__(self, model_path='models/best.pt'):
        """
        Initialize classifier with YOLOv8 model.
        """
        try:
            # Get the absolute path to the model file
            current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            model_path = os.path.join(current_dir, model_path)
            print(f"Loading model from: {model_path}")
            self.model = YOLO(model_path)
        except Exception as e:
            print(f"Failed to load model: {e}")
            raise e
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)

    def predict_image(self, image: Union[bytes, str, Image.Image]) -> Dict[str, Union[str, float, List[int]]]:
        """
        Predict classification for a single image.
        """
        try:
            processed_image = preprocess_image(image)
            results = self.model(processed_image)
            result = results[0]

            if not result.boxes or len(result.boxes.cls) == 0:
                print("Không phát hiện đối tượng.")
                return {
                    "classification": "Không xác định",
                    "confidence": 0.0,
                    "bounding_box": []
                }

            # Lấy box có độ tin cậy cao nhất
            best_idx = result.boxes.conf.argmax()
            cls_id = int(result.boxes.cls[best_idx])
            confidence = float(result.boxes.conf[best_idx])
            box = result.boxes.xyxy[best_idx].tolist()  # [x1, y1, x2, y2]

            class_name = self.model.names[cls_id]

            output = {
                "classification": class_name,
                "confidence": round(confidence * 100, 2),  # %
                "bounding_box": [int(round(x)) for x in box]
            }

            print(f"[predict_image] Kết quả: {output}")
            return output

        except Exception as e:
            print(f"[predict_image] Lỗi: {str(e)}")
            return {
                "classification": "Error",
                "confidence": 0.0,
                "bounding_box": [],
                "error": str(e)
            }

    def predict_frame(self, frame: np.ndarray) -> Dict[str, Union[str, float, List[int]]]:
        """
        Predict classification for a video frame (ndarray).
        """
        try:
            image = Image.fromarray(frame)
            results = self.model(image)
            result = results[0]

            if not result.boxes or len(result.boxes.cls) == 0:
                print("Không phát hiện đối tượng.")
                return {
                    "classification": "Không xác định",
                    "confidence": 0.0,
                    "bounding_box": []
                }

            # Lấy box có độ tin cậy cao nhất
            best_idx = result.boxes.conf.argmax()
            cls_id = int(result.boxes.cls[best_idx])
            confidence = float(result.boxes.conf[best_idx])
            box = result.boxes.xyxy[best_idx].tolist()

            class_name = self.model.names[cls_id]

            output = {
                "classification": class_name,
                "confidence": round(confidence * 100, 2),  # %
                "bounding_box": [int(round(x)) for x in box]
            }

            print(f"[predict_frame] Kết quả: {output}")
            return output

        except Exception as e:
            print(f"[predict_frame] Lỗi: {e}")
            return {
                "classification": "Error",
                "confidence": 0.0,
                "bounding_box": [],
                "error": str(e)
            }

    def batch_predict(self, images: List[Union[bytes, str, Image.Image]]) -> List[Dict[str, Union[str, float]]]:
        """
        Predict multiple images.
        """
        try:
            processed_images = [preprocess_image(img) for img in images]

            results = self.model(processed_images)
            outputs = []

            for result in results:
                if not result.boxes or len(result.boxes.cls) == 0:
                    outputs.append({"classification": "Không xác định", "confidence": 0.0})
                    continue

                cls_id = int(result.boxes.cls[0])
                confidence = float(result.boxes.conf[0])
                class_name = self.model.names[cls_id]

                output = {
                    "classification": class_name,
                    "confidence": round(confidence, 2)
                }
                outputs.append(output)
                print(f"[batch_predict] Kết quả: {output}")

            return outputs

        except Exception as e:
            print(f"[batch_predict] Lỗi: {e}")
            return [{
                "classification": "Error",
                "confidence": 0.0,
                "error": str(e)
            }]
