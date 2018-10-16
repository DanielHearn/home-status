#!/usr/bin/python
import sys
import Adafruit_DHT
import time
import requests
import secret

apikey = secret.get_key()
waitInterval = 1800

def startInterval():
    secondsIn30Min = 30*60
    timeUntilStart = secondsIn30Min - time.time() % (secondsIn30Min)
    time.sleep(timeUntilStart)
    print('Sending first data in: {0:0.1f} minutes'.format(timeUntilStart/60))
    updateInterval()

def updateInterval():
    while True:
        status = {}
        temp_humidity = getTemp()
        status['temp'] = temp_humidity[0]
        status['humidity'] = temp_humidity[1]
        printStatus(status)
        postTemp(status)
        time.sleep(waitInterval)

def getTemp():
    humidity, temperature = Adafruit_DHT.read_retry(11, 4)
    return [temperature, humidity]

def printStatus(status):
    print('Temp: {0:0.1f} C  Humidity: {1:0.1f} %'.format(status['temp'], status['humidity']))

def postTemp(status):
    qs = {
        'method': 'set',
        'temp_value': status['temp'],
        'humidity_value': status['humidity'],
        'key': apikey
    }
    r = requests.post('http://thekoreanhandbook.com/homestatus', params=qs)
    print(r.text)

startInterval()