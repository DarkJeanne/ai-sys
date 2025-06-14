import React, { useRef, useEffect, useState } from 'react';
import { useAppState } from './contexts/AppStateContext';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import classificationService from './services/classificationService';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import PageNotFound from './pages/PageNotFound';
import AboutUs from './pages/AboutUs';
import ClassificationOutput from '../src/components/Results/ClassificationOutput';
import WebcamRealtimeClassification from "../src/components/MediaDisplay/WebcamRealtimeClassification";
import Register from './pages/Register';



function MainApp() {
  const { state, dispatch } = useAppState();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [droppedImage, setDroppedImage] = useState(null);
  // Initialize hooks
  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const previewURL = URL.createObjectURL(file);
      setDroppedImage(previewURL);
      processFile(file)
    } else {
      alert('Vui lòng thả một tệp ảnh!');
    }
  };


  // Handle file selection
  const processFile = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const previewURL = URL.createObjectURL(file);
      setDroppedImage(previewURL);  // <-- thêm dòng này
    }

    dispatch({ type: 'SET_CURRENT_FILE', payload: file });

    if (file.type.startsWith('video/')) {
      dispatch({ type: 'SET_INPUT_TYPE', payload: 'video' });
      loadVideo(file);
    } else if (file.type.startsWith('image/')) {
      dispatch({ type: 'SET_INPUT_TYPE', payload: 'image' });
      try {
        dispatch({ type: 'SET_PROCESSING', payload: true });
        const result = await classificationService.classifyImage(file);
        dispatch({ type: 'SET_CLASSIFICATION_RESULT', payload: result });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) processFile(file);
  };



  const path = window.location.pathname;
  if (path === '/register') {
    return <Register />;
  }

  if (!user) {
    return <Login />;
  }

  if (path === '/admin') {
    return (
      <ProtectedRoute requireAdmin>
        <Admin />
      </ProtectedRoute>
    );
  }

  if (path === '/profile') {
    return (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    );
  }
  if (path === '/aboutus') {
    return (
      <ProtectedRoute>
        <AboutUs />
      </ProtectedRoute>
    );
  }
  //Page Not Found
  if (path === '/pnf') {
    return (
      <ProtectedRoute>
        <PageNotFound />
      </ProtectedRoute>
    );
  }

  return (
    //phần 1
    <div className="min-h-screen bg-white ">
      <Navigation />

      {/* Title */}
      <div className="container mx-auto p-4 text-center">
        <div className="mb-4">
          <h1 className="text-black text-3xl font-bold">Tomato Quality Inspection - Kiểm tra chất lượng cà chua </h1>
          <p className="text-black-600 mt-2 text-base max-w-6xl mx-auto">
            Khám phá độ tươi và chất lượng cà chua của bạn với công nghệ AI hiện đại. Tải ảnh để nhận kết quả chi tiết về độ tươi và trạng thái của cà chua.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">

          {/* Image Display */}
          <div className="flex-1">
            <div className="mb-4">
              <img
                src="/cachua.png" // Thay thế bằng đường dẫn thực tế
                alt="Food Freshness"
                className="w-full h-[500px] object-cover rounded-lg shadow-xl" // giữ khung chữ nhật
              />
            </div>
          </div>

          {/* Upload Section */}
          <div className="flex-1">
            <div className="max-w-xl mx-auto bg-white p-14 rounded-2xl shadow-lg">
              <div className="flex flex-col items-center mb-4">

                <div style={{ position: 'relative', display: 'inline-block' }}>
                  {state.classificationResult?.data?.image_base64 && (
                    <img
                      src={`data:image/jpeg;base64,${state.classificationResult.data.image_base64}`}
                      alt="Detected"
                    />
                  )}

                  {Array.isArray(state.classificationResult?.data?.predictions) &&
                    state.classificationResult.data.predictions.map((pred, idx) => {
                      const [x, y, w, h] = pred.bounding_box.map(Number);
                      return (
                        <div key={idx} style={{
                          position: 'absolute',
                          left: x,
                          top: y,
                          width: w,
                          height: h,
                          pointerEvents: 'none'
                        }}>
                          {/* Khung bao quanh */}
                          <div
                            style={{
                              border: '2px solid #ff0000 !important',
                              borderRadius: '4px',
                              width: '100%',
                              height: '100%',
                              boxSizing: 'border-box',
                            }}
                          />
                          {/* Text label */}
                          <div
                            style={{
                              position: 'absolute',
                              top: -40, // lên trên khung 1 chút
                              left: 0,
                              backgroundColor: '#ff0000',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              fontSize: '24px', // chữ to hơn
                              whiteSpace: 'nowrap',
                              zIndex: 10,        // chắc chắn label nổi lên trên
                              pointerEvents: 'none',
                            }}
                          >
                            {pred.class} ({(pred.confidence * 100).toFixed(1)}%)
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Webcam */}
                {state.inputType === 'webcam' && (
                  <WebcamRealtimeClassification
                    onError={(error) => {
                      console.error("Lỗi webcam:", error);
                      dispatch({ type: 'SET_ERROR', payload: error });
                    }}
                    onResult={(result) => {
                      dispatch({ type: 'SET_RESULT', payload: result });
                    }}
                  />
                )}
                {/* Buttons - chỉ hiện khi chưa có ảnh */}
                {!droppedImage && state.inputType !== 'webcam' && (
                  <>
                    <span className="text-[#14213D] font-medium mb-2">Kéo và thả ảnh vào đây</span>
                    {/* Drop Zone */}
                    <div
                      className="w-20 h-20 bg-[#3dd9e6] rounded-full flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleImageDrop}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 12l8-8m0 0l8 8m-8-8v16"
                        />
                      </svg>
                    </div>
                    {/* Buttons */}
                    <div className="mb-4 flex flex-wrap justify-center gap-2">
                      <button
                        onClick={() => dispatch({ type: 'SET_INPUT_TYPE', payload: 'image' })}
                        className={`px-4 py-2 rounded font-medium transition ${state.inputType === 'image'
                          ? 'bg-[#14213D] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-[#3dd9e6]'
                          }`}
                      >
                        Ảnh
                      </button>


                      <button
                        onClick={() => dispatch({ type: 'SET_INPUT_TYPE', payload: 'webcam' })}
                        className={`px-4 py-2 rounded font-medium transition ${state.inputType === 'webcam'
                          ? 'bg-[#14213D] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-[#3dd9e6]'
                          }`}
                      >
                        Webcam
                      </button>
                    </div>

                    {/* File Input */}
                    {(state.inputType === 'image' ) && (
                      <div className="mb-4 w-full flex flex-col items-center space-y-2">
                        {/* File input */}
                        <input
                          type="file"
                          accept={state.inputType === 'image' }
                          onChange={handleFileSelect}
                          className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                          file:rounded file:border-0 file:text-sm file:font-semibold
                          file:bg-[#3dd9e6] file:text-white hover:file:bg-[#3dd9e6]"
                        />
                      </div>
                    )}


                  </>
                )}
                {/* Nút hủy file - hiện khi có ảnh đã thả */}
                {(droppedImage) && (
                  <button
                    onClick={() => {
                      setDroppedImage(null);
                      setSelectedFile(null);
                      dispatch({ type: 'CLEAR_RESULT' });
                    }}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
                  >
                    Hủy tệp
                  </button>
                )}
                {/* Nút Dừng camera khi đang dùng webcam */}
                {state.inputType === 'webcam' && (
                  <button
                    onClick={() => {
                      dispatch({ type: 'CLEAR_RESULT' });

                      // Dừng webcam
                      const video = document.getElementById('webcam-video');
                      if (video && video.srcObject) {
                        video.srcObject.getTracks().forEach(track => track.stop());
                        video.srcObject = null;
                      }

                      // Chuyển giao diện về kéo thả ảnh (image)
                      dispatch({ type: 'SET_INPUT_TYPE', payload: 'image' });
                    }}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition"
                  >
                    Dừng camera
                  </button>

                )}
              </div>
            </div>
            {/* Phần kết quả*/}
            <div className="bg-white-100 justify-center">
              {/* Results Display */}
              {state.classificationResult && (
                <div className="mt-4 p-4 pl-50 bg-white rounded w-full max-w-xl text-left">
                  <h2 className="text-xl font-bold mb-2">Kết quả phân loại</h2>
                  <ClassificationOutput result={state.classificationResult} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Error */}
      {state.error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
          {state.error}
        </div>
      )}


      {/* Loading */}
      {state.isProcessing && (
        <div className="mt-4 text-center text-gray-700 font-medium">
          Processing...
        </div>
      )}
      {/* Phần 2 */}
      <div className="bg-gray-100 py-6 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">

          {/* Bên trái: nội dung hướng dẫn */}
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Cách kiểm tra độ tươi của cà chua?
            </h2>

            <div className="space-y-5 text-black text-base leading-relaxed">
              <div>
                <h4 className="font-semibold text-[#3dd9e6]">Tải ảnh </h4>
                <p>Chọn ảnh cà chua bằng thiết bị của bạn, hoặc sử dụng webcam trực tiếp.</p>
              </div>

              <div>
                <h4 className="font-semibold text-[#3dd9e6]">Phân tích bằng AI</h4>
                <p>Hệ thống sẽ tự động nhận diện và phân tích các đặc điểm như màu sắc, kết cấu, và dấu hiệu hư hỏng để xác định độ tươi của cà chua.</p>
              </div>

              <div>
                <h4 className="font-semibold text-[#3dd9e6]">Xem kết quả</h4>
                <p>Kết quả được hiển thị trực quan kèm theo đánh giá chi tiết về tình trạng và mức độ tươi của cà chua.</p>
              </div>
            </div>
          </div>

          {/* Bên phải: ảnh minh họa thực phẩm */}
          <div className="flex-1 flex justify-center">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/hoaqua.png"  // <-- Đổi thành ảnh minh họa thực tế bạn có
                alt="Food Freshness Detection Example"
                className="w-full max-w-xl h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Phần 3 */}
      <section className="min-screen bg-white py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Đánh giá của người dùng</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Đánh giá 1 */}
            <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-lg text-gray-800 mb-1">Ngọc Anh</h4>
              <div className="text-pink-500 text-sm mb-2">★★★★★</div>
              <div className="text-blue-400 text-3xl text-right mt-2">❝</div>
              <p className="text-gray-700 text-sm">
                "Tôi thường rất lo lắng khi mua cà chua ngoài chợ. Nhờ hệ thống này, tôi có thể kiểm tra nhanh độ tươi của cà chua chỉ bằng ảnh chụp. Thật sự rất tiện lợi và chính xác!"
              </p>
            </div>

            {/* Đánh giá 2 */}
            <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-lg text-gray-800 mb-1">Minh Trí</h4>
              <div className="text-pink-500 text-sm mb-2">★★★★★</div>
              <div className="text-blue-400 text-3xl text-right mt-2">❝</div>
              <p className="text-gray-700 text-sm">
                "Là chủ một chuỗi cửa hàng cà chua sạch, tôi rất cần một công cụ hỗ trợ kiểm định. Công nghệ AI trong hệ thống này đã giúp tôi tiết kiệm thời gian và nâng cao chất lượng kiểm tra."
              </p>
            </div>

            {/* Đánh giá 3 */}
            <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-lg text-gray-800 mb-1">Thu Hà</h4>
              <div className="text-pink-500 text-sm mb-2">★★★★★</div>
              <div className="text-blue-400 text-3xl text-right mt-2">❝</div>
              <p className="text-gray-700 text-sm">
                "Tôi tải ảnh quả cà chua vừa hái lên để thử, và kết quả rất bất ngờ — hệ thống còn chỉ ra độ chín và gợi ý thời gian sử dụng tốt nhất! Giao diện cũng rất thân thiện."
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Phần 4 */}
      <footer className="bg-[#0b1f3a] text-white pt-12 pb-6 px-4 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">

          {/* Dự án */}
          <div>
            <h3 className="font-semibold mb-3">Về dự án</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#">Mục tiêu</a></li>
              <li><a href="#">Công nghệ sử dụng</a></li>
              <li><a href="#">Đội ngũ phát triển</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </div>

          {/* Tính năng */}
          <div>
            <h3 className="font-semibold mb-3">Tính năng</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#">Phân loại độ tươi</a></li>
              <li><a href="#">Nhận diện từ webcam</a></li>
              <li><a href="#">Hiển thị kết quả</a></li>
            </ul>
          </div>

          {/* Hướng dẫn */}
          <div>
            <h3 className="font-semibold mb-3">Hướng dẫn sử dụng</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#">Tải ảnh lên</a></li>
              <li><a href="#">Sử dụng webcam</a></li>
              <li><a href="#">Xem kết quả</a></li>
              <li><a href="#">Xử lý lỗi</a></li>
            </ul>
          </div>

          {/* Tài nguyên */}
          <div>
            <h3 className="font-semibold mb-3">Tài nguyên</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#">Dataset mẫu</a></li>
              <li><a href="#">Tài liệu kỹ thuật</a></li>
              <li><a href="#">Mã nguồn GitHub</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
        </div>

        {/* Thông tin nhóm & đăng ký */}
        <div className="max-w-7xl mx-auto mt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-t border-gray-700 pt-6">
          <div className="text-gray-300 text-sm">
            <p className="font-semibold text-white">Nhóm phát triển - Tomato Quality Inspection</p>
            <p>📍 Trường Đại học Công Nghệ, Đại học Quốc gia Hà Nội, Quận Cầu Giấy, Thành phố Hà Nội</p>
            <p>✉ foodfresh.ai@gmail.com</p>
            <p>📞 0123 456 789</p>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex space-x-4 mt-3">
              <a href="#" className="text-[#3dd9e6] hover:text-cyan-400">🌐</a>
              <a href="#" className="text-[#3dd9e6] hover:text-cyan-400">💻</a>
              <a href="#" className="text-[#3dd9e6] hover:text-cyan-400">📷</a>
              <a href="#" className="text-[#3dd9e6] hover:text-cyan-400">📊</a>
            </div>
          </div>
        </div>

        {/* Logo + bản quyền */}
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <div className="flex justify-center items-center gap-2">
            <img src="/logoDas.png" alt="Logo" className="h-6" />
            <span className="font-bold text-white">TOMATO FRESH AI</span>
          </div>
          <p className="mt-2">Copyright © 2025 Tomato Quality Inspection Project. All Rights Reserved</p>
        </div>
      </footer>

    </div>
  );

}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;