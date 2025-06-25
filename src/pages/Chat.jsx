import { HubConnectionBuilder } from "@microsoft/signalr";
import { useCallback, useEffect, useRef, useState } from "react";
import FriendTabs from "../components/friends/FriendTabs";

// const friendsDummy = [
//   {
//     id: 1,
//     Name: "Salim",
//   },
//   {
//     id: 2,
//     Name: "Asep",
//   },
//   {
//     id: 3,
//     Name: "Udin",
//   },
//   {
//     id: 4,
//     Name: "Pena",
//   },
//   {
//     id: 5,
//     Name: "Juned",
//   },
// ];

// const messagesDummy = [
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 2,
//       name: "Asep",
//     },
//     messageText: "Hello World",
//   },
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 2,
//       name: "Asep",
//     },
//     messageText: "Hahah",
//   },
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 2,
//       name: "Asep",
//     },
//     messageText: "JunTed",
//   },
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 2,
//       name: "Asep",
//     },
//     messageText: "JunTed",
//   },
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 2,
//       name: "Asep",
//     },
//     messageText: "JunTed",
//   },
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 2,
//       name: "Asep",
//     },
//     messageText: "JunTed",
//   },
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 5,
//       name: "Juned",
//     },
//     messageText: "Jangan ganggu",
//   },
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 4,
//       name: "Pena",
//     },
//     messageText: "Jangan ganggu",
//   },
//   {
//     sender: {
//       id: 1,
//       name: "Salim",
//     },
//     receiver: {
//       id: 3,
//       name: "Udin",
//     },
//     messageText: "Jangan ganggu",
//   },
//   {
//     sender: {
//       id: 3,
//       name: "Udin",
//     },
//     receiver: {
//       id: 1,
//       name: "Salim",
//     },
//     messageText: "Jangan ganggu",
//   },
//   {
//     sender: {
//       id: 2,
//       name: "Asep",
//     },
//     receiver: {
//       id: 1,
//       name: "Salim",
//     },
//     messageText: "Jangan ganggu",
//   },
// ];

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const senderId = JSON.parse(localStorage.getItem("user")).id;
  const [receiverId, setReceiverId] = useState("");
  const [receiver, setReceiver] = useState({});
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const messageListRef = useRef(null);

  useEffect(() => {
    if (!senderId) {
      location.href = "/login";
    }
  }, [senderId]);

  useEffect(() => {
    // Scroll otomatis ke bawah setiap kali messages berubah
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:5006/api/Friendlist/${senderId}`
      );
      const data = await res.json();

      // Ambil semua relasi yang accepted & melibatkan senderId
      const accepted = data.filter(
        (item) =>
          item.status === "accept" &&
          (item.user.id == senderId || item.friend.id == senderId)
      );
      console.log(data);

      const friendsList = accepted.map((item) => item.friend);
      setFriends(friendsList);

      // Ambil request yang masih pending dan dikirim OLEH senderId
      const pendingRequests = data.filter(
        (item) => item.status === "pending" && item.friend.id === senderId
      );
      console.log(pendingRequests);
      setFriendRequests(pendingRequests);
    } catch (e) {
      console.error("Error fetch friend list:", e);
    }
  }, [senderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (senderId != null && receiverId != null) {
      const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5006/chathub?userId=" + senderId)
        .withAutomaticReconnect()
        .build();
      const friendListConn = new HubConnectionBuilder()
        .withUrl("http://localhost:5006/friendlist")
        .withAutomaticReconnect()
        .build();

      friendListConn.on("ReceiveAddFriend", (friendList) => {
        setFriendRequests((prev) => [...prev, friendList]);
      });

      friendListConn.on("GetListFriend", (friendList) => {
        console.log(friendList);
        // setFriendRequests((prev) => [...prev, friendList]);
      });

      connection.on("ReceiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });

      connection.on("UserOnline", (userId) => {
        setOnlineUsers((prev) => new Set(prev).add(Number(userId)));
      });

      connection.on("UserOffline", (userId) => {
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(Number(userId));
          return updated;
        });
      });

      connection
        .start()
        .then(() => console.log("SignalR MessageHub Connected"))
        .catch((err) => console.error("SignalR Connection Error:", err));
      friendListConn
        .start()
        .then(() => console.log("SignalR FriendlistHub Connected"))
        .catch((err) => console.error("SignalR Connection Error:", err));

      return () => {
        connection.stop();
        friendListConn.stop();
      };
    }
  }, [senderId, receiverId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const payload = {
      messageText,
      senderId,
      receiverId,
    };

    try {
      const res = await fetch("http://localhost:5006/api/Message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to send message");
      console.log("Berhasil");
      setMessageText("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (receiverId && senderId) {
      const fetchData = async () => {
        const res = await fetch(
          `http://localhost:5006/api/Message/messages?receiverId=${receiverId}&senderId=${senderId}`
        ).then((r) => r.json());
        setMessages(res);
      };
      fetchData();
    }
  }, [receiverId, senderId]);

  async function handleClickMessage(friend) {
    try {
      setReceiverId(friend.id);
      setReceiver(friend);
    } catch (error) {
      console.error(error);
    }
  }

  const simplifyDate = (rawDate) => {
    if (!rawDate) return "No Date";

    const trimmed = rawDate.split(".")[0];
    const date = new Date(trimmed);

    if (isNaN(date)) return "Invalid Date";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleClickRequest = async (request, status) => {
    const payload = {
      ...request,
      userId: senderId,
      friendId: request.user.id,
      status: status,
    };
    // console.log(payload)
    // return;
    try {
      const result = await fetch(
        "http://localhost:5006/api/Friendlist/" + request.id,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const res = await result.json();
      // const accepted = res.filter(
      //   (item) =>
      //     item.status !== "accepted" &&
      //     (item.user.id == senderId || item.friend.id == senderId)
      // );

      // const friendsList = accepted.map((item) => item.friend);
      setFriends((prev) => [...prev, res.friend]);
      console.log("Berhasil");
      setMessageText("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        console.log("Key pressed:", event.key);
        setReceiverId(null);
        setReceiver({})
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="chat">
      <div className="chat-sidebar">
        <FriendTabs
          friends={friends}
          friendRequests={friendRequests}
          handleClickMessage={handleClickMessage}
          handleClickRequest={handleClickRequest}
          messages={messages}
          senderId={senderId}
        />
        <div>
          <button onClick={handleLogout} className="logout-button">
            Logout Bang
          </button>
        </div>
      </div>
      <div className="chat-body">
        <div className="chat-header">
          <h2>{receiver.name != null ? receiver.name : "Message Chat"}</h2>
          {receiver && receiver.id && (
            <span
              className={`status ${
                onlineUsers.has(receiver.id) ? "online" : "offline"
              }`}
            >
              {onlineUsers.has(receiver.id) ? "Online" : "Offline"}
            </span>
          )}
        </div>

        <ul className="message-list" ref={messageListRef}>
          {messages.length > 0 ? (
            messages
              .slice()
              .reverse()
              .filter(
                (msg) =>
                  (msg.sender.id === senderId &&
                    msg.receiver.id === receiverId) ||
                  (msg.sender.id === receiverId && msg.receiver.id === senderId)
              )
              .map((msg, i) => (
                <li
                  key={i}
                  className={
                    msg.sender.id === senderId
                      ? "chat-bubble-sender"
                      : "chat-bubble-receiver"
                  }
                >
                  <div
                    className={
                      !msg.messageText.includes("🚫") ? "deleted-message" : ""
                    }
                  >
                    {msg.messageText}
                  </div>
                  <div className="timestamp">
                    {simplifyDate(msg.sendDateTime)}
                  </div>
                </li>
              ))
          ) : (
            <span>Tidak ada pesan bang</span>
          )}
        </ul>
        {receiverId && (
          <form onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Tulis pesan..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button type="submit">Kirim</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Chat;
