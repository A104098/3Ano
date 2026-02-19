import {
  Chart,
  PieController,
  ArcElement,
  Legend,
  Tooltip
} from "chart.js";

Chart.register(PieController, ArcElement, Legend, Tooltip);

export function criarPieChart(ctx, labels, data, colors) {
  return new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}
