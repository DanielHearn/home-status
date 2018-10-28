const tempValueElement = document.querySelector('#latest-temp .value')
const humidityValueElement = document.querySelector('#latest-humidity .value')
const dateElement = document.querySelector('#latest-date .value')
const chartContainer = document.querySelector('.chart-container')
const updateTimerElement = document.querySelector('#update-timer .value')

const day1Button = document.querySelector('#day1-button')
const day2Button = document.querySelector('#day2-button')
const day7Button = document.querySelector('#day7-button')

const apiUrlRoot = 'http://www.thekoreanhandbook.com/homestatus'

const colors = {
  red: '#ff7491',
  lightRed: 'rgba(255,116,145,0.5)',
  blue: '#37a2eb',
  lightBlue: 'rgba(55,162,235, 0.5)'
}

const timePeriods = {
  days_1: 48,
  days_2: 96,
  days_7: 336
}

const options = {
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
}

let statusQuantity = timePeriods.days_7
let statusChart
let statusArray
let currentPeriod = timePeriods.days_1

day1Button.addEventListener('click', get1DayStatus)
day2Button.addEventListener('click', get2DayStatus)
day7Button.addEventListener('click', get7DayStatus)

function showChartButtonActive (activeButton) {
  day1Button.classList.remove('active')
  day2Button.classList.remove('active')
  day7Button.classList.remove('active')
  activeButton.classList.add('active')
}

function get1DayStatus () {
  currentPeriod = timePeriods.days_1
  showChartButtonActive(day1Button)
  getChartData(currentPeriod)
}

function get2DayStatus () {
  currentPeriod = timePeriods.days_2
  showChartButtonActive(day2Button)
  getChartData(currentPeriod)
}

function get7DayStatus () {
  currentPeriod = timePeriods.days_7
  showChartButtonActive(day7Button)
  getChartData(currentPeriod)
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
        console.log('Retrieved', json)
        if (json.status === 'success') {
          resolve(json.statuses)
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
    .then((statuses) => {
      if (statuses) {
        statusArray = statuses
        showStatus()
      }
    })
}

function updateStatus () {
  console.log('Update status')
  getStatus()
    .then((statuses) => {
      if (statuses) {
        statusArray = statuses
        console.log('Got updated', statusArray)
        showLatestStatus()
        getChartData(currentPeriod)
      }
    })
}

function showStatus () {
  showLatestStatus()
  createChart()
  getChartData(currentPeriod)
}

function showLatestStatus () {
  if (statusArray) {
    const latestStatus = statusArray[0]
    const temp = latestStatus.temp_value
    const humidity = latestStatus.humidity_value
    const date = moment.parseZone(latestStatus.date_inserted)

    tempValueElement.textContent = temp
    humidityValueElement.textContent = humidity
    dateElement.textContent = date.format('LLL')
  }
}

function startApp () {
  handleStatus()
  startUpdateTimer()
}

function timeUntilNextMinute () {
  return (60 - new Date().getSeconds() % 60) * 1000
}

function timeUntilHalfHour () {
  return (30 * 60 - new Date().getMinutes() % 30 * 60) / 60
}

function startUpdateTimer () {
  // Show initial timer
  showUpdateTimer(timeUntilHalfHour())

  console.log('Seconds till update timer interval:', timeUntilNextMinute() / 1000)
  // Wait till next minute before setting update interval
  setTimeout(function () {
    showUpdateTimer(timeUntilHalfHour())
    setUpdateTimerInterval()
  }, timeUntilNextMinute())
}

function setUpdateTimerInterval () {
  console.log('Set interval')
  // Update next update timer every minute
  setInterval(function () {
    const timeUntilNextUpdate = timeUntilHalfHour()
    console.log('Minutes till update timer:', timeUntilNextUpdate)
    showUpdateTimer(timeUntilNextUpdate)
    if (timeUntilNextUpdate === 30) {
      setTimeout(function () {
        updateStatus(timeUntilNextUpdate)
      }, 1000)
    }
  }, 60000)
}

function showUpdateTimer (timeUntilNextUpdate) {
  updateTimerElement.textContent = timeUntilNextUpdate
}

function reduceArray (array, increment) {
  let newArray = []
  for (let i = 0; i < array.length; i += increment) {
    newArray = newArray.concat(array[i])
  }
  return newArray
}

function getChartData (length) {
  // Get n number of statuses
  const statusList = statusArray.slice(0, length).reverse()

  let mappedTemps = mapTemps(statusList)
  let mappedHumidity = mapHumidities(statusList)
  let mappedDates = mapDates(statusList)

  // Skip n amount of items in array to reduce chart clutter
  if (currentPeriod === timePeriods.days_2) {
    mappedTemps = reduceArray(mappedTemps, 2)
    mappedHumidity = reduceArray(mappedHumidity, 2)
    mappedDates = reduceArray(mappedDates, 2)
  } else if (currentPeriod === timePeriods.days_7) {
    mappedTemps = reduceArray(mappedTemps, 6)
    mappedHumidity = reduceArray(mappedHumidity, 6)
    mappedDates = reduceArray(mappedDates, 6)
  }

  updateChart(mappedTemps, mappedHumidity, mappedDates)
}

function createChart () {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  canvas.id = 'statusChart'
  chartContainer.appendChild(canvas)
  const ctx = document.querySelector('#statusChart').getContext('2d')
  statusChart = new Chart(ctx, options)
}

function updateChart (temp, humidity, dates) {
  options.data.labels = dates
  options.data.datasets[0].data = temp
  options.data.datasets[1].data = humidity
  statusChart.update(0)
}

startApp()
