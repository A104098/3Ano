import java.util.*;

class Warehouse {
    private Map<String, Product> map =  new HashMap<String, Product>();

    private class Product { int quantity = 0; }

    private Product get(String item) { //adição hashmap caso a chave nao exista
        Product p = map.get(item);
        if (p != null) return p;
        p = new Product();
        map.put(item, p);
        return p;
    }

    public void supply(String item, int quantity) {
        Product p = get(item); //
        p.quantity += quantity;
    }

    // Errado se faltar algum produto...
    public void consume(Set<String> items) {
        for (String s : items)
            get(s).quantity--;
    }

}
// todas as variaveis de condição sao criadas associadas a um lock apenas (ver video yt de "conditions and lock")