import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export function criarCidadesChart(ctx, dados) {
  const labels = (dados.regions && Array.isArray(dados.regions))
    ? dados.labels.map((c, i) => [c, dados.regions[i] || ''])
    : dados.labels;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '1º Semestre',
          data: dados.sem1,
          backgroundColor: dados.cor1 || '#d18567',
          borderRadius: 6,
        },
        {
          label: '2º Semestre',
          data: dados.sem2,
          backgroundColor: dados.cor2 || '#b5694b',
          borderRadius: 6,
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,   
      layout: {
        padding: { left: 6, right: 6, top: 6, bottom: 6}
      },
      datasets: {
        bar: {
          barThickness : undefined,
          barPercentage: 0.8,
          categoryPercentage: 0.6
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          grid: { display: false },
          ticks: {
            maxRotation: 0,
            padding: 2,   
        }
    }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}
