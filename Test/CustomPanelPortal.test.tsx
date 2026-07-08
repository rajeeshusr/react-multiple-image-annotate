import { render, screen, cleanup } from "@testing-library/react";
import { vi } from "vitest";
import { CustomPanelPortal } from "./CustomPanelPortal";

// helper to create the chat container in DOM
const setupChatContainer = () => {
  const parent = document.createElement("div");
  document.body.appendChild(parent);

  const chatContainer = document.createElement("div");
  chatContainer.className = "rcb-chat-body-container";
  parent.appendChild(chatContainer);

  return { parent, chatContainer };
};

describe("CustomPanelPortal", () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.useFakeTimers(); // for requestAnimationFrame
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("returns null when .rcb-chat-body-container is not found", () => {
    const { container } = render(
      <CustomPanelPortal>
        <div>Child</div>
      </CustomPanelPortal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("mounts a new wrapper if wrapper does not exist", () => {
    const { parent, chatContainer } = setupChatContainer();

    render(
      <CustomPanelPortal>
        <span>Portal Child</span>
      </CustomPanelPortal>
    );

    // wrapper is created
    const wrapper = parent.querySelector(".rcb-chat-wrapper");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.contains(chatContainer)).toBe(true);

    // panel is created
    const customPanel = wrapper?.querySelector(".chatbot-custom-right-panel");
    expect(customPanel).not.toBeNull();

    // child rendered inside portal
    expect(screen.getByText("Portal Child")).toBeInTheDocument();
  });

  it("mounts inside existing wrapper if it already exists", () => {
    const { parent, chatContainer } = setupChatContainer();

    // first render to create wrapper
    render(
      <CustomPanelPortal>
        <span>First</span>
      </CustomPanelPortal>
    );

    const wrapper = parent.querySelector(".rcb-chat-wrapper") as HTMLDivElement;
    expect(wrapper).not.toBeNull();

    cleanup(); // unmount first

    // render again (wrapper still exists)
    render(
      <CustomPanelPortal>
        <span>Second</span>
      </CustomPanelPortal>
    );

    expect(wrapper.querySelectorAll(".chatbot-custom-right-panel").length).toBe(
      1
    );
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("cleans up the custom panel on unmount", () => {
    const { parent } = setupChatContainer();

    const { unmount } = render(
      <CustomPanelPortal>
        <span>To be removed</span>
      </CustomPanelPortal>
    );

    const wrapper = parent.querySelector(".rcb-chat-wrapper")!;
    expect(wrapper.querySelector(".chatbot-custom-right-panel")).not.toBeNull();

    unmount();

    expect(wrapper.querySelector(".chatbot-custom-right-panel")).toBeNull();
  });
});
