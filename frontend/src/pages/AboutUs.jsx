import React from 'react';
import Navigation from '/src/components/Navigation';
const AboutUs = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation đặt ngoài flex layout */}
            <Navigation />

            {/* Anh 1 */}
            <div className="flex flex-col md:flex-row items-center justify-center w-full">
                {/* Left: Nội dung chào hỏi */}
                <div className="bg-[#0b1f3a] text-white px-10 py-16 md:w-1/2 w-full text-center md:text-left relative">
                    <h4 className="uppercase text-sm tracking-widest mb-2">
                        Developer
                    </h4>
                    <hr className="border-white opacity-30 my-2" />
                    <h1 className="text-5xl font-bold mb-4">Nguyễn Hoàng Tú</h1>
                    <hr className="border-white opacity-30 my-4" />
                    <p className="text-sm">Cảm ơn đã chào đón tôi.</p>
                </div>

                {/* Right: Ảnh chân dung */}
                <div className="md:w-1/2 w-full flex items-center justify-center p-8 bg-white">
                    <img
                        src="/mai-tran.jpg" // Nếu ảnh đặt trong public folder
                        alt="Mai Trần"
                        className="w-80 h-80 object-cover rounded-full border-4 border-[#0b1f3a] shadow-md"
                    />
                </div>
            </div>
            {/* Anh 2 */}
            <div className="flex flex-col md:flex-row items-center justify-center w-full">
                {/* Left: Nội dung chào hỏi */}
                <div className="bg-[#3dd9e6] text-white px-10 py-16 md:w-1/2 w-full text-center md:text-left relative">
                    <h4 className="uppercase text-sm tracking-widest mb-2">
                        Tester
                    </h4>
                    <hr className="border-white opacity-30 my-2" />
                    <h1 className="text-5xl font-bold mb-4">Nguyễn Bá Quang</h1>
                    <hr className="border-white opacity-30 my-4" />
                    <p className="text-sm">Cảm ơn đã chào đón tôi.</p>
                </div>

                {/* Right: Ảnh chân dung */}
                <div className="md:w-1/2 w-full flex items-center justify-center p-8 bg-white">
                    <img
                        src="/mai-tran.jpg" // Nếu ảnh đặt trong public folder
                        alt="Mai Trần"
                        className="w-80 h-80 object-cover rounded-full border-4 border-[#3dd9e6] shadow-md"
                    />
                </div>
            </div>
            {/* Anh 3 */}
            <div className="flex flex-col md:flex-row items-center justify-center w-full">
                {/* Left: Nội dung chào hỏi */}
                <div className="bg-[#0b1f3a] text-white px-10 py-16 md:w-1/2 w-full text-center md:text-left relative">
                    <h4 className="uppercase text-sm tracking-widest mb-2">
                        Developer
                    </h4>
                    <hr className="border-white opacity-30 my-2" />
                    <h1 className="text-5xl font-bold mb-4">Vũ Minh Sơn</h1>
                    <hr className="border-white opacity-30 my-4" />
                    <p className="text-sm">Cảm ơn đã chào đón tôi.</p>
                </div>

                {/* Right: Ảnh chân dung */}
                <div className="md:w-1/2 w-full flex items-center justify-center p-8 bg-white">
                    <img
                        src="/mai-tran.jpg" // Nếu ảnh đặt trong public folder
                        alt="Mai Trần"
                        className="w-80 h-80 object-cover rounded-full border-4 border-[#0b1f3a] shadow-md"
                    />
                </div>
            </div>
            {/* Anh 4 */}
            <div className="flex flex-col md:flex-row items-center justify-center w-full">
                {/* Left: Nội dung chào hỏi */}
                <div className="bg-[#3dd9e6] text-white px-10 py-16 md:w-1/2 w-full text-center md:text-left relative">
                    <h4 className="uppercase text-sm tracking-widest mb-2">
                        Developer
                    </h4>
                    <hr className="border-white opacity-30 my-2" />
                    <h1 className="text-5xl font-bold mb-4">Mai Minh Tùng</h1>
                    <hr className="border-white opacity-30 my-4" />
                    <p className="text-sm">Cảm ơn đã chào đón tôi.</p>
                </div>

                {/* Right: Ảnh chân dung */}
                <div className="md:w-1/2 w-full flex items-center justify-center p-8 bg-white">
                    <img
                        src="/mai-tran.jpg" // Nếu ảnh đặt trong public folder
                        alt="Mai Trần"
                        className="w-80 h-80 object-cover rounded-full border-4 border-[#3dd9e6] shadow-md"
                    />
                </div>
            </div>
            {/* Anh 5 */}
            <div className="flex flex-col md:flex-row items-center justify-center w-full">
                {/* Left: Nội dung chào hỏi */}
                <div className="bg-[#0b1f3a] text-white px-10 py-16 md:w-1/2 w-full text-center md:text-left relative">
                    <h4 className="uppercase text-sm tracking-widest mb-2">
                        UI designer
                    </h4>
                    <hr className="border-white opacity-30 my-2" />
                    <h1 className="text-5xl font-bold mb-4">Phạm Thế Trung</h1>
                    <hr className="border-white opacity-30 my-4" />
                    <p className="text-sm">Cảm ơn đã chào đón tôi.</p>
                </div>

                {/* Right: Ảnh chân dung */}
                <div className="md:w-1/2 w-full flex items-center justify-center p-8 bg-white">
                    <img
                        src="/mai-tran.jpg" // Nếu ảnh đặt trong public folder
                        alt="Mai Trần"
                        className="w-80 h-80 object-cover rounded-full border-4 border-[#0b1f3a] shadow-md"
                    />
                </div>
            </div>
            {/* Phần 4 */}
            <footer className="bg-white text-black pt-12 pb-6 px-0">
                {/* Thông tin nhóm & đăng ký */}
                <div className="w-full px-4 sm:px-6 lg:px-8 mt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-t border-gray-700 pt-6">
                    <div className="text-black-300 text-sm">
                        <p className="font-semibold text-black">Nhóm phát triển - Food Freshness Detection</p>
                        <p>📍 Trường Đại học Công Nghệ, Đại học Quốc gia Hà Nội, Quận Cầu Giấy, Thành phố Hà Nội</p>
                        <p>✉ foodfresh.ai@gmail.com</p>
                        <p>📞 0123 456 789</p>
                    </div>

                    <div className="w-full md:w-auto">
                        <h3 className="text-black font-semibold mb-2">Đăng ký nhận thông báo</h3>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Nhập địa chỉ email"
                                className="px-4 py-2 rounded-l bg-gray-300 text-black w-64"
                            />
                            <button className="bg-white px-4 py-2 rounded-r hover:bg-cyan-500">
                                ✈
                            </button>
                        </div>
                        <div className="flex space-x-4 mt-3">
                            <a href="#" className="text-[#3dd9e6] hover:text-cyan-400">🌐</a>
                            <a href="#" className="text-[#3dd9e6] hover:text-cyan-400">💻</a>
                            <a href="#" className="text-[#3dd9e6] hover:text-cyan-400">📷</a>
                            <a href="#" className="text-[#3dd9e6] hover:text-cyan-400">📊</a>
                        </div>
                    </div>
                </div>

                {/* Logo + bản quyền */}
                <div className="w-full px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
                    <div className="flex justify-center items-center gap-2">
                        <img src="/src/public/logoDas.png" alt="Logo" className="h-6" />
                        <span className="font-bold text-black">FOOD FRESH AI</span>
                    </div>
                    <p className="mt-2">Copyright © 2025 Food Freshness Detection Project. All Rights Reserved</p>
                </div>
            </footer>
        </div>
    );
};

export default AboutUs;
