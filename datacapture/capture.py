#!/usr/bin/python
import sys
import Adafruit_DHT
import time
import requests
import secret

apikey = secret.get_key()

def calculateInterval():
    secondsIn30Min = 30*60
    timeUntilStart = secondsIn30Min - time.time() % (secondsIn30Min)
    return timeUntilStart/60

def startInterval():
    timeUntilStart = calculateInterval()
    print('Sending first data in: {0:0.1f} minutes'.format(timeUntilStart))
    time.sleep(timeUntilStart)
    updateInterval()

def updateInterval():
    while True:
        status = {}
        temp_humidity = getTemp()
        status['temp'] = temp_humidity[0]
        status['humidity'] = temp_humidity[1]
        printStatus(status)
        postTemp(status)
        timeUntilStart = calculateInterval()
        print('Sending next data in: {0:0.1f} minutes'.format(timeUntilStart))
        time.sleep(waitInterval)

def getTemp():
    humidity, temperature = Adafruit_DHT.read_retry(11, 4)
    return [temperature, humidity]

def printStatus(status):
    print('Temp: {0:0.1f} C  Humidity: {1:0.1f} %'.format(status['temp'], status['humidity']))

def postTemp(status):
    qs = {
        'method': 'set',
        'key': apikey,
        'temp_value': int(status['temp']),
        'humidity_value': int(status['humidity'])
    }
    try:
        r = requests.post('http://thekoreanhandbook.com/homestatus', params=qs)
        print(r.text)
    except:
        print('Fail request')
        pass

startInterval()