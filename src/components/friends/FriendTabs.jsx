import { useEffect, useState } from "react";

const FriendTabs = ({
  friends,
  messages,
  senderId,
  handleClickMessage,
  handleClickRequest,
  friendRequests,
}) => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchText, setSearchText] = useState("");
  const [registeredUser, setRegisteredUser] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5006/api/AppUser");
        const data = await res.json();

        // Ambil hanya yang belum jadi teman
        const belumTeman = getNewValuesOnly(data, friends);
        setRegisteredUser(belumTeman);
      } catch (err) {
        console.error("Gagal ambil user:", err);
      }
    };

    fetchData();
  }, [friends]);

  function getNewValuesOnly(arrBaru, arrLama) {
    const lamaIds = arrLama.map((f) => f.id);
    return arrBaru.filter((baru) => !lamaIds.includes(baru.id));
  }


  // Filter berdasarkan search dan bukan diri sendiri
  const filteredFriends = friends.filter(
    (f) =>
      f.id !== senderId &&
      f.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredRequests = friendRequests.filter(
    (r) =>
      r.userId !== senderId &&
      r.friend.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleClickAddFriend = async (user) => {
    const payload = {
      userId: senderId,
      friendId: user.id,
      status: "pending",
    };
    try {
      const result = await fetch("http://localhost:5006/api/friendList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="friend-tabs">
      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab("friends")}
          className={activeTab === "friends" ? "active" : ""}
        >
          🤝
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={activeTab === "requests" ? "active" : ""}
        >
          👋
        </button>
        <button
          onClick={() => setActiveTab("find")}
          className={activeTab === "find" ? "active" : ""}
        >
          👋
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari teman..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="search-input"
      />

      <ul className="friends-list">
        {activeTab === "friends" ? (
          filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => {
              const latestMessage = messages
                .filter(
                  (msg) =>
                    (msg.sender.id === friend.id &&
                      msg.receiver.id === senderId) ||
                    (msg.sender.id === senderId &&
                      msg.receiver.id === friend.id)
                )
                .sort(
                  (a, b) => new Date(b.sendDateTime) - new Date(a.sendDateTime)
                )[0];

              return (
                <li
                  className="friend-profile"
                  onClick={() => handleClickMessage(friend)}
                  key={`friend-${friend.id}`}
                >
                  <img src="#" alt="Profile" />
                  <div>
                    <h3>{friend.name}</h3>
                    <span className="last-message">
                      {latestMessage?.messageText || ""}
                    </span>
                  </div>
                </li>
              );
            })
          ) : (
            <li>Tidak ada teman ditemukan.</li>
          )
        ) : activeTab === "requests" ? (
          filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <li className="friend-profile" key={`request-${request.id}`}>
                <div>
                  <h3>{request.user.name}</h3>
                  <div className="request-action">
                    <button
                      onClick={() => handleClickRequest(request, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleClickRequest(request, "block")}
                    >
                      Block
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li>Tidak ada permintaan pertemanan ditemukan.</li>
          )
        ) : (
          <>
            <li>
              <h5>Temukan Teman Anda</h5>
            </li>
            {registeredUser.length > 0 &&
              registeredUser
                .filter((u) => u.id != senderId)
                .map((user) => (
                  <li className="friend-profile" key={`user-${user.id}`}>
                    <div>
                      <h3>{user.name}</h3>
                      <button onClick={() => handleClickAddFriend(user)}>
                        ➕
                      </button>
                    </div>
                  </li>
                ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default FriendTabs;
