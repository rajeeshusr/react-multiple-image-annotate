import { useContext, useEffect, useRef, useState } from "react";
import { PermissionsContext } from "context/PermissionsContext";
import { getChatbotAccessToken } from "lib/utils/Util";
import ChatBot, { Flow, Params } from "react-chatbotify";
import MarkdownRenderer, {
  MarkdownRendererBlock,
} from "@rcb-plugins/markdown-renderer";
import { Focus } from "@hitachivantara/uikit-react-icons";
import { useTheme } from "@hitachivantara/uikit-react-core";
import "./CustomChatBot.css";
import { CustomPanelPortal } from "./CustomPanelPortal";
import PlotlyChart from "./Chart";
import { DefaultSettings } from "./ChatbotSettings";
import { DefaultStyles } from "./ChatbotStyles";
import DocumentPreview from "./DocumentPreview";
import MarkdownWrapper from "./MarkdownWrapper";

const CustomChatBot = () => {
  const { hasPermissions } = useContext(PermissionsContext);
  const customChatWindowRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const isFullscreenRef = useRef(false);
  const plugins = [MarkdownRenderer()];
  const { selectedMode } = useTheme(); // Access the current theme
  const hasError = false;
  const [fileName, setFileName] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [graphData, setGraphData] = useState<any>(null);

  const toggleMaxWidth = () => {
    setIsFullscreen((prevIsFullscreen) => {
      const newIsFullscreen = !prevIsFullscreen;
      isFullscreenRef.current = newIsFullscreen; // keep ref in sync
      const newMaxWidth = newIsFullscreen ? "99%" : "30%";
      const newWidthMargin = newIsFullscreen ? "10%" : "0";
      const newInputHeight = newIsFullscreen ? "20px" : "38px";
      const chatWindow = document.querySelector(
        ".rcb-chat-window"
      ) as HTMLElement;
      if (chatWindow) {
        chatWindow.style.width = newMaxWidth;
      }
      // document.documentElement.style.setProperty(
      //   "--chat-window-width-margin",
      //   newWidthMargin
      // );
      document.documentElement.style.setProperty(
        "--chat-input-window-min-height",
        newInputHeight
      );

      if (!newIsFullscreen) {
        setFileName("");
        setPageNumber(0);
        setGraphData(null);
      }

      return newIsFullscreen;
    });
  };

  if (DefaultSettings?.header?.buttons?.[1] !== undefined) {
    DefaultSettings.header.buttons[1] = (
      <button
        data-testid="fullscreen-button"
        key="fullscreen-toggle-button"
        style={{ background: "transparent", cursor: "pointer" }}
        onClick={() => toggleMaxWidth()}
      >
        <Focus style={{ width: 20, height: 20 }} color={"white"} />
      </button>
    );
  }

  const handlePageSelection = (source: string, refNumber: number) => {
    if (!isFullscreenRef.current) {
      toggleMaxWidth();
    }
    setFileName(source);
    setPageNumber(refNumber);
    setGraphData(null);
  };

  const handleGraphSelection = (graphData: any) => {
    if (!isFullscreenRef.current) {
      toggleMaxWidth();
    }

    setGraphData(graphData);
    setFileName("");
    setPageNumber(0);
  };

  const [scrollWidth, setScrollWidth] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    const checkScrollWidth = () => {
      const element = document.getElementsByClassName("rcb-chat-window")[0];
      if (element) {
        const currentScrollWidth = element.scrollWidth;
        const currentScrollHeight = element.scrollHeight;
        // Check if the scroll width has changed
        if (currentScrollWidth !== scrollWidth) {
          setScrollWidth(currentScrollWidth);
        }
        if (currentScrollHeight !== scrollHeight) {
          setScrollHeight(currentScrollHeight);
        }
      }
    };

    // Set interval to check for scroll width changes every 100ms
    const intervalId = setInterval(checkScrollWidth, 100);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [scrollWidth, scrollHeight]);

  const loadingMessage = (message: string, firstValueSeen: boolean = false) => {
    return (
      <div
        className="chat-box"
        style={{ marginLeft: firstValueSeen ? "50px" : "20px" }}
      >
        <div className="progress-container">
          <p>{message}</p>
          <div className="progress-bar">
            <div className="progress-bar-fill"></div>
          </div>
        </div>
      </div>
    );
  };

  async function fetchResponse(params: Params): Promise<Response | string> {
    try {
      const token = await getChatbotAccessToken();
      if (!token) {
        return "Authentication failed. Invalid token format.";
      }
      const colorTheme = selectedMode === "wicked";
      const response = await fetch(
        `${import.meta.env.VITE_CHATBOT_API_URL}/query_stream`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            query: params.userInput,
            clientContextualInfo: {
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              timezone_offset_min: new Date().getTimezoneOffset(),
              is_dark_mode: colorTheme,
            },
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Network response was not ok");
      }

      return response;
    } catch (error) {
      return "Something went wrong. Try Again.";
    }
  }

  async function call_LlmApi(params: Params): Promise<void> {
    if (shouldEndChat(params.userInput)) {
      await handleEndChat(params);
      return;
    }

    async function simulateMessages(params: Params): Promise<void> {
      const messages = ["Working on it..."];
      const messageHistory: (string | null)[] = [];
      let lastMessageId: string | null = null;

      const removeMessageIfExists = async (id: string | null) => {
        if (id) {
          await params.removeMessage(id);
        }
      };

      const injectMessageWithHistory = async (text: string) => {
        const jsxMessage = loadingMessage(text);
        const newId = await params.injectMessage(jsxMessage);
        messageHistory.push(newId);
        return newId;
      };

      const cleanupLoading = async () => {
        const lastId = messageHistory.pop();
        await removeMessageIfExists(lastId || null);
        await removeMessageIfExists(lastMessageId);
        lastMessageId = null;
      };

      const handleResponse = async (
        response: string | Response,
        params: Params
      ) => {
        if (isReadableStream(response)) {
          await streamLlmResponse(response, params);
        } else {
          handleFallbackMessage(params);
        }
      };

      for (let i = 0; i < messages.length; i++) {
        // Remove the previous message
        await removeMessageIfExists(messageHistory.pop() || null);

        // Inject new message
        await injectMessageWithHistory(messages[i]);

        // Wait before next
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          const response = await fetchResponse(params);

          // Clean up if this is the last loop
          if (i === messages.length - 1) {
            await cleanupLoading();
          }

          await handleResponse(response, params);
        } catch {
          await cleanupLoading();
          handleFallbackMessage(params);
        }
      }
    }

    simulateMessages(params);
  }

  // Helper functions below

  function shouldEndChat(input: string): boolean {
    return input === "end";
  }

  async function handleEndChat(params: Params): Promise<void> {
    await params.goToPath("end");
    setTimeout(() => params.openChat(false), 1000);
  }

  function isReadableStream(
    response: any
  ): response is Response & { body: ReadableStream<Uint8Array> } {
    return response instanceof Response && response.body !== null;
  }
  function handleFallbackMessage(params: Params): void {
    params.injectMessage(
      "Unable to answer your query. Could you try again with more information?"
    );
  }

  async function streamLlmResponse(
    response: Response,
    params: Params
  ): Promise<void> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let prevText = "";
    let firstValueSeen = false;
    let statusMessageId: string | null = null;
    let done = false;

    const injectedMessages: string[] = [];
    let prevStatusText = "";

    const removeAllInjected = async () => {
      while (injectedMessages.length) {
        const id = injectedMessages.pop();
        if (id) await params.removeMessage(id);
      }
    };

    const handleValue = async (data: any) => {
      await removeAllInjected();
      statusMessageId = null;
      prevStatusText = "";
      firstValueSeen = true;

      prevText += data.v;
      const updatedText = prevText.trim();
      await params.streamMessage(
        <MarkdownWrapper>{updatedText}</MarkdownWrapper>,
        "BOT"
      );
      await delay(30);
    };

    const handleStatus = async (data: any) => {
      if (data.s === prevStatusText) return;

      if (statusMessageId) {
        await params.removeMessage(statusMessageId);
      }

      prevStatusText = data.s;
      statusMessageId = await params.injectMessage(
        loadingMessage(data.s, firstValueSeen)
      );

      if (statusMessageId) injectedMessages.push(statusMessageId);

      await delay(300);
    };

    const handleReferences = async (data: any) => {
      await removeAllInjected();
      handleStreamingReferences(data.r, params);
    };

    const handleChart = async (data: any) => {
      await removeAllInjected();
      handleChartRendering(data.c, params);
    };

    try {
      while (!done) {
        const { value, done: readDone } = await reader.read();
        done = readDone;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n").filter(Boolean);

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.substring(6);
          if (jsonStr.includes("on_chat_model_end")) return;

          const data = JSON.parse(jsonStr);

          if (data.v !== undefined) {
            await handleValue(data);
          } else if (data.s !== undefined) {
            await handleStatus(data);
          } else if (data.r && data.r.length > 0) {
            await handleReferences(data);
          } else if (data.c) {
            await handleChart(data);
          }
        }
      }

      await params.endStreamMessage("USER");
    } catch (e) {
      console.error("Failed in streamLlmResponse:", e);

      await removeAllInjected();
      handleFallbackMessage(params);
    }
  }

  const handleChartRendering = async (
    dataC: any,
    params: Params
  ): Promise<void> => {
    const chart = JSON.parse(dataC);
    await params.injectMessage(
      <div className="chat-box-pdf-viewer">
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          <div className="graph-header">Associated Graph:</div>
          <ul className="graph-list">
            <li className="graph-item">
              <span className="graph-icon" aria-hidden="true">
                📊
              </span>
              <span className="graph-title">{chart.title}</span>
              <span
                className="view-button"
                onClick={() => handleGraphSelection(chart?.chart)}
              >
                View
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const handleStreamingReferences = async (
    dataR: any[],
    params: Params
  ): Promise<void> => {
    const sourceNames: { source: any; refNumber: any }[] = [];

    const referenceSpans = dataR
      .filter((r) => r?.source)
      .map((r, i) => {
        const refNumber = r.page_number;
        const source = r.source;
        sourceNames.push({ source, refNumber });

        return (
          <div key={i} className="reference-span">
            <span role="img" aria-label="pdf">
              📘
            </span>
            <span>{source}</span>
            <button
              type="button"
              className="reference-button"
              onClick={() => handlePageSelection(source, refNumber)}
            >
              [{refNumber}]
            </button>
          </div>
        );
      });

    await params.injectMessage(
      <div className="chat-box-pdf-viewer">
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Sources ({referenceSpans.length}):
        </div>
        <div>{referenceSpans}</div>
      </div>
    );
  };

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const flow: Flow = {
    start: {
      message:
        "Hello, I’m Rita — your AI assistant for ESG reporting. I can extract and organise your sustainability data, guide you through reporting requirements, and make compliance simpler. What would you like to work on today?",
      path: "loop",
      options: [],
      chatDisabled: false,
      renderMarkdown: ["BOT", "USER"],
    } as MarkdownRendererBlock,
    loop: {
      message: async (params: any) => {
        await call_LlmApi(params);
      },
      path: () => {
        if (hasError) {
          return "start";
        }
        return "loop";
      },
      options: [],
      chatDisabled: false,
      renderMarkdown: ["BOT", "USER"],
    } as MarkdownRendererBlock,
    end: {
      message: "This conversation is closed. Thank you",
      chatDisabled: false,
      path: "start",
      options: [],
    },
  };

  if (!hasPermissions("AIChatbot")) {
    return null;
  }

  const handlOnClose = () => {
    setFileName("");
    setPageNumber(0);
    setGraphData(null);
  };

  return (
    <div
      data-testid="custom-chat-window"
      ref={customChatWindowRef}
      className={`custom-chat-window ${isFullscreen ? "fullscreen" : ""}`}
    >
      <ChatBot
        plugins={plugins}
        settings={DefaultSettings}
        styles={DefaultStyles}
        flow={flow}
      />
      {fileName && isFullscreen && (
        <CustomPanelPortal>
          <DocumentPreview
            fileName={fileName}
            pageNumber={pageNumber}
            onClose={handlOnClose}
          />
        </CustomPanelPortal>
      )}
      {graphData && isFullscreen && (
        <CustomPanelPortal>
          <PlotlyChart
            graphData={graphData.data}
            graphLayout={graphData.layout}
            onClose={handlOnClose}
          />
        </CustomPanelPortal>
      )}
    </div>
  );
};
export default CustomChatBot;
