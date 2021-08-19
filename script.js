'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerActivities = document.querySelector('.activites');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputName = document.querySelector('.form__input--name');
const inputSpecies = document.querySelector('.form__input--species');
const inputRating = document.querySelector('.form__input--rating');
const distanceRow = document.getElementById('distance');
const durationRow = document.getElementById('duration');
const nameRow = document.getElementById('name');
const speciesRow = document.getElementById('species');
const ratingRow = document.getElementById('rating');

class Activity {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords) {
    this.coords = coords; // [lat, lng]
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Biking extends Activity {
  type = 'biking';

  constructor(coords, distance, duration, rating) {
    super(coords);
    this.distance = distance;
    this.duration = duration;
    this.rating = rating;
    this._setDescription();
  }

  calcSpeed() {
    return this.duration / this.distance;
  }
}

class Hiking extends Activity {
  type = 'hiking';

  constructor(coords, distance, duration, rating) {
    super(coords);
    this.distance = distance;
    this.duration = duration;
    this.rating = rating;
    this._setDescription();
  }

  calcSpeed() {
    return this.duration / this.distance;
  }
}

class Landmark extends Activity {
  type = 'landmark';

  constructor(coords, name, rating) {
    super(coords);
    this.name = name;
    this.rating = rating;
    this._setDescription();
  }
}

class Picnic extends Activity {
  type = 'picnic';

  constructor(coords, rating) {
    super(coords);
    this.rating = rating;
    this._setDescription();
  }
}

class Views extends Activity {
  type = 'views';

  constructor(coords, rating) {
    super(coords);
    this.rating = rating;
    this._setDescription();
  }
}

class Wildlife extends Activity {
  type = 'wildlife';

  constructor(coords, species) {
    super(coords);
    this.species = species;
    this._setDescription();
  }
}

class App {
  #map;
  #mapEvent;
  #activities = [];
  #currentRow = 'biking';

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newActivity.bind(this));

    inputType.addEventListener('change', this._toggleField.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        alert('could not get position');
      });
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //map click
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleField() {
    const e = document.getElementById('user-option');
    const value = e.options[e.selectedIndex].value;
    this._toggleInputs(this.#currentRow);
    this._toggleInputs(value);
    this.#currentRow = value;
  }

  _newActivity(e) {
    const checkInputs = (...inputs) => {
      if (!inputs.every(inp => Number.isFinite(inp))) {
        alert('Oops inputs must be valid numbers');
        return false;
      }
      return true;
    };
    e.preventDefault();

    //get data from form, check validty create object, add new object to activity array
    const type = inputType.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let distance;
    let duration;
    let rating;
    let name;
    let species;
    let activity;

    if (type == 'biking' || type == 'hiking') {
      distance = +inputDistance.value;
      duration = +inputDuration.value;
      rating = +inputRating.value;
      if (!checkInputs(distance, duration, rating)) return;
      activity =
        type == 'biking'
          ? new Biking([lat, lng], distance, duration, rating)
          : new Hiking([lat, lng], distance, duration, rating);
    } else if (type == 'landmark') {
      name = inputName.value;
      rating = +inputRating.value;
      if (!checkInputs(rating)) return;
      activity = new Landmark([lat, lng], name, rating);
    } else if (type == 'picnic' || type == 'views') {
      rating = +inputRating.value;
      if (!checkInputs(rating)) return;
      activity =
        type == 'picnic'
          ? new Picnic([lat, lng], rating)
          : new Views([lat, lng], rating);
    } else if (type == 'wildlife') {
      species = inputSpecies.value;
      activity = new Wildlife([lat, lng], species);
    }
    //add activity
    console.log(activity);
    this.#activities.push(activity);

    inputDistance.value = '';
    inputDuration.value = '';
    inputName.value = '';
    inputRating.value = '';
    inputSpecies.value = '';
    //add marker to map
    this._renderActivityMarker(activity);
    this._renderActivity(activity);
  }

  _renderActivityMarker(activity) {
    L.marker(activity.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 250,
          autoClose: false,
          closeOnClick: false,
          className: `${activity.type}-popup`,
        })
      )
      .setPopupContent('buttercup')
      .openPopup();
  }

  _renderActivity(activity) {
    let html = `
    <li class="activity activity--${activity.type}" data-id="${activity.id}">
      <h2 class="activity__title">${activity.description}</h2>
      <div class="activity__details">
        <span class="activity__icon">${this._getActivityEmoji(
          activity.type
        )}</span>
        ${this._getPrimaryActivityValue(activity)}
      </div>
      <div class="activity__details">
        <span class="activity__icon">⏱</span>
        <span class="activity__value">${activity.duration}</span>
        <span class="activity__unit">min</span>
      </div>
  `;

    form.insertAdjacentHTML('afterend', html);
  }

  _getActivityEmoji(type) {
    if (type == 'biking') {
      return '🚴';
    } else if (type == 'hiking') {
      return '🏔';
    } else if (type == 'landmark') {
      return '🏰';
    } else if (type == 'picnic') {
      return '🧺';
    } else if (type == 'views') {
      return '🌁';
    } else if (type == 'wildlife') {
      return '🐯';
    }
  }

  _getPrimaryActivityValue(activity) {
    if (activity.type == 'biking' || activity.type == 'hiking') {
      return `<span class="activity__value">${activity.distance}</span>
      <span class="activity__unit">km</span>`;
    } else if (activity.type == 'landmark') {
      return `<span class="activity__value">${activity.name}</span>
      <span class="activity__unit">name</span>`;
    } else if (activity.type == 'picnic' || activity.type == 'views') {
      return `<span class="activity__value">${this._getStarCount(
        activity
      )}</span>
      <span class="activity__unit">rating</span>`;
    } else if (activity.type == 'wildlife') {
      return `<span class="activity__value">${activity.species}</span>
      <span class="activity__unit">species</span>`;
    }
  }

  _toggleInputs(optionValue) {
    if (optionValue == 'biking' || optionValue == 'hiking') {
      distanceRow.classList.toggle('form__row--hidden');
      durationRow.classList.toggle('form__row--hidden');
      ratingRow.classList.toggle('form__row--hidden');
    } else if (optionValue == 'landmark') {
      nameRow.classList.toggle('form__row--hidden');
      ratingRow.classList.toggle('form__row--hidden');
    } else if (optionValue == 'picnic' || optionValue == 'views') {
      ratingRow.classList.toggle('form__row--hidden');
    } else {
      speciesRow.classList.toggle('form__row--hidden');
    }
  }

  _getStarCount(rating) {
    const ratingAbs = Math.abs(rating);
    let stars = '⭐️⭐️⭐️⭐️⭐️';
    if (ratingAbs >= 5) {
      return stars;
    }
    if (ratingAbs >= 4) {
      return stars.slice(1);
    }
    if (ratingAbs >= 3) {
      return stars.slice(2);
    }
    if (ratingAbs >= 2) {
      return stars.slice(3);
    }
    if (ratingAbs >= 1) {
      stars.slice(4);
    }
    return '❌';
  }
}

const app = new App();
