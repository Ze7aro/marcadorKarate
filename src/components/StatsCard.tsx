import { Card, CardBody } from "@heroui/react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "danger";
  description?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  color = "primary",
  description,
}: StatsCardProps) {
  const colorClasses = {
    primary: "from-blue-500 to-blue-600",
    secondary: "from-purple-500 to-purple-600",
    success: "from-green-500 to-green-600",
    warning: "from-orange-500 to-orange-600",
    danger: "from-red-500 to-red-600",
  };

  return (
    <Card className="w-full">
      <CardBody className="p-0">
        <div
          className={`bg-gradient-to-br ${colorClasses[color]} text-white p-6 rounded-lg`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm opacity-90 mb-1">{title}</p>
              <p className="text-4xl font-bold">{value}</p>
              {description && (
                <p className="text-sm opacity-75 mt-2">{description}</p>
              )}
            </div>
            {icon && <div className="text-5xl opacity-50">{icon}</div>}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
