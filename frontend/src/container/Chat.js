import React from 'react'
import SidePanel from './Sidepanel/Sidepanel'
import WebSocketInstance from '../websocket'

class Chat extends React.Component {

    constructor(props){
      super(props)
      this.state = {}

      this.waitForSocketConnection(() => {
            WebSocketInstance.addCallbacks(
              this.setMessages.bind(this),
              this.addMessage.bind(this));
			WebSocketInstance.fetchMessages(this.props.currentUser)
      })
    }

    waitForSocketConnection(callback) {
      const component = this
      
      setTimeout(
          function(){
              if (WebSocketInstance.state() === 1){
                  console.log('connection is secure')
                  callback()
                  return
              }else{
                  console.log('waiting for connection')
                  component.waitForSocketConnection(callback)
              }
          },100)
  	}

	addMessage(message) {
		this.setState({
			messages: [...this.state.messages, message]
		})
	}

	setMessages(messages) {
		this.setState({
			messages : messages.reverse()
		})
	}

	renderMessages = (message) => {
		const currentUser = 'admin';
		return message.map(message => (
			<li 
			key={message.id}
			className={message.author === currentUser ? 'send' : 'replies'}>
			<img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
			<p>
				{message.content}
			</p>
			</li>
		))
	}
  
    render() {
		const messages = this.state.messages
        return(
            <div id="frame">
            <SidePanel/>
            <div className="content">
              <div className="contact-profile">
                <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                <p>username </p>
                <div className="social-media">
                  <i className="fa fa-facebook" aria-hidden="true"></i>
                  <i className="fa fa-twitter" aria-hidden="true"></i>
                  <i className="fa fa-instagram" aria-hidden="true"></i>
                </div>
              </div>
              <div className="messages">
                <ul id="chat-log">
                   {
					messages && 
					this.renderMessages(messages)
				   }
                </ul>
              </div>
              <div className="message-input">
                <div className="wrap">
                <input id="chat-message-input" type="text" placeholder="Write your message..." />
                <i className="fa fa-paperclip attachment" aria-hidden="true"></i>
                <button id="chat-message-submit" className="submit">
                  <i className="fa fa-paper-plane" aria-hidden="true"></i>
                </button>
                </div>
              </div>
            </div>
          </div>
        )
    }
}

export default Chat