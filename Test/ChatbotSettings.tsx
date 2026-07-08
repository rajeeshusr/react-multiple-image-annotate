import { Button, Settings } from "react-chatbotify";
import ChatbotIcon from "../../../assets/images/AIChatBot/UserIcon.png";
import UserAvatar from "../../../assets/images/AIChatBot/profile icon.svg";
import { Focus } from "@hitachivantara/uikit-react-icons";

export const DefaultSettings: Settings = {
  general: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', " +
      "'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', " +
      "sans-serif",
    showHeader: true,
    showFooter: false,
    showInputRow: true,
    embedded: false,
    flowStartTrigger: "ON_LOAD",
  },
  tooltip: {
    mode: "NEVER",
    text: "Talk to me!",
  },
  header: {
    title: (
      <div
        style={{
          cursor: "pointer",
          margin: 0,
          fontSize: 16,
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        RitaONE
      </div>
    ),
    showAvatar: true,
    avatar: ChatbotIcon,
    buttons: [
      Button.NOTIFICATION_BUTTON,
      <button
        data-testid="fullscreen-button"
        key="fullscreen-toggle-button"
        style={{ background: "transparent", cursor: "pointer" }}
        onClick={() => {
          // this will be overwritten in CustomChatBot
        }}
      >
        <Focus style={{ width: 20, height: 20 }} color={"white"} />
      </button>,
      Button.CLOSE_CHAT_BUTTON,
    ],
  },
  notification: {
    disabled: false,
  },
  audio: {
    disabled: true,
  },
  ariaLabel: {
    chatButton: "ChatBot",
  },
  chatHistory: {
    disabled: true,
  },
  chatInput: {
    disabled: false,
    allowNewline: false,
    enabledPlaceholderText: "Type your query...",
    disabledPlaceholderText: "",
    showCharacterCount: true,
    characterLimit: -1,
    botDelay: 500,
    blockSpam: true,
    sendOptionOutput: true,
    sendCheckboxOutput: true,
  },
  chatWindow: {
    showScrollbar: false,
    showTypingIndicator: true,
    autoJumpToBottom: false,
    showMessagePrompt: true,
    messagePromptText: "New Messages ↓",
    messagePromptOffset: 30,
    defaultOpen: false,
  },
  sensitiveInput: {
    maskInTextArea: true,
    maskInUserBubble: true,
    asterisksCount: 10,
    hideInUserBubble: false,
  },
  chatButton: {
    icon: ChatbotIcon,
  },
  userBubble: {
    animate: true,
    avatar: UserAvatar,
    showAvatar: true,
    simStream: false,
    streamSpeed: 30,
  },
  botBubble: {
    animate: true,
    avatar: ChatbotIcon,
    showAvatar: true,
    simStream: false,
    streamSpeed: 30,
  },
  voice: {
    disabled: true,
  },
  fileAttachment: {
    disabled: true,
  },
  toast: {
    maxCount: 3,
    forbidOnMax: false,
    dismissOnClick: true,
  },
  device: {
    desktopEnabled: true,
    mobileEnabled: false,
  },
};
