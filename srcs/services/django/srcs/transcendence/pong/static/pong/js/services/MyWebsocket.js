
// const socket = new WebSocket(
//     'wss://'
//     + window.location.host
//     + '/ws/online/'
//   );

//   socket.onopen = function(event) {
//     console.log('WebSocket is connected.');
//   };
  
//   socket.onmessage = function(event) {
//     console.log('Message from server')
//   };
  
//   socket.onclose = function(event) {
//     console.log('WebSocket is closed.');
//   };
  
//   socket.onerror = function(error) {
//     console.log('WebSocket error:', error);
//   };

  const MyWebsocket = {
    socket : null,

    startConnection : () => {
      if (MyWebsocket.socket)
        return ;
      MyWebsocket.socket = new WebSocket(
        'wss://'
        + window.location.host
        + '/ws/online/'
      );

      MyWebsocket.socket.onopen = function(event) {
        console.log('WebSocket is connected.');
      };
      
      MyWebsocket.socket.onmessage = function(event) {
        console.log('Message from server')
      };
      
      MyWebsocket.socket.onclose = function(event) {
        console.log('WebSocket is closed.');
      };
      
      MyWebsocket.socket.onerror = function(error) {
        console.log('WebSocket error:', error);
      };
    },

    removeConnection : () => {
      if (!MyWebsocket.socket)
        return ;
      MyWebsocket.socket.close();
      MyWebsocket.socket = null;
    },


  }

  export default MyWebsocket;