from random import seed
from random import random

import asyncio
import cv2
import json
import numpy as np
import socket
import threading
import urllib.request as url

IP = socket.gethostbyname(socket.gethostname())
PORT = 1234
ADDR = (IP, PORT)

INTERFACE_CLIENT = "interface"

async def imgProcessing(img_url):
    img_url = url.urlopen(img_url)
    img = np.asarray(bytearray(img_url.read()), dtype = "uint8")
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    cv2.imwrite("img.jpeg", img)

    await asyncio.sleep(10)

    coord_r = -3 + (random()*(3-(-3)))
    coord_g = -3 + (random()*(3-(-3)))
    coord_b = -3 + (random()*(3-(-3)))

    return str(round(coord_r, 2)) + " " + str(round(coord_g, 2)) + " " + str(round(coord_b, 2))

def thread(client, address):
    print("[NEW CONNECTION] {}:{} connected".format(address[0], address[1]))

    data = json.loads(client.recv()) # Message received from a client

    if data["type"] == INTERFACE_CLIENT: # Another authentication layer
        img_url = data["message"]
        print("[{} : {}] {}".format(address[0], address[1], img_url)) # Print the received message from client

        str_pos_light = imgProcessing(img_url)

        client.send(json.dumps({
            "type": "server",
            "message": str_pos_light,
        }))
        
        print("[DISCONNECT] {} : {} disconnected".format(address[0], address[1]))
        client.close() # Connection closed
def Main():
    print("[STARTING] Server is starting...")

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind(ADDR)
    server.listen() # Put the socket into listening mode
    print("[LISTENING] Server is listening on {}:{}".format(IP, PORT))

    # Loop until client wants exit
    while True:
        client, address = server.accept() # Establish connection with client
        
        new_thread = threading.Thread(target = thread, args = (client, address))
        new_thread.start()
        
        print("[ACTIVE CONNECTIONS] {}".format(threading.activeCount()-1))

if __name__ == "__main__":
    seed(1)
    Main()