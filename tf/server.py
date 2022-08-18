import asyncio
import cv2
import numpy as np
import urllib.request as url
import websockets

async def server(ws: str, path: int):
    inp = input("Client joined. \nType ")
    await ws.send(inp)

    while True:
        message = await ws.recv()

        print("Msg: {}".format(message))

        url_msg = url.urlopen(message)
        img = np.asarray(bytearray(url_msg.read()), dtype = "uint8")
        img = cv2.imdecode(img, cv2.IMREAD_COLOR)

        cv2.imwrite("teste.jpeg", img)

Server = websockets.serve(server, "10.5.191.62", 1234)

asyncio.get_event_loop().run_until_complete(Server)
asyncio.get_event_loop().run_forever()