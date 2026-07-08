import { getDocuments } from "apis/dashboardApi";
import { useEffect, useState } from "react";
import {
  Viewer,
  Worker,
  DocumentLoadEvent,
  SpecialZoomLevel,
} from "@react-pdf-viewer/core";
import { HvBox } from "@hitachivantara/uikit-react-core";
import { MinimalButton } from "@react-pdf-viewer/core";
import {
  NextIcon,
  PreviousIcon,
  RenderSearchProps,
  searchPlugin,
} from "@react-pdf-viewer/search";
import {
  pageNavigationPlugin,
  RenderGoToPageProps,
} from "@react-pdf-viewer/page-navigation";
import {
  RenderCurrentScaleProps,
  RenderZoomInProps,
  RenderZoomOutProps,
  zoomPlugin,
} from "@react-pdf-viewer/zoom";
import Cancel from "../../../assets/images/AIChatBot/Cancel.svg";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "./DocumentPreview.css";

interface DocumentPreviewProps {
  fileName: string;
  onClose: () => void;
  pageNumber: number;
}

const DocumentPreview = ({
  fileName,
  onClose,
  pageNumber,
}: DocumentPreviewProps) => {
  const [sasUrl, setSasUrl] = useState<string>("");
  const [pdfLoaded, setPdfLoaded] = useState(false);

  const pageNavigationPluginInstance = pageNavigationPlugin();
  const {
    GoToFirstPage,
    GoToLastPage,
    GoToNextPage,
    GoToPreviousPage,
    jumpToPage,
  } = pageNavigationPluginInstance;

  const searchPluginInstance = searchPlugin();
  const { Search } = searchPluginInstance;

  const zoomPluginInstance = zoomPlugin();
  const { CurrentScale, ZoomIn, ZoomOut, zoomTo } = zoomPluginInstance;

  useEffect(() => {
    if (fileName && fileName !== "undefined" && fileName.includes(".pdf")) {
      getDocuments(fileName)
        .then((response: { sasUrl: string }) => {
          setSasUrl(response?.sasUrl);
        })
        .catch((error) => {
          console.error(`Error fetching document: ${error}`);
        });
    } else if (fileName.includes(".html")) {
      setSasUrl(fileName);
    }
  }, [fileName]);

  const handleDocumentLoad = (e: DocumentLoadEvent) => {
    setPdfLoaded(true);
    zoomTo(SpecialZoomLevel.PageWidth);
  };

  useEffect(() => {
    if (!pdfLoaded) return;

    const raf = requestAnimationFrame(() => {
      jumpToPage(pageNumber); // 0-based page index
    });

    return () => cancelAnimationFrame(raf);
  }, [pdfLoaded, pageNumber]);

  const closePdfViewer = () => {
    onClose();
  };

  return (
    <HvBox className="document-preview-container">
      {sasUrl && sasUrl.includes(".pdf") && (
        <>
          <Search>
            {(renderSearchProps: RenderSearchProps) => {
              const [readyToSearch, setReadyToSearch] = useState(false);
              return (
                <>
                  <HvBox className="search-main">
                    <HvBox className="search-main-child">
                      <HvBox className="search-component">
                        <input
                          placeholder="Enter to search"
                          type="text"
                          value={renderSearchProps.keyword}
                          onChange={(e) => {
                            setReadyToSearch(false);
                            renderSearchProps.setKeyword(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            if (e.keyCode === 13 && renderSearchProps.keyword) {
                              setReadyToSearch(true);
                              renderSearchProps.search();
                            }
                          }}
                        />
                      </HvBox>
                      {readyToSearch && renderSearchProps.numberOfMatches ? (
                        <>
                          <HvBox className="menu-bar-child-item">
                            <MinimalButton
                              onClick={renderSearchProps.jumpToPreviousMatch}
                            >
                              <PreviousIcon />
                            </MinimalButton>
                          </HvBox>
                          <HvBox className="menu-bar-child-item">
                            <MinimalButton
                              onClick={renderSearchProps.jumpToNextMatch}
                            >
                              <NextIcon />
                            </MinimalButton>
                          </HvBox>
                        </>
                      ) : null}

                      <HvBox className="menu-bar">
                        <HvBox className="menu-bar-child ">
                          <HvBox className="menu-bar-child-item">
                            <GoToFirstPage>
                              {(props: RenderGoToPageProps) => (
                                <button
                                  className="pdf-viewer-buttons"
                                  onClick={props.onClick}
                                >
                                  First page
                                </button>
                              )}
                            </GoToFirstPage>
                          </HvBox>
                          <HvBox className="menu-bar-child-item">
                            <GoToPreviousPage>
                              {(props: RenderGoToPageProps) => (
                                <button
                                  className="pdf-viewer-buttons"
                                  disabled={props.isDisabled}
                                  onClick={props.onClick}
                                >
                                  Previous page
                                </button>
                              )}
                            </GoToPreviousPage>
                          </HvBox>
                          <HvBox className="menu-bar-child-item">
                            <GoToNextPage>
                              {(props: RenderGoToPageProps) => (
                                <button
                                  className="pdf-viewer-buttons"
                                  disabled={props.isDisabled}
                                  onClick={props.onClick}
                                >
                                  Next page
                                </button>
                              )}
                            </GoToNextPage>
                          </HvBox>
                          <HvBox className="menu-bar-child-item">
                            <GoToLastPage>
                              {(props: RenderGoToPageProps) => (
                                <button
                                  className="pdf-viewer-buttons"
                                  onClick={props.onClick}
                                >
                                  Last page
                                </button>
                              )}
                            </GoToLastPage>
                          </HvBox>
                          <HvBox className="menu-bar-child-item">
                            <ZoomOut>
                              {(props: RenderZoomOutProps) => (
                                <button
                                  className="pdf-viewer-buttons"
                                  onClick={props.onClick}
                                >
                                  Zoom out
                                </button>
                              )}
                            </ZoomOut>
                          </HvBox>
                          <HvBox className="menu-bar-child-item">
                            <CurrentScale>
                              {(props: RenderCurrentScaleProps) => (
                                <>{`${Math.round(props.scale * 100)}%`}</>
                              )}
                            </CurrentScale>
                          </HvBox>
                          <HvBox className="menu-bar-child-item">
                            <ZoomIn>
                              {(props: RenderZoomInProps) => (
                                <button
                                  className="pdf-viewer-buttons"
                                  onClick={props.onClick}
                                >
                                  Zoom in
                                </button>
                              )}
                            </ZoomIn>
                          </HvBox>
                        </HvBox>
                      </HvBox>
                    </HvBox>

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
                  {readyToSearch &&
                    renderSearchProps.keyword &&
                    renderSearchProps.numberOfMatches === 0 && (
                      <HvBox style={{ padding: "0 8px" }}>Not found</HvBox>
                    )}
                  {readyToSearch &&
                    renderSearchProps.keyword &&
                    renderSearchProps.numberOfMatches > 0 && (
                      <HvBox style={{ padding: "0 8px" }}>
                        {renderSearchProps.currentMatch} of{" "}
                        {renderSearchProps.numberOfMatches}
                      </HvBox>
                    )}
                </>
              );
            }}
          </Search>

          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={sasUrl}
              plugins={[
                pageNavigationPluginInstance,
                searchPluginInstance,
                zoomPluginInstance,
              ]}
              onDocumentLoad={handleDocumentLoad}
            />
          </Worker>
        </>
      )}
      {sasUrl && sasUrl.startsWith("https://") && (
        <>
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
          <HvBox className="iframe-container">
            <iframe
              src={sasUrl}
              title="Content"
              style={{ height: "100%", width: "100%" }}
            />
          </HvBox>
        </>
      )}
    </HvBox>
  );
};

export default DocumentPreview;
