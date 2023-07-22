import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Card } from 'antd';
import './Chats.css';
import { FaUserFriends } from 'react-icons/fa'
// import * as PushAPI from '@pushprotocol/restapi';
import { Client } from "@xmtp/xmtp-js";

const ChatIconModal = (props) => {

  const PEER_ADDRESS = "0x937C0d4a6294cdfa575de17382c7076b579DC176";

  const [messages, setMessages] = useState(null);
  const convRef = useRef(null);
  const clientRef = useRef(null);
  const signer = props.signer;
  const isConnected = !!signer;
  const [isOnNetwork, setIsOnNetwork] = useState(false);

  // Function to load the existing messages in a conversation
  const newConversation = async function (xmtp_client, addressTo) {
    //Creates a new conversation with the address
    if (await xmtp_client?.canMessage(PEER_ADDRESS)) {
      const conversation = await xmtp_client.conversations.newConversation(
        addressTo
      );
      convRef.current = conversation;
      //Loads the messages of the conversation
      const messages = await conversation.messages();
      setMessages(messages);
    } else {
      console.log("cant message because is not on the network.");
      //cant message because is not on the network.
    }
  };

  // Function to initialize the XMTP client
  const initXmtp = async function () {
    // Create the XMTP client
    console.log('this is signer here ', signer)
    const xmtp = await Client.create(signer, { env: "dev" });
    //Create or load conversation with Gm bot
    newConversation(xmtp, PEER_ADDRESS);
    // Set the XMTP client in state for later use
    setIsOnNetwork(!!xmtp.address);
    //Set the client in the ref
    clientRef.current = xmtp;
  };

  useEffect(() => {
    if (isOnNetwork && convRef.current) {
      // Function to stream new messages in the conversation
      const streamMessages = async () => {
        const newStream = await convRef.current.streamMessages();
        for await (const msg of newStream) {
          const exists = messages.find((m) => m.id === msg.id);
          if (!exists) {
            setMessages((prevMessages) => {
              const msgsnew = [...prevMessages, msg];
              return msgsnew;
            });
          }
        }
      };
      streamMessages();
    }
  }, [messages, isOnNetwork]);

  // // props should have wallet address and signer 
  // const checkUserStatus = async () => {

  //   console.log('this is signer ', props.signer);
  //   const user = await PushAPI.user.get({
  //     env: 'staging',
  //     account: walletToPCAIP10(props.walletAddress)
  //   })

  //   if(!user) {
  //     const user = await PushAPI.user.create({
  //       env: 'staging',
  //       signer: props.signer.originalSigner
  //     })
  //     console.log('user created ', user);
  //   }
  // }

  useEffect(() => {
    initXmtp()
    // checkUserStatus();
  }, [props.walletAddress]);

  // const walletToPCAIP10 = (account) => {
  //   if (account.includes('eip155:')) {
  //     return account;
  //   }
  //   return 'eip155:' + account;
  // };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);

  // Sample data for chat requests (replace this with your actual data)
  const chatRequests = [
    { id: 1, ethereumAddress: '0x123abc', message: 'Hi! Let\'s chat!' },
    { id: 2, ethereumAddress: '0x456def', message: 'Interested in your project.' },
    // Add more chat requests as needed
  ];

  const handleIconClick = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRequest(null);
  };

  const handleCardClick = (request) => {
    setSelectedRequest(request);
    setIsMessageModalVisible(true);
  };

  const handleMessageModalClose = () => {
    setIsMessageModalVisible(false);
  };

  const handleApproveClick = () => {
    // Perform any actions related to approving the request here
  };

  return (
    <div className="chat-icon-container">
      <div className="chat-icon" onClick={handleIconClick}>
        <FaUserFriends />
         {/* <span className="notification-badge">{chatRequests.length}</span> */}
      </div>

      <Modal
        title="Chat Requests"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>Close</Button>
        ]}
      >
        {chatRequests.map((request) => (
          <Card key={request.id} className="chat-card" onClick={() => handleCardClick(request)}>
            <p>Ethereum Address: {request.ethereumAddress}</p>
            <Button type="primary" className="approve-button" onClick={handleApproveClick}>
              Approve
            </Button>
          </Card>
        ))}
      </Modal>

      <Modal
        title="Chat Message"
        visible={isMessageModalVisible}
        onCancel={handleMessageModalClose}
        footer={[
          <Button key="close" onClick={handleMessageModalClose}>Close</Button>
        ]}
      >
        {selectedRequest && (
          <div>
            <p>Ethereum Address: {selectedRequest.ethereumAddress}</p>
            <p>Message: {selectedRequest.message}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatIconModal;
