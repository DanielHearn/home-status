'use strict';

var tempValueElement = document.querySelector('#latest-temp .value');
var humidityValueElement = document.querySelector('#latest-humidity .value');
var dateElement = document.querySelector('#latest-date .value');
var chartContainer = document.querySelector('.chart-container');

var day1Button = document.querySelector('#day1-button');
var day2Button = document.querySelector('#day2-button');
var day7Button = document.querySelector('#day7-button');

var apiUrlRoot = 'http://www.thekoreanhandbook.com/homestatus';

var colors = {
  red: '#ff7491',
  lightRed: 'rgba(255,116,145,0.5)',
  blue: '#37a2eb',
  lightBlue: 'rgba(55,162,235, 0.5)'
};

var timePeriods = {
  days_1: 48,
  days_2: 96,
  days_7: 336
};

var options = {
  type: 'line',
  data: {
    datasets: [{
      label: 'Temp c',
      backgroundColor: colors.lightRed,
      borderColor: colors.red,
      borderWidth: 1
    }, {
      label: 'Humidity %',
      backgroundColor: colors.lightBlue,
      borderColor: colors.blue,
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          // steps: 10,
          // stepValue: 5,
          max: 100
        }
      }]
    }
  }
};

var statusQuantity = timePeriods.days_7;
var statusChart = void 0;
var statusArray = void 0;
var currentPeriod = timePeriods.days_1;

day1Button.addEventListener('click', get1DayStatus);
day2Button.addEventListener('click', get2DayStatus);
day7Button.addEventListener('click', get7DayStatus);

function showChartButtonActive(activeButton) {
  day1Button.classList.remove('active');
  day2Button.classList.remove('active');
  day7Button.classList.remove('active');
  activeButton.classList.add('active');
}

function get1DayStatus() {
  currentPeriod = timePeriods.days_1;
  showChartButtonActive(day1Button);
  getChartData(currentPeriod);
}

function get2DayStatus() {
  currentPeriod = timePeriods.days_2;
  showChartButtonActive(day2Button);
  getChartData(currentPeriod);
}

function get7DayStatus() {
  currentPeriod = timePeriods.days_7;
  showChartButtonActive(day7Button);
  getChartData(currentPeriod);
}

function mapTemps(statuses) {
  return statuses.map(function (status) {
    return status.temp_value;
  });
}

function mapHumidities(statuses) {
  return statuses.map(function (status) {
    return status.humidity_value;
  });
}

function mapDates(statuses) {
  return statuses.map(function (status) {
    return moment.parseZone(status.date_inserted).format('LT');
  });
}

function showError(str) {
  dateElement.textContent = str;
}

function getStatus() {
  return new Promise(function (resolve, reject) {
    var apiUrl = apiUrlRoot + '?status_quantity=' + statusQuantity;
    return fetch(apiUrl).then(function (response) {
      return response.json();
    }).then(function (json) {
      console.log('Retrieved', json);
      if (json.status === 'success') {
        resolve(json.statuses);
      } else {
        reject(false);
      }
    }).catch(function (error) {
      showError('Fetch error: ' + error);
      reject(error);
    });
  });
}

function handleStatus() {
  getStatus().then(function (statuses) {
    if (statuses) {
      statusArray = statuses;
      showStatus();
    }
  });
}

function showStatus() {
  showLatestStatus();
  createChart();
  getChartData(currentPeriod);
}

function showLatestStatus() {
  if (statusArray) {
    var latestStatus = statusArray[0];
    var temp = latestStatus.temp_value;
    var humidity = latestStatus.humidity_value;
    var date = moment.parseZone(latestStatus.date_inserted);

    tempValueElement.textContent = temp;
    humidityValueElement.textContent = humidity;
    dateElement.textContent = date.format('LLL');
  }
}

function startApp() {
  handleStatus();
}

function reduceArray(array, increment) {
  var newArray = [];
  for (var i = 0; i < array.length; i += increment) {
    newArray = newArray.concat(array[i]);
  }
  return newArray;
}

function getChartData(length) {
  // Get n number of statuses
  var statusList = statusArray.slice(0, length).reverse();

  var mappedTemps = mapTemps(statusList);
  var mappedHumidity = mapHumidities(statusList);
  var mappedDates = mapDates(statusList);

  // Skip n amount of items in array to reduce chart clutter
  if (currentPeriod === timePeriods.days_2) {
    mappedTemps = reduceArray(mappedTemps, 2);
    mappedHumidity = reduceArray(mappedHumidity, 2);
    mappedDates = reduceArray(mappedDates, 2);
  } else if (currentPeriod === timePeriods.days_7) {
    mappedTemps = reduceArray(mappedTemps, 6);
    mappedHumidity = reduceArray(mappedHumidity, 6);
    mappedDates = reduceArray(mappedDates, 6);
  }

  updateChart(mappedTemps, mappedHumidity, mappedDates);
}

function createChart() {
  var canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  canvas.id = 'statusChart';
  chartContainer.appendChild(canvas);
  var ctx = document.querySelector('#statusChart').getContext('2d');
  statusChart = new Chart(ctx, options);
}

function updateChart(temp, humidity, dates) {
  options.data.labels = dates;
  options.data.datasets[0].data = temp;
  options.data.datasets[1].data = humidity;
  statusChart.update(0);
}

startApp();