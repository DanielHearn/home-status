#!/usr/bin/python
import sys
import Adafruit_DHT
import time
import requests

def updateInterval():
    while True:
        status = getTemp()
        printStatus(status)
        postTemp(status)
        time.sleep(3600)

def getTemp():
    humidity, temperature = Adafruit_DHT.read_retry(11, 4)
    status = [temperature, humidity]
    return status

def printStatus(status):
    print 'Temp: {0:0.1f} C  Humidity: {1:0.1f} %'.format(status[0], status[1])

def postTemp(status):
    qs = {'method': 'set', 'temp': status[0], 'key': 'ertwqe3v34'}
    r = requests.post('http://thekoreanhandbook.com/homestatus', params=qs)
    print(r.text)
updateInterval()