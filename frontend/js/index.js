const tempValueElement = document.querySelector('#value--temp')
const humidityValueElement = document.querySelector('#value--humidity')
const dateElement = document.querySelector('#value--date')
const apiUrlRoot = 'http://www.thekoreanhandbook.com/homestatus'

let statusQuantity = 10

function mapTemps (statuses) {
  return statuses.map((status) => { return status.temp_value })
}

function mapHumidities (statuses) {
  return statuses.map((status) => { return status.humidity_value })
}

function mapDates (statuses) {
  return statuses.map((status) => { return status.date_inserted })
}

function getStatus () {
  var apiUrl = apiUrlRoot + '?status_quantity=' + statusQuantity
  fetch(apiUrl)
    .then(function (response) {
      return response.json()
    }).then(function (json) {
      console.log(json)
      if (json.status == 'success') {
        const status = json.statuses[0]
        const statusList = json.statuses.reverse()
        tempValueElement.textContent = status.temp_value
        humidityValueElement.textContent = status.humidity_value
        dateElement.textContent = status.date_inserted

        const mappedTemps = mapTemps(statusList)
        const mappedHumidity = mapHumidities(statusList)
        const mappedDates = mapDates(statusList)

        showChart(mappedTemps, mappedHumidity, mappedDates)
        return true
      } else {
        return false
      }
    }).catch(function (error) {
      dateElement.textContent = `Fetch error: ${error}`
    })
}

getStatus()

function showChart (temp, humidity, dates) {
  const ctx = document.getElementById('statusChart').getContext('2d')
  const statusChart = new Chart(ctx, {
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
  })
}
