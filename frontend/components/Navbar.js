export default {
  template: `
    <div>
      <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #e3f2fd;">
        
        <a class="navbar-brand" href="#">ParkEasy</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div v-if="!$store.state.loggedin" class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <router-link class="nav-link" to="/login">Login</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/register">Register</router-link>
            </li>
          </ul>
        </div>

        <div v-else-if="$store.state.loggedin and $store.state.roles.includes('user')" class="collapse navbar-collapse" id="navbarSupportedContent">
          
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <router-link class="nav-link" to="/api/parking_lots">Parking Lots</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/history">History</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/profile">My Profile</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/about">About</router-link>
            </li>
            <li class="nav-item active">
              <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
            </li>
          </ul>

          <form class="form-inline my-2 my-lg-0">
            <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
          </form>

        </div>

        <div v-else-if="$store.state.loggedin and $store.state.roles.includes('admin')" class="collapse navbar-collapse" id="navbarSupportedContent">
          
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <router-link class="nav-link" to="/api/parking_lots">Parking Lots</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/history">Parking Spots</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/about">User Analytics</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/about">Users</router-link>
            </li>
            <li class="nav-item active">
              <router-link class="nav-link" to="/profile">My Profile</router-link>
            </li>
            <li class="nav-item active">
              <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
            </li>
          </ul>

          <form class="form-inline my-2 my-lg-0">
            <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
            <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
          </form>

        </div>

      </nav>
    </div>
    `,
    methods: {
      logout() {
        this.$store.commit('logout');
        this.$router.push('/');
      }
    }
}