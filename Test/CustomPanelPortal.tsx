import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface CustomPanelPortalProps {
  children: ReactNode;
}

export const CustomPanelPortal = ({ children }: CustomPanelPortalProps) => {

    const mountCustomPanel = (): HTMLElement | null => {
        const chatContainer = document.querySelector(".rcb-chat-body-container");

        if (!chatContainer) return null;

        const wrapperExists = chatContainer.parentElement?.classList.contains("rcb-chat-wrapper");

        let wrapper: HTMLDivElement;

        if (!wrapperExists) {
            const parent = chatContainer.parentElement!;
            wrapper = document.createElement("div");
            wrapper.className = "rcb-chat-wrapper";
            Object.assign(wrapper.style, {
                display: "flex",
                flexDirection: "row",
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                direction: "ltr",
            });

            parent.replaceChild(wrapper, chatContainer);
            wrapper.appendChild(chatContainer);

        } else {
            wrapper = chatContainer.parentElement as HTMLDivElement;
        }

        // Create fresh customPanel on every call
        const customPanel = document.createElement("div");
        customPanel.className = "chatbot-custom-right-panel";
        Object.assign(customPanel.style, {
            width: "50%",
            height: "100%",
            overflowY: "auto",
            backgroundColor: "#f3f3f3",
            // padding: "1rem",
            boxSizing: "border-box",
            flexShrink: "0",
            direction: "ltr",
            // border: "1px solid",
            borderRadius: "5px",
            marginRight: "10px",
        });

        // Scroll to bottom after mounting
        // Scroll to bottom after layout
        requestAnimationFrame(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        });

        // Append panel on every mount
        wrapper.appendChild(customPanel);

        return customPanel;
    }


    // const container = document.getElementById("custom-right-panel-root");
    const containerRef = useRef<HTMLElement | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const panel = mountCustomPanel();  // creates and returns DOM element
        containerRef.current = panel;
        setMounted(true);

        return () => {
            if (containerRef.current?.parentNode) {
                containerRef.current.remove();
                containerRef.current = null;
            }
        };
    }, []);

    if (!mounted || !containerRef.current) return null;

    return createPortal(
        <div className="custom-right-panel"> {children} </div>,
        containerRef.current
    );
};
