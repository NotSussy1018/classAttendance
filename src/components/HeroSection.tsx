/**
 * Hero Section Component
 * 대시보드 상단 히어로 섹션
 */

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white py-16 md:py-24">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 opacity-20 bg-black"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            School Attendance Tracker
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            학생 출석 관리를 쉽고 효율적으로
          </p>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            학교의 출석 데이터를 한눈에 관리하고, 실시간으로 학생들의 출석 현황을 추적하세요.
          </p>

          {/* CTA 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              시작하기
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition">
              더 알아보기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
