const tempValueElement = document.querySelector('#value--temp')
const dateElement = document.querySelector('#value--date')

const apiUrl = 'http://www.thekoreanhandbook.com/homestatus'

function getStatus () {
  fetch(apiUrl)
    .then(function (response) {
      return response.json()
    }).then(function (json) {
      tempValueElement.textContent = json.temp
      dateElement.textContent = json.date
      return true
    }).catch(function (error) {
      dateElement.textContent = `Fetch error: ${error}`
    })
}

getStatus()
