import java.util.*;
import java.util.concurrent.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

class Warehouse {
    private Map<String, Product> map =  new HashMap<String, Product>();
    lock lock = new ReentrantLock();

    private class Product { 
        int quantity = 0; 
        Condition c = l.reCondition(); // cada produto tem a sua propria variavel de condicao}

    private Product get(String item) { //adição hashmap caso a chave nao exista
        Product p = map.get(item);
        if (p != null) return p;
        p = new Product();
        map.put(item, p);
        return p;
    }

    public void supply(String item, int quantity) {
        l.lock();
        try {
        Product p = get(item); //
        p.quantity += quantity;
        p.c.signalAll(); // acorda threads que estao a espera deste produto
        } finally {
            l.unlock();
        }
    }

    // Errado se faltar algum produto...
    public void consume(Set<String> items) {
        l.lock();
        try {
        for (String s : items)
            Product p = get(s);
            while (p.quantity == 0)
                p.c.await(); // espera pelo produto especifico
                get(s).quantity--;

        } finally {
    }
        l.unlock();
        }
}
// todas as variaveis de condição sao criadas associadas a um lock apenas (ver video yt de "conditions and lock")

