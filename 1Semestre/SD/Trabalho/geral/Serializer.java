package geral;
// converter objetos java em bytes (serialização) e vice-versa (desserialização)

import java.io.*;
import java.util.*;

public class Serializer {
//antes de enviar uma string, é preciso saber o seu tamanho. por isso, primeiro escreve-se o comprimento e só depois os bytes da string.
// importancia: garante strings de tamanho variável (de qualquer tamana e com caracteres especiais) possam ser corretamente serializadas e desserializadas, e que seja, transmitidas corretamente.
    public static void writeString(DataOutputStream out, String str) throws IOException {
        if (str == null) {
            out.writeInt(-1);
        } else {
            byte[] bytes = str.getBytes("UTF-8");
            out.writeInt(bytes.length);
            out.write(bytes);
        }
    }
//serialização de listas
//para enviar uma lista indica-se o numero de elementos, depois de cada elemento individualmente.
// permite enviar coleções de dados de forma estruturada

    public static void writeStringList(DataOutputStream out, List<String> list) throws IOException {
        if (list == null) {
            out.writeInt(-1);
        } else {
            out.writeInt(list.size());
            for (String str : list) {
                writeString(out, str);
            }
        }
    }


    public static void writeBoolean(DataOutputStream out, boolean value) throws IOException {
        out.writeByte(value ? 1 : 0);
    }

// Ao receber le-se primeiro o tamanho e depois os bytes, construindo a string corretamente e original.
//evita erros de leitura e garante que os dados não ficam  "partidos"

    public static String readString(DataInputStream in) throws IOException {
        int length = in.readInt();
        if (length == -1) {
            return null;
        }
        byte[] bytes = new byte[length];
        in.readFully(bytes);
        return new String(bytes, "UTF-8");
    }
//desserialização de listas
//reconstroi a lista lendo o numero de elementos e depois de cada string.
//garante que listas de qualquer tamanho são recebidas corretamente
    public static List<String> readStringList(DataInputStream in) throws IOException {
        int count = in.readInt();
        if (count == -1) {
            return null;
        }
        List<String> list = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            list.add(readString(in));
        }
        return list;
    }


    public static boolean readBoolean(DataInputStream in) throws IOException {
        return in.readByte() == 1;
    }
}

//Serialização é essencial para garantir que dados complexos podem ser transmitidos pela rede.
//O Serializer.java é fundamental para garantir que toda a informação trocada entre cliente e servidor é transmitida de forma correta, eficiente e sem ambiguidades.
//Sem serialização, seria muito difícil garantir que objetos complexos (como listas ou strings com caracteres especiais) chegavam intactos ao destino.