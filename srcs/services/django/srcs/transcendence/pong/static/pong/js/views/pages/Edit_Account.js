import { parseRequestUrl } from '../../services/utils.js';

const Home = {
  /**
   * Render the page content.
   */
  render: async () => {
    return /*html*/ `
      <div class="account">
      <section class="account-highlights account-section">
      <div class="profile-sidepanel account-highlights">
            <h6>Current Image:</h6>
            <img src="{{img}}" alt="Current Image" class="account-image">
          </div>
        <div class="form-container">
          <div class="input-form">
            <form method="POST" enctype="multipart/form-data">
              <!-- CSRF token -->
              <fieldset>
                <legend class="neonbar neonbar-animated neonbar-medium neonbar-pink">Edit Profile</legend>
                <div class="upload-btn-container">
                   <button class="glow-button cyan">Upload new image</button>
                </div>
                <div class="account-info-text">
                  <label for="nickname" class= "neonbar neonbar-small neonbar-pink" >Nickname</label>
                  <input type="text" id="nickname" name="nickname" value="{{nickname}}" required class="neonbar neonbar-blue">
                  <label for="email" class= "neonbar neonbar-small neonbar-pink" >Email</label>
                  <input type="email" id="email" name="email" value="{{email}}" required class="neonbar neonbar-small neonbar-blue">
                  <div>
                  <a class="glow-button purple" href="{% url 'account' %}">Return</a>
                  <button class="glow-button green">Update</button>
                  </div>
                </div>
              </fieldset>
                </form>
              </div>
        </div>
        </section>
      </div>
    `;
  },
  /**
   * All DOM related interactions and controls are typically put in place once the DOM
   * is fully loaded. This is because any manipulations or interactions with the DOM elements
   * must be done after these elements have been fully rendered on the page.
   */
  after_render: async () => {}
};

export default Home;
