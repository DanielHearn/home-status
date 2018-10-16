const tempValueElement = document.querySelector('#value--temp')
const humidityValueElement = document.querySelector('#value--humidity')
const dateElement = document.querySelector('#value--date')
const apiUrlRoot = 'http://www.thekoreanhandbook.com/homestatus'

let statusQuantity = 1

function getStatus () {
  var apiUrl = apiUrlRoot + '?status_quantity=' + statusQuantity
  fetch(apiUrl)
    .then(function (response) {
      return response.json()
    }).then(function (json) {
      console.log(json)
      if (json.status == 'success') {
        tempValueElement.textContent = json.temp_value
        humidityValueElement.textContent = json.humidity_value
        dateElement.textContent = json.date_inserted
        return true
      } else {
        return false
      }
    }).catch(function (error) {
      dateElement.textContent = `Fetch error: ${error}`
    })
}

getStatus()
