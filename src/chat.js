import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';

const GET_MESSAGES = gql`
  query GetMessages {
    messages {
      id
      user
      content
    }
  }
`;

const POST_MESSAGE = gql`
  mutation PostMessage($user: String!, $content: String!) {
    postMessage(user: $user, content: $content) {
      id
      user
      content
    }
  }
`;

const MESSAGE_ADDED = gql`
  subscription OnMessageAdded {
    messageAdded {
      id
      user
      content
    }
  }
`;

const MESSAGE_DELETED = gql`
  subscription OnMessageDeleted {
    messageDeleted {
      id
      user
      content
    }
  }
`

const MESSAGE_UPDATED = gql`
  subscription OnMessageUpdated {
    messageUpdated {
    id
    user
    content
  }
  }
`

const Chat = () => {
  const [user, setUser] = useState('');
  const [content, setContent] = useState('');

  const { data: queryData, loading } = useQuery(GET_MESSAGES);
  // const { data: subscriptionData } = useSubscription(MESSAGE_ADDED,MESSAGE_DELETED);
  
  const { data: messageAddedData } = useSubscription(MESSAGE_ADDED);
  const { data: messageDeletedData } = useSubscription(MESSAGE_DELETED);
  const {data: messageUpdatedData} = useSubscription(MESSAGE_UPDATED);

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (queryData) {
      setMessages(queryData.messages);
    }
  }, [queryData]);

  // useEffect(() => {
  //   if (subscriptionData) {
  //     setMessages((prevMessages) => [...prevMessages, subscriptionData.messageAdded, subscriptionData.messageDeleted]);
  //   }
  // }, [subscriptionData]);

  useEffect(() => {
    if (messageAddedData) {
      setMessages((prevMessages) => [...prevMessages, messageAddedData.messageAdded]);
    }
  }, [messageAddedData]);

  useEffect(() => {
    if (messageDeletedData) {
      setMessages((prevMessages) =>
        prevMessages.filter(message => message.id !== messageDeletedData.messageDeleted.id)
      );
    }
  }, [messageDeletedData]);

  // useEffect(()=>{
  //   if(messageUpdatedData){
  //     setMessages((prevMessages)=>{
  //       prevMessages.map((message)=>
  //         message.id === messageUpdatedData.messageUpdated.id ? {...message, ...messageUpdatedData.messageUpdated} : message
  //       )
  //     })
  //   }
  // },[messageUpdatedData])

  useEffect(() => {
    if (messageUpdatedData) {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageUpdatedData.messageUpdated.id ? { ...message, ...messageUpdatedData.messageUpdated } : message
        )
      );
    }
  }, [messageUpdatedData]);

  const [postMessage] = useMutation(POST_MESSAGE);

  const sendMessage = () => {
    if (content.length > 0) {
      postMessage({
        variables: {
          user,
          content,
        },
      });
      setContent('');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div>
        {messages.map(({ id, user, content }) => (
          <div key={id}>
            <b>{user}:</b> {content}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          placeholder="User"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="text"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
