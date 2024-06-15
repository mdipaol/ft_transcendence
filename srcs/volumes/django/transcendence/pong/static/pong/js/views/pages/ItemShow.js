// Import utils to extract id from url.
import { parseRequestUrl } from '../../services/utils.js';

/**
 * Fetch data from external API.
 * @param  {String} id Item's id.
 * @return {Object}    Data fetched.
 */
const getItem = async id => {
  try {
    // Set API url.
    const apiUrl = `${id}`;
    // Create options for the fetch function.
    const options = { cache: 'force-cache' };
    // Get a response from the API.
    const response = await fetch(apiUrl, options);
    // Parse and destructure response into JSON.
    const [data] = await response.json();
    // Print fetched data to the console.
    console.log('(App) Data fetched from API:', data);
    // Return fetched data.
    return data;
  } catch (error) {
    // Print catched error to the console.
    console.log('(App) Error occured while getting data.', error);
  }
};

// const ItemShow = {
//   /**
//    * Render the page content.
//    */
//   render: async () => {
//     // Get current URL params.
//     const params = parseRequestUrl();
//     // Get destructured data from API based on id provided.
//     const { name, nickname, img, wins, level } = await getItem(params.id);
    
//     return `
//       <section class="container-md" style="width: 20rem;">
//         <div class="card">
//           <img src="${img}" class="card-img-top" alt="${name}" id="characterImage">
//           <div class="card-body">
//             <h5 class="card-title">${name}</h5>
//             <p class="card-text">Known as ${nickname}.</p>
//             <p class="card-text">Wins ${wins}.</p>
//             <p class="card-text">Level ${level}.</p>
//             <a href="/#/home" class="btn btn-dark">Go Back</a>
//           </div>
//         </div>
//       </section> 
//     `;
//   // },
  /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {
    // Add event listener with a simple alert.
    document
      .querySelector('#characterImage')
      .addEventListener('click', () => alert('stocazzo, stocazzo, stocazzone!'));
  }
;

export default ItemShow;
