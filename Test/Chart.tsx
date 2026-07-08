import { useEffect, useRef, useState } from "react";
import mockData from "./mockdata.json";
import { HvBox } from "@hitachivantara/uikit-react-core";
import Cancel from "../../../assets/images/AIChatBot/Cancel.svg";
interface PlotlyChartProps {
  graphData?: any;
  graphLayout?: any;
  onClose: () => void;
}

const PlotlyChart = ({graphData, graphLayout, onClose}: PlotlyChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const data = graphData??mockData?.data;

  const layoutData = {
    ...graphLayout,
    autosize: true,
    margin: { t: 40, r: 70, l: 60, b: 140 }, // big bottom margin for rotated labels
    xaxis: {
      tickangle: -45,           // rotate labels
      automargin: true,         // allow Plotly to increase margins if needed
      tickfont: { size: 12 },
      tickmode: 'auto',
      tickson: 'labels',
    },
    yaxis: { automargin: true },
  };

  const config = {
    displaylogo: false, // Hides the Plotly logo
  };

  const layout = layoutData;

  useEffect(() => {
    if (chartRef.current) {
      (window as any).Plotly.newPlot(chartRef.current, data, layout, config);
    }
    // Optional: Cleanup
    return () => {
      if (chartRef.current) {
        (window as any).Plotly.purge(chartRef.current);
      }
    };
  }, [graphData]);

  const [scrollWidth, setScrollWidth] = useState(0);
  useEffect(() => {
    const checkScrollWidth = () => {
      const element = document.getElementsByClassName("rcb-chat-window")[0];
      if (element) {
        const currentScrollWidth = element.scrollWidth;
        const chartLayout = {
          ...layout,
          autosize: true,
          responsive: true,
          width: currentScrollWidth,
        };

        // Check if the scroll width has changed
        if (currentScrollWidth !== scrollWidth) {
          setScrollWidth(currentScrollWidth);
          if (chartRef.current) {
            (window as any).Plotly.Plots.resize(chartRef.current, data, chartLayout, config);
          }
        }
      }
    };

    // Set interval to check for scroll width changes every 100ms
    const intervalId = setInterval(checkScrollWidth, 100);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [scrollWidth, graphData]);

    const closePdfViewer = () => {
    onClose();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "600px",
        overflow: "hidden",
        padding: "10px",
        background: "#e6f2e8",
        borderRadius: "10px",
      }}
    >
      <HvBox className="search-bar-html">
            <HvBox>
              <button
                onClick={closePdfViewer}
                aria-label="Cancel edit"
                style={{ cursor: "pointer" }}
              >
                <img src={Cancel} alt="Cancel" />
              </button>
            </HvBox>
          </HvBox>
      <div ref={chartRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default PlotlyChart;
