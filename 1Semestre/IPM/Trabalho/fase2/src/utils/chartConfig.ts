// Configurações e utilitários para gráficos (cores, opções de Chart.js, etc.)
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  LineController,
  DoughnutController
} from 'chart.js';

export const registerChartPlugins = () => {
  ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    Title, 
    Tooltip, 
    Legend, 
    ArcElement,
    LineController,
    DoughnutController
  );
};
