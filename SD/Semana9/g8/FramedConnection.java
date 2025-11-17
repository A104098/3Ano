package g8;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.net.Socket;


public class FramedConnection implements AutoCloseable {
    private final Socket socket;
    private final DataInputStream in;
    private final DataOutputStream out;
    private final Object inLock = new Object();
    private final Object outLock = new Object();

    public FramedConnection(Socket socket) throws IOException {
        this.socket = socket;
        this.in = new DataInputStream(new BufferedInputStream(socket.getInputStream()));
        this.out = new DataOutputStream(new BufferedOutputStream(socket.getOutputStream()));
    }

    /**
     * Send a message (byte array). First writes the length (int) then the bytes.
     */
    public void send(byte[] data) throws IOException {
        if (data == null) throw new NullPointerException("data");
        synchronized (outLock) {
            out.writeInt(data.length);
            out.write(data);
            out.flush();
        }
    }

    /**
     * Receive next message: reads int length then reads fully the byte array.
     */
    public byte[] receive() throws IOException {
        synchronized (inLock) {
            int len = in.readInt();
            if (len < 0) throw new IOException("Negative frame length: " + len);
            byte[] data = new byte[len];
            in.readFully(data);
            return data;
        }
    }

    @Override
    public void close() throws IOException {
        IOException ex = null;
        try {
            in.close();
        } catch (IOException e) {
            ex = e;
        }
        try {
            out.close();
        } catch (IOException e) {
            if (ex == null) ex = e;
        }
        try {
            socket.close();
        } catch (IOException e) {
            if (ex == null) ex = e;
        }
        if (ex != null) throw ex;
    }
}
