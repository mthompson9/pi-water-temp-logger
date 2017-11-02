import os
import glob
import time
import RPi.GPIO as GPIO
import csv
import requests
import json
import smtplib
import os.path

#Store the date and time in a string
timestamp = time.strftime("%Y_%m_%d" + "@ " + "%H:%M%S")
filename = timestamp

#Path to save CSV to
csv_filepath = '/home/pi/delete/'

#Locate and open/create the CSV file
csv_file = os.path.join(csv_filepath,filename  + ".csv")

#Create the CSV file with headings
appendfile = open(csv_file, 'a')
appendfile.write('Time' + ',' + ' ' + 'Temperature' + ',' + ' ' + 'Status' + '\n') #this is the line that write in the log
appendfile.close()#this closes and saves the file

#Connect to the firebase project for the database
firebase_url = 'https://jsts-ed810.firebaseio.com' 
time.sleep(5)
#os.system instantiates the sensor probe
os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')

#Variables in use by the code
logdatetime = ''
logstatus = ''
lowBound = 20
upBound = 25

#This code locates the sensor
try:    
    base_dir = '/sys/bus/w1/devices/'
    device_folder = glob.glob(base_dir + '28*')[0]
    device_file = device_folder + '/w1_slave'
    device_file = device_folder + '/w1_slave'
except Exception as e:
    error_catchmsg = "{0}" + ',' + ' ' + "{1!r}"
    reason = "Sensor undetected. Check connection and power"
    error_message = error_catchmsg.format(type(e).__name__, e.args)
    appendfile = open('error-log.csv', 'a') #opens the file for ammending
    appendfile.write(timestamp + ',' + ' ' + error_message + ',' + ' ' + reason + '\n') #this is the line that write in the log
    appendfile.close()#this closes and saves the file
    
#Instantiate the LED
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(18,GPIO.OUT)

#Obtain the raw data read before formatting
def read_temp_raw():
    f = open(device_file, 'r')
    lines = f.readlines()
    f.close()
    return lines

#Parse the data as a float for temperature in celsius
def read_temp():
    #createfile = open('test_log.txt', 'w+')
    #appendfile = open('test_log.txt', 'a')
    lines = read_temp_raw()
    while lines[0].strip()[-3:] != 'YES':
        time.sleep(0,2)
        lines = read_temp_raw()
    equals_pos = lines[1].find('t=')
    if equals_pos != -1:
        temp_string = lines[1][equals_pos+2:]
        temp_c = float(temp_string) / 1000.0
        return temp_c
    
#While the temperature sensor is connected and data is captured from it
while True:
    try:
            string_temp = read_temp()
            str_tp = str(read_temp())
            date_today = time.strftime("%Y_%m_%d")
            time_now = time.strftime("%H:%M:%S")
    except Exception as e:
        error_catchmsg = "{0}" + ',' + ' ' + "{1!r}"
        error_message = error_catchmsg.format(type(e).__name__, e.args)
        reason = "Error reading Temperature. Check sensor connection and read_temp() function code."
        appendfile = open('error-log.csv', 'a') #opens the file for ammending
        appendfile.write(timestamp + ',' + ' ' + error_message + ',' + ' ' + reason + '\n') #this is the line that write in the log
        appendfile.close()#this closes and saves the file
        
#If the temperature exceeds the upper boundary
    if read_temp() > upBound:
        logstatus = 'high'
        print(read_temp(), "Temperature reporting too HIGH()")
        GPIO.output(18,GPIO.HIGH) 
#Create the data object then send it to firebase
        try:
            sendData = {'temp':str_tp, 'time':time_now, 'date':date_today, 'status':logstatus}
            result = requests.post(firebase_url + '/' + '/temperature.json', data=json.dumps(sendData))            
        except Exception as e:
            error_catchmsg = "{0}" + ',' + ' ' + "{1!r}"
            error_message = error_catchmsg.format(type(e).__name__, e.args)
            reason = "Sensor undetected. Check connection and power"
            appendfile = open('error-log.csv', 'a') #opens the file for ammending
            appendfile.write(timestamp + ',' + ' ' + error_message + ',' + ' ' + reason + '\n') #this is the line that write in the log
            appendfile.close()#this closes and saves the file
#Write each new capture on a separate line
        try:
            appendfile = open(csv_file, 'a')
            appendfile.writelines(str(string_temp) + "," + date_today + ' ' + time_now + ',' + logstatus + '\n') #this is the line that write in the log
            appendfile.close()#this closes and saves the file
            GPIO.output(18,GPIO.LOW)
            time.sleep(60)
        
        except Exception as e:
            GPIO.output(18,GPIO.LOW)
            error_catchmsg = "{0}" + ',' + ' ' + "{1!r}"
            error_message = error_catchmsg.format(type(e).__name__, e.args)
            reason = "Sensor undetected. Check connection and power"
            appendfile = open('error-log.csv', 'a') #opens the file for ammending
            appendfile.write(timestamp + ',' + ' ' + error_message + ',' + ' ' + reason + '\n') #this is the line that write in the log
            appendfile.close()#this closes and saves the file
        
        else:
            if read_temp() < lowBound:
                logstatus = 'low'
                print(read_temp(), "Temperature reporting too LOW()")
                GPIO.output(18,GPIO.HIGH)
                #Create the data object then send it to firebase
                try:
                    sendData = {'temp':str_tp, 'time':time_now, 'date':date_today, 'status':logstatus}
                    result = requests.post(firebase_url + '/' + '/temperature.json', data=json.dumps(sendData))            
                except Exception as e:
                    error_catchmsg = "{0}" + ',' + ' ' + "{1!r}"
                    error_message = error_catchmsg.format(type(e).__name__, e.args)
                    reason = "Sensor undetected. Check connection and power"
                    appendfile = open('error-log.csv', 'a') #opens the file for ammending
                    appendfile.write(timestamp + ',' + ' ' + error_message + ',' + ' ' + reason + '\n') #this is the line that write in the log
                    appendfile.close()#this closes and saves the file
#Write each new capture on a separate line
                try:
                    appendfile = open(csv_file, 'a')
                    appendfile.writelines(str(string_temp) + "," + date_today + ' ' + time_now + ',' + logstatus + '\n') #this is the line that write in the log
                    appendfile.close()#this closes and saves the file
                    GPIO.output(18,GPIO.LOW)
                    time.sleep(60)
        
                except Exception as e:
                    GPIO.output(18,GPIO.LOW)
                    error_catchmsg = "{0}" + ',' + ' ' + "{1!r}"
                    error_message = error_catchmsg.format(type(e).__name__, e.args)
                    reason = "Sensor undetected. Check connection and power"
                    appendfile = open('error-log.csv', 'a') #opens the file for ammending
                    appendfile.write(timestamp + ',' + ' ' + error_message + ',' + ' ' + reason + '\n') #this is the line that write in the log
                    appendfile.close()#this closes and saves the file
                
                
        
    else:
        logstatus = 'OK'
        print(read_temp())
        GPIO.output(18,GPIO.LOW)
        try:
            sendData = {'temp':str_tp, 'time':time_now, 'date':date_today, 'status':logstatus}
            result = requests.post(firebase_url + '/' + '/temperature.json', data=json.dumps(sendData))            
        except Exception as e:
            error_catchmsg = "{0}" + ',' + ' ' + "{1!r}"
            error_message = error_catchmsg.format(type(e).__name__, e.args)
            reason = "Sensor undetected. Check connection and power"
            appendfile = open('error-log.csv', 'a') #opens the file for ammending
            appendfile.write(timestamp + ',' + ' ' + error_message + ',' + ' ' + reason + '\n') #this is the line that write in the log
            appendfile.close()#this closes and saves the file
#Write each new capture on a separate line
        try:
            appendfile = open(csv_file, 'a')
            appendfile.writelines(str(string_temp) + "," + date_today + ' ' + time_now + ',' + logstatus + '\n') #this is the line that write in the log
            appendfile.close()#this closes and saves the file
            GPIO.output(18,GPIO.LOW)
            time.sleep(60)
        
        except Exception as e:
            GPIO.output(18,GPIO.LOW)
            error_catchmsg = "{0}" + ',' + ' ' + "{1!r}"
            error_message = error_catchmsg.format(type(e).__name__, e.args)
            reason = "Sensor undetected. Check connection and power"
            appendfile = open('error-log.csv', 'a') #opens the file for ammending
            appendfile.write(timestamp + ',' + ' ' + error_message + ',' + ' ' + reason + '\n') #this is the line that write in the log
            appendfile.close()#this closes and saves the file
        
