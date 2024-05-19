/**
 * Fetch data from external API.
 * @return {Array} Data fetched.
 */
const getItems = async () => {
  try {
    // Set API url.
    const apiUrl = ``;
    // Create options for the fetch function.
    const options = { cache: 'force-cache' };
    // Get a response from the API.
    const response = await fetch(apiUrl, options);
    // Parse response into JSON.
    const data = await response.json();
    // Print fetched data to the console.
    console.log('(App) Data fetched from API:', data);
    // Return fetched data.
    return data;
  } catch (error) {
    // Print catched error to the console.
    console.log('(App) Error occured while getting data.', error);
  }
};

const Items = {
  /**
   * Render the page content.
   */
  render: async () => {
    // Get items data.
    const items = await getItems();
    // Map over items and build card components.
    const itemList = items
      .map(
        ({ name, img, char_id }) => /*html*/ `
        <div class="col-lg-3 col-md-4 col-sm-6">
          <div class="card mb-3" style="width: 13rem;">
            <a href="/#/items/${char_id}">
              <img src=${img} class="card-img-top" alt=${name}>
            </a>
            <div class="card-body">
              <h5 class="card-title">${name}</h5>
            </div>
          </div>
        </div>
      `
      )
      .join('\n');
    return /*html*/ `
      <section class="container-md">
        <h1 class="text-center">List of characters:</h1>
        <div class="row m-4">
          ${itemList}
        </div>
      </section>  
    `;
  },
 /**
   * All DOM related interactions and controls are typically put in place once the DOM 
   * is fully loaded. This is because any manipulations or interactions with the DOM elements 
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {}
};

export default Items;
