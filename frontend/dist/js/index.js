const tempValueElement = document.querySelector('#latest-temp .value')
const humidityValueElement = document.querySelector('#latest-humidity .value')
const dateElement = document.querySelector('#latest-date .value')
const apiUrlRoot = 'http://www.thekoreanhandbook.com/homestatus'

const red = '#ff7491'
const blue = '#37a2eb'

let statusQuantity = 10

function mapTemps (statuses) {
  return statuses.map((status) => { return status.temp_value })
}

function mapHumidities (statuses) {
  return statuses.map((status) => { return status.humidity_value })
}

function mapDates (statuses) {
  return statuses.map((status) => { return moment.parseZone(status.date_inserted).format('LT') })
}

function showError (str) {
  dateElement.textContent = str
}

function getStatus () {
  const apiUrl = apiUrlRoot + '?status_quantity=' + statusQuantity
  return fetch(apiUrl)
    .then(function (response) {
      return response.json()
    }).then(function (json) {
      console.log(json)
      if (json.status === 'success') {
        return json
      } else {
        return false
      }
    }).catch(function (error) {
      showError(`Fetch error: ${error}`)
      return false
    })
}

async function handleStatus () {
  const json = await getStatus()
  if (json) {
    showStatus(json)
  }
}

function showStatus (json) {
  showLatestStatus(json.statuses[0])

  const statusList = json.statuses.reverse()
  const mappedTemps = mapTemps(statusList)
  const mappedHumidity = mapHumidities(statusList)
  const mappedDates = mapDates(statusList)

  showChart(mappedTemps, mappedHumidity, mappedDates)
}

function showLatestStatus (latestStatus) {
  const temp = latestStatus.temp_value
  const humidity = latestStatus.humidity_value
  const date = moment.parseZone(latestStatus.date_inserted)

  tempValueElement.textContent = temp
  humidityValueElement.textContent = humidity
  dateElement.textContent = date.format('LLL')
}

function startApp () {
  handleStatus()
}

function showChart (temp, humidity, dates) {
  const ctx = document.getElementById('statusChart').getContext('2d')
  const statusChart = new Chart(ctx, {
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
  })
}

startApp()
