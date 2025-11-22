import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const PieExample = ({
  isAnimationActive = false,
  data,
}: {
  isAnimationActive?: boolean;
  data: Array<{ name: string; value: number; color: string }>;
}) => {
  const totalSpending = data.reduce((sum, item) => sum + item.value, 0);
  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, percent, name, value } = props;

    // Don't render label if less than 5%
    if (percent < 0.05) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10; // Position labels outside the pie
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#000"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{ fontSize: "12px" }}
      >
        <tspan x={x} dy="0" style={{ fontWeight: "bold" }}>
          {name}
        </tspan>
        <tspan x={x} dy="1.2em" fill="#777">
          £{value.toLocaleString()} ({(percent * 100).toFixed(0)}%)
        </tspan>
      </text>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        maxWidth: "850px",
        margin: "0 auto",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius="50%"
            outerRadius="75%"
            cornerRadius={5}
            paddingAngle={1}
            label={renderLabel}
            labelLine={false}
            isAnimationActive={isAnimationActive}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: "14px", color: "#666" }}>Total Spending</div>
        <div style={{ fontSize: "28px", fontWeight: "bold", color: "#333" }}>
          £{totalSpending.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
