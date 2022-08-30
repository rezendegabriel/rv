import json
import socket
import threading

IP = socket.gethostbyname(socket.gethostname())
PORT = 1234
ADDR = (IP, PORT)

ADDRESSES = []

INTERFACE_CLIENT = "interface"
RENDER_CLIENT = "render"

IMG_URL = ""
LIGHT_POS = ""

IMG_URL_RECEIVED = False
IMG_URL_SEND = False

LIGHT_POS_SEND = False
LIGHT_POS_RECEIVED = False

def thread(client, address):
    print("[NEW CONNECTION] {}:{} connected".format(address[0], address[1]))

    connected = True
    while connected:
        if ADDRESSES[0] == address[1]: # Interface
            data = json.loads(client.recv()) # Message received from a client

            if data["type"] == INTERFACE_CLIENT: # Another authentication layer
                IMG_URL = data["message"]
                IMG_URL_RECEIVED = True
                print("[{} : {}] {}".format(address[0], address[1], IMG_URL)) # Print the received message from client

            if LIGHT_POS_RECEIVED:
                client.send(json.dumps({
                    "type": "server",
                    "message": LIGHT_POS
                }))

                LIGHT_POS_SEND = True

            if LIGHT_POS_SEND:
                connected = False
                print("[DISCONNECT] {} : {} disconnected".format(address[0], address[1]))

                client.close() # Connection closed
        else: # Render
            if IMG_URL_RECEIVED:
                client.send(json.dumps({
                    "type": "server",
                    "message": IMG_URL
                }))

                IMG_URL_SEND = True

            if IMG_URL_SEND:
                data = json.loads(client.recv()) # Message received from a client

                if data["type"] == RENDER_CLIENT: # Another authentication layer
                    LIGHT_POS = data["message"]
                    LIGHT_POS_RECEIVED = True
                    print("[{} : {}] {}".format(address[0], address[1], LIGHT_POS)) # Print the received message from client

            if LIGHT_POS_RECEIVED:
                connected = False
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
        ADDRESSES.append(address[1])
        
        new_thread = threading.Thread(target = thread, args = (client, address))
        new_thread.start()
        
        print("[ACTIVE CONNECTIONS] {}".format(threading.activeCount()-1))

if __name__ == "__main__":
    Main()