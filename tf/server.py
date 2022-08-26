from random import seed
from random import random

import asyncio
import cv2
import json
import numpy as np
import urllib.request as url
import os
import signal
import websockets

async def imgProcessing(ws, img_url):
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
    
async def webserver(ws):
    event = await ws.recv() # Communication established with the interface
    event = json.loads(event)
    assert event["type"] == "connection"

    if event["sender"] == "interface": 
        print("[Interface connected]")

        str_pos_light = await imgProcessing(ws, event["message"])

        event = {"type": "connection", "sender": "webserver", "message": str_pos_light}

        await ws.send(json.dumps(event))
        print("[Msg sent to the interface] ", str_pos_light)

async def main():
    loop = asyncio.get_running_loop()
    stop = loop.create_future()
    loop.add_signal_handler(signal.SIGTERM, stop.set_result, None)

    PORT = int(os.environ.get("PORT", "8080"))
    async with websockets.serve(webserver, "", PORT):
        await stop
        
if __name__ == "__main__":
    asyncio.run(main())