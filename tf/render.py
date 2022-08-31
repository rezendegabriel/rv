from random import seed
from random import random
from random import randrange

import asyncio
import cv2
import json
import numpy as np
import urllib.request as url
import websockets

async def render():
    uri = "wss://websockets-rv.herokuapp.com/"
    async with websockets.connect(uri) as ws:
        print(ws)

        connection = False
        try:
            event_connection = {
			    "type": "connection",
			    "sender": "render"
            }

            await ws.send(json.dumps(event_connection))
            print("[Connecting to the Server...]")
        except NameError:
            print("[Error: connection to the Server fail]")


        data = await ws.recv()
        event_connection = json.loads(data)

        if event_connection["type"] == "connection":
            connection = True
            print("[Connected]")
        else:
            print("[Connection not allowed]")

        if(connection):
            data = await ws.recv()
            event_recv = json.loads(data)

            if event_recv["type"] == "send":
                img_url = event_recv["message"] # Received image URL by the Server
                print("[Message received by the Server] {}".format(img_url))

                img_url = url.urlopen(img_url)
                img = np.asarray(bytearray(img_url.read()), dtype = "uint8")
                img = cv2.imdecode(img, cv2.IMREAD_COLOR)

                cv2.imwrite("img.jpeg", img)

                await asyncio.sleep(10)

                pos_neg = randrange(-1, 2, 1) # Positive or negative x axis
                if pos_neg == 1:
                    coord_r = 0.25 + (random()*(2-(0.25)))
                else:
                    coord_r = -2 + (random()*(-0.25-(-2)))

                pos_neg = randrange(-1, 2, 1) # Positive or negative z axis
                if pos_neg == 1:
                    coord_b = 0.25 + (random()*(2-(0.25)))
                else:
                    coord_b = -2 + (random()*(-0.25-(-2)))

                coord_g = 0.25 + (random()*(2-(0.25))) # Positive y axis

                light_pos = str(round(coord_r, 2)) + " " + str(round(coord_g, 2)) + " " + str(round(coord_b, 2))

                event_send = {
                    "type": "send",
                    "message": light_pos
                }

                try:
                    await ws.send(json.dumps(event_send)) # Sent light position to the Server
                    print("[Message sent to the server] {}".format(light_pos))
                    print("[Disconnected]")
                except NameError:
                    print("[Error: message not sent to the server]")
                    print("[Disconnected]")

if __name__ == "__main__":
    seed(1)
    asyncio.run(render())