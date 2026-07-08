import { Styles } from "react-chatbotify";
import ChatbotIcon from "../../../assets/images/AIChatBot/UserIcon.png";

export const DefaultStyles: Styles = {
  botOptionStyle: {
    fontSize: "10px",
    padding: "5px 10px",
    backgroundColor: "#ECECEC",
    borderColor: "#56a966",
    color: "#202224",
  },
  botOptionHoveredStyle: {
    fontSize: "10px",
    padding: "5px 10px",
    backgroundColor: "Highlight",
    borderBlockColor: "Highlight",
  },
  voiceButtonStyle: {
    borderRadius: "50%",
  },
  voiceButtonDisabledStyle: {
    borderRadius: "50%",
  },
  chatIconStyle: {
    backgroundImage: `url(${ChatbotIcon})`,
    height: "45px",
    width: "45px",
    marginLeft: "0px",
  },
  closeChatIconStyle: {
    stroke: "#000",
    fill: "#000",
    color: "#000",
    backgroundColor: "transparent",
  },
  sendIconStyle: {
    rotate: "315deg",
    paddingTop: "7px",
  },
  notificationIconStyle: {
    fill: "#fff",
    stroke: "#fff",
  },
};
