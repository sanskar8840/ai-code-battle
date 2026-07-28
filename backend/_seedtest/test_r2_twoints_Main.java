import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        List<Integer> arr = new ArrayList<>();
        while (st.hasMoreTokens()) arr.add(Integer.parseInt(st.nextToken()));

        int target = Integer.parseInt(br.readLine().trim());

        // TODO: implement your solution using arr and target
        System.out.println("-1 -1");
    }
}
