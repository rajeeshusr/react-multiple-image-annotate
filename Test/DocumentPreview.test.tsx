import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import DocumentPreview from "./DocumentPreview";

// ---- Mock getDocuments API ----
vi.mock("apis/dashboardApi", () => ({
  getDocuments: vi.fn((fileName: string) =>
    Promise.resolve({ sasUrl: `https://mockurl.com/${fileName}` })
  ),
}));

// ---- Mock @react-pdf-viewer/core ----
vi.mock("@react-pdf-viewer/core", () => {
  return {
    Viewer: (props: any) => (
      <div data-testid="mock-viewer">Viewer {props.fileUrl}</div>
    ),
    Worker: ({ children }: any) => <div>{children}</div>,
    MinimalButton: ({ onClick, children }: any) => (
      <button onClick={onClick}>{children}</button>
    ),
    SpecialZoomLevel: { PageWidth: "PageWidth" },
  };
});

// ---- Mock @react-pdf-viewer/search ----
vi.mock("@react-pdf-viewer/search", () => {
  return {
    searchPlugin: () => ({
      Search: ({ children }: any) => {
        const renderSearchProps = {
          keyword: "",
          setKeyword: vi.fn(),
          search: vi.fn(),
          numberOfMatches: 0,
          currentMatch: 0,
          jumpToPreviousMatch: vi.fn(),
          jumpToNextMatch: vi.fn(),
        };
        return children(renderSearchProps);
      },
    }),
    NextIcon: () => <span>NextIcon</span>,
    PreviousIcon: () => <span>PreviousIcon</span>,
  };
});

// ---- Mock @react-pdf-viewer/page-navigation ----
vi.mock("@react-pdf-viewer/page-navigation", () => {
  return {
    pageNavigationPlugin: () => ({
      GoToFirstPage: ({ children }: any) => children({ onClick: vi.fn() }),
      GoToLastPage: ({ children }: any) => children({ onClick: vi.fn() }),
      GoToNextPage: ({ children }: any) =>
        children({ onClick: vi.fn(), isDisabled: false }),
      GoToPreviousPage: ({ children }: any) =>
        children({ onClick: vi.fn(), isDisabled: false }),
      jumpToPage: vi.fn(),
    }),
  };
});

// ---- Mock @react-pdf-viewer/zoom ----
vi.mock("@react-pdf-viewer/zoom", () => {
  return {
    zoomPlugin: () => ({
      ZoomIn: ({ children }: any) => children({ onClick: vi.fn() }),
      ZoomOut: ({ children }: any) => children({ onClick: vi.fn() }),
      CurrentScale: ({ children }: any) => children({ scale: 1 }),
      zoomTo: vi.fn(),
    }),
  };
});


// ---- Cancel image mock ----
vi.mock("../../../assets/images/AIChatBot/Cancel.svg", () => ({
  default: "cancel-icon",
}));


describe("DocumentPreview", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders PDF viewer when fileName is .pdf", async () => {
    render(<DocumentPreview fileName="test.pdf" onClose={onClose} pageNumber={2} />);

    expect(await screen.findByTestId("mock-viewer")).toBeInTheDocument();
    expect(screen.getByText(/Viewer/)).toHaveTextContent("https://mockurl.com/test.pdf");
  });

  it("renders HTML iframe when fileName is .html", async () => {
    render(<DocumentPreview fileName="https://example.com/test.html" onClose={onClose} pageNumber={1} />);
    expect(await screen.findByTitle("Content")).toBeInTheDocument();
  });

  it("does not render viewer if fileName is invalid", () => {
    render(<DocumentPreview fileName="invalid.txt" onClose={onClose} pageNumber={1} />);
    expect(screen.queryByTestId("mock-viewer")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Content")).not.toBeInTheDocument();
  });

  it("shows navigation and zoom buttons", async () => {
    render(<DocumentPreview fileName="test.pdf" onClose={onClose} pageNumber={0} />);

    expect(await screen.findByText("First page")).toBeInTheDocument();
    expect(screen.getByText("Previous page")).toBeInTheDocument();
    expect(screen.getByText("Next page")).toBeInTheDocument();
    expect(screen.getByText("Last page")).toBeInTheDocument();
    expect(screen.getByText("Zoom out")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Zoom in")).toBeInTheDocument();
  });

 
});
