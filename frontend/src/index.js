import React from 'react'
import  ReactDOM   from 'react-dom'
import Chat from './container/chat'

class App extends React.Component {
    render() {
        return (
            <Chat />
        )
    }
}

ReactDOM.render(<App/>, document.getElementById("app"))