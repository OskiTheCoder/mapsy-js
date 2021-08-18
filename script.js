'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
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
    e.preventDefault();
    inputDistance.value = '';
    inputDuration.value = '';
    inputName.value = '';
    inputRating.value = '';
    inputSpecies.value = '';
    //add marker to map
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 250,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('buttercup tofu nico problematic white people')
      .openPopup();
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
}

const app = new App();
