from random import seed
from random import random

import asyncio
import cv2
import json
import numpy as np
import urllib.request as url
import websockets

async def imgProcessing(img_url):
    print("[Msg received from the web server] {}".format(img_url))

    img_url = url.urlopen(img_url)
    img = np.asarray(bytearray(img_url.read()), dtype = "uint8")
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    cv2.imwrite("img.jpeg", img)

    await asyncio.sleep(10)

    coord_r = -5 + (random()*(5-(-5)))
    coord_g = -5 + (random()*(5-(-5)))
    coord_b = -5 + (random()*(5-(-5)))

    return str(round(coord_r, 2)) + " " + str(round(coord_g, 2)) + " " + str(round(coord_b, 2))

async def client(ws):
    event = {"type": "connection", "sender": "localclient"}
    await ws.send(json.dumps(event)) # Communication established with the web server (1)
    print("[Connected from the web server]")

    event = await ws.recv() # (3)
    event = json.loads(event)

    if event["type"] == "connection" and event["sender"] == "webserver":
        str_pos_light = await imgProcessing(event["message"])

        event = {"type": "disconnection", "sender": "localclient", "message": str_pos_light}

        await ws.send(json.dumps(event)) # Communication closed with the web server (4)
        print("[Msg sent to the web server] ", str_pos_light)

        ws.close()
        print("[Disconnected from the web server]")

async def main():
    uri = "wss://websockets-rv.herokuapp.com/"
    async with websockets.connect(uri) as ws:
        await client(ws)
        
if __name__ == "__main__":
    seed(1)
    asyncio.run(main())