/**
 * Parse current url and break it into resource, id and verb.
 * @return {Object} Path params.
 */
export const parseRequestUrl = () => {
  // Convert location hash into an url.
  const path = location.hash.slice(2).toLowerCase() || '/';

  // Split url into params array: [resource, id, verb].
  const params = path.split('/');

  // Build request variable.
  const request = {
    resource: params[0] || null,
    id: params[1] || null,
    verb: params[2] || null
  };

  // Print it in the console.
  // console.log('(App) Parsed url:', request);

  // Return and object with params.
  return request;
};

export default function triggerHashChange(hash) {
  // Store the current hash
  var currentHash = window.location.hash;

  // If the current hash is the same as the desired hash, temporarily change it
  if (currentHash === `#${hash}`) {
    window.location.hash = '';  // Clear the hash
    setTimeout(function() {
      window.location.hash = '#' + hash;  // Set the desired hash
    }, 0);  // Delay is 0 to ensure the change is noticed
  } else {
    // If the current hash is different, simply set the desired hash
    window.location.hash = '#' + hash;
  }
}

function onlineWebSocket(){
  const socket = new WebSocket(
    'wss://'
    + window.location.host
    + '/ws/online/'
  );
}

export function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}