import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) line = "";
        // Tokens are level-order tree values separated by spaces; "null" = no node.
        // TODO: build the tree from these tokens and implement your solution.
        System.out.println(line);
    }
}
