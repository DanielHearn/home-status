const tempValueElement = document.querySelector('#latest-temp .value')
const humidityValueElement = document.querySelector('#latest-humidity .value')
const dateElement = document.querySelector('#latest-date .value')
const chartContainer = document.querySelector('.chart-container')

const day1Button = document.querySelector('#day1-button')
const day2Button = document.querySelector('#day2-button')
const day7Button = document.querySelector('#day7-button')

const apiUrlRoot = 'http://www.thekoreanhandbook.com/homestatus'

const colors = {
  red: '#ff7491',
  lightRed: '#ff8ca4',
  blue: '#37a2eb'

}

const timePeriods = {
  days_1: 48,
  days_2: 96,
  days_7: 336
}

let statusQuantity = 336

day1Button.addEventListener('click', get1DayStatus)
day2Button.addEventListener('click', get2DayStatus)
day7Button.addEventListener('click', get7DayStatus)

function get1DayStatus () {
  statusQuantity = timePeriods.days_1
  handleStatus()
}

function get2DayStatus () {
  statusQuantity = timePeriods.days_2
  handleStatus()
}

function get7DayStatus () {
  statusQuantity = timePeriods.days_7
  handleStatus()
}

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
  return new Promise((resolve, reject) => {
    const apiUrl = apiUrlRoot + '?status_quantity=' + statusQuantity
    return fetch(apiUrl)
      .then((response) => {
        return response.json()
      }).then((json) => {
        console.log(json)
        if (json.status === 'success') {
          resolve(json)
        } else {
          reject(false)
        }
      }).catch((error) => {
        showError(`Fetch error: ${error}`)
        reject(error)
      })
  })
}

function handleStatus () {
  getStatus()
    .then((json) => {
      if (json) {
        showStatus(json)
      }
    })
}

function showStatus (json) {
  showLatestStatus(json.statuses[0])
  getChartData(json)
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

function reduceArray (array, increment) {
  let newArray = []
  for (let i = 0; i < array.length; i += increment) {
    newArray = newArray.concat(array[i])
  }
  return newArray
}

function getChartData (json) {
  const statusList = json.statuses.reverse()
  let mappedTemps = mapTemps(statusList)
  let mappedHumidity = mapHumidities(statusList)
  let mappedDates = mapDates(statusList)

  // Skip n amount of items in array to reduce chart clutter
  if (statusQuantity === timePeriods.days_2) {
    mappedTemps = reduceArray(mappedTemps, 2)
    mappedHumidity = reduceArray(mappedHumidity, 2)
    mappedDates = reduceArray(mappedDates, 2)
  } else if (statusQuantity === timePeriods.days_7) {
    mappedTemps = reduceArray(mappedTemps, 8)
    mappedHumidity = reduceArray(mappedHumidity, 8)
    mappedDates = reduceArray(mappedDates, 8)
  }

  showChart(mappedTemps, mappedHumidity, mappedDates)
}

function deleteChart () {
  if (document.querySelector('#statusChart')) {
    document.querySelector('.chart-container').innerHTML = ''
  }
}

function showChart (temp, humidity, dates) {
  deleteChart()

  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  canvas.id = 'statusChart'
  chartContainer.appendChild(canvas)

  const ctx = document.querySelector('#statusChart').getContext('2d')
  const options = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Temp c',
        data: temp,
        backgroundColor: colors.lightRed,
        borderColor: colors.red,
        borderWidth: 1
      }, {
        label: 'Humidity %',
        data: humidity,
        backgroundColor: colors.blue,
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
            steps: 10,
            stepValue: 5,
            max: 100
          }
        }]
      }
    }
  }
  const statusChart = new Chart(ctx, options)
}

startApp()
