'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout{
  date =new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords,distance,duration){
    this.coords = coords;  //[lat,long]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }
}

class Running extends Workout{
  constructor(coords,distance,duration,cadence){
    super(coords, distance,duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace(){
    //min/km
    this.pace = this.duration/this.distance;
    return this.pace;
  }
}

class Cycling extends Workout{
  constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed(){
    this.speed = this.distance/(this.duration/60);
    return this.speed;
  }
}

// const run1 = new Running([39,-12],5.2,24,178);
// const cycling1 = new Cycling([39,-12],5.2,24,178);
// console.log(run1,cycling1);

/* Application Architecture */
class App{
  #map;
  #mapEvent;
  constructor(){
    this._getPosition();
    form.addEventListener('submit',this._newWorkout.bind(this));
    inputType.addEventListener('change',this._toggleElevationField);
  }

  _getPosition(){
      /* geolocation API to get the location */
    if(navigator.geolocation)
      console.log(this);
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
              alert('Could not get your position');
            }
        );
  }

  _loadMap(position){
      const {latitude,longitude} = position.coords;
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      const coords = [latitude,longitude];
      /* Integration with leafletjs to get the map*/
      this.#map = L.map('map').setView(coords,13);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.#map);

      /* Handling clicks on map */
        this.#map.on('click',this._showForm.bind(this));
  }
  _showForm(mapE){
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(){
    e.preventDefault();

  /* Clear input fields */
    inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value = '';
    console.log(mapEvent);

    const{lat,lng} =  this.#mapEvent.latlng;

    L.marker([lat,lng])
    .addTo(this.#map)
    .bindPopup(L.popup({
      maxWidth:250,
      minWidth:100,
      autoClose:false,
      closeOnClick:false,
      className:'running-popup'
      }))
    .setPopupContent('workout')
    .openPopup();
  }
}

const app = new App();
app._getPosition();

