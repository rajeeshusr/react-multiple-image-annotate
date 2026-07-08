// MarkdownWrapper.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import MarkdownWrapper from "./MarkdownWrapper";

// A helper to render component with markdown
const renderMarkdown = (md: string) => render(<MarkdownWrapper>{md}</MarkdownWrapper>);

describe("MarkdownWrapper", () => {
  it("renders plain text markdown correctly", () => {
    renderMarkdown("Hello World");
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders headings", () => {
    renderMarkdown("# Heading 1");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Heading 1");
  });

  it("renders bold and italic text", () => {
    renderMarkdown("**bold** *italic*");
    expect(screen.getByText("bold")).toContainHTML("strong");
    expect(screen.getByText("italic")).toContainHTML("em");
  });

  it("renders links correctly", () => {
    renderMarkdown("[Google](https://google.com)");
    const link = screen.getByRole("link", { name: "Google" });
    expect(link).toHaveAttribute("href", "https://google.com");
  });

  it("renders lists correctly", () => {
    renderMarkdown("- Item 1\n- Item 2");
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Item 1");
    expect(items[1]).toHaveTextContent("Item 2");
  });


  it("applies markdown-wrapper class", () => {
    const { container } = renderMarkdown("Hello World");
    expect(container.firstChild).toHaveClass("markdown-wrapper");
  });
});
