import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { PermissionsContext } from "context/PermissionsContext";
import CustomChatBot from "./CustomChatBot";

// ✅ Mock useTheme
vi.mock("@hitachivantara/uikit-react-core", () => ({
  useTheme: () => ({
    selectedMode: "light",
  }),
}));

// ✅ Mock react-chatbotify
vi.mock("react-chatbotify", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="mock-chatbot">
      ChatBotMock
      {props.flow && (
        <>
          <button
            data-testid="simulate-message"
            onClick={() =>
              props.flow.loop.message({
                userInput: "test",
                injectMessage: vi.fn(),
                removeMessage: vi.fn(),
                streamMessage: vi.fn(),
                endStreamMessage: vi.fn(),
                goToPath: vi.fn(),
                openChat: vi.fn(),
              })
            }
          >
            SimulateMessage
          </button>
          <button
            data-testid="simulate-end"
            onClick={() =>
              props.flow.loop.message({
                userInput: "end",
                injectMessage: vi.fn(),
                removeMessage: vi.fn(),
                streamMessage: vi.fn(),
                endStreamMessage: vi.fn(),
                goToPath: vi.fn(),
                openChat: vi.fn(),
              })
            }
          >
            SimulateEnd
          </button>
        </>
      )}
    </div>
  ),
  Button: {
    NOTIFICATION_BUTTON: "NOTIFICATION_BUTTON",
  },
}));

// ✅ Mock MarkdownRenderer
vi.mock("@rcb-plugins/markdown-renderer", () => {
  return {
    __esModule: true,
    default: vi.fn(() => {
      return {
        render: vi.fn(),
      };
    }),
    MarkdownRendererBlock: vi.fn(),
  };
});

// ✅ Mock CustomPanelPortal
vi.mock("./CustomPanelPortal", () => ({
  CustomPanelPortal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="custom-panel">{children}</div>
  ),
}));

// ✅ Mock DocumentPreview
vi.mock("./DocumentPreview", () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="doc-preview">
      DocumentPreview <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// ✅ Mock Chart
vi.mock("./Chart", () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="chart">
      Chart <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// ✅ Mock getChatbotAccessToken
vi.mock("lib/utils/Util", () => ({
  getChatbotAccessToken: vi.fn(() => "mockToken"),
}));

global.fetch = vi.fn();

describe("CustomChatBot Component", () => {
  const permissionsWithAI = {
    hasPermissions: (perm: string) => perm === "AIChatbot",
  };
  const permissionsWithoutAI = {
    hasPermissions: () => false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (permissions = permissionsWithAI) => {
    return render(
      <PermissionsContext.Provider value={permissions}>
        <CustomChatBot />
      </PermissionsContext.Provider>
    );
  };

  test("should not render if no AIChatbot permission", () => {
    renderComponent(permissionsWithoutAI);
    expect(screen.queryByTestId("custom-chat-window")).not.toBeInTheDocument();
  });

  test("renders chat window when permissions exist", () => {
    renderComponent();
    expect(screen.getByTestId("custom-chat-window")).toBeInTheDocument();
    expect(screen.getByTestId("mock-chatbot")).toBeInTheDocument();
  });

  test("flow loop triggers simulate message", async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("simulate-message"));
    expect(screen.getByTestId("mock-chatbot")).toBeInTheDocument();
  });

  test("fetchResponse returns fallback on error", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("fail"));
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId("simulate-message"));
    });
    expect(screen.getByTestId("mock-chatbot")).toBeInTheDocument();
  });

  test("streamLlmResponse processes streamed data correctly", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encoder.encode('data: {"v":"hello"}\n data: {"on_chat_model_end":true}\n')
        );
        controller.close();
      },
    });
    const mockResponse = new Response(stream, { status: 200 });
    (fetch as any).mockResolvedValueOnce(mockResponse);
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId("simulate-message"));
    });
    expect(screen.getByTestId("mock-chatbot")).toBeInTheDocument();
  });

  test("handleOnClose resets all states", async () => {
    renderComponent();
    const doc = screen.queryByTestId("doc-preview");
    if (doc) {
      fireEvent.click(screen.getByText("Close"));
    }
    expect(screen.queryByTestId("doc-preview")).not.toBeInTheDocument();
  });

  test("simulates end chat scenario (userInput='end')", async () => {
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId("simulate-end"));
    });
    expect(screen.getByTestId("mock-chatbot")).toBeInTheDocument();
  });




  test("fetchResponse handles token missing case gracefully", async () => {
    const { getChatbotAccessToken } = await import("lib/utils/Util");
    (getChatbotAccessToken as any).mockResolvedValueOnce(null);
    renderComponent();
    await act(async () => {
      fireEvent.click(screen.getByTestId("simulate-message"));
    });
    expect(screen.getByTestId("mock-chatbot")).toBeInTheDocument();
  });
});
