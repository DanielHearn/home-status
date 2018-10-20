'use strict';

var tempValueElement = document.querySelector('#value--temp');
var humidityValueElement = document.querySelector('#value--humidity');
var dateElement = document.querySelector('#value--date');
var apiUrlRoot = 'http://www.thekoreanhandbook.com/homestatus';

var statusQuantity = 10;

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
    return status.date_inserted;
  });
}

function getStatus() {
  var apiUrl = apiUrlRoot + '?status_quantity=' + statusQuantity;
  fetch(apiUrl).then(function (response) {
    return response.json();
  }).then(function (json) {
    console.log(json);
    if (json.status == 'success') {
      var status = json.statuses[0];
      var statusList = json.statuses.reverse();
      tempValueElement.textContent = status.temp_value;
      humidityValueElement.textContent = status.humidity_value;
      dateElement.textContent = status.date_inserted;

      var mappedTemps = mapTemps(statusList);
      var mappedHumidity = mapHumidities(statusList);
      var mappedDates = mapDates(statusList);

      showChart(mappedTemps, mappedHumidity, mappedDates);
      return true;
    } else {
      return false;
    }
  }).catch(function (error) {
    dateElement.textContent = 'Fetch error: ' + error;
  });
}

getStatus();

function showChart(temp, humidity, dates) {
  var ctx = document.getElementById('statusChart').getContext('2d');
  var statusChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Temp c',
        data: temp,
        backgroundColor: 'transparent',
        borderColor: 'red',
        borderWidth: 1
      }, {
        label: 'Humidity %',
        data: humidity,
        backgroundColor: 'transparent',
        borderColor: 'blue',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            steps: 10,
            stepValue: 5,
            max: 100
          }
        }]
      }
    }
  });
}