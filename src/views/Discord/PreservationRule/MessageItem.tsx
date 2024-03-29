import {
  Attachment,
  ContentCut as ContentCutIcon,
  Download,
  Launch,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import filesize from "filesize";
import {
  Typography,
  Avatar,
  ListItem,
  Modal,
  Skeleton,
  IconButton,
  useTheme,
} from "@mui/material";
import { forwardRef, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import discordLogo from "../../../assets/app-logos/discord.png";
import { DiscordMessage } from "../../../api/messages";
import "./MessageItem.css";
import { partition } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "../../../redux";
import { ActionType } from "../../../redux/messages/actions";
import {
  getJumpedToMessage,
  getJumpStatus,
} from "../../../redux/messages/selectors";

export const LoadingMessageItem = forwardRef<
  HTMLDivElement,
  {
    isSearchResult?: boolean;
  }
>(({ isSearchResult }, ref) => (
  <ListItem
    className="message-content"
    style={{
      padding: "10px 5px",
      borderRadius: isSearchResult ? 4 : 0,
      margin: isSearchResult ? "10px 0" : 0,
      borderTop: isSearchResult ? "none" : "1px solid #666",
    }}
    disablePadding
  >
    <div ref={ref} style={{ display: "flex", width: "100%" }}>
      <Skeleton variant="circular" width={40} height={40} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginLeft: 10,
          width: "100%",
          maxWidth: "calc(100% - 60px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton variant="rectangular" width={100} height={20} />
          <Skeleton
            variant="rectangular"
            width={150}
            height={20}
            style={{ marginLeft: 15 }}
          />
        </div>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={20}
          style={{ marginTop: 10 }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={20}
          style={{ marginTop: 10 }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={20}
          style={{ marginTop: 10 }}
        />
      </div>
    </div>
  </ListItem>
));

export const MessageItem = ({
  index,
  message,
  totalMessages,
  scrollMessagesToHeight,
  isSearchResult,
  firstSelectedMessageIndex,
  lastSelectedMessageIndex,
  setFirstSelectedMessageIndex,
  setLastSelectedMessageIndex,
}: {
  index: number;
  message: DiscordMessage;
  totalMessages: number;
  scrollMessagesToHeight: (height: number) => void;
  isSearchResult?: boolean;
  firstSelectedMessageIndex?: number | null;
  lastSelectedMessageIndex?: number | null;
  setFirstSelectedMessageIndex?: (index: number) => void;
  setLastSelectedMessageIndex?: (index: number) => void;
}) => {
  const dispatch = useDispatch<Dispatch>();

  const myRef = useRef<HTMLLIElement>(null);

  const {
    palette: {
      primary: { main: mainColor },
    },
  } = useTheme();

  const jumpStatus = useSelector(getJumpStatus);
  const jumpedToMessage = useSelector(getJumpedToMessage);

  const isJumpedToMessage = message.id === jumpedToMessage?.id;

  useEffect(() => {
    if (
      (jumpStatus === "pending" || jumpStatus === "success") &&
      !isSearchResult &&
      isJumpedToMessage &&
      myRef?.current
    ) {
      scrollMessagesToHeight(myRef.current.offsetTop);
    }
  }, [jumpStatus]);

  const [viewedImage, setViewedImage] = useState<{
    url: string;
    filename: string;
  } | null>(null);

  const [imageAttachments, nonImageAttachments] = message.appSpecificData
    ?.attachments
    ? partition(message.appSpecificData.attachments, ({ content_type }) =>
        content_type?.includes("image")
      )
    : [];

  const isCreatingSnippet =
    firstSelectedMessageIndex != null && lastSelectedMessageIndex != null;
  const isSelected =
    !isSearchResult &&
    isCreatingSnippet &&
    firstSelectedMessageIndex <= index &&
    lastSelectedMessageIndex >= index;

  return (
    <ListItem
      ref={myRef}
      className={
        "message-content" +
        (isSearchResult ? " message-content-search-result" : "")
      }
      key={message.id}
      style={{
        padding: "10px 5px",
        borderRadius: isSearchResult ? 4 : 0,
        margin: isSearchResult ? "10px 0" : 0,
        cursor: isSearchResult ? "pointer" : "default",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        borderTop: isSearchResult ? "none" : "1px solid #666",
        background: isJumpedToMessage ? "#444" : undefined,
        borderLeft: isSelected ? `2px solid ${mainColor}` : "none",
      }}
      onClick={
        isSearchResult
          ? () => dispatch({ type: ActionType.jumpStart, payload: { message } })
          : undefined
      }
      disablePadding
    >
      {isSearchResult && (
        <IconButton
          className="search-result-jump-icon"
          style={{ position: "absolute", top: 2, right: 2, background: "#222" }}
        >
          <Launch />
        </IconButton>
      )}
      {!isSearchResult && !isCreatingSnippet && (
        <div className="create-snippet-btn-container">
          <button
            onClick={() => {
              setFirstSelectedMessageIndex?.(index);
              setLastSelectedMessageIndex?.(index);
            }}
          >
            <ContentCutIcon htmlColor="#eee" />
          </button>
        </div>
      )}
      {isCreatingSnippet && index === firstSelectedMessageIndex && (
        <>
          {index > 0 && (
            <div
              className="change-snippet-selection-container"
              style={{ top: -35 }}
            >
              <button
                className="change-snippet-selection-button-up"
                onClick={() => setFirstSelectedMessageIndex?.(index - 1)}
              >
                <AddIcon htmlColor={mainColor} />
              </button>
            </div>
          )}
          {firstSelectedMessageIndex < lastSelectedMessageIndex && (
            <div
              className="change-snippet-selection-container"
              style={{ top: 0 }}
            >
              <button
                className="change-snippet-selection-button-down"
                onClick={() => setFirstSelectedMessageIndex?.(index + 1)}
              >
                <RemoveIcon htmlColor={mainColor} />
              </button>
            </div>
          )}
        </>
      )}
      {isCreatingSnippet && index === lastSelectedMessageIndex && (
        <>
          {firstSelectedMessageIndex < lastSelectedMessageIndex && (
            <div
              className="change-snippet-selection-container"
              style={{ bottom: 0 }}
            >
              <button
                className="change-snippet-selection-button-up"
                onClick={() => setLastSelectedMessageIndex?.(index - 1)}
              >
                <RemoveIcon htmlColor={mainColor} />
              </button>
            </div>
          )}
          {index < totalMessages - 1 && (
            <div
              className="change-snippet-selection-container"
              style={{ bottom: -35 }}
            >
              <button
                className="change-snippet-selection-button-down"
                onClick={() => setLastSelectedMessageIndex?.(index + 1)}
              >
                <AddIcon htmlColor={mainColor} />
              </button>
            </div>
          )}
        </>
      )}
      <div style={{ display: "flex", width: "100%" }}>
        <Avatar
          src={
            message.authorAvatar
              ? `https://cdn.discordapp.com/avatars/${message.authorId}/${message.authorAvatar}`
              : discordLogo
          }
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: 10,
            width: "100%",
            maxWidth: "calc(100% - 60px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography style={{ fontWeight: "500" }}>
              {message.authorName}
            </Typography>
            <Typography color="text.secondary" style={{ fontSize: ".75rem" }}>
              {format(message.sentAt, "P")} at {format(message.sentAt, "p")}
            </Typography>
          </div>
          <Typography style={{ marginTop: "2px", wordWrap: "break-word" }}>
            {message.content}
          </Typography>
          {imageAttachments?.map(({ filename, url, width, height }, index) => {
            const widthHeightRatio = width && height && width / height;
            let widthToUse: number | undefined;
            let heightToUse: number | undefined;
            if (widthHeightRatio) {
              if (widthHeightRatio > 1) {
                widthToUse = Math.min(width, isSearchResult ? 250 : 300);
                heightToUse = widthToUse / widthHeightRatio;
              } else {
                heightToUse = Math.min(height, isSearchResult ? 250 : 300);
                widthToUse = heightToUse * widthHeightRatio;
              }
            }
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  className="message-view-original"
                  color="text.secondary"
                  style={{
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    width: "fit-content",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    window.api.urls.openExternal(url);
                  }}
                >
                  View Original
                </Typography>
                <img
                  src={url}
                  alt={filename}
                  style={{
                    borderRadius: 4,
                    maxHeight: isSearchResult ? 250 : 300,
                    maxWidth: isSearchResult ? 250 : 300,
                    height: heightToUse ?? "auto",
                    width: widthToUse ?? "auto",
                    cursor: "pointer",
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setViewedImage({ url, filename });
                  }}
                />
              </div>
            );
          })}
          {viewedImage && (
            <Modal onClose={() => setViewedImage(null)} open>
              <img
                src={viewedImage.url}
                alt={viewedImage.filename}
                style={{
                  maxWidth: 800,
                  maxHeight: 600,
                  height: "auto",
                  width: "auto",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </Modal>
          )}
          {nonImageAttachments?.map(
            ({ filename, url, content_type, size }, index) => (
              <div
                key={index}
                style={{
                  background: "#111",
                  height: 55,
                  display: "flex",
                  alignItems: "center",
                  margin: "5px 0 5px 0",
                  borderRadius: 4,
                  border: "1px solid #666",
                  cursor: "pointer",
                  padding: "0 10px",
                  width: isSearchResult ? 250 : 400,
                  justifyContent: "space-between",
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  window.api.urls.openExternal(url);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Attachment />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: 5,
                    }}
                  >
                    <Typography
                      style={{
                        width: isSearchResult ? 100 : 250,
                        justifyContent: "space-between",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {filename}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      style={{ fontSize: ".875rem" }}
                    >
                      {content_type}
                    </Typography>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    color="text.secondary"
                    style={{ fontSize: ".875rem", whiteSpace: "nowrap" }}
                  >
                    {filesize(size)}
                  </Typography>
                  <Download />
                </div>
              </div>
            )
          )}
          {/* message.appSpecificData?.embeds.map((embed) => "EMBED") */}
        </div>
      </div>
    </ListItem>
  );
};
