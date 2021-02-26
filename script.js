'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout{
  date =new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords,distance,duration){
    this.coords = coords;  //[lat,long]
    this.distance = distance; //in km
    this.duration = duration; //in min

  }

  _setDescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUppercase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

class Running extends Workout{
  type = 'running';
  constructor(coords,distance,duration,cadence){
    super(coords, distance,duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace(){
    //min/km
    this.pace = this.duration/this.distance;
    return this.pace;
  }
}

class Cycling extends Workout{
  type = 'cycling';
  constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
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

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App{
  #map;
  #mapEvent;
  #workouts = [];

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

  _newWorkout(e){
    const validInputs = (...inputs)=>inputs.every(
      input =>Number.isFinite(input));

    const allPositive = (...inputs) =>inputs.every(input =>input>0);

    e.preventDefault();

    //Get data from form 
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value
    let workout;
    const{lat,lng} =  this.#mapEvent.latlng;
    //Check if data is valid

    //If workout running, create running object
    if(type === 'running'){
      const cadence = +inputCadence.value;
      //check if data is valid
      if(!validInputs(distance,duration,cadence)|| !allPositive(distance,duration,cadence))
      return alert('Inputs have to be positive number');
      workout = new Running([lat,lng],distance,duration,cadence);
    }

    //If workout cycling, create cycling object
    if(type === 'cycling'){
      const elevation = +inputElevation.value;
      if(!validInputs(distance,duration,elevation) || !allPositive(distance,duration))
      return alert('Inputs have to be positive number');
      workout = new Cycling([lat,lng],distance,duration,elevation);
    }

    //Add new object to workout Array
    this.#workouts.push(workout);
    console.log(workout);
    //Render workout on map as marker
    this._renderWorkoutMarker(workout);

    //render workout on map as list 
    this._renderWorkout(workout);

    //Hide form + clear input fields  
    inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value = '';
  }

  _renderWorkoutMarker(workout){
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(L.popup({
        maxWidth:250,
        minWidth:100,
        autoClose:false,
        closeOnClick:false,
        className:`${workout.type}-popup`,
        }))
      .setPopupContent('workout')
      .openPopup();
  }

  _renderWorkout(workout){
    const html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">Running on April 14</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚵‍♀️'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`
  }

}

const app = new App();
app._getPosition();

