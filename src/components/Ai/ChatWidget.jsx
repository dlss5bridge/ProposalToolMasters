import { useState } from "react";
import ChatWindow from "./ChatWindow";
import { useSelector } from "react-redux";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const organisationKeyID = useSelector(
    (state) => state.Storage.organisationKeyID,
  );

  const token = useSelector((state) => state.Storage.token);

  return (
    <>
      {/* Floating Toggle */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-3 right-6 z-[10000] w-12 h-12 rounded-full d-flex align-items-center justify-content-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl"
        style={{
          backgroundColor: "#3ac1f1",
        }}
      >
        {open ? (
          <span
            style={{
              fontSize: "22px",
              fontWeight: "600",
              color: "#fff",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            ✕
          </span>
        ) : (
          <span
            style={{
              fontSize: "22px",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            🤖
          </span>
        )}
      </div>

      {/* Chat Window */}
      {open && (
        <div
          className="
        fixed z-[9999]
        bottom-16 right-0
        w-full h-[calc(100%-4rem)]
        sm:bottom-20 sm:right-6
        sm:w-[90vw] sm:h-[85vh]
        md:w-[60%]
        lg:w-[45%] lg:h-[85vh]
        shadow-2xl
        rounded-t-2xl sm:rounded-2xl
        overflow-hidden
        border border-zinc-700
        bg-zinc-950
      "
        >
          <ChatWindow
            key={organisationKeyID}
            organisationKeyID={organisationKeyID}
            token={token}
          />
        </div>
      )}
    </>
  );
};

export default ChatWidget;

// import { useState } from "react";
// import ChatWindow from "./ChatWindow";
// import { useSelector } from "react-redux";

// const ChatWidget = () => {
//     const [open, setOpen] = useState(false);
//     const organisationKeyID = useSelector(
//         (state) => state.Storage.organisationKeyID
//     );

//     const token = useSelector(
//         (state) => state.Storage.token
//     );

//     return (
//         <>
//             {/* Floating Button */}
//             <button
//                 onClick={() => setOpen(!open)}
//                 className="btn btn-primary chat-toggle-btn"
//             >
//                 🤖
//             </button>

//             {/* Chat Window */}
//             {open &&
//                 // <div className="fixed bottom-20 right-6 z-[9999] w-[580px] h-[560px] shadow-2xl rounded-2xl overflow-hidden border border-zinc-700"></div>
//                 <div className="fixed z-[99999]
// bottom-0 right-0
// w-full h-full

// sm:bottom-20 sm:right-6
// sm:w-[420px] sm:h-[75vh]

// md:w-[500px] md:h-[80vh]

// lg:w-[580px] lg:h-[560px]

// bg-zinc-950
// shadow-2xl
// rounded-none sm:rounded-2xl
// overflow-hidden
// border border-zinc-700">
//                     <ChatWindow key={organisationKeyID} organisationKeyID={organisationKeyID} token={token} />
//                 </div>
//             }
//         </>
//     );
// };

// export default ChatWidget;
