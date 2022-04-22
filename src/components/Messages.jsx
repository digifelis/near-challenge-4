import React from 'react';
import PropTypes from 'prop-types';

export default function Messages({ messages }) {
  return (
    <>
      <h2>Messages</h2>
      {messages.map((message, i) =>
        // TODO: format as cards, add timestamp
        <a href={"/" + i} className="articles">
        <p key={i} className={message.premium ? 'is-premium' : ''}>
          <strong>{message.sender}</strong>:<br/>
          {message.text}<br/>
          {(new Date(parseInt(message.timestamp)/1000000)).toString()}<br/>
          {message.premium ? 'premium : Donated' : 'Not Donated'} {parseFloat(message.donation_amount / 1000000000000000000000000).toString()}<br/>
          <br/>

          
          
        </p>
        </a>
      )}
    </>
  );
}

Messages.propTypes = {
  messages: PropTypes.array
};
