'use strict';

var handleStatus = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var json;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getStatus();

          case 2:
            json = _context.sent;

            if (json) {
              showStatus(json);
            }

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function handleStatus() {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var tempValueElement = document.querySelector('#latest-temp .value');
var humidityValueElement = document.querySelector('#latest-humidity .value');
var dateElement = document.querySelector('#latest-date .value');
var apiUrlRoot = 'http://www.thekoreanhandbook.com/homestatus';

var red = '#ff7491';
var blue = '#37a2eb';

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
    return moment.parseZone(status.date_inserted).format('LT');
  });
}

function showError(str) {
  dateElement.textContent = str;
}

function getStatus() {
  var apiUrl = apiUrlRoot + '?status_quantity=' + statusQuantity;
  return fetch(apiUrl).then(function (response) {
    return response.json();
  }).then(function (json) {
    console.log(json);
    if (json.status === 'success') {
      return json;
    } else {
      return false;
    }
  }).catch(function (error) {
    showError('Fetch error: ' + error);
    return false;
  });
}

function showStatus(json) {
  showLatestStatus(json.statuses[0]);

  var statusList = json.statuses.reverse();
  var mappedTemps = mapTemps(statusList);
  var mappedHumidity = mapHumidities(statusList);
  var mappedDates = mapDates(statusList);

  showChart(mappedTemps, mappedHumidity, mappedDates);
}

function showLatestStatus(latestStatus) {
  var temp = latestStatus.temp_value;
  var humidity = latestStatus.humidity_value;
  var date = moment.parseZone(latestStatus.date_inserted);

  tempValueElement.textContent = temp;
  humidityValueElement.textContent = humidity;
  dateElement.textContent = date.format('LLL');
}

function startApp() {
  handleStatus();
}

function showChart(temp, humidity, dates) {
  var ctx = document.getElementById('statusChart').getContext('2d');
  var statusChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Temp c',
        data: temp,
        backgroundColor: red,
        borderColor: red,
        borderWidth: 1
      }, {
        label: 'Humidity %',
        data: humidity,
        backgroundColor: blue,
        borderColor: blue,
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
            steps: 10,
            stepValue: 5,
            max: 100
          }
        }]
      }
    }
  });
}

startApp();