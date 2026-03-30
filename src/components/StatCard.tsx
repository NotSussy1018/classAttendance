/**
 * Stat Card Component
 * 통계 카드 - 학생 수, 클래스 수 등 표시
 */

interface StatCardProps {
  icon: string;
  title: string;
  value: number | string;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const colorStyles = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  purple: 'bg-purple-50 border-purple-200',
  orange: 'bg-orange-50 border-orange-200',
};

const iconColorStyles = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
};

export default function StatCard({
  icon,
  title,
  value,
  description,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className={`${colorStyles[color]} border rounded-xl p-6 hover:shadow-lg transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
        </div>
        <span className={`text-3xl ${iconColorStyles[color]}`}>{icon}</span>
      </div>
    </div>
  );
}
