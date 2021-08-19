'use strict';

const form = document.querySelector('.form');
const containerActivities = document.querySelector('.activities');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputSpecies = document.querySelector('.form__input--species');
const inputRating = document.querySelector('.form__input--rating');
const distanceRow = document.getElementById('distance');
const durationRow = document.getElementById('duration');
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

  constructor(coords, distance, duration) {
    super(coords);
    this.distance = distance;
    this.duration = duration;
    this._setDescription();
  }

  calcSpeed() {
    return this.duration / this.distance;
  }
}

class Hiking extends Activity {
  type = 'hiking';

  constructor(coords, distance, duration) {
    super(coords);
    this.distance = distance;
    this.duration = duration;
    this._setDescription();
  }

  calcSpeed() {
    return this.duration / this.distance;
  }
}

class Landmark extends Activity {
  type = 'landmark';

  constructor(coords, rating) {
    super(coords);
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
    containerActivities.addEventListener('click', this._moveToPopup.bind(this));
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
    let species;
    let activity;

    if (type == 'biking' || type == 'hiking') {
      distance = +inputDistance.value;
      duration = +inputDuration.value;
      if (!checkInputs(distance, duration)) return;
      activity =
        type == 'biking'
          ? new Biking([lat, lng], distance, duration)
          : new Hiking([lat, lng], distance, duration);
    } else if (type == 'landmark') {
      rating = +inputRating.value;
      if (!checkInputs(rating)) return;
      activity = new Landmark([lat, lng], rating);
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

    //add marker to map
    this._renderActivityMarker(activity);
    //add activity
    this._renderActivity(activity);
    //hide form until click
    this._hideForm();
  }

  _hideForm() {
    inputDistance.value = '';
    inputDuration.value = '';
    inputRating.value = '';
    inputSpecies.value = '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
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
      .setPopupContent(activity.description)
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
      ${this._getSecondaryActivityValue(activity)}
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
      return '🏯';
    } else if (type == 'picnic') {
      return '🧺';
    } else if (type == 'views') {
      return '🌁';
    } else if (type == 'wildlife') {
      return '🐯';
    }
  }

  _getSecondaryActivityValue(activity) {
    if (
      activity.type == 'wildlife' ||
      activity.type == 'views' ||
      activity.type == 'picnic' ||
      activity.type == 'landmark'
    ) {
      return ``;
    } else {
      return `<span class="activity__icon">⏱</span>
      <span class="activity__value">${activity.duration}</span>
      <span class="activity__unit">min</span>`;
    }
  }

  _getPrimaryActivityValue(activity) {
    if (activity.type == 'biking' || activity.type == 'hiking') {
      return `<span class="activity__value">${activity.distance}</span>
      <span class="activity__unit">km</span>`;
    } else if (
      activity.type == 'picnic' ||
      activity.type == 'views' ||
      activity.type == 'landmark'
    ) {
      return `<span class="activity__value">${this._getStarCount(
        activity.rating
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
    } else if (optionValue == 'landmark') {
      ratingRow.classList.toggle('form__row--hidden');
    } else if (optionValue == 'picnic' || optionValue == 'views') {
      ratingRow.classList.toggle('form__row--hidden');
    } else {
      speciesRow.classList.toggle('form__row--hidden');
    }
  }

  _getStarCount(rating) {
    if (rating <= 1) {
      return '❌';
    }
    if (rating >= 5) {
      return '⭐️⭐️⭐️⭐️⭐️';
    }
    if (rating >= 4) {
      return '⭐️⭐️⭐️⭐️';
    }
    if (rating >= 3) {
      return '⭐️⭐️⭐️';
    }
    if (rating >= 2) {
      return '⭐️⭐️';
    }
    if (rating >= 1) {
      return '⭐️';
    }
  }

  _moveToPopup(e) {
    const activityElement = e.target.closest('.activity');
    if (!activityElement) return;

    const activity = this.#activities.find(
      act => act.id === activityElement.dataset.id
    );

    this.#map.setView(activity.coords, 13, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    console.log(activity);
  }
}

const app = new App();
