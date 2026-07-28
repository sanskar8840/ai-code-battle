import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Integer> arr = new ArrayList<>();
        while (scanner.hasNextInt()) arr.add(scanner.nextInt());
        // TODO: implement your solution using arr
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < arr.size(); i++) { sb.append(arr.get(i)); if (i + 1 < arr.size()) sb.append(' '); }
        System.out.println(sb.toString());
    }
}
