import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int q = Integer.parseInt(br.readLine().trim());
        // TODO: maintain a queue; for each "pop"/"peek" op, print the result on its own line.
        for (int i = 0; i < q; i++) {
            String line = br.readLine();
            // parse line: "push x" | "pop" | "peek"
        }
    }
}
