
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
        const data = JSON.parse(event.data);

        if (data.username) {
          window.username = data.username;
          console.log('Connected as: ' + window.username);
        }
        console.log(data);

        if (data.type == "notification"){

        }
      };
      
      MyWebsocket.socket.onclose = function(event) {
        console.log('WebSocket is closed.');

        if (window.username)
          window.username = null;
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