import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import PlotlyChart from "./Chart";

// Inline mock data
const inlineMockData = [
  { x: [2018, 2019, 2020, 2021, 2022], y: [10, 15, 13, 17, 12], type: "bar" },
];

// Mock Plotly global object
const newPlotMock = vi.fn();
const purgeMock = vi.fn();
const resizeMock = vi.fn();

beforeAll(() => {
  (window as any).Plotly = {
    newPlot: newPlotMock,
    purge: purgeMock,
    Plots: { resize: resizeMock },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  // Fake container for resize effect
  const div = document.createElement("div");
  div.className = "rcb-chat-window";
  // 👇 Mock scrollWidth (read-only) with defineProperty
  Object.defineProperty(div, "scrollWidth", {
    value: 500,
    writable: true, // allow override
    configurable: true,
  });
  document.body.appendChild(div);
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("PlotlyChart Component", () => {


  it("triggers Plotly.Plots.resize when scrollWidth changes", () => {
    vi.useFakeTimers();

    render(<PlotlyChart onClose={vi.fn()} />);
    const container = document.getElementsByClassName("rcb-chat-window")[0];

    // 👇 Redefine scrollWidth dynamically
    Object.defineProperty(container, "scrollWidth", {
      value: 800,
      writable: true,
      configurable: true,
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(resizeMock).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.anything(),
      expect.objectContaining({ width: 800 }),
      expect.any(Object)
    );

    vi.useRealTimers();
  });

  it("calls onClose when cancel button is clicked", () => {
    const onClose = vi.fn();
    render(<PlotlyChart onClose={onClose} />);

    const button = screen.getByRole("button", { name: /cancel edit/i });
    fireEvent.click(button);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
