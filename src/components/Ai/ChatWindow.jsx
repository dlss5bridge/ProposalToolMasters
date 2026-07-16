import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UserInputsUI from "./components/UserInputsUI";

const TOOL_MESSAGES = {
  searchCompanyDetails: "Searching Company...",
  getCompanyDetailsAndOfficers: "Retrieving Company Details...",
  getProspectDetails: "Retrieving Updated Prospect Details...",
  saveOrUpdateProspect: "Saving Prospect Details...",
  select_service: "Configuring Service...",
  set_driver_value: "Setting Driver Value...",
  set_service_charge_type: "Setting Service Charge Type...",
  get_status: "Getting Status...",
  load_proposal: "Loading Proposal...",
  query_driver: "Querying Driver...",
  save_proposal: "Saving Proposal...",
  get_templates: "Getting Templates...",
  set_client_and_template: "Setting Client & Template...",
  calculate_pricing: "Calculating Pricing...",
  apply_discount: "Applying Discount...",
  select_package: "Configuring Package...",
  calculate_package_pricing: "Calculating Pricing...",
  get_package_status: "Getting Package Status...",
  apply_package_discount: "Applying Discount...",
  render_user_inputs: "Preparing options...",
  default: "🔧 Using tools...",
};

const MARKDOWN_COMPONENTS = {
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
};

const ProspectSelection = memo(({ prospects, onSelect, disabled = false }) => {
  return (
    <div className="flex flex-col gap-2 my-2">
      <p className="text-zinc-300">
        I found a few potential matches. Please select one or create a new
        prospect.
      </p>
      {prospects.map((prospect) => (
        <button
          key={prospect.clientKeyID}
          onClick={() => onSelect(prospect.clientKeyID)}
          disabled={disabled}
          className={`bg-zinc-800 border border-zinc-700 text-left text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-zinc-700 cursor-pointer"
          }`}
        >
          <span className="font-semibold">{prospect.clientName}</span> (
          {prospect.businessTypeName})
        </button>
      ))}
      <button
        onClick={() => onSelect(null)}
        disabled={disabled}
        className={`bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-blue-700 cursor-pointer"
        }`}
      >
        Or, create a new prospect
      </button>
    </div>
  );
});

ProspectSelection.displayName = "ProspectSelection";

const ShimmerText = memo(({ children }) => (
  <div className="relative overflow-hidden">
    <div className="animate-pulse bg-linear-to-r from-zinc-400 via-zinc-200 to-zinc-400 bg-clip-text text-transparent bg-size-[200%_100%] animate-shimmer">
      {children}
    </div>
  </div>
));

ShimmerText.displayName = "ShimmerText";

export default function ChatWindow({ organisationKeyID, token }) {
  const CHAT_API_URL = `https://aiagent-v2.caelum.ai/api/chat?organisation_key_id=${organisationKeyID}`;
  const TRANSCRIBE_API_ENDPOINT = `https://aiagent-v2.caelum.ai/api/transcribe?organisation_key_id=${organisationKeyID}`;

  const {
    messages,
    sendMessage,
    error,
    status,
    id: chatId,
  } = useChat({
    transport: new DefaultChatTransport({
      api: CHAT_API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  });

  const [input, setInput] = useState("");
  const [isProspectSelectionActive, setIsProspectSelectionActive] =
    useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copyConversationFeedback, setCopyConversationFeedback] =
    useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedProspectMessages, setSelectedProspectMessages] = useState(
    new Set(),
  );

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);
  const recordingTimerRef = useRef(null);
  const isCancellingRef = useRef(false);

  const [activeUIInputs, setActiveUIInputs] = useState(null);
  const [submittedUIComponents, setSubmittedUIComponents] = useState(new Set());

  const messagesEndRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const lastStatusRef = useRef(status);
  const hasActiveToolCallRef = useRef(false);

  useEffect(() => {
    document.title = "AI Assistant - Unified";
  }, []);

  const clearRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current !== null) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }
  }, []);

  const checkForActiveToolCalls = useCallback(() => {
    return messages.some((message) => {
      if (message.role === "assistant") {
        const toolCalls = message.parts.filter(
          (part) => part.type.startsWith("tool-") && part.type !== "tool-call",
        );
        return toolCalls.some(
          (tool) => tool.state !== "done" && tool.state !== "output-available",
        );
      }
      return false;
    });
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    const shouldBeActive =
      lastMessage &&
      lastMessage.role === "assistant" &&
      getMessageContent(lastMessage.parts).includes("[PROSPECT_SELECTION]");
    if (shouldBeActive !== isProspectSelectionActive) {
      setIsProspectSelectionActive(shouldBeActive);
    }
  }, [messages, isProspectSelectionActive]);

  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current) {
          if (mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        }
      } catch {}
      clearRecordingTimer();
    };
  }, [clearRecordingTimer]);

  const handleImageSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setSelectedImage(base64String);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const messageText = input.trim();
      const imageToSend = selectedImage;
      const uiResponsesToSend = activeUIInputs?.responses || {};
      const questionIds = activeUIInputs?.questionIds || [];
      const hasActiveUI = activeUIInputs !== null;

      if (!messageText && !imageToSend && !hasActiveUI) return;

      setInput("");
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (activeUIInputs) {
        setSubmittedUIComponents(
          (prev) => new Set([...prev, activeUIInputs.messageId]),
        );
        setActiveUIInputs(null);
      }

      const parts = [];

      let textContent = messageText;

      if (hasActiveUI && questionIds.length > 0) {
        const formattedUIResponses = questionIds
          .map((questionId) => {
            const value = uiResponsesToSend[questionId];
            if (value === "" || value === null || value === undefined) {
              return `${questionId}: <unanswered>`;
            }
            try {
              const parsed = JSON.parse(value);
              if (parsed.display) {
                return `${questionId}: ${parsed.display}${parsed.id ? ` (id: ${parsed.id})` : ""}`;
              }
              return `${questionId}: ${JSON.stringify(parsed)}`;
            } catch {
              return `${questionId}: ${value}`;
            }
          })
          .join("\n");

        textContent = textContent
          ? `[UI Responses]\n${formattedUIResponses}\n\n[User Message]\n${textContent}`
          : `[UI Responses]\n${formattedUIResponses}`;
      }

      if (textContent) {
        parts.push({ type: "text", text: textContent });
      }

      if (imageToSend) {
        const mediaTypeMatch = imageToSend.match(
          /^data:(image\/[a-z]+);base64,/,
        );
        const mediaType = mediaTypeMatch ? mediaTypeMatch[1] : "image/jpeg";
        parts.push({
          type: "file",
          mediaType: mediaType,
          url: imageToSend,
        });
      }

      if (parts.length === 0) return;

      await sendMessage(
        {
          role: "user",
          parts: parts,
        },
        {
          body: {
            chatId,
            uiResponseData: hasActiveUI ? uiResponsesToSend : undefined,
          },
        },
      );

      setTimeout(() => scrollToBottom(), 100);
    },
    [input, selectedImage, activeUIInputs, chatId, sendMessage, scrollToBottom],
  );

  const handleProspectSelect = useCallback(
    async (clientKeyID, messageId) => {
      setIsProspectSelectionActive(false);
      // Mark this message's prospect list as having a selection
      setSelectedProspectMessages((prev) => new Set([...prev, messageId]));

      let messageText = "";
      if (clientKeyID) {
        messageText = `USER_SELECTED_PROSPECT::${clientKeyID}`;
      } else {
        messageText = "Create a new prospect";
      }
      await sendMessage(
        {
          role: "user",
          parts: [{ type: "text", text: messageText }],
        },
        {
          body: {
            chatId,
          },
        },
      );
      setTimeout(() => scrollToBottom(), 100);
    },
    [chatId, sendMessage, scrollToBottom],
  );

  const transcribeAudio = useCallback(async (audioBlob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");
      const response = await fetch(TRANSCRIBE_API_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Transcription failed");
      }
      const data = await response.json();
      const transcribedText = data.text;
      if (transcribedText && transcribedText.trim()) {
        setInput(transcribedText);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      alert("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        const wasCancelling = isCancellingRef.current;
        const audioBlob = wasCancelling
          ? null
          : new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        clearRecordingTimer();
        setRecordingStartTime(null);
        if (!wasCancelling && audioBlob) {
          await transcribeAudio(audioBlob);
        }
        isCancellingRef.current = false;
        audioChunksRef.current = [];
      };
      mediaRecorder.start();
      setIsRecording(true);
      const start = Date.now();
      setRecordingStartTime(start);
      setRecordingElapsedMs(0);
      if (recordingTimerRef.current !== null) {
        clearInterval(recordingTimerRef.current);
      }
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingElapsedMs(Date.now() - start);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  }, [clearRecordingTimer, transcribeAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearRecordingTimer();
      setRecordingStartTime(null);
    }
  }, [isRecording, clearRecordingTimer]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      isCancellingRef.current = true;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const isLoading = useMemo(() => status === "submitted", [status]);
  const isInputDisabled = useMemo(
    () =>
      isLoading || isProspectSelectionActive || isRecording || isTranscribing,
    [isLoading, isProspectSelectionActive, isRecording, isTranscribing],
  );

  const hasActiveUIInputs = useMemo(() => {
    return messages.some(
      (msg) =>
        msg.role === "assistant" &&
        msg.parts.some(
          (part) =>
            part.type === "tool-render_user_inputs" &&
            part.state === "output-available" &&
            !submittedUIComponents.has(msg.id),
        ),
    );
  }, [messages, submittedUIComponents]);

  const getMessageContent = useCallback((parts) => {
    const textPart = parts.find((part) => part.type === "text");
    return textPart ? textPart.text : "";
  }, []);

  const formatDisplayContent = useCallback((content, isUser, questions) => {
    if (!isUser || !content.includes("[UI Responses]")) {
      return content;
    }

    const lines = content.split("\n");
    const selections = [];
    let userMessage = "";
    let inUserMessage = false;

    for (const line of lines) {
      if (line.trim() === "[User Message]") {
        inUserMessage = true;
        continue;
      }
      if (line.trim() === "[UI Responses]") {
        continue;
      }

      if (inUserMessage) {
        userMessage += (userMessage ? "\n" : "") + line;
      } else if (line.includes(":")) {
        const colonIdx = line.indexOf(":");
        const questionId = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();

        if (value === "<unanswered>") {
          continue;
        }

        const parenIdx = value.indexOf("(");
        const displayValue =
          parenIdx > 0 ? value.substring(0, parenIdx).trim() : value;

        if (displayValue) {
          const question = questions?.find((q) => q.id === questionId);
          let prefix = "Selected";

          if (question) {
            switch (question.type) {
              case "quantity":
                prefix = "Quantity";
                break;
              case "date":
                prefix = "Date";
                break;
              case "text":
                prefix = "Text";
                break;
              default:
                prefix = "Selected";
                break;
            }
          }

          selections.push(`${prefix}: ${displayValue}`);
        }
      }
    }

    let result = "";
    if (selections.length > 0) {
      result = selections.join(", ");
    }
    if (userMessage.trim()) {
      result += (result ? "\n\n" : "") + userMessage.trim();
    }

    return result || content;
  }, []);

  const getMessageImage = useCallback((parts) => {
    const imagePart = parts.find(
      (part) =>
        part.type === "file" ||
        part.type === "image" ||
        part.image !== undefined ||
        part.url !== undefined,
    );
    if (!imagePart) return null;
    return imagePart.url || imagePart.image || null;
  }, []);

  const getActiveToolCalls = useCallback((parts) => {
    return parts.filter(
      (part) => part.type.startsWith("tool-") && part.type !== "tool-call",
    );
  }, []);

  const getRenderUserInputsParts = useCallback((parts) => {
    return parts.filter((part) => part.type === "tool-render_user_inputs");
  }, []);

  const parseProspectSelection = useCallback((content) => {
    const match = content.match(
      /\[PROSPECT_SELECTION\]\s*([\s\S]*?)\s*\[\/PROSPECT_SELECTION\]/,
    );
    if (!match) return null;
    try {
      const prospectsJson = JSON.parse(match[1]);
      return prospectsJson;
    } catch (e) {
      console.error("Failed to parse prospect selection JSON:", e);
      return null;
    }
  }, []);

  const getToolCallMessage = useCallback(
    (parts, message) => {
      const toolCalls = getActiveToolCalls(parts);
      if (toolCalls.length === 0) {
        return null;
      }

      const hasCompletedUITool = toolCalls.some(
        (tool) =>
          tool.type === "tool-render_user_inputs" &&
          tool.state === "output-available",
      );
      if (hasCompletedUITool) {
        return null;
      }

      const nonUIToolCalls = toolCalls.filter(
        (tool) =>
          !(
            tool.type === "tool-render_user_inputs" &&
            tool.state === "output-available"
          ),
      );

      const activeTool = nonUIToolCalls.find(
        (tool) => tool.state !== "done" && tool.state !== "output-available",
      );
      const textContent = getMessageContent(parts);
      const hasCompletedTools = nonUIToolCalls.some(
        (tool) => tool.state === "output-available",
      );
      let toolToShow = activeTool;
      if (!activeTool && hasCompletedTools && !textContent.trim()) {
        toolToShow = nonUIToolCalls[nonUIToolCalls.length - 1];
      }
      if (!toolToShow) {
        return null;
      }
      let toolName = "default";
      if (toolToShow.type && toolToShow.type.startsWith("tool-")) {
        toolName = toolToShow.type.substring(5);
      }
      return TOOL_MESSAGES[toolName] || TOOL_MESSAGES.default;
    },
    [getActiveToolCalls, getMessageContent],
  );

  const getTimingMetadata = useCallback((message) => {
    if (message.metadata) {
      return message.metadata;
    }
    const finishPart = message.parts?.find((part) => part.type === "finish");
    if (finishPart?.metadata) {
      return finishPart.metadata;
    }
    return null;
  }, []);

  const formatDuration = useCallback((ms) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }, []);

  const formatElapsed = useCallback((ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, []);

  const copyChatId = useCallback(async () => {
    if (chatId) {
      try {
        await navigator.clipboard.writeText(chatId);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
        console.error("Failed to copy chat ID:", err);
      }
    }
  }, [chatId]);

  const copyConversation = useCallback(async () => {
    if (messages.length === 0) {
      return;
    }
    try {
      const formattedMessages = messages
        .map((message, index) => {
          let content = getMessageContent(message.parts);

          if (
            message.role === "user" &&
            content.startsWith("USER_SELECTED_PROSPECT::")
          ) {
            const clientKeyID = content.split("::")[1];
            if (index > 0) {
              const previousMessage = messages[index - 1];
              const previousProspects = parseProspectSelection(
                getMessageContent(previousMessage.parts),
              );
              if (previousProspects) {
                const selectedProspect = previousProspects.find(
                  (p) => p.clientKeyID === clientKeyID,
                );
                if (selectedProspect) {
                  content = `Selected: ${selectedProspect.clientName}`;
                } else {
                  content = "Create a new prospect";
                }
              }
            }
          }

          content = content.replace(
            /\[PROSPECT_SELECTION\][\s\S]*?\[\/PROSPECT_SELECTION\]/g,
            "[Prospect selection interface]",
          );
          const role = message.role === "user" ? "User" : "AI";
          return `${role}:\n${content}\n`;
        })
        .join("\n---\n\n");

      await navigator.clipboard.writeText(formattedMessages);
      setCopyConversationFeedback(true);
      setTimeout(() => setCopyConversationFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to copy conversation:", err);
      alert("Failed to copy conversation. Please try again.");
    }
  }, [messages, getMessageContent, parseProspectSelection]);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + "px";
      textarea.style.overflowY =
        textarea.scrollHeight > 120 ? "auto" : "hidden";
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const wasStreaming = lastStatusRef.current === "submitted";
    const isNowIdle = status !== "submitted";
    if (wasStreaming && isNowIdle) {
      scrollToBottom();
    }
    lastStatusRef.current = status;
  }, [status, scrollToBottom]);

  useEffect(() => {
    const hasActiveToolCall = checkForActiveToolCalls();
    const hadActiveToolCall = hasActiveToolCallRef.current;
    if (!hadActiveToolCall && hasActiveToolCall) {
      scrollToBottom();
    }
    hasActiveToolCallRef.current = hasActiveToolCall;
  }, [messages, checkForActiveToolCalls, scrollToBottom]);

  useEffect(() => {
    const currentMessageCount = messages.length;
    const isStreaming = status === "submitted";
    if (isStreaming && currentMessageCount > lastMessageCountRef.current) {
      scrollToBottom();
    }
    lastMessageCountRef.current = currentMessageCount;
  }, [messages.length, status, scrollToBottom]);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white">
      <header className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-zinc-100">AI Assistant</h1>
        </div>
        <div className="flex items-center gap-4">
          {messages.length > 0 && (
            <button
              onClick={copyConversation}
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Copy entire conversation"
            >
              {copyConversationFeedback ? (
                <>
                  <span className="text-green-400 text-xs">✓</span>
                  <span className="text-zinc-300">Copied!</span>
                </>
              ) : (
                <>
                  <span className="text-zinc-300">Copy Chat</span>
                  <svg
                    className="w-4 h-4 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </>
              )}
            </button>
          )}
          {isClient && chatId && (
            <button
              onClick={copyChatId}
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Click to copy chat ID"
            >
              <span className="text-zinc-300 font-mono">
                {chatId.slice(0, 8)}...
              </span>
              {copyFeedback ? (
                <span className="text-green-400 text-xs">✓</span>
              ) : (
                <svg
                  className="w-4 h-4 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          )}
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-4 overflow-y-auto relative">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-500">
            <div className="text-6xl mb-4 animate-bounce">🤖</div>
            <p className="text-lg">Your AI assistant is ready. Ask anything!</p>
            <p className="text-sm mt-2 text-zinc-600">
              I can help with prospects and proposals.
            </p>
          </div>
        )}

        <div className={`${messages.length > 0 ? "space-y-6" : ""}`}>
          {messages
            .filter(
              (message, index, self) =>
                index === self.findIndex((m) => m.id === message.id),
            )
            .map((message, index) => {
              const isUser = message.role === "user";
              const rawContent = getMessageContent(message.parts);
              const renderUserInputsParts = !isUser
                ? getRenderUserInputsParts(message.parts)
                : [];
              const questions = renderUserInputsParts
                .filter(
                  (part) =>
                    part.state === "output-available" && part.output?.questions,
                )
                .flatMap((part) => part.output.questions);

              let content = formatDisplayContent(rawContent, isUser, questions);
              const imageUrl = getMessageImage(message.parts);
              const prospects = !isUser
                ? parseProspectSelection(rawContent)
                : null;
              const toolCallMessage = !isUser
                ? getToolCallMessage(message.parts, message)
                : null;
              const timingMetadata = !isUser
                ? getTimingMetadata(message)
                : null;

              if (isUser && rawContent.startsWith("USER_SELECTED_PROSPECT::")) {
                const clientKeyID = rawContent.split("::")[1];
                const previousMessage = messages[index - 1];
                if (previousMessage) {
                  const previousProspects = parseProspectSelection(
                    getMessageContent(previousMessage.parts),
                  );
                  if (previousProspects) {
                    const selectedProspect = previousProspects.find(
                      (p) => p.clientKeyID === clientKeyID,
                    );
                    if (selectedProspect) {
                      content = `Selected: ${selectedProspect.clientName}`;
                    } else {
                      content = "Prospect selected.";
                    }
                  }
                }
              }

              return (
                <div key={message.id}>
                  {toolCallMessage && (
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8"></div>
                      <div className="max-w-4xl flex flex-col">
                        <div className="rounded-2xl px-4 py-2.5 bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 rounded-bl-none">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <ShimmerText>
                              <span className="text-sm italic font-semibold">
                                {toolCallMessage}
                              </span>
                            </ShimmerText>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                        <span className="text-sm">🤖</span>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}
                    >
                      {(content.trim() || imageUrl || prospects) && (
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isUser
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-none"
                          }`}
                        >
                          {imageUrl && (
                            <div className="mb-3">
                              <img
                                src={imageUrl}
                                alt="Uploaded content"
                                className="max-w-full max-h-96 rounded-lg"
                              />
                            </div>
                          )}
                          {prospects ? (
                            <ProspectSelection
                              prospects={prospects}
                              onSelect={(clientKeyID) =>
                                handleProspectSelect(clientKeyID, message.id)
                              }
                              disabled={selectedProspectMessages.has(
                                message.id,
                              )}
                            />
                          ) : (
                            content.trim() && (
                              <div
                                className={`prose prose-sm max-w-none wrap-break-word ${
                                  isUser ? "prose-blue" : "prose-zinc"
                                }`}
                              >
                                <Markdown
                                  remarkPlugins={[remarkGfm]}
                                  components={MARKDOWN_COMPONENTS}
                                >
                                  {content}
                                </Markdown>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {renderUserInputsParts.map((part, partIndex) => {
                        const uniqueKey =
                          part.providerOptions?.openai?.itemId ||
                          part.toolCallId ||
                          `part-${partIndex}`;

                        if (part.state === "call") {
                          return (
                            <div key={uniqueKey} className="mt-3 w-full">
                              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 animate-pulse">
                                <div className="h-4 bg-zinc-700 rounded w-3/4 mb-3"></div>
                                <div className="h-10 bg-zinc-700 rounded mb-2"></div>
                                <div className="h-10 bg-zinc-700 rounded"></div>
                              </div>
                            </div>
                          );
                        }

                        if (part.state === "output-available" && part.output) {
                          const isSubmitted = submittedUIComponents.has(
                            message.id,
                          );
                          const questionIds = part.output.questions.map(
                            (q) => q.id,
                          );

                          return (
                            <div key={uniqueKey} className="mt-3 w-full">
                              <UserInputsUI
                                questions={part.output.questions}
                                groupLabel={part.output.groupLabel}
                                instructions={part.output.instructions}
                                disabled={isSubmitted}
                                onChange={(responses) => {
                                  if (!isSubmitted) {
                                    setActiveUIInputs({
                                      messageId: message.id,
                                      responses,
                                      questionIds,
                                    });
                                  }
                                }}
                              />
                              {isSubmitted && (
                                <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                  <span>✓</span> Submitted
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (part.state === "error") {
                          return (
                            <div
                              key={uniqueKey}
                              className="mt-3 w-full text-red-400 text-sm"
                            >
                              Error loading options. Please try again.
                            </div>
                          );
                        }

                        return null;
                      })}

                      {!isUser &&
                        timingMetadata &&
                        (timingMetadata.completionDuration ||
                          timingMetadata.timeToFirstToken) && (
                          <div className="mt-1 px-2 text-xs text-zinc-500 flex gap-3">
                            {timingMetadata.timeToFirstToken !== null &&
                              timingMetadata.timeToFirstToken !== undefined && (
                                <span title="Time to first token (user-facing response)">
                                  ⚡{" "}
                                  {formatDuration(
                                    timingMetadata.timeToFirstToken,
                                  )}
                                </span>
                              )}
                            {timingMetadata.completionDuration && (
                              <span title="Total completion time">
                                🕐{" "}
                                {formatDuration(
                                  timingMetadata.completionDuration,
                                )}
                              </span>
                            )}
                          </div>
                        )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                        <span className="text-sm">👨</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        <div ref={messagesEndRef} />
      </main>

      <footer className="p-3 md:p-3 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        {error && (
          <div className="mb-4">
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              <p>
                <span className="font-medium">Error:</span> {error.message}
              </p>
            </div>
          </div>
        )}

        {(isRecording || isTranscribing) && (
          <div className="mb-4 flex items-center justify-center max-w-4xl mx-auto">
            <div
              className="w-full flex items-center justify-between gap-4 bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/70 rounded-xl px-4 py-3 shadow-lg"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <div className="relative" aria-hidden="true">
                    <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                ) : (
                  <div className="flex gap-1" aria-hidden="true">
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-200 font-semibold">
                    {isRecording ? "Recording" : "Transcribing"}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {isRecording
                      ? `Mic is active — ${formatElapsed(recordingElapsedMs)}`
                      : "Processing your audio to text"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isRecording && (
                  <>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold border border-red-500 transition-colors"
                      aria-label="Stop recording"
                      title="Stop and transcribe"
                    >
                      Stop
                    </button>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold border border-zinc-600 transition-colors"
                      aria-label="Cancel recording"
                      title="Cancel and discard"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {isTranscribing && (
                  <span className="text-xs text-zinc-400">
                    This may take a few seconds…
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedImage && (
          <div className="mb-4 flex items-center gap-3 max-w-4xl mx-auto">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Selected"
                className="h-20 w-20 object-cover rounded-lg border-2 border-blue-500"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute cursor-pointer -top-2 -right-2 bg-red-700 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
              >
                X
              </button>
            </div>
            <span className="text-sm text-zinc-400">
              Image ready to be sent!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isInputDisabled}
            className="bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 text-white p-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Attach image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading || isTranscribing}
            className={`${isRecording ? "bg-red-600 hover:bg-red-700 border-red-500" : "bg-zinc-800 hover:bg-zinc-700 border-zinc-700"} disabled:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed border text-white p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500`}
            title={isRecording ? "Stop recording" : "Record audio"}
            aria-pressed={isRecording}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            )}
          </button>
          <textarea
            ref={textareaRef}
            className="flex-1 w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none min-h-[44px] max-h-[93px] overflow-hidden"
            value={input}
            placeholder={
              isRecording
                ? "Recording..."
                : isTranscribing
                  ? "Transcribing..."
                  : "Ask me anything about prospects or proposals..."
            }
            onChange={(e) => setInput(e.target.value)}
            disabled={isInputDisabled}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={
              (!input.trim() && !selectedImage && !hasActiveUIInputs) ||
              isInputDisabled
            }
            className={`${hasActiveUIInputs ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} disabled:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 ${hasActiveUIInputs ? "focus:ring-green-500" : "focus:ring-blue-500"}`}
          >
            {hasActiveUIInputs ? "Submit" : "Send"}
          </button>
        </form>
      </footer>
    </div>
  );
}
