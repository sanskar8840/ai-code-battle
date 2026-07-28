import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int k = scanner.nextInt();
        List<List<Integer>> lists = new ArrayList<>();
        for (int i = 0; i < k; i++) {
            int size = scanner.nextInt();
            List<Integer> list = new ArrayList<>();
            for (int j = 0; j < size; j++) list.add(scanner.nextInt());
            lists.add(list);
        }
        // TODO: merge lists, print merged values on one line.
        System.out.println();
    }
}
